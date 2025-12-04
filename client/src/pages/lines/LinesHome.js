import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLines } from '../../context/LinesContext';
import SearchableCitySelect from '../../components/UI/SearchableCitySelect';
import LineCard from '../../components/lines/LineCard';
import LineFilters from '../../components/lines/LineFilters';
import { citiesAPI } from '../../services/api';
import styles from './LinesHome.module.css';

/**
 * LinesHome - Main page for browsing and searching lines
 */
const LinesHome = () => {
  console.log('[LinesHome] Component rendering');

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { lines, loading, error, pagination, fetchLines, updateFilters, loadMore } = useLines();

  console.log('[LinesHome] State:', {
    currentUser: currentUser?.name,
    linesCount: lines?.length,
    loading,
    error,
  });

  const [cities, setCities] = useState([]);
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch cities on mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        const cached = localStorage.getItem('cached_cities');
        if (cached) {
          setCities(JSON.parse(cached));
        }
        const response = await citiesAPI.getAll();
        setCities(response.cities || []);
        localStorage.setItem('cached_cities', JSON.stringify(response.cities || []));
      } catch (err) {
        console.error('Error loading cities:', err);
      }
    };
    loadCities();
  }, []);

  // Fetch lines on mount and when filters change
  useEffect(() => {
    fetchLines();
  }, [fetchLines]);

  const handleSearch = () => {
    updateFilters({ fromCity, toCity });
    fetchLines({ fromCity, toCity });
  };

  const handleFilterChange = (filterType) => {
    setActiveFilter(filterType);

    let newFilters = {};

    switch (filterType) {
      case 'students':
        newFilters = { lineType: 'students', isLadiesOnly: false };
        break;
      case 'employees':
        newFilters = { lineType: 'employees', isLadiesOnly: false };
        break;
      case 'ladies':
        newFilters = { lineType: '', isLadiesOnly: true };
        break;
      case 'morning':
        newFilters = { lineType: '', isLadiesOnly: false };
        // Morning filter would need backend support
        break;
      default:
        newFilters = { lineType: '', isLadiesOnly: false };
    }

    updateFilters(newFilters);
    fetchLines(newFilters);
  };

  const handleSwitchToTrips = () => {
    localStorage.setItem('preferred_mode', 'trips');
    navigate('/');
  };

  const isDriver = currentUser?.isDriver;

  return (
    <div className={styles.container}>
      {/* Background decorations */}
      <div className={styles.bgPattern} />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <button className={styles.switchButton} onClick={handleSwitchToTrips}>
              🚗 التبديل للرحلات
            </button>
          </div>
          <div className={styles.headerCenter}>
            <h1 className={styles.title}>🚌 الخطوط</h1>
            <p className={styles.subtitle}>اشتراكات يومية للطلاب والموظفين</p>
          </div>
          <div className={styles.headerRight}>
            {isDriver && (
              <button className={styles.createButton} onClick={() => navigate('/lines/create')}>
                + إنشاء خط
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{pagination.total || 0}</span>
              <span className={styles.statLabel}>خط متاح</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>50+</span>
              <span className={styles.statLabel}>سائق موثق</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>1000+</span>
              <span className={styles.statLabel}>مشترك</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchForm}>
          <div className={styles.searchRow}>
            <div className={styles.searchField}>
              <SearchableCitySelect
                value={fromCity}
                onChange={setFromCity}
                cities={cities}
                label="من"
                placeholder="مدينة الانطلاق..."
                allOptionLabel="جميع المدن"
              />
            </div>
            <div className={styles.searchField}>
              <SearchableCitySelect
                value={toCity}
                onChange={setToCity}
                cities={cities}
                label="إلى"
                placeholder="مدينة الوصول..."
                allOptionLabel="جميع المدن"
              />
            </div>
            <button className={styles.searchButton} onClick={handleSearch}>
              🔍 بحث
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <LineFilters activeFilter={activeFilter} onFilterChange={handleFilterChange} />

      {/* Lines List */}
      <div className={styles.linesSection}>
        {/* Error */}
        {error && <div className={styles.errorBox}>{error}</div>}

        {/* Loading */}
        {loading && lines.length === 0 && (
          <div className={styles.loadingBox}>
            <div className={styles.spinner} />
            <span>جاري التحميل...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && lines.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🚌</div>
            <h3>لا توجد خطوط متاحة</h3>
            <p>لم نعثر على خطوط تطابق بحثك</p>
            {isDriver && (
              <button className={styles.createLineButton} onClick={() => navigate('/lines/create')}>
                + أنشئ خطك الأول
              </button>
            )}
          </div>
        )}

        {/* Lines Grid */}
        {lines.length > 0 && (
          <div className={styles.linesGrid}>
            {lines.map((line) => (
              <LineCard
                key={line.id}
                line={line}
                onSubscribe={() => navigate(`/lines/${line.id}`)}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {lines.length > 0 && pagination.page < pagination.totalPages && (
          <div className={styles.loadMoreContainer}>
            <button className={styles.loadMoreButton} onClick={loadMore} disabled={loading}>
              {loading ? '⏳ جاري التحميل...' : '📥 تحميل المزيد'}
            </button>
          </div>
        )}

        {/* Pagination Info */}
        {lines.length > 0 && (
          <div className={styles.paginationInfo}>
            عرض {lines.length} من {pagination.total} خط
          </div>
        )}
      </div>
    </div>
  );
};

export default LinesHome;
