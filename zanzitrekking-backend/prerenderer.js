/**
 * Prerender.io / self-hosted prerender middleware for crawlers.
 *
 * IMPORTANT: `prerender-node` exports the middleware function itself — do NOT call it as
 * prerender(). Invoking it with no (req,res,next) caused: Cannot read properties of
 * undefined (reading 'headers').
 */
const prerender = require("prerender-node");

function initPrerender(app) {
  if (!process.env.PRERENDER_SERVICE_URL) {
    console.warn(
      "[prerender] PRERENDER_SERVICE_URL not set; prerender middleware disabled.",
    );
    return;
  }

  prerender
    .set("prerenderServiceUrl", process.env.PRERENDER_SERVICE_URL)
    .set("whitelist", [
      "^/$",
      "^/trips",
      "^/trip/details",
      "^/blog",
      "^/about",
      "^/about-us",
      "^/contact",
      "^/contact-us",
    ])
    .set("blacklist", [
      "^/api",
      "\\.js$",
      "\\.css$",
      "\\.png$",
      "\\.jpg$",
    ])
    .set("crawlerUserAgents", [
      "googlebot",
      "bingbot",
      "yandex",
      "twitterbot",
      "facebookexternalhit",
      "linkedinbot",
    ])
    .set("forwardHeaders", true)
    .set("timeout", 10000);

  app.use(prerender);
}

module.exports = { initPrerender };
