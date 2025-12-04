import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Admin Route Guard Component
 * Protects admin routes from unauthorized access
 */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--surface-primary)',
        }}
      >
        <div
          style={{
            width: '50px',
            height: '50px',
            border: '4px solid var(--border-light)',
            borderTop: '4px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        ></div>
      </div>
    );
  }

  // Check if user is authenticated and has admin role
  if (!user || user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
