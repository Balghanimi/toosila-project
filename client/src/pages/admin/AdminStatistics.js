import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Card } from '../../components/UI';

/**
 * Admin Statistics Page - Detailed Analytics
 */
const AdminStatistics = () => {
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
        adminAPI.getBookingStats().catch(() => ({ data: {} })),
        adminAPI.getRatingStats().catch(() => ({ data: {} })),
        adminAPI.getOfferStats().catch(() => ({ data: {} })),
        adminAPI.getDemandStats().catch(() => ({ data: {} })),
        adminAPI.getMessageStats().catch(() => ({ data: {} })),
        adminAPI.getVerificationStats().catch(() => ({ data: {} })),
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
      </div>
    );
  }

  return (
    <div className="admin-statistics">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">الإحصائيات التفصيلية</h1>
        <p className="admin-page-subtitle">تحليل شامل لنشاط المنصة</p>
      </div>

      {/* Bookings Statistics */}
      <div className="stats-section">
        <h2 className="section-title">📋 إحصائيات الحجوزات</h2>
        <div className="stats-grid">
          <Card className="stat-detail-card">
            <div className="stat-label">إجمالي الحجوزات</div>
            <div className="stat-big-value">{stats.bookings?.total || 0}</div>
          </Card>
          <Card className="stat-detail-card">
            <div className="stat-label">حجوزات معلقة</div>
            <div className="stat-big-value warning">{stats.bookings?.pending || 0}</div>
          </Card>
          <Card className="stat-detail-card">
            <div className="stat-label">حجوزات مؤكدة</div>
            <div className="stat-big-value success">{stats.bookings?.confirmed || 0}</div>
          </Card>
          <Card className="stat-detail-card">
            <div className="stat-label">حجوزات مكتملة</div>
            <div className="stat-big-value info">{stats.bookings?.completed || 0}</div>
          </Card>
          <Card className="stat-detail-card">
            <div className="stat-label">حجوزات ملغاة</div>
            <div className="stat-big-value error">{stats.bookings?.cancelled || 0}</div>
          </Card>
        </div>
      </div>

      {/* Verifications Statistics */}
      <div className="stats-section">
        <h2 className="section-title">✅ إحصائيات التحقق</h2>
        <div className="stats-grid">
          <Card className="stat-detail-card">
            <div className="stat-label">طلبات معلقة</div>
            <div className="stat-big-value warning">{stats.verifications?.pending || 0}</div>
          </Card>
          <Card className="stat-detail-card">
            <div className="stat-label">طلبات موافق عليها</div>
            <div className="stat-big-value success">{stats.verifications?.approved || 0}</div>
          </Card>
          <Card className="stat-detail-card">
            <div className="stat-label">طلبات مرفوضة</div>
            <div className="stat-big-value error">{stats.verifications?.rejected || 0}</div>
          </Card>
        </div>
      </div>

      {/* Offers & Demands Statistics */}
      <div className="stats-section">
        <h2 className="section-title">🚗 إحصائيات العروض والطلبات</h2>
        <div className="stats-grid">
          <Card className="stat-detail-card">
            <div className="stat-label">إجمالي العروض</div>
            <div className="stat-big-value">{stats.offers?.total || 0}</div>
          </Card>
          <Card className="stat-detail-card">
            <div className="stat-label">عروض نشطة</div>
            <div className="stat-big-value success">{stats.offers?.active || 0}</div>
          </Card>
          <Card className="stat-detail-card">
            <div className="stat-label">إجمالي الطلبات</div>
            <div className="stat-big-value">{stats.demands?.total || 0}</div>
          </Card>
          <Card className="stat-detail-card">
            <div className="stat-label">طلبات نشطة</div>
            <div className="stat-big-value success">{stats.demands?.active || 0}</div>
          </Card>
        </div>
      </div>

      {/* Ratings Statistics */}
      <div className="stats-section">
        <h2 className="section-title">⭐ إحصائيات التقييمات</h2>
        <div className="stats-grid">
          <Card className="stat-detail-card">
            <div className="stat-label">إجمالي التقييمات</div>
            <div className="stat-big-value">{stats.ratings?.totalRatings || 0}</div>
          </Card>
          <Card className="stat-detail-card">
            <div className="stat-label">متوسط التقييم</div>
            <div className="stat-big-value warning">
              {stats.ratings?.averageRating?.toFixed(1) || '0.0'} ⭐
            </div>
          </Card>
          <Card className="stat-detail-card">
            <div className="stat-label">تقييمات 5 نجوم</div>
            <div className="stat-big-value success">{stats.ratings?.fiveStarCount || 0}</div>
          </Card>
          <Card className="stat-detail-card">
            <div className="stat-label">تقييمات 1 نجمة</div>
            <div className="stat-big-value error">{stats.ratings?.oneStarCount || 0}</div>
          </Card>
        </div>
      </div>

      {/* Messages Statistics */}
      <div className="stats-section">
        <h2 className="section-title">💬 إحصائيات الرسائل</h2>
        <div className="stats-grid">
          <Card className="stat-detail-card">
            <div className="stat-label">إجمالي الرسائل</div>
            <div className="stat-big-value">{stats.messages?.total || 0}</div>
          </Card>
          <Card className="stat-detail-card">
            <div className="stat-label">رسائل اليوم</div>
            <div className="stat-big-value info">{stats.messages?.today || 0}</div>
          </Card>
          <Card className="stat-detail-card">
            <div className="stat-label">رسائل هذا الأسبوع</div>
            <div className="stat-big-value info">{stats.messages?.thisWeek || 0}</div>
          </Card>
        </div>
      </div>

      <style>{`
        .admin-statistics {
          animation: fadeIn 0.4s ease-in-out;
        }

        .stats-section {
          margin-bottom: 48px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-slate-800, #1e293b);
          margin: 0 0 24px 0;
          font-family: 'Cairo', sans-serif;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .stat-detail-card {
          padding: 24px !important;
          text-align: center;
          border-top: 4px solid var(--color-slate-300, #cbd5e1);
          transition: all 0.3s ease;
        }

        .stat-detail-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--elevation-4);
        }

        .stat-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-slate-600, #475569);
          margin-bottom: 12px;
          font-family: 'Cairo', sans-serif;
        }

        .stat-big-value {
          font-size: 40px;
          font-weight: 800;
          color: var(--color-slate-900, #0f172a);
          font-family: 'Cairo', sans-serif;
          line-height: 1;
        }

        .stat-big-value.success {
          color: var(--color-success-600, #16a34a);
        }

        .stat-big-value.warning {
          color: var(--color-warning-600, #d97706);
        }

        .stat-big-value.error {
          color: var(--color-error-600, #dc2626);
        }

        .stat-big-value.info {
          color: var(--color-info-600, #2563eb);
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
      `}</style>
    </div>
  );
};

export default AdminStatistics;
