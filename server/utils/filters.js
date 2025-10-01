/**
 * Filter and sanitize query parameters for database queries
 * @param {Object} query - Query parameters from request
 * @param {Array} allowedFilters - Array of allowed filter keys
 * @returns {Object} Sanitized filters
 */
const sanitizeFilters = (query, allowedFilters = []) => {
  const filters = {};
  
  allowedFilters.forEach(filter => {
    if (query[filter] !== undefined && query[filter] !== null && query[filter] !== '') {
      filters[filter] = query[filter];
    }
  });
  
  return filters;
};

/**
 * Create filter object for offers
 * @param {Object} query - Query parameters
 * @returns {Object} Filter object for offers
 */
const createOfferFilters = (query) => {
  const allowedFilters = ['category', 'location', 'minPrice', 'maxPrice', 'search', 'userId'];
  return sanitizeFilters(query, allowedFilters);
};

/**
 * Create filter object for demands
 * @param {Object} query - Query parameters
 * @returns {Object} Filter object for demands
 */
const createDemandFilters = (query) => {
  const allowedFilters = ['category', 'location', 'maxPrice', 'search', 'userId'];
  return sanitizeFilters(query, allowedFilters);
};

/**
 * Create filter object for bookings
 * @param {Object} query - Query parameters
 * @returns {Object} Filter object for bookings
 */
const createBookingFilters = (query) => {
  const allowedFilters = ['status', 'userId', 'offerId', 'offerOwnerId'];
  return sanitizeFilters(query, allowedFilters);
};

/**
 * Create filter object for messages
 * @param {Object} query - Query parameters
 * @returns {Object} Filter object for messages
 */
const createMessageFilters = (query) => {
  const allowedFilters = ['senderId', 'recipientId', 'isRead'];
  return sanitizeFilters(query, allowedFilters);
};

/**
 * Create filter object for ratings
 * @param {Object} query - Query parameters
 * @returns {Object} Filter object for ratings
 */
const createRatingFilters = (query) => {
  const allowedFilters = ['targetUserId', 'userId', 'bookingId', 'minRating'];
  return sanitizeFilters(query, allowedFilters);
};

/**
 * Validate and convert numeric filters
 * @param {Object} filters - Filter object
 * @param {Array} numericFields - Array of fields that should be numeric
 * @returns {Object} Filters with converted numeric values
 */
const convertNumericFilters = (filters, numericFields = []) => {
  const convertedFilters = { ...filters };
  
  numericFields.forEach(field => {
    if (convertedFilters[field] !== undefined) {
      const numValue = parseFloat(convertedFilters[field]);
      if (!isNaN(numValue)) {
        convertedFilters[field] = numValue;
      } else {
        delete convertedFilters[field];
      }
    }
  });
  
  return convertedFilters;
};

/**
 * Validate and convert integer filters
 * @param {Object} filters - Filter object
 * @param {Array} integerFields - Array of fields that should be integers
 * @returns {Object} Filters with converted integer values
 */
const convertIntegerFilters = (filters, integerFields = []) => {
  const convertedFilters = { ...filters };
  
  integerFields.forEach(field => {
    if (convertedFilters[field] !== undefined) {
      const intValue = parseInt(convertedFilters[field]);
      if (!isNaN(intValue)) {
        convertedFilters[field] = intValue;
      } else {
        delete convertedFilters[field];
      }
    }
  });
  
  return convertedFilters;
};

/**
 * Validate and convert boolean filters
 * @param {Object} filters - Filter object
 * @param {Array} booleanFields - Array of fields that should be boolean
 * @returns {Object} Filters with converted boolean values
 */
const convertBooleanFilters = (filters, booleanFields = []) => {
  const convertedFilters = { ...filters };
  
  booleanFields.forEach(field => {
    if (convertedFilters[field] !== undefined) {
      const boolValue = convertedFilters[field] === 'true' || convertedFilters[field] === true;
      convertedFilters[field] = boolValue;
    }
  });
  
  return convertedFilters;
};

/**
 * Create search filter for text fields
 * @param {string} searchTerm - Search term
 * @param {Array} fields - Array of fields to search in
 * @returns {Object} Search filter object
 */
const createSearchFilter = (searchTerm, fields = []) => {
  if (!searchTerm || !fields.length) {
    return {};
  }
  
  return {
    search: searchTerm.trim(),
    searchFields: fields
  };
};

/**
 * Create date range filter
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Object} Date range filter
 */
const createDateRangeFilter = (startDate, endDate) => {
  const filter = {};
  
  if (startDate) {
    filter.startDate = new Date(startDate);
  }
  
  if (endDate) {
    filter.endDate = new Date(endDate);
  }
  
  return filter;
};

/**
 * Create price range filter
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {Object} Price range filter
 */
const createPriceRangeFilter = (minPrice, maxPrice) => {
  const filter = {};
  
  if (minPrice !== undefined && minPrice !== null) {
    filter.minPrice = parseFloat(minPrice);
  }
  
  if (maxPrice !== undefined && maxPrice !== null) {
    filter.maxPrice = parseFloat(maxPrice);
  }
  
  return filter;
};

/**
 * Remove empty filters
 * @param {Object} filters - Filter object
 * @returns {Object} Filters with empty values removed
 */
const removeEmptyFilters = (filters) => {
  const cleanedFilters = {};
  
  Object.keys(filters).forEach(key => {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== '') {
      cleanedFilters[key] = value;
    }
  });
  
  return cleanedFilters;
};

module.exports = {
  sanitizeFilters,
  createOfferFilters,
  createDemandFilters,
  createBookingFilters,
  createMessageFilters,
  createRatingFilters,
  convertNumericFilters,
  convertIntegerFilters,
  convertBooleanFilters,
  createSearchFilter,
  createDateRangeFilter,
  createPriceRangeFilter,
  removeEmptyFilters
};

