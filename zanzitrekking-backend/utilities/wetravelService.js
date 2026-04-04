const axios = require('axios')
const { isTripDateInPast } = require('./bookingRestrictions')
const moment = require('moment')
const debugNamespace = require('debug')
const debug = debugNamespace('wetravel')

class WeTravelService {
  constructor() {
    // Use production API by default, fallback to demo if WETRAVEL_USE_DEMO is set
    const useDemo = process.env.WETRAVEL_USE_DEMO === 'true'
    this.apiKey = process.env.WETRAVEL_API_KEY
    
    this.apiUrl = useDemo ? 'https://api.demo.wetravel.to/v2' : 'https://api.wetravel.com/v2'
    this.authUrl = `${this.apiUrl}/auth/tokens/access`
    this.accessToken = null

    this.refreshTokenTimeout = null

    this.getAccessToken()
  }

  /**
   * Get access token from WeTravel API
   */
  async getAccessToken() {
    try {
      const response = await axios.post(
        this.authUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      this.accessToken = response.data.access_token
      /**
       * Call the getAccessToken method after every 45 minutes
       */
      this.refreshTokenTimeout = setTimeout(
        () => {
          this.getAccessToken()
        },
        45 * 60 * 1000
      )

      return this.accessToken
    } catch (error) {
      debug('Error getting WeTravel access token:', error.response?.data || error.message)
      debug('Status Code:', error.response?.status)
      debug('Full error:', error)
      throw new Error('Failed to obtain WeTravel access token')
    }
  }

  /**
   * Check if trip dates are in the past
   * @param {string} startDate - Trip start date (YYYY-MM-DD)
   * @param {string} endDate - Trip end date (YYYY-MM-DD) - optional
   * @returns {boolean} - True if dates are in the past
   */
  isTripDateInPast(startDate, endDate = null) {
    return isTripDateInPast(startDate)
  }

  /**
   * Create a payment link for an order
   * @param {Object} orderData - Order data including trip details and pricing
   * @returns {Promise<Object>} - Payment link data
   */
  async createPaymentLink(orderData) {

    try {
      const {
        tripTitle,
        tripId,
        startDate,
        endDate,
        totalAmount,
        currency = 'USD',
        daysBeforeDeparture = 2,
        participantInfo, // Customer/participant information
        travelersNumber = 1, // Number of travelers
        paymentOption = 'full', // "deposit" or "full"
        depositAmount = 0, // Deposit amount if paymentOption is "deposit"
        returnUrl // Return URL for payment callback
      } = orderData

      // Validate that trip dates are not in the past
      if (this.isTripDateInPast(startDate, endDate)) {
        const errorMessage = `Cannot create payment link: Trip start date (${startDate}) is in the past`
        debug(errorMessage)
        throw new Error(errorMessage)
      }

      // Validate total amount
      if (!totalAmount || totalAmount <= 0) {
        throw new Error('Total amount must be greater than 0')
      }

      // Validate deposit amount if deposit option is selected
      if (paymentOption === 'deposit') {
        if (!depositAmount || depositAmount <= 0) {
          throw new Error('Deposit amount must be greater than 0 when deposit option is selected')
        }
        if (depositAmount >= totalAmount) {
          throw new Error(`Deposit amount (${depositAmount}) must be less than total amount (${totalAmount})`)
        }
        // Ensure deposit is reasonable (at least 10% and not more than 50%)
        const depositPercentage = (depositAmount / totalAmount) * 100
        if (depositPercentage < 10) {
          debug(`Deposit percentage (${depositPercentage.toFixed(2)}%) is less than 10%`)
        }
        if (depositPercentage > 50) {
          debug(`Deposit percentage (${depositPercentage.toFixed(2)}%) is more than 50%`)
        }


        // Validate that installments sum equals total amount (for deposits)
        const remainingAmount = totalAmount - depositAmount
        const installmentsSum = depositAmount + remainingAmount
        if (Math.abs(installmentsSum - totalAmount) > 0.01) {
          throw new Error(
            `Installments sum (${installmentsSum}) does not match total amount (${totalAmount})`
          )
        }
      }

      const totalAmountCents = totalAmount
      const depositAmountCents = paymentOption === 'deposit' ? depositAmount : totalAmountCents
      const remainingAmountCents = totalAmountCents - depositAmountCents

      const data = {
        trip: {
          title: this.sanitizeTitle(tripTitle),
          trip_id: tripId,
          start_date: startDate,
          end_date: endDate,
          currency: currency,
          participant_fees: 'all',
        },

        pricing: {
          price: totalAmountCents,
          days_before_departure: 1,
          payment_plan: {
            allow_auto_payment: true,
            allow_partial_payment: false,
            deposit: 0,
            installments: [
              {
                price: totalAmountCents,
                days_before_departure: 1
              }
            ]
          }
        }
        
      }

      // Validate deposit amount if deposit option is selected
      if (paymentOption === 'deposit') {
        data.pricing.payment_plan = {
          allow_auto_payment: true,
          allow_partial_payment: false,
          deposit: depositAmountCents,
          installments: [
            {
              price: remainingAmountCents,
              days_before_departure: 1
            }
          ]
        }
      }


      let response = null

      try {
        debug (`Sending Payload %O`, {data})
        response = await axios.post(`${this.apiUrl}/payment_links`, {data}, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        debug('Payment link created successfully!')
        debug('Response: %O', response.data)

        return response.data.data
      } catch (e) {
        debug(`Failed to create payment link. %O`, e)
        debug(`Response: %O`, response)
        throw new Error('Failed to create WeTravel payment link. Please try again later.')
      }

    } catch (error) {
      debug(`Error creating payment link: %O`, error)

      throw new Error('Failed to create WeTravel payment link')
    }
  }

  /**
   * Sanitize title for WeTravel API (remove special chars, limit length)
   * @param {string} title - Original title
   * @returns {string} - Sanitized title
   */
  sanitizeTitle(title) {
    if (!title) return 'Safari Trip'
    // Remove special characters, keep alphanumeric, spaces, and basic punctuation
    let sanitized = title.replace(/[^\w\s\-.,&()]/g, '').trim()
    // Limit to 100 characters
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 97) + '...'
    }
    return sanitized || 'Safari Trip'
  }

  /**
   * Format order data for WeTravel payment link creation
   * @param {Object} order - MongoDB order document
   * @returns {Object} - Formatted data for WeTravel API
   */
  formatOrderForPaymentLink(order) {
    // Get the first trip's start date or use the earliest date from cart items
    // CRITICAL: Extract UTC date components to avoid timezone shifts
    let startDateObj = null
    if (order.cartItems && order.cartItems.length > 0 && order.cartItems[0].startingDate) {
      const dateInput = order.cartItems[0].startingDate

      if (dateInput) {
        startDateObj = moment.utc(dateInput).hour(12).minute(0).second(0).millisecond(0).toDate()
      }
    }

    if (!startDateObj) {
      startDateObj = moment.utc(new Date()).hour(12).minute(0).second(0).millisecond(0).toDate()
    }

    // Get cart item details for booking restriction check
    const firstCartItem = order.cartItems && order.cartItems.length > 0 ? order.cartItems[0] : null

    // Calculate end date based on days (if available) or default to start date + 7 days
    const daysCount = order.cartItems && order.cartItems.length > 0 ? order.cartItems[0].days || 7 : 7

    // Calculate end date using UTC to avoid timezone shifts
    const endDateObj = new Date(startDateObj)
    endDateObj.setUTCDate(endDateObj.getUTCDate() + daysCount)

    // Calculate days before departure (days between now and trip start)
    const now = new Date()
    const nowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
    const tripStartUTC = new Date(
      Date.UTC(
        startDateObj.getUTCFullYear(),
        startDateObj.getUTCMonth(),
        startDateObj.getUTCDate(),
        0,
        0,
        0,
        0
      )
    )

    // Calculate difference in days
    const daysDiff = Math.ceil((tripStartUTC - nowUTC) / (1000 * 60 * 60 * 24))

    // Determine if this is a Midrange/Luxury Safari (requires 4-day rule)
    const isMidrangeOrLuxury =
      firstCartItem &&
      (firstCartItem.selectedCategory === 'midRange' || firstCartItem.selectedCategory === 'luxury')

    const categoryName = firstCartItem?.categoryName ? firstCartItem.categoryName.toLowerCase() : ''
    const isSafariCategory = categoryName.includes('safari')
    const isMidrangeLuxurySafari = isMidrangeOrLuxury && isSafariCategory

    // Set days before departure based on booking restrictions:
    // - Midrange/Luxury Safaris: require payment at least 4 days before departure
    // - All other trips: allow payment until 1 day before departure
    let daysBeforeDeparture
    if (daysDiff <= 0) {
      daysBeforeDeparture = 0 // Trip is today or past, allow immediate payment
    } else if (daysDiff === 1) {
      daysBeforeDeparture = 0 // Trip is tomorrow, allow payment today
    } else if (isMidrangeLuxurySafari && daysDiff >= 4) {
      // For Midrange/Luxury Safaris with 4+ days until trip: require payment 4 days before
      // This means payment deadline is (daysDiff - 4) days from now
      daysBeforeDeparture = 4 // Payment must be completed at least 4 days before departure
    } else {
      // For all other trips: allow payment until 1 day before
      daysBeforeDeparture = Math.min(daysDiff - 1, 365) // Allow until 1 day before trip
    }

    // Create a descriptive title (sanitized for WeTravel API)
    // Include package type in title to help WeTravel identify the package
    const itemCount = order.cartItems?.length || 0
    const selectedCategory = firstCartItem?.selectedCategory || 'standard'
    const packageTypeLabel =
      selectedCategory === 'standard'
        ? 'Budget'
        : selectedCategory === 'midRange'
          ? 'Mid-Range'
          : selectedCategory === 'luxury'
            ? 'Luxury'
            : ''

    let rawTitle =
      itemCount === 1
        ? packageTypeLabel
          ? `${order.cartItems[0].mainTitle} (${packageTypeLabel})`
          : order.cartItems[0].mainTitle
        : `${itemCount} Safari Trips - ${order.orderNumber}`
    const tripTitle = this.sanitizeTitle(rawTitle)

    // Get total travelers number from all cart items (adults + children)
    const totalTravelers = order.cartItems.reduce(
      (sum, item) => sum + (item.travelersNumber || 1) + (item.childrenCount || 0),
      0
    )

    // Format dates as YYYY-MM-DD using UTC components to avoid timezone shifts
    const formatDateAsYYYYMMDD = (dateObj) => {
      const year = dateObj.getUTCFullYear()
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getUTCDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // selectedCategory is already declared above (line 376) for packageTypeLabel

    // Calculate total children count from all cart items
    const totalChildrenCount = order.cartItems.reduce((sum, item) => sum + (item.childrenCount || 0), 0)

    // Extract trip metadata from cart items for WeTravel Trips Builder API
    // firstCartItem is already declared above (line 970)
    const mainDestination = firstCartItem?.mainDestination || firstCartItem?.trip?.mainDestination
    const destinationName =
      Array.isArray(mainDestination) && mainDestination.length > 0
        ? mainDestination[0].name
        : mainDestination?.name || tripTitle.split('(')[0].trim() || 'Tanzania'

    // Extract group size constraints if available
    const groupMin = firstCartItem?.groupMin || firstCartItem?.trip?.groupMin || 1
    const groupMax =
      firstCartItem?.groupMax || firstCartItem?.trip?.groupMax || Math.max(totalTravelers || 1, 100)

    return {
      tripTitle,
      tripId: order.orderNumber,
      startDate: formatDateAsYYYYMMDD(startDateObj), // Format: YYYY-MM-DD using UTC
      endDate: formatDateAsYYYYMMDD(endDateObj),
      totalAmount: order.totalAmount,
      currency: 'USD',
      daysBeforeDeparture: daysBeforeDeparture,
      travelersNumber: totalTravelers, // This already includes children from the reduce above
      childrenCount: totalChildrenCount, // Explicitly pass children count for validation
      selectedCategory, // Package type: standard, midRange, luxury
      // Trip metadata for Trips Builder API
      destination: destinationName,
      groupMin: groupMin,
      groupMax: groupMax,
      // Include participant/customer information (billing address is optional in WeTravel)
      participantInfo: order.personalInfo
        ? {
            firstName: order.personalInfo.firstName,
            lastName: order.personalInfo.lastName,
            email: order.personalInfo.email,
            phone: order.personalInfo.phone,
            // Include billing address if available (WeTravel allows this but it's optional)
            ...(order.billingAddress && {
              address: {
                street: order.billingAddress.street,
                city: order.billingAddress.city,
                state: order.billingAddress.state,
                zip: order.billingAddress.zip,
                country: order.billingAddress.country
              }
            })
          }
        : null
    }
  }
}

// Export a singleton instance
module.exports = new WeTravelService()
