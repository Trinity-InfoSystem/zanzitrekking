/**
 * Validates if a URL is safe for redirection.
 * Prevents open redirect vulnerabilities by ensuring URLs are:
 * - Absolute URLs with allowed protocols (https, http for same-origin)
 * - Relative URLs (starting with /)
 * 
 * @param {string} url - The URL to validate
 * @param {string[]} allowedDomains - Optional array of allowed domains
 * @returns {boolean} - True if URL is safe, false otherwise
 */
export const isValidRedirectUrl = (url, allowedDomains = []) => {
  if (!url || typeof url !== "string") {
    return false;
  }

  // Allow relative URLs (starting with /)
  if (url.startsWith("/")) {
    return true;
  }

  try {
    const urlObj = new URL(url);

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return false;
    }

    // If allowedDomains is specified, check if domain is in the list
    if (allowedDomains.length > 0) {
      const hostname = urlObj.hostname.toLowerCase();
      return allowedDomains.some(
        (domain) => hostname === domain.toLowerCase() || hostname.endsWith(`.${domain.toLowerCase()}`),
      );
    }

    // For external URLs, prefer https
    // In production, you might want to be more restrictive
    return urlObj.protocol === "https:";
  } catch (error) {
    // Invalid URL format
    return false;
  }
};

/**
 * Safely redirects to a URL after validation.
 * 
 * @param {string} url - The URL to redirect to
 * @param {string[]} allowedDomains - Optional array of allowed domains
 * @returns {boolean} - True if redirect was performed, false if URL was invalid
 */
export const safeRedirect = (url, allowedDomains = []) => {
  if (!isValidRedirectUrl(url, allowedDomains)) {
    console.error("Invalid or unsafe redirect URL:", url);
    return false;
  }

  window.location.href = url;
  return true;
};
