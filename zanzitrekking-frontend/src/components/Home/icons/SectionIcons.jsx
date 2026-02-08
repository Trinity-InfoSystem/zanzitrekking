import { memo } from "react";

// Custom SVG Icons for SectionDivider
export const Mountain = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 18L9 6l4 12 4-12 3 12H5z"
    />
  </svg>
);

export const TreePine = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 2L8 6h8l-4-4zM12 6L6 12h12l-6-6zM12 12L4 18h16l-8-6zM12 18v4"
    />
  </svg>
);

export const Compass = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
  </svg>
);

export const Tent = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 20L12 4l9 16H3zM12 4v16"
    />
  </svg>
);

export const Star = memo(({ className }) => {
  Star.displayName = "Star";
  try {
    return (
      <svg 
        className={className} 
        fill="currentColor" 
        viewBox="0 0 24 24"
        style={{ display: "inline-block" }}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  } catch (error) {
    return <span className={className}>★</span>;
  }
});

export const Award = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88" />
  </svg>
);

export const ChevronLeft = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

export const ChevronRight = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polyline points="9,18 15,12 9,6" />
  </svg>
);

export default {
  Mountain,
  TreePine,
  Compass,
  Tent,
  Star,
  Award,
  ChevronLeft,
  ChevronRight,
};
