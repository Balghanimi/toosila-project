const config = require('../config/env');

/**
 * Calculate pagination parameters
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @returns {Object} Pagination parameters
 */
const calculatePagination = (page = 1, limit = config.DEFAULT_PAGE_SIZE) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(config.MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    offset
  };
};

/**
 * Create pagination metadata
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @returns {Object} Pagination metadata
 */
const createPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

/**
 * Validate pagination parameters
 * @param {Object} query - Query parameters
 * @returns {Object} Validated pagination parameters
 */
const validatePagination = (query) => {
  const { page = 1, limit = config.DEFAULT_PAGE_SIZE } = query;
  
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(config.MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));

  return {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  };
};

/**
 * Create paginated response
 * @param {Array} data - Array of items
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @returns {Object} Paginated response
 */
const createPaginatedResponse = (data, total, page, limit) => {
  const pagination = createPaginationMeta(total, page, limit);
  
  return {
    data,
    pagination
  };
};

/**
 * Extract pagination parameters from request query
 * @param {Object} req - Express request object
 * @returns {Object} Pagination parameters
 */
const extractPaginationFromQuery = (req) => {
  const { page = 1, limit = config.DEFAULT_PAGE_SIZE } = req.query;
  return validatePagination({ page, limit });
};

/**
 * Create pagination links for API responses
 * @param {string} baseUrl - Base URL for the API endpoint
 * @param {Object} pagination - Pagination metadata
 * @param {Object} query - Additional query parameters
 * @returns {Object} Pagination links
 */
const createPaginationLinks = (baseUrl, pagination, query = {}) => {
  const { page, limit, totalPages, hasNextPage, hasPrevPage } = pagination;
  
  const createUrl = (pageNum) => {
    const params = new URLSearchParams({
      page: pageNum,
      limit,
      ...query
    });
    return `${baseUrl}?${params.toString()}`;
  };

  return {
    first: createUrl(1),
    last: createUrl(totalPages),
    prev: hasPrevPage ? createUrl(page - 1) : null,
    next: hasNextPage ? createUrl(page + 1) : null,
    self: createUrl(page)
  };
};

/**
 * Format pagination response with links
 * @param {Array} data - Array of items
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @param {string} baseUrl - Base URL for the API endpoint
 * @param {Object} query - Additional query parameters
 * @returns {Object} Formatted pagination response
 */
const formatPaginatedResponse = (data, total, page, limit, baseUrl, query = {}) => {
  const pagination = createPaginationMeta(total, page, limit);
  const links = createPaginationLinks(baseUrl, pagination, query);
  
  return {
    data,
    pagination: {
      ...pagination,
      links
    }
  };
};

module.exports = {
  calculatePagination,
  createPaginationMeta,
  validatePagination,
  createPaginatedResponse,
  extractPaginationFromQuery,
  createPaginationLinks,
  formatPaginatedResponse
};

