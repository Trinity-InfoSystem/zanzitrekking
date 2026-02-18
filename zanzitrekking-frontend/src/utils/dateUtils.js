/**
 * Date utility functions for consistent date formatting across the application
 */

/**
 * Format date as YYYY-MM-DD (local date, no timezone conversion)
 * This ensures dates are sent to the backend in the expected format
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string in YYYY-MM-DD format
 */
export const formatDateForAPI = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  
  // Use local date components to avoid timezone issues
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Get tomorrow's date formatted as YYYY-MM-DD
 * Useful for setting minimum dates in date pickers
 * @returns {string} Tomorrow's date in YYYY-MM-DD format
 */
export const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateForAPI(tomorrow);
};

/**
 * Get today's date formatted as YYYY-MM-DD
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => {
  return formatDateForAPI(new Date());
};
