const redis = require('../redis')

async function delPattern(pattern) {
  const stream = redis.scanStream({
    match: pattern,
    count: 1000
  })

  stream.on('data', (keys) => {
    if (keys.length) {
      const pipeline = redis.pipeline()
      keys.forEach((key) => pipeline.del(key))
      pipeline.exec()
    }
  })

  return new Promise((resolve) => {
    stream.on('end', resolve)
  })
}

module.exports = { delPattern }
