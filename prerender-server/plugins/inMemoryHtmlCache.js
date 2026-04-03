/**
 * Simple in-memory HTML cache for prerender responses.
 * (Upstream prerender v5 no longer ships this plugin; this mirrors the usual behavior.)
 */
const cache = Object.create(null);
const MAX_ENTRIES = 500;

function trimCache() {
  const keys = Object.keys(cache);
  if (keys.length <= MAX_ENTRIES) {
    return;
  }
  keys.slice(0, keys.length - MAX_ENTRIES).forEach((k) => {
    delete cache[k];
  });
}

module.exports = {
  requestReceived: (req, res, next) => {
    const u = req.prerender.url;
    const hit = cache[u];
    if (hit) {
      return res.send(200, hit);
    }
    next();
  },
  beforeSend: (req, res, next) => {
    if (
      req.prerender.renderType === "html" &&
      req.prerender.content &&
      req.prerender.statusCode >= 200 &&
      req.prerender.statusCode < 300
    ) {
      const body =
        typeof req.prerender.content === "string"
          ? req.prerender.content
          : req.prerender.content.toString();
      cache[req.prerender.url] = body;
      trimCache();
    }
    next();
  },
};
