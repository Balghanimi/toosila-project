import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessLines } from '../config/featureFlags';

/**
 * LinesRoute - Protected route wrapper for Lines feature
 * Redirects to Lines Coming Soon page if user doesn't have access
 */
const LinesRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // Debug: Log access check (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('[LinesRoute] User:', currentUser?.name, 'Role:', currentUser?.role, 'Can Access:', canAccessLines(currentUser));
  }

  if (!canAccessLines(currentUser)) {
    return <Navigate to="/lines-coming-soon" replace />;
  }

  return children;
};

export default LinesRoute;
