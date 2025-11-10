import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Card, Button, Badge } from '../../components/UI';

/**
 * Verification Management Page
 */
const VerificationManagement = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    fetchVerifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminAPI.getPendingVerifications(page, 20);
      setVerifications(response.data.verifications || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching verifications:', err);
      setError(err.message || 'فشل في تحميل طلبات التحقق');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (docId) => {
    if (!window.confirm('هل أنت متأكد من الموافقة على هذا الطلب؟')) {
      return;
    }

    try {
      setActionLoading(docId);
      await adminAPI.approveVerification(docId);
      alert('تم الموافقة على طلب التحقق بنجاح');
      fetchVerifications();
    } catch (err) {
      alert(err.message || 'فشل في الموافقة على الطلب');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (docId) => {
    if (!rejectReason.trim()) {
      alert('الرجاء إدخال سبب الرفض');
      return;
    }

    try {
      setActionLoading(docId);
      await adminAPI.rejectVerification(docId, rejectReason);
      alert('تم رفض طلب التحقق بنجاح');
      setRejectingId(null);
      setRejectReason('');
      fetchVerifications();
    } catch (err) {
      alert(err.message || 'فشل في رفض الطلب');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && verifications.length === 0) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>جاري تحميل طلبات التحقق...</p>
      </div>
    );
  }

  return (
    <div className="verification-management">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">إدارة التحقق من الهوية</h1>
        <p className="admin-page-subtitle">مراجعة والموافقة على طلبات التحقق من هوية المستخدمين</p>
      </div>

      {/* Error Display */}
      {error && <div className="alert-pro alert-pro-error">{error}</div>}

      {/* Verifications List */}
      {verifications.length === 0 ? (
        <Card className="empty-state-card">
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>لا توجد طلبات تحقق معلقة</h3>
            <p>جميع طلبات التحقق تمت مراجعتها</p>
          </div>
        </Card>
      ) : (
        <div className="verifications-grid">
          {verifications.map((verification) => (
            <Card key={verification.id} className="verification-card">
              {/* User Info */}
              <div className="verification-header">
                <div className="user-info">
                  <div className="user-avatar">
                    {verification.user_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{verification.user_name}</div>
                    <div className="user-email">{verification.user_email}</div>
                  </div>
                </div>
                <Badge variant="warning">معلق</Badge>
              </div>

              <div className="divider-pro"></div>

              {/* Document Info */}
              <div className="document-info">
                <div className="info-row">
                  <span className="info-label">نوع الوثيقة:</span>
                  <span className="info-value">{verification.document_type || 'غير محدد'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">رقم الوثيقة:</span>
                  <span className="info-value">{verification.document_number || 'غير محدد'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">تاريخ الطلب:</span>
                  <span className="info-value">
                    {new Date(verification.submitted_at).toLocaleDateString('ar-IQ')}
                  </span>
                </div>
              </div>

              {/* Document Preview */}
              {verification.document_url && (
                <div className="document-preview">
                  <a
                    href={verification.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-pro btn-pro-outline btn-pro-sm"
                  >
                    📄 عرض الوثيقة
                  </a>
                </div>
              )}

              {/* Actions */}
              {rejectingId === verification.id ? (
                <div className="reject-form">
                  <textarea
                    className="input-pro"
                    placeholder="أدخل سبب رفض الطلب..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="3"
                  />
                  <div className="reject-actions">
                    <Button
                      variant="danger"
                      onClick={() => handleReject(verification.id)}
                      loading={actionLoading === verification.id}
                      disabled={!rejectReason.trim()}
                    >
                      تأكيد الرفض
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setRejectingId(null);
                        setRejectReason('');
                      }}
                      disabled={actionLoading === verification.id}
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="verification-actions">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => handleApprove(verification.id)}
                    loading={actionLoading === verification.id}
                  >
                    ✓ موافقة
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => setRejectingId(verification.id)}
                    disabled={actionLoading === verification.id}
                  >
                    ✗ رفض
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <Button
            variant="secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            السابق
          </Button>
          <span className="pagination-info">
            صفحة {page} من {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            التالي
          </Button>
        </div>
      )}

      <style>{`
        .verification-management {
          animation: fadeIn 0.4s ease-in-out;
        }

        .verifications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
        }

        .verification-card {
          padding: 24px !important;
        }

        .verification-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .user-info {
          display: flex;
          gap: 12px;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--primary, #34c759), var(--primary-dark, #28a745));
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 20px;
          flex-shrink: 0;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-slate-900, #0f172a);
          font-family: 'Cairo', sans-serif;
          margin-bottom: 4px;
        }

        .user-email {
          font-size: 13px;
          color: var(--color-slate-600, #475569);
          font-family: 'Cairo', sans-serif;
        }

        .document-info {
          margin: 20px 0;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid var(--color-slate-200, #e2e8f0);
          font-family: 'Cairo', sans-serif;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          font-weight: 600;
          color: var(--color-slate-600, #475569);
          font-size: 14px;
        }

        .info-value {
          color: var(--color-slate-900, #0f172a);
          font-weight: 600;
          font-size: 14px;
        }

        .document-preview {
          margin: 20px 0;
        }

        .verification-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 20px;
        }

        .reject-form {
          margin-top: 20px;
        }

        .reject-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
        }

        .empty-state-card {
          padding: 60px 20px !important;
        }

        .empty-state {
          text-align: center;
        }

        .empty-state h3 {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-slate-800, #1e293b);
          margin: 16px 0 8px 0;
          font-family: 'Cairo', sans-serif;
        }

        .empty-state p {
          font-size: 15px;
          color: var(--color-slate-600, #475569);
          margin: 0;
          font-family: 'Cairo', sans-serif;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 32px;
        }

        .pagination-info {
          font-family: 'Cairo', sans-serif;
          font-weight: 600;
          color: var(--color-slate-700, #334155);
        }

        @media (max-width: 768px) {
          .verifications-grid {
            grid-template-columns: 1fr;
          }

          .verification-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default VerificationManagement;
