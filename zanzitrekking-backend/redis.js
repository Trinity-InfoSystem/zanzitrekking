const Redis = require('ioredis')

const client = process.env.REDIS_SOCKET ? new Redis(process.env.REDIS_SOCKET) : new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined
})

client.on('connect', () => console.log('Redis connected'))
client.on('error', (err) => console.error('Redis connection error:', err))

module.exports = client
