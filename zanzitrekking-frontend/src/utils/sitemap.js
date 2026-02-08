/**
 * Sitemap Generator Utility
 * Generates sitemap.xml for better SEO and crawlability
 */

import { BASE_URL, routeConfig } from "../config/routes";

/**
 * Generate sitemap XML string
 * @param {Array} dynamicRoutes - Array of dynamic routes with their URLs
 * @returns {string} XML sitemap string
 */
export const generateSitemap = (dynamicRoutes = []) => {
  const staticRoutes = Object.values(routeConfig).filter(
    (route) => !route.dynamic && !route.metadata?.robots?.includes("noindex"),
  );

  const urls = [
    // Static routes
    ...staticRoutes.map((route) => ({
      loc: `${BASE_URL}${route.path}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: route.changefreq || "monthly",
      priority: route.priority || 0.5,
    })),
    // Dynamic routes (trips, blog posts, jobs)
    ...dynamicRoutes.map((route) => ({
      loc: `${BASE_URL}${route.path}`,
      lastmod: route.lastmod || new Date().toISOString().split("T")[0],
      changefreq: route.changefreq || "weekly",
      priority: route.priority || 0.7,
    })),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return sitemap;
};

/**
 * Escape XML special characters
 */
const escapeXml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

/**
 * Generate robots.txt content
 */
export const generateRobotsTxt = () => {
  return `# robots.txt for ${BASE_URL}

User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /cart
Disallow: /checkout
Disallow: /order-confirmation
Disallow: /login
Disallow: /register
Disallow: /apply/
Disallow: /job-application-success
Disallow: /forgot-password-*

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl-delay (optional, adjust as needed)
Crawl-delay: 1
`;
};
