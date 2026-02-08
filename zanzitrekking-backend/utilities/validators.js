/**
 * Validates an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} - Returns true if the email is valid, false otherwise
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Regular expression for basic email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Test the email against the regex
  if (!emailRegex.test(email)) {
    return false;
  }

  // Additional checks
  if (email.length > 254) {
    return false;
  }

  // Check for consecutive dots
  if (email.includes('..')) {
    return false;
  }

  // Split into local part and domain
  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;

  // Check local part length (max 64 chars)
  if (localPart.length > 64) {
    return false;
  }

  // Check domain part
  if (domain.includes(' ')) {
    return false;
  }

  // Check for valid TLD (top-level domain)
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return false;
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return false;
  }

  return true;
};

module.exports = { validateEmail };