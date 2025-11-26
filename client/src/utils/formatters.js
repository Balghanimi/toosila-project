/**
 * Number and Date Formatting Utilities
 * Ensures all numbers display in English (Latin) format: 0-9
 * Prevents Arabic numeral display: ٠-٩
 */

/**
 * Convert Arabic numerals to English numerals
 * Converts: ١٢٣٤٥ → 12345
 * @param {string|number} num - Number to convert
 * @returns {string} Number with English numerals
 */
export const toEnglishNumber = (num) => {
  if (num === null || num === undefined) return '';

  // Convert to string and replace Arabic numerals
  return String(num)
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[\u0660-\u0669]/g, (d) => d.charCodeAt(0) - 1632);
};

/**
 * Format price with English numerals and thousand separators
 * Example: 25000 → "25,000"
 * @param {number} price - Price to format
 * @returns {string} Formatted price
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '0';
  return toEnglishNumber(Number(price).toLocaleString('en-US'));
};

/**
 * Format date to show English numerals in YYYY-MM-DD format
 * Example: "٢٠٢٥-١١-٢٢" → "2025-11-22"
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  } catch {
    return '';
  }
};

/**
 * Format time to show English numerals in HH:MM format
 * Handles both time strings ("09:30") and ISO datetime strings ("2025-10-31T14:12:00.000Z")
 * Example: "٠٩:٣٠" → "09:30"
 * Example: "2025-10-31T14:12:00.000Z" → "14:12"
 * @param {string} time - Time to format
 * @returns {string} Formatted time
 */
export const formatTime = (time) => {
  if (!time) return '';
  try {
    const d = new Date(time);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    return toEnglishNumber(time);
  } catch {
    return toEnglishNumber(time);
  }
};

/**
 * Format datetime to readable string with English numerals
 * @param {string|Date} datetime - Datetime to format
 * @returns {string} Formatted datetime
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '';
  try {
    const d = new Date(datetime);
    if (isNaN(d.getTime())) return '';

    const date = d.toLocaleDateString('en-CA');
    const time = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return `${toEnglishNumber(date)} ${toEnglishNumber(time)}`;
  } catch {
    return '';
  }
};

/**
 * Format rating number (e.g., 4.5)
 * @param {number} rating - Rating value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted rating
 */
export const formatRating = (rating, decimals = 1) => {
  if (!rating && rating !== 0) return '0';
  return toEnglishNumber(Number(rating).toFixed(decimals));
};

/**
 * Format seats count
 * @param {number} seats - Number of seats
 * @returns {string} Formatted seats count
 */
export const formatSeats = (seats) => {
  if (!seats && seats !== 0) return '0';
  return toEnglishNumber(seats);
};

/**
 * Format percentage
 * @param {number} value - Percentage value
 * @returns {string} Formatted percentage with % symbol
 */
export const formatPercentage = (value) => {
  if (!value && value !== 0) return '0%';
  return `${toEnglishNumber(value)}%`;
};

/**
 * Format large numbers with K suffix (e.g., 10000 → 10K)
 * @param {number} num - Number to format
 * @returns {string} Formatted number with K suffix
 */
export const formatLargeNumber = (num) => {
  if (!num && num !== 0) return '0';
  if (num >= 1000) {
    return toEnglishNumber(`${(num / 1000).toFixed(0)}K`);
  }
  return toEnglishNumber(num);
};
