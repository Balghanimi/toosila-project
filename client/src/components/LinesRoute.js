import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessLines } from '../config/featureFlags';

/**
 * LinesRoute - Protected route wrapper for Lines feature
 * Redirects to Lines Coming Soon page if user doesn't have access
 */
const LinesRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Debug: Always log for debugging blank page issue
  console.log('[LinesRoute] Debug:', {
    currentUser: currentUser ? { name: currentUser.name, role: currentUser.role, id: currentUser.id } : null,
    loading,
    canAccess: canAccessLines(currentUser),
    hasChildren: !!children,
  });

  // Wait for auth to load before making access decision
  if (loading) {
    console.log('[LinesRoute] Auth loading, showing spinner...');
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!canAccessLines(currentUser)) {
    console.log('[LinesRoute] Access denied, redirecting to coming-soon');
    return <Navigate to="/lines-coming-soon" replace />;
  }

  console.log('[LinesRoute] Access granted, rendering children');
  return children;
};

export default LinesRoute;
