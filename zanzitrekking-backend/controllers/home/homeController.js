const Category = require('../../models/category')
const Product = require('../../models/product')
const Trip = require('../../models/trip')
const QueryProducts = require('../../utilities/queryProducts')
const { responseReturn } = require('../../utilities/response')
const redis = require('../../redis')
const crypto = require('crypto')

class HomeControllers {
  formateProduct = (products) => {
    const productArray = []
    let i = 0
    while (i < products.length) {
      let temp = []
      let j = i
      while (j < i + 3) {
        if (products[j]) {
          temp.push(products[j])
        }
        j++
      }
      productArray.push([...temp])
      i = j
    }
    return productArray
  }
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
  get_products = async (req, res) => {
    try {
      const key = `home:products`
      const cached = await redis.get(key)
      if (cached) {
        return responseReturn(res, 200, JSON.parse(cached))
      }

      let products = await Product.find({}).limit(12).sort({ createdAt: 1 })
      const allProducts1 = await Product.find({}).limit(9).sort({ createdAt: -1 })
      const latest_product = this.formateProduct(allProducts1)
      const allProducts2 = await Product.find({}).limit(9).sort({ rating: -1 })
      const top_rated_product = this.formateProduct(allProducts2)
      const allProducts3 = await Product.find({}).limit(9).sort({ discount: -1 })
      const discount_product = this.formateProduct(allProducts3)

      await redis.set(
        key,
        JSON.stringify({ products, latest_product, top_rated_product, discount_product }),
        'EX',
        3600
      )

      responseReturn(res, 200, {
        products,
        latest_product,
        top_rated_product,
        discount_product
      })
    } catch (error) {
      res.status(500).send(error.message)
    }
  }
  price_range_product = async (req, res) => {
    try {
      const priceRange = {
        low: 0,
        high: 0
      }

      const key = `home:products:price-range`
      const cached = await redis.get(key)
      if (cached) {
        return responseReturn(res, 200, JSON.parse(cached))
      }

      const products = await Product.find({}).limit(9).sort({ createdAt: -1 })
      const latest_product = this.formateProduct(products)
      const getForPrice = await Product.find({}).sort({ price: 1 })
      if (getForPrice.length > 0) {
        priceRange.high = getForPrice[getForPrice.length - 1].price
        priceRange.low = getForPrice[0].price
      }

      await redis.set(key, JSON.stringify({ priceRange, latest_product }), 'EX', 3600)

      responseReturn(res, 200, { priceRange, latest_product })
    } catch (error) {
      return responseReturn(res, 500, { error: error.message })
    }
  }
  query_products = async (req, res) => {
    const parPage = 8
    req.query.parPage = parPage
    const searchValue = req.query.searchValue.trim()

    let query = {}
    if (searchValue) {
      query = {
        $or: [
          { name: { $regex: searchValue, $options: 'i' } },
          { category: { $regex: searchValue, $options: 'i' } },
          { brand: { $regex: searchValue, $options: 'i' } },
          { description: { $regex: searchValue, $options: 'i' } }
        ]
      }
      // Optional: Add $text search as fallback if exact matching is needed.
      // query.$text = { $search: searchValue.split(' ').join(' AND ') };
    }
    try {
      const hash = crypto.createHash('sha256').update(JSON.stringify(query)).digest('hex')

      const key = `home:products:query:${hash}`
      const cached = await redis.get(key)
      if (cached) {
        return responseReturn(res, 200, JSON.parse(cached))
      }

      let products = await Product.find(query).sort({
        createdAt: -1
      })
      const queryProductsInstance = new QueryProducts(products, req.query)
        .categoryQuery()
        .ratingQuery()
        .priceQuery()
        .sortingQuery()

      const totalProducts = queryProductsInstance.countProducts() // Ensure this method counts filtered products

      const result = queryProductsInstance.skip().limit().getProducts()

      await redis.set(key, JSON.stringify({ totalProducts, result, parPage }), 'EX', 60)

      responseReturn(res, 200, { totalProducts, result, parPage })
    } catch (error) {
      return responseReturn(res, 500, { error: error.message })
    }
  }
  product_details = async (req, res) => {
    const { productId } = req.params

    try {
      const key = `home:product:${productId}`
      const cached = await redis.get(key)
      if (cached) {
        return responseReturn(res, 200, JSON.parse(cached))
      }

      // Fetch product using await and pass productId directly
      const product = await Product.findById(productId)

      // Check if product exists
      if (!product) {
        return responseReturn(res, 409, { error: "Couldn't Find Product!" })
      }

      await redis.set(key, JSON.stringify({ product }), 'EX', 3600)

      // Return product details
      return responseReturn(res, 200, { product })
    } catch (error) {
      return responseReturn(res, 500, { error: 'Internal Server Error' })
    }
  }
}
module.exports = new HomeControllers()
