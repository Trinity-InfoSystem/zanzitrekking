const Category = require('../../models/category')
const Trip = require('../../models/trip')
const { responseReturn } = require('../../utilities/response')
const redis = require('../../redis')

class HomeControllers {
  get_catgories = async (req, res) => {
    try {
      const key = `home:categories`
      const cached = await redis.get(key)
      if (cached) {
        return responseReturn(res, 200, JSON.parse(cached))
      }

      const categories = await Category.find({})

      // Get total trips count (all trips, regardless of category)
      const totalTrips = await Trip.countDocuments({})

      // Get trip counts for each category
      // Now trips use ObjectId reference, so query by ObjectId
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          // Query trips by category ObjectId reference
          const tripCount = await Trip.countDocuments({
            category: category._id
          })
          return {
            ...category.toObject(),
            trips_count: tripCount
          }
        })
      )

      await redis.set(
        key,
        JSON.stringify({ categories: categoriesWithCounts, totalTrips: totalTrips }),
        'EX',
        3600
      )

      responseReturn(res, 200, {
        categories: categoriesWithCounts,
        totalTrips: totalTrips
      })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
}
module.exports = new HomeControllers()
