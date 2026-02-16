import { useRef, useEffect } from "react";

const GoogleReviewsWidgets = () => {
  const widgetRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector(
      'script[src="https://elfsightcdn.com/platform.js"]',
    );

    if (!existingScript && !scriptLoadedRef.current) {
      // Create and load the Elfsight script
      const script = document.createElement("script");
      script.src = "https://elfsightcdn.com/platform.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        scriptLoadedRef.current = true;
        // Reinitialize widgets after script loads
        if (window.elfsight) {
          window.elfsight.init();
        }
      };
      script.onerror = () => {
        console.error("Failed to load Elfsight widget script");
        scriptLoadedRef.current = false;
      };
      document.body.appendChild(script);
    } else if (existingScript) {
      scriptLoadedRef.current = true;
      // If script already exists, try to reinitialize
      if (window.elfsight) {
        window.elfsight.init();
      }
    }

    // Cleanup function
    return () => {};
  }, []);

  return (
    <div className="google-reviews-widget-container">
      <div
        ref={widgetRef}
        className="elfsight-app-15621045-455b-4112-abe8-10cbdeba506c"
        data-elfsight-app-lazy
      ></div>
    </div>
  );
};

export default GoogleReviewsWidgets;
