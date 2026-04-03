const prerender = require('prerender-node');

const initPrerender = (app) => {

  if (process.env.PRERENDER_SERVICE_URL) {
    const prerenderMiddleware = prerender();
  
    prerenderMiddleware
      .set('prerenderServiceUrl', process.env.PRERENDER_SERVICE_URL)
    
      .set('whitelist', [
        '^/$',
        '^/trips',
        '^/trip/details',
        '^/blog',
        '^/about',
        '^/contact'
      ])
    
      .set('blacklist', [
        '^/api',
        '\\.js$',
        '\\.css$',
        '\\.png$',
        '\\.jpg$'
      ])
    
      .set('crawlerUserAgents', [
        'googlebot',
        'bingbot',
        'yandex',
        'twitterbot',
        'facebookexternalhit',
        'linkedinbot'
      ])
    
      .set('forwardHeaders', true)
      .set('timeout', 10000);

      app.use(prerenderMiddleware)
  } else {
    console.warn('Server started without Prerender service')
  }
}  

module.exports = {
  initPrerender
}
