const url = require("url");

/**
 * Only allow prerendering for specific path patterns (path only; query string ignored).
 * Keep in sync with Apache .htaccess crawler rules and public routes.
 *
 * Note: This app uses /about-us and /contact-us. If you prerender those pages,
 * add them here (and in .htaccess) — the stock list uses /about and /contact per spec.
 */
function isAllowedPath(pathname) {
  if (!pathname) {
    return false;
  }
  const p = pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;

  if (p === "/trips") {
    return true;
  }
  if (p.startsWith("/trip/details/")) {
    return true;
  }
  if (p === "/blog" || p.startsWith("/blog/")) {
    return true;
  }
  if (p === "/about" || p === "/contact") {
    return true;
  }
  return false;
}

module.exports = {
  requestReceived: (req, res, next) => {
    const parsed = url.parse(req.prerender.url);
    const pathname = parsed.pathname || "";

    if (isAllowedPath(pathname)) {
      next();
    } else {
      res.send(404);
    }
  },
};
