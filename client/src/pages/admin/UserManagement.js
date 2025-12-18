import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Card, Button, Badge } from '../../components/UI';

/**
 * User Management Page
 */
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    role: '',
    isDriver: '',
    isActive: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminAPI.getAllUsers(page, 20, filters);
      // Backend returns { success, data: [...users...], pagination: { totalPages, ... } }
      setUsers(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'فشل في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('هل أنت متأكد من تعطيل هذا المستخدم؟')) {
      return;
    }

    try {
      await adminAPI.deactivateUser(userId);
      alert('تم تعطيل المستخدم بنجاح');
      fetchUsers();
    } catch (err) {
      alert(err.message || 'فشل في تعطيل المستخدم');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>جاري تحميل المستخدمين...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">إدارة المستخدمين</h1>
        <p className="admin-page-subtitle">عرض وإدارة جميع مستخدمي المنصة</p>
      </div>

      {/* Filters & Search */}
      <Card className="filters-card">
        <div className="filters-container">
          {/* Search */}
          <div className="filter-item filter-search">
            <input
              type="text"
              placeholder="البحث عن مستخدم..."
              className="input-pro"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <div className="filter-item">
            <select
              className="input-pro"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="">جميع الأدوار</option>
              <option value="user">مستخدم</option>
              <option value="admin">مدير</option>
              <option value="moderator">مشرف</option>
            </select>
          </div>

          {/* Driver Filter */}
          <div className="filter-item">
            <select
              className="input-pro"
              value={filters.isDriver}
              onChange={(e) => setFilters({ ...filters, isDriver: e.target.value })}
            >
              <option value="">الجميع</option>
              <option value="true">سائقون</option>
              <option value="false">ركاب</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-item">
            <select
              className="input-pro"
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
            >
              <option value="">جميع الحالات</option>
              <option value="true">نشط</option>
              <option value="false">معطل</option>
            </select>
          </div>

          <Button variant="primary" onClick={fetchUsers} loading={loading}>
            تطبيق الفلاتر
          </Button>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="alert-pro alert-pro-error" style={{ marginTop: '20px' }}>
          {error}
        </div>
      )}

      {/* Users Table */}
      <Card className="users-table-card">
        <div className="table-header">
          <h2 className="table-title">المستخدمون ({filteredUsers.length})</h2>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>لا توجد مستخدمين</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-responsive desktop-only">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>البريد الإلكتروني</th>
                    <th>النوع</th>
                    <th>الدور</th>
                    <th>الحالة</th>
                    <th>تاريخ التسجيل</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="user-name">{user.name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        {user.isDriver ? (
                          <Badge variant="primary">سائق</Badge>
                        ) : (
                          <Badge variant="neutral">راكب</Badge>
                        )}
                      </td>
                      <td>
                        {user.role === 'admin' && <Badge variant="error">مدير</Badge>}
                        {user.role === 'moderator' && <Badge variant="warning">مشرف</Badge>}
                        {user.role === 'user' && <Badge variant="neutral">مستخدم</Badge>}
                      </td>
                      <td>
                        {user.isActive ? (
                          <span className="status-indicator status-active">نشط</span>
                        ) : (
                          <span className="status-indicator status-inactive">معطل</span>
                        )}
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString('ar-IQ')}</td>
                      <td>
                        <div className="action-buttons">
                          {user.role !== 'admin' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeactivateUser(user.id)}
                            >
                              تعطيل
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-only users-cards">
              {filteredUsers.map((user) => (
                <div key={user.id} className="user-card-mobile">
                  <div className="user-card-header">
                    <div className="user-cell">
                      <div className="user-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</div>
                      <div>
                        <div className="user-name">{user.name}</div>
                        {user.email && <div className="user-email">{user.email}</div>}
                      </div>
                    </div>
                    {user.isActive ? (
                      <span className="status-indicator status-active">نشط</span>
                    ) : (
                      <span className="status-indicator status-inactive">معطل</span>
                    )}
                  </div>

                  <div className="user-card-body">
                    <div className="user-info-row">
                      <span className="label">النوع:</span>
                      {user.isDriver ? (
                        <Badge variant="primary">سائق</Badge>
                      ) : (
                        <Badge variant="neutral">راكب</Badge>
                      )}
                    </div>
                    <div className="user-info-row">
                      <span className="label">الدور:</span>
                      {user.role === 'admin' && <Badge variant="error">مدير</Badge>}
                      {user.role === 'moderator' && <Badge variant="warning">مشرف</Badge>}
                      {user.role === 'user' && <Badge variant="neutral">مستخدم</Badge>}
                    </div>
                    <div className="user-info-row">
                      <span className="label">تاريخ التسجيل:</span>
                      <span>{new Date(user.createdAt).toLocaleDateString('ar-IQ')}</span>
                    </div>
                  </div>

                  {user.role !== 'admin' && (
                    <div className="user-card-footer">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeactivateUser(user.id)}
                        style={{ width: '100%' }}
                      >
                        تعطيل المستخدم
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

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
        .user-management {
          animation: fadeIn 0.4s ease-in-out;
        }

        .filters-card {
          margin-bottom: 24px;
        }

        .filters-container {
          display: grid;
          grid-template-columns: 2fr repeat(3, 1fr) auto;
          gap: 16px;
          align-items: end;
        }

        .filter-search {
          min-width: 200px;
        }

        .users-table-card {
          margin-top: 24px;
        }

        .table-header {
          padding-bottom: 16px;
          border-bottom: 2px solid var(--color-slate-200, #e2e8f0);
          margin-bottom: 20px;
        }

        .table-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-slate-800, #1e293b);
          margin: 0;
          font-family: 'Cairo', sans-serif;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }

        .admin-table th {
          text-align: right;
          padding: 12px 16px;
          background: var(--color-slate-100, #f1f5f9);
          color: var(--color-slate-700, #334155);
          font-weight: 700;
          font-size: 14px;
          font-family: 'Cairo', sans-serif;
          border-bottom: 2px solid var(--color-slate-200, #e2e8f0);
        }

        .admin-table td {
          padding: 16px;
          border-bottom: 1px solid var(--color-slate-200, #e2e8f0);
          color: var(--color-slate-700, #334155);
          font-size: 14px;
          font-family: 'Cairo', sans-serif;
        }

        .admin-table tr:hover {
          background: var(--color-slate-50, #f8fafc);
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary, #34c759), var(--primary-dark, #28a745));
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
        }

        .user-name {
          font-weight: 600;
          color: var(--color-slate-900, #0f172a);
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
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
          margin-top: 24px;
        }

        .pagination-info {
          font-family: 'Cairo', sans-serif;
          font-weight: 600;
          color: var(--color-slate-700, #334155);
        }

        /* Mobile/Desktop visibility toggles */
        .desktop-only {
          display: block;
        }

        .mobile-only {
          display: none;
        }

        /* Mobile User Cards */
        .users-cards {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .user-card-mobile {
          background: white;
          border: 1px solid var(--color-slate-200, #e2e8f0);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .user-card-mobile:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .user-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--color-slate-50, #f8fafc);
          border-bottom: 1px solid var(--color-slate-200, #e2e8f0);
        }

        .user-email {
          font-size: 12px;
          color: var(--color-slate-500, #64748b);
          margin-top: 4px;
          direction: ltr;
          text-align: right;
        }

        .user-card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .user-info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
        }

        .user-info-row .label {
          font-weight: 600;
          color: var(--color-slate-600, #475569);
        }

        .user-card-footer {
          padding: 12px 16px;
          background: var(--color-slate-50, #f8fafc);
          border-top: 1px solid var(--color-slate-200, #e2e8f0);
        }

        @media (max-width: 768px) {
          .desktop-only {
            display: none;
          }

          .mobile-only {
            display: block;
          }

          .filters-container {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .filter-item {
            width: 100%;
          }

          .admin-page-title {
            font-size: 20px;
          }

          .admin-page-subtitle {
            font-size: 13px;
          }

          .table-title {
            font-size: 18px;
          }
        }

        @media (max-width: 1024px) and (min-width: 769px) {
          .filters-container {
            grid-template-columns: 1fr 1fr;
          }

          .filter-search {
            grid-column: 1 / -1;
          }

          .admin-table {
            font-size: 12px;
          }

          .admin-table th,
          .admin-table td {
            padding: 10px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
