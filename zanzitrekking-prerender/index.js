require('dotenv').config()
const prerender = require('prerender')
const Cache = require('node-cache')

const stdTTL = process.env.PAGE_CACHE_TTL || 3600
const renderCache = new Cache({ stdTTL, checkperiod: stdTTL / 2 })

const server = prerender({
  chromeLocation: process.env.BROWSER_PATH,
  chromeFlags: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--headless=new',
    '--remote-debugging-port=9222',
    '--remote-debugging-address=127.0.0.1'
  ]
})

server.use({
  requestReceived: (req, res, next) => {
    const cached = renderCache.get(req.url)

    if (cached) {
      console.log('[CACHE HIT]', req.url)
      return res.send(200, cached)
    }

    next()
  },

  beforeSend: (req, res, next) => {
    if (res.prerender && res.prerender.content) {
      renderCache.set(req.url, res.prerender.content, stdTTL)
      console.log('[CACHE SET]', req.url)
    }
    next()
  }
})

server.use(prerender.blockResources())

server.start()
