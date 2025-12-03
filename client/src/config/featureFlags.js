/**
 * Feature Flags Configuration
 * Control feature visibility and access
 */

export const FEATURES = {
  // Lines Feature (خطوط الاشتراك اليومي)
  LINES_ENABLED: false, // Set to true to enable for everyone
  LINES_ADMIN_ONLY: true, // When true, only admins can access full feature
  LINES_SHOW_COMING_SOON: true, // Show coming soon page to non-admin users
};

/**
 * Check if user can access full Lines feature
 * @param {Object} user - Current user object
 * @returns {boolean} - Whether user can access full Lines feature
 */
export const canAccessLines = (user) => {
  // If feature is enabled for everyone
  if (FEATURES.LINES_ENABLED) return true;

  // If admin-only mode and user is admin
  if (FEATURES.LINES_ADMIN_ONLY && user?.role === 'admin') return true;

  return false;
};

/**
 * Check if Lines should be visible in navigation (even as coming soon)
 * @returns {boolean} - Whether Lines link should show in nav
 */
export const showLinesInNav = () => {
  return FEATURES.LINES_ENABLED || FEATURES.LINES_SHOW_COMING_SOON;
};
