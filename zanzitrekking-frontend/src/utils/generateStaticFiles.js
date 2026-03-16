/**
 * Static File Generator for Client-Side
 * Generates sitemap.xml and robots.txt dynamically
 * This can be called from the app or used in a build script
 */

import { generateRobotsTxt, generateSitemap } from "./sitemap";

/**
 * Generate and serve sitemap.xml
 * This can be used in a server route or static file generation
 */
export const getSitemapXml = () => {
  // For now, return static routes only
  // In production, you'd fetch dynamic routes from your API
  const dynamicRoutes = [];
  return generateSitemap(dynamicRoutes);
};

/**
 * Generate and serve robots.txt
 */
export const getRobotsTxt = () => {
  return generateRobotsTxt();
};
