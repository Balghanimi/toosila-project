import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

/**
 * Admin Panel Layout with Sidebar Navigation
 */
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Prevent body scroll on mobile when sidebar is open
  React.useEffect(() => {
    if (window.innerWidth <= 768 && sidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      path: '/admin',
      icon: '📊',
      label: 'لوحة التحكم',
      end: true,
    },
    {
      path: '/admin/users',
      icon: '👥',
      label: 'إدارة المستخدمين',
    },
    {
      path: '/admin/verification',
      icon: '✅',
      label: 'التحقق من الهوية',
    },
    {
      path: '/admin/statistics',
      icon: '📈',
      label: 'الإحصائيات',
    },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
          onTouchStart={(e) => e.preventDefault()}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {/* Logo & Title */}
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <span className="admin-logo-icon">⚡</span>
            {sidebarOpen && <span className="admin-logo-text">لوحة الإدارة</span>}
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="admin-user-info">
            <div className="admin-user-avatar">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
            <div className="admin-user-details">
              <div className="admin-user-name">{user?.name}</div>
              <div className="admin-user-role">مدير النظام</div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="admin-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="admin-nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="admin-sidebar-footer">
          <button onClick={() => navigate('/')} className="admin-action-btn" title="العودة للموقع">
            <span className="admin-nav-icon">🏠</span>
            {sidebarOpen && <span className="admin-nav-label">الموقع الرئيسي</span>}
          </button>
          <button onClick={handleLogout} className="admin-action-btn logout" title="تسجيل الخروج">
            <span className="admin-nav-icon">🚪</span>
            {sidebarOpen && <span className="admin-nav-label">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <button
            className="admin-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <span>{sidebarOpen ? '◀' : '▶'}</span>
          </button>

          <div className="admin-topbar-title">
            <h1>توصيلة - لوحة الإدارة</h1>
          </div>

          <div className="admin-topbar-actions">
            <div className="admin-user-badge">
              <span className="admin-user-badge-icon">👤</span>
              <span className="admin-user-badge-name">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
