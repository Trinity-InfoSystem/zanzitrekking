/**
 * Route Optimization Utilities
 * Handles route prefetching, preloading, and performance optimizations
 */

import { getPreloadRoutes, getRouteConfig } from "../config/routes";

/**
 * Preload critical route chunks
 * Called after initial page load to improve navigation speed
 */
export const preloadCriticalRoutes = () => {
  if (typeof window === "undefined") {return;}

  const preloadRoutes = getPreloadRoutes();
  
  preloadRoutes.forEach((route) => {
    if (route.component) {
      // Preload the route component
      route.component().catch(() => {
        // Route preload failed, will load on demand
      });
    }
  });
};

/**
 * Prefetch route on link hover/focus
 * @param {string} path - Route path to prefetch
 */
export const prefetchRoute = (path) => {
  if (typeof window === "undefined") {return;}

  const routeConfig = getRouteConfig(path);
  
  if (routeConfig?.component) {
    // Use link prefetching for better performance
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = path;
    link.as = "document";
    document.head.appendChild(link);

    // Also preload the component chunk
    routeConfig.component().catch(() => {
      // Route prefetch failed, will load on demand
    });
  }
};

/**
 * Initialize route optimizations
 * Should be called after app mount
 */
export const initRouteOptimizations = () => {
  if (typeof window === "undefined") {return;}

  // Preload critical routes after initial load
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      preloadCriticalRoutes();
    }, { timeout: 2000 });
  } else {
    setTimeout(() => {
      preloadCriticalRoutes();
    }, 2000);
  }

  // Prefetch routes on link hover
  document.addEventListener("mouseover", (e) => {
    const link = e.target.closest("a[href]");
    if (link && link.href.startsWith(window.location.origin)) {
      const path = new URL(link.href).pathname;
      // Small delay to avoid prefetching on accidental hovers
      setTimeout(() => {
        prefetchRoute(path);
      }, 100);
    }
  }, { passive: true });

  // Prefetch routes on link focus (keyboard navigation)
  document.addEventListener("focusin", (e) => {
    const link = e.target.closest("a[href]");
    if (link && link.href.startsWith(window.location.origin)) {
      const path = new URL(link.href).pathname;
      prefetchRoute(path);
    }
  }, { passive: true });
};

/**
 * Get route chunk name for monitoring
 */
export const getRouteChunk = (pathname) => {
  const routeConfig = getRouteConfig(pathname);
  return routeConfig?.chunk || "unknown";
};
