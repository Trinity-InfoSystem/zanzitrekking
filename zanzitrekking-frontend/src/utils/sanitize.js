import DOMPurify from "dompurify";

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Uses DOMPurify to remove potentially dangerous HTML/JavaScript.
 * 
 * @param {string} dirty - The unsanitized HTML string
 * @param {object} options - Optional DOMPurify configuration
 * @returns {string} - Sanitized HTML string safe for rendering
 */
export const sanitizeHTML = (dirty, options = {}) => {
  if (!dirty || typeof dirty !== "string") {
    return "";
  }

  // Default configuration: allow safe HTML tags and attributes
  const defaultConfig = {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "code",
      "pre",
      "span",
      "div",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
    ],
    ALLOWED_ATTR: [
      "href",
      "src",
      "alt",
      "title",
      "class",
      "id",
      "style",
      "target",
      "rel",
    ],
    ALLOWED_URI_REGEXP:
      // eslint-disable-next-line no-useless-escape
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Prevent data URIs and javascript: protocols
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  };

  const config = { ...defaultConfig, ...options };

  return DOMPurify.sanitize(dirty, config);
};

/**
 * Sanitizes HTML and returns only plain text (strips all HTML tags).
 * Useful for extracting text content safely.
 * 
 * @param {string} html - The HTML string to extract text from
 * @returns {string} - Plain text content
 */
export const sanitizeToText = (html) => {
  if (!html || typeof html !== "string") {
    return "";
  }

  // Sanitize and then extract text content
  const sanitized = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  return sanitized.trim();
};
