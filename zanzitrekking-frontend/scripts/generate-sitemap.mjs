/**
 * Sitemap Generation Script
 * Generates sitemap.xml and robots.txt for production builds
 * Run this script after building the application
 */

import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { routeConfig } from "../src/config/routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, "../dist");
dotenv.config({ path: join(__dirname, "../.env.production") });

// Import route config (we'll inline the sitemap generation here)
const BASE_URL = process.env.VITE_FRONTEND_URL || "https://zanzisafaris.com";
const API_URL = process.env.VITE_API_URL || "https://api.zanzisafaris.com/api";

const escapeXml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const fetchDynamicUrls = async () => {
  const today = new Date().toISOString().split("T")[0];
  const dynamicUrls = [];

  try {
    const [tripsRes, blogsRes] = await Promise.all([
      fetch(`${API_URL}/trips`),
      fetch(`${API_URL}/blogs`),
    ]);

    if (!tripsRes.ok || !blogsRes.ok) {
      throw new Error(
        `Failed API responses: trips=${tripsRes.status}, blogs=${blogsRes.status}`,
      );
    }

    const trips = await tripsRes.json();
    const blogs = await blogsRes.json();

    if (Array.isArray(trips)) {
      for (const trip of trips) {
        if (trip?._id) {
          dynamicUrls.push({
            loc: `${BASE_URL}/trip/details/${trip._id}`,
            lastmod: today,
            changefreq: "weekly",
            priority: 0.8,
          });
        }
      }
    }

    if (Array.isArray(blogs)) {
      for (const blog of blogs) {
        if (blog?._id) {
          dynamicUrls.push({
            loc: `${BASE_URL}/blog/${blog._id}`,
            lastmod: today,
            changefreq: "weekly",
            priority: 0.7,
          });
        }
      }
    }
  } catch (error) {
    // Do not fail the build if dynamic sitemap fetching fails.
    console.warn(`⚠️ Dynamic sitemap fetch failed: ${error.message}`);
  }

  return dynamicUrls;
};

const generateSitemap = async () => {
  const staticRoutes = Object.values(routeConfig).filter((route) => {
    if (route.dynamic) {
      return false;
    }
    const robots = route.metadata?.robots || "";
    return !robots.includes("noindex");
  });
  const urls = staticRoutes.map((route) => ({
    loc: `${BASE_URL}${route.path}`,
    lastmod: new Date().toISOString().split("T")[0],
    changefreq: route.changefreq || "monthly",
    priority: route.priority || 0.5,
  }));
  const dynamicUrls = await fetchDynamicUrls();
  const allUrls = [...urls, ...dynamicUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allUrls
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
Disallow: /careers/application-success
Disallow: /forgot-password-*
Disallow: /my-bookings
Disallow: /orders
Disallow: /payment

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl-delay (optional, adjust as needed)
Crawl-delay: 1
`;
};

// Generate sitemap.xml
try {
  const sitemap = await generateSitemap();
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
