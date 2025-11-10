import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Card } from '../../components/UI';

/**
 * Admin Dashboard - Main Overview Page
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    bookings: null,
    ratings: null,
    offers: null,
    demands: null,
    messages: null,
    verifications: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [bookings, ratings, offers, demands, messages, verifications] = await Promise.all([
        adminAPI
          .getBookingStats()
          .catch(() => ({ data: { total: 0, pending: 0, confirmed: 0, completed: 0 } })),
        adminAPI.getRatingStats().catch(() => ({ data: { totalRatings: 0, averageRating: 0 } })),
        adminAPI.getOfferStats().catch(() => ({ data: { total: 0, active: 0 } })),
        adminAPI.getDemandStats().catch(() => ({ data: { total: 0, active: 0 } })),
        adminAPI.getMessageStats().catch(() => ({ data: { total: 0 } })),
        adminAPI
          .getVerificationStats()
          .catch(() => ({ data: { pending: 0, approved: 0, rejected: 0 } })),
      ]);

      setStats({
        bookings: bookings.data,
        ratings: ratings.data,
        offers: offers.data,
        demands: demands.data,
        messages: messages.data,
        verifications: verifications.data,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('فشل في تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>جاري تحميل الإحصائيات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <div className="alert-pro alert-pro-error">{error}</div>
        <button onClick={fetchAllStats} className="btn-pro btn-pro-primary">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">لوحة التحكم الرئيسية</h1>
        <p className="admin-page-subtitle">نظرة عامة على نشاط المنصة</p>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {/* Bookings Stats */}
        <Card className="admin-stat-card stat-primary">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-label">إجمالي الحجوزات</div>
            <div className="stat-value">{stats.bookings?.total || 0}</div>
            <div className="stat-details">
              <span className="stat-detail-item">
                <span className="badge-pro badge-pro-warning">
                  معلق: {stats.bookings?.pending || 0}
                </span>
              </span>
              <span className="stat-detail-item">
                <span className="badge-pro badge-pro-success">
                  مكتمل: {stats.bookings?.completed || 0}
                </span>
              </span>
            </div>
          </div>
        </Card>

        {/* Verifications Stats */}
        <Card className="admin-stat-card stat-warning">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">طلبات التحقق</div>
            <div className="stat-value">{stats.verifications?.pending || 0}</div>
            <div className="stat-details">
              <span className="stat-detail-item">
                <span className="badge-pro badge-pro-success">
                  موافق: {stats.verifications?.approved || 0}
                </span>
              </span>
              <span className="stat-detail-item">
                <span className="badge-pro badge-pro-error">
                  مرفوض: {stats.verifications?.rejected || 0}
                </span>
              </span>
            </div>
          </div>
        </Card>

        {/* Offers Stats */}
        <Card className="admin-stat-card stat-success">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <div className="stat-label">العروض</div>
            <div className="stat-value">{stats.offers?.total || 0}</div>
            <div className="stat-details">
              <span className="stat-detail-item">
                <span className="badge-pro badge-pro-success">
                  نشط: {stats.offers?.active || 0}
                </span>
              </span>
            </div>
          </div>
        </Card>

        {/* Demands Stats */}
        <Card className="admin-stat-card stat-info">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-label">الطلبات</div>
            <div className="stat-value">{stats.demands?.total || 0}</div>
            <div className="stat-details">
              <span className="stat-detail-item">
                <span className="badge-pro badge-pro-success">
                  نشط: {stats.demands?.active || 0}
                </span>
              </span>
            </div>
          </div>
        </Card>

        {/* Ratings Stats */}
        <Card className="admin-stat-card stat-secondary">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-label">التقييمات</div>
            <div className="stat-value">{stats.ratings?.totalRatings || 0}</div>
            <div className="stat-details">
              <span className="stat-detail-item">
                <span className="badge-pro badge-pro-warning">
                  متوسط: {stats.ratings?.averageRating?.toFixed(1) || '0.0'} ⭐
                </span>
              </span>
            </div>
          </div>
        </Card>

        {/* Messages Stats */}
        <Card className="admin-stat-card stat-purple">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-label">الرسائل</div>
            <div className="stat-value">{stats.messages?.total || 0}</div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="admin-quick-actions">
        <h2 className="admin-section-title">إجراءات سريعة</h2>
        <div className="admin-actions-grid">
          <Card
            interactive
            className="admin-action-card"
            onClick={() => (window.location.href = '/admin/verification')}
          >
            <div className="action-icon">✅</div>
            <div className="action-title">مراجعة طلبات التحقق</div>
            <div className="action-badge">{stats.verifications?.pending || 0} معلق</div>
          </Card>

          <Card
            interactive
            className="admin-action-card"
            onClick={() => (window.location.href = '/admin/users')}
          >
            <div className="action-icon">👥</div>
            <div className="action-title">إدارة المستخدمين</div>
          </Card>

          <Card
            interactive
            className="admin-action-card"
            onClick={() => (window.location.href = '/admin/statistics')}
          >
            <div className="action-icon">📊</div>
            <div className="action-title">عرض الإحصائيات التفصيلية</div>
          </Card>
        </div>
      </div>

      <style>{`
        .admin-dashboard {
          animation: fadeIn 0.4s ease-in-out;
        }

        .admin-page-header {
          margin-bottom: 32px;
        }

        .admin-page-title {
          font-size: 32px;
          font-weight: 800;
          color: var(--color-slate-900, #0f172a);
          margin: 0 0 8px 0;
          font-family: 'Cairo', sans-serif;
        }

        .admin-page-subtitle {
          font-size: 16px;
          color: var(--color-slate-600, #475569);
          margin: 0;
          font-family: 'Cairo', sans-serif;
        }

        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .admin-stat-card {
          padding: 24px !important;
          display: flex;
          gap: 20px;
          position: relative;
          overflow: hidden;
        }

        .admin-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .admin-stat-card.stat-primary::before {
          background: linear-gradient(90deg, #3b82f6, #2563eb);
        }

        .admin-stat-card.stat-success::before {
          background: linear-gradient(90deg, #10b981, #059669);
        }

        .admin-stat-card.stat-warning::before {
          background: linear-gradient(90deg, #f59e0b, #d97706);
        }

        .admin-stat-card.stat-error::before {
          background: linear-gradient(90deg, #ef4444, #dc2626);
        }

        .admin-stat-card.stat-info::before {
          background: linear-gradient(90deg, #06b6d4, #0891b2);
        }

        .admin-stat-card.stat-purple::before {
          background: linear-gradient(90deg, #8b5cf6, #7c3aed);
        }

        .admin-stat-card.stat-secondary::before {
          background: linear-gradient(90deg, #64748b, #475569);
        }

        .stat-icon {
          font-size: 48px;
          opacity: 0.9;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 14px;
          color: var(--color-slate-600, #475569);
          font-weight: 600;
          margin-bottom: 8px;
          font-family: 'Cairo', sans-serif;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 800;
          color: var(--color-slate-900, #0f172a);
          margin-bottom: 12px;
          font-family: 'Cairo', sans-serif;
        }

        .stat-details {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .admin-section-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-slate-800, #1e293b);
          margin: 0 0 20px 0;
          font-family: 'Cairo', sans-serif;
        }

        .admin-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .admin-action-card {
          padding: 24px !important;
          text-align: center;
          cursor: pointer;
          position: relative;
        }

        .action-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .action-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-slate-800, #1e293b);
          margin-bottom: 8px;
          font-family: 'Cairo', sans-serif;
        }

        .action-badge {
          display: inline-block;
          padding: 4px 12px;
          background: var(--color-error-50, #fef2f2);
          color: var(--color-error-700, #b91c1c);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Cairo', sans-serif;
        }

        .admin-loading,
        .admin-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 20px;
        }

        .admin-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--color-slate-200, #e2e8f0);
          border-top: 4px solid var(--primary, #34c759);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
