/**
 * PrefetchLink Component
 * Enhanced Link component with automatic route prefetching on hover/focus
 * Use this instead of regular Link for better navigation performance
 */
import { Link } from "react-router-dom";
import { prefetchRoute } from "../../utils/routeOptimization";
import { useCallback } from "react";

const PrefetchLink = ({ to, children, className, onMouseEnter, onFocus, ...props }) => {
  const handleMouseEnter = useCallback(
    (e) => {
      // Prefetch the route on hover
      if (to) {
        prefetchRoute(to);
      }
      // Call original onMouseEnter if provided
      if (onMouseEnter) {
        onMouseEnter(e);
      }
    },
    [to, onMouseEnter],
  );

  const handleFocus = useCallback(
    (e) => {
      // Prefetch the route on focus (keyboard navigation)
      if (to) {
        prefetchRoute(to);
      }
      // Call original onFocus if provided
      if (onFocus) {
        onFocus(e);
      }
    },
    [to, onFocus],
  );

  return (
    <Link
      to={to}
      className={className}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      {...props}
    >
      {children}
    </Link>
  );
};

export default PrefetchLink;
