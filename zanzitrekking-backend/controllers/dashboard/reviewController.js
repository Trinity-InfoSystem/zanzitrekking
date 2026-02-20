const Review = require('../../models/review')
const Trip = require('../../models/trip')
const { delPattern } = require('../../utilities/cache')
const { responseReturn } = require('../../utilities/response')
const mongoose = require('mongoose')
const redis = require('../../redis')

class AdminReviewController {
  // Get all reviews with filters (for admin dashboard)
  getAllReviews = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        tripId,
        searchValue,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query

      const skip = (parseInt(page) - 1) * parseInt(limit)

      // Build query
      const query = {}
      if (status) query.status = status
      if (tripId) query.tripId = tripId
      if (searchValue) {
        query.$or = [
          { title: { $regex: searchValue, $options: 'i' } },
          { comment: { $regex: searchValue, $options: 'i' } }
        ]
      }

      // Get reviews with pagination
      const reviews = await Review.find(query)
        .populate('customerId', 'name email image')
        .populate('tripId', 'mainTitle mainImage')
        .populate('orderId', 'orderNumber')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit))

      // Get total count
      const totalReviews = await Review.countDocuments(query)

      // Get status counts
      const statusCounts = await Review.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])

      const stats = {
        total: totalReviews,
        pending: 0,
        approved: 0,
        rejected: 0
      }

      statusCounts.forEach((item) => {
        stats[item._id] = item.count
      })

      return responseReturn(res, 200, {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          hasNext: skip + reviews.length < totalReviews,
          hasPrev: parseInt(page) > 1
        },
        stats
      })
    } catch (error) {
      console.error('Error getting all reviews:', error)
      return responseReturn(res, 500, { message: 'Internal server error' })
    }
  }

  // Update review status (approve, reject, pending)
  updateReviewStatus = async (req, res) => {
    try {
      const { reviewId } = req.params
      const { status, adminResponse } = req.body

      // Validate status
      const validStatuses = ['pending', 'approved', 'rejected']
      if (!validStatuses.includes(status)) {
        return responseReturn(res, 400, {
          message: 'Invalid status. Must be pending, approved, or rejected'
        })
      }

      const review = await Review.findById(reviewId)
      if (!review) {
        return responseReturn(res, 404, { message: 'Review not found' })
      }

      // Update review
      review.status = status
      if (adminResponse) {
        review.adminResponse = adminResponse.trim()
      }
      await review.save()

      // Update trip rating (only approved reviews count)
      await this.updateTripRating(review.tripId)

      // Populate customer and trip info
      await review.populate([
        { path: 'customerId', select: 'name email image' },
        { path: 'tripId', select: 'mainTitle mainImage' }
      ])

      await delPattern(`home:trip:${review.tripId}:reviews:*`)

      return responseReturn(res, 200, {
        message: `Review ${status} successfully`,
        review
      })
    } catch (error) {
      console.error('Error updating review status:', error)
      return responseReturn(res, 500, { message: 'Internal server error' })
    }
  }

  // Delete review (admin)
  deleteReview = async (req, res) => {
    try {
      const { reviewId } = req.params

      const review = await Review.findById(reviewId)
      if (!review) {
        return responseReturn(res, 404, { message: 'Review not found' })
      }

      const tripId = review.tripId

      // Delete the review
      await Review.findByIdAndDelete(reviewId)

      // Remove review from trip's reviews array
      await Trip.findByIdAndUpdate(tripId, {
        $pull: { reviews: reviewId }
      })

      // Update trip rating
      await this.updateTripRating(tripId)

      await Promise.allSettled([
        redis.del(`home:trip:${review.tripId}`),
        delPattern(`home:trip:${review.tripId}:reviews:*`)
      ])

      return responseReturn(res, 200, {
        message: 'Review deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting review:', error)
      return responseReturn(res, 500, { message: 'Internal server error' })
    }
  }

  // Bulk update review status
  bulkUpdateReviews = async (req, res) => {
    try {
      const { reviewIds, status } = req.body

      // Validate
      if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
        return responseReturn(res, 400, {
          message: 'reviewIds must be a non-empty array'
        })
      }

      const validStatuses = ['pending', 'approved', 'rejected']
      if (!validStatuses.includes(status)) {
        return responseReturn(res, 400, {
          message: 'Invalid status'
        })
      }

      // Update all reviews
      const result = await Review.updateMany({ _id: { $in: reviewIds } }, { status })

      // Get unique tripIds to update ratings
      const reviews = await Review.find({ _id: { $in: reviewIds } }).select('tripId')
      const uniqueTripIds = [...new Set(reviews.map((r) => r.tripId.toString()))]

      // Update trip ratings
      for (const tripId of uniqueTripIds) {
        await this.updateTripRating(tripId)
      }

      Promise.allSettled([
        ...uniqueTripIds.map((id) => redis.del(`home:trip:${id}`)),
        ...uniqueTripIds.map((id) => delPattern(`home:trip:${id}:reviews:*`))
      ])

      return responseReturn(res, 200, {
        message: `${result.modifiedCount} reviews updated to ${status}`,
        modifiedCount: result.modifiedCount
      })
    } catch (error) {
      console.error('Error bulk updating reviews:', error)
      return responseReturn(res, 500, { message: 'Internal server error' })
    }
  }

  // Bulk delete reviews
  bulkDeleteReviews = async (req, res) => {
    try {
      const { reviewIds } = req.body

      if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
        return responseReturn(res, 400, {
          message: 'reviewIds must be a non-empty array'
        })
      }

      // Get reviews to find tripIds before deletion
      const reviews = await Review.find({ _id: { $in: reviewIds } }).select('tripId')
      const uniqueTripIds = [...new Set(reviews.map((r) => r.tripId.toString()))]

      // Delete reviews
      const result = await Review.deleteMany({ _id: { $in: reviewIds } })

      // Remove from trips
      await Trip.updateMany({ reviews: { $in: reviewIds } }, { $pull: { reviews: { $in: reviewIds } } })

      // Update trip ratings
      for (const tripId of uniqueTripIds) {
        await this.updateTripRating(tripId)
      }

      Promise.allSettled([
        ...uniqueTripIds.map((id) => redis.del(`home:trip:${id}`)),
        ...uniqueTripIds.map((id) => delPattern(`home:trip:${id}:reviews:*`))
      ])

      return responseReturn(res, 200, {
        message: `${result.deletedCount} reviews deleted successfully`,
        deletedCount: result.deletedCount
      })
    } catch (error) {
      console.error('Error bulk deleting reviews:', error)
      return responseReturn(res, 500, { message: 'Internal server error' })
    }
  }

  // Get reviews for a specific trip (admin view - all statuses)
  getTripReviews = async (req, res) => {
    try {
      const { tripId } = req.params
      const { page = 1, limit = 10 } = req.query

      const skip = (parseInt(page) - 1) * parseInt(limit)

      const reviews = await Review.find({ tripId })
        .populate('customerId', 'name email image')
        .populate('orderId', 'orderNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))

      const totalReviews = await Review.countDocuments({ tripId })

      // Get status breakdown
      const statusCounts = await Review.aggregate([
        { $match: { tripId: new mongoose.Types.ObjectId(tripId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])

      const stats = {
        total: totalReviews,
        pending: 0,
        approved: 0,
        rejected: 0
      }

      statusCounts.forEach((item) => {
        stats[item._id] = item.count
      })

      // Get average rating
      const ratingStats = await Review.getTripAverageRating(tripId)

      return responseReturn(res, 200, {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews
        },
        stats,
        ratingStats
      })
    } catch (error) {
      console.error('Error getting trip reviews:', error)
      return responseReturn(res, 500, { message: 'Internal server error' })
    }
  }

  // Helper method to update trip average rating
  updateTripRating = async (tripId) => {
    try {
      const ratingStats = await Review.getTripAverageRating(tripId)

      await Trip.findByIdAndUpdate(tripId, {
        rating: Math.round(ratingStats.averageRating * 10) / 10 // Round to 1 decimal place
      })
    } catch (error) {
      console.error('Error updating trip rating:', error)
    }
  }
}

module.exports = new AdminReviewController()
