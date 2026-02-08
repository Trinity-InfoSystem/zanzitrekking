/**
 * Route Prefetching Utility
 * Preloads route components on hover/focus for smoother navigation
 */

// Route component import functions
const routeImports = {
  "/trips": () => import("../pages/Trips"),
  "/trip/details": () => import("../pages/TripDetails"),
  "/cart": () => import("../pages/Cart"),
  "/about-us": () => import("../pages/AboutUs"),
  "/contact-us": () => import("../pages/ContactUs"),
  "/blog": () => import("../pages/Blog"),
  "/careers": () => import("../pages/Jobs"),
  "/checkout": () => import("../pages/Checkout"),
  "/dashboard": () => import("../pages/Dashboard"),
};

// Cache for prefetched routes
const prefetchCache = new Set();

/**
 * Prefetch a route component
 * @param {string} path - Route path to prefetch
 */
export const prefetchRoute = (path) => {
  // Normalize path (remove query params, trailing slashes)
  const normalizedPath = path.split("?")[0].replace(/\/$/, "") || "/";
  
  // Skip if already prefetched
  if (prefetchCache.has(normalizedPath)) {
    return;
  }

  // Find matching import
  const importFn = Object.keys(routeImports).find((key) => {
    if (key === "/") {return normalizedPath === "/";}
    return normalizedPath.startsWith(key);
  });

  if (importFn && routeImports[importFn]) {
    // Prefetch the route
    routeImports[importFn]()
      .then(() => {
        prefetchCache.add(normalizedPath);
      })
      .catch(() => {
        // Route prefetch failed, will load on demand
      });
  }
};

/**
 * Prefetch route on link hover/focus
 * Use this in Link components or navigation elements
 */
export const useRoutePrefetch = () => {
  const handleMouseEnter = (path) => {
    // Small delay to avoid prefetching on accidental hovers
    const timeoutId = setTimeout(() => {
      prefetchRoute(path);
    }, 100);

    return () => clearTimeout(timeoutId);
  };

  const handleFocus = (path) => {
    prefetchRoute(path);
  };

  return { handleMouseEnter, handleFocus };
};

/**
 * Prefetch critical routes on idle time
 */
export const prefetchCriticalRoutes = () => {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      // Prefetch most common routes
      prefetchRoute("/trips");
      prefetchRoute("/blog");
      prefetchRoute("/about-us");
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      prefetchRoute("/trips");
      prefetchRoute("/blog");
      prefetchRoute("/about-us");
    }, 2000);
  }
};
