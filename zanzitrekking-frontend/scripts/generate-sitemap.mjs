/**
 * Sitemap Generation Script
 * Generates sitemap.xml and robots.txt for production builds
 * Run this script after building the application
 */

import { writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, "../dist");

// Import route config (we'll inline the sitemap generation here)
const BASE_URL = "https://booking.zanzisafaris.com";

const routeConfig = {
  home: { path: "/", priority: 1.0, changefreq: "daily" },
  trips: { path: "/trips", priority: 0.9, changefreq: "daily" },
  blog: { path: "/blog", priority: 0.8, changefreq: "daily" },
  aboutUs: { path: "/about-us", priority: 0.8, changefreq: "monthly" },
  contactUs: { path: "/contact-us", priority: 0.8, changefreq: "monthly" },
  careers: { path: "/careers", priority: 0.7, changefreq: "weekly" },
  googleReviews: { path: "/reviews/google", priority: 0.6, changefreq: "weekly" },
  tripAdvisorReviews: { path: "/reviews/tripadvisor", priority: 0.6, changefreq: "weekly" },
  safariBookingReviews: { path: "/reviews/safariBooking", priority: 0.6, changefreq: "weekly" },
  getYourGuideReviews: { path: "/reviews/getYourGuide", priority: 0.6, changefreq: "weekly" },
  termsOfService: { path: "/terms-of-service", priority: 0.3, changefreq: "monthly" },
  privacyPolicy: { path: "/privacy-policy", priority: 0.3, changefreq: "monthly" },
  cookiePolicy: { path: "/cookie-policy", priority: 0.3, changefreq: "monthly" },
};

const escapeXml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const generateSitemap = () => {
  const staticRoutes = Object.values(routeConfig);
  const urls = staticRoutes.map((route) => ({
    loc: `${BASE_URL}${route.path}`,
    lastmod: new Date().toISOString().split("T")[0],
    changefreq: route.changefreq || "monthly",
    priority: route.priority || 0.5,
  }));

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

const generateRobotsTxt = () => {
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

// Generate sitemap.xml
try {
  const sitemap = generateSitemap();
  writeFileSync(join(distPath, "sitemap.xml"), sitemap, "utf-8");
  console.log("✅ Generated sitemap.xml");
} catch (error) {
  console.error("❌ Failed to generate sitemap.xml:", error.message);
  process.exit(1);
}

// Generate robots.txt
try {
  const robotsTxt = generateRobotsTxt();
  writeFileSync(join(distPath, "robots.txt"), robotsTxt, "utf-8");
  console.log("✅ Generated robots.txt");
} catch (error) {
  console.error("❌ Failed to generate robots.txt:", error.message);
  process.exit(1);
}

console.log("\n📄 SEO files generated successfully!");
