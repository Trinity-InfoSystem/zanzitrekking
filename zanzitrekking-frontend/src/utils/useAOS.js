import { useEffect, useRef } from "react";

// Lazy load AOS to reduce initial bundle size
let aosLoaded = false;
let aosPromise = null;

const loadAOS = async () => {
  if (aosLoaded) {return;}
  
  if (!aosPromise) {
    aosPromise = import("aos").then((module) => {
      aosLoaded = true;
      return module.default;
    });
  }
  
  return aosPromise;
};

/**
 * Hook to lazy load and initialize AOS (Animate On Scroll)
 * Only loads AOS when the component mounts, reducing initial bundle size
 * 
 * @param {Object} options - AOS initialization options
 * @param {boolean} options.once - Whether to animate only once
 * @param {number} options.duration - Animation duration
 * @param {number} options.offset - Offset from trigger point
 * @param {string} options.easing - Easing function
 */
export const useAOS = (options = {}) => {
  const initialized = useRef(false);
  
  useEffect(() => {
    if (initialized.current) {return;}
    
    const initAOS = async () => {
      try {
        const AOS = await loadAOS();
        if (!initialized.current) {
          AOS.init({
            once: true,
            duration: 800,
            offset: 60,
            ...options,
          });
          initialized.current = true;
        }
      } catch (error) {
        // AOS failed to load - continue without animations
      }
    };
    
    // Use requestIdleCallback if available, otherwise setTimeout
    if ("requestIdleCallback" in window) {
      requestIdleCallback(initAOS, { timeout: 2000 });
    } else {
      setTimeout(initAOS, 100);
    }
  }, [options]);
};
