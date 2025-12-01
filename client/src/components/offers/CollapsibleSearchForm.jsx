import React, { useState } from 'react';
import styles from './CollapsibleSearchForm.module.css';
import SearchableCitySelect from '../UI/SearchableCitySelect';

/**
 * Collapsible Search Form Component for Mobile-Optimized Offers Page
 * Features:
 * - Collapsible/Expandable with smooth animation
 * - Mobile-first design (48px+ touch targets)
 * - 16px+ font size (prevents iOS auto-zoom)
 * - Accessible and WCAG compliant
 * - Searchable city dropdowns with Arabic support
 */
const CollapsibleSearchForm = ({
  filters,
  onFiltersChange,
  onSearch,
  onClearFilters,
  allCities = [],
  // isDriver = false, // Reserved for future use
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleFilterChange = (field, value) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  const handleSearchClick = () => {
    onSearch();
    // Auto-collapse after search on mobile
    if (window.innerWidth <= 768) {
      setIsExpanded(false);
    }
  };

  return (
    <div className={styles.searchFormContainer}>
      {/* Toggle Button - Always Visible */}
      <button
        type="button"
        onClick={handleToggle}
        className={styles.toggleButton}
        aria-expanded={isExpanded}
        aria-controls="search-form-content"
      >
        <span className={styles.toggleIcon}>🔍</span>
        <span className={styles.toggleText}>البحث السريع</span>
        <span className={styles.toggleArrow}>{isExpanded ? '▲' : '▼'}</span>
      </button>

      {/* Search Form - Collapsible */}
      <div
        id="search-form-content"
        className={`${styles.formContent} ${isExpanded ? styles.expanded : ''}`}
        aria-hidden={!isExpanded}
      >
        <div className={styles.formInner}>
          {/* Basic Filters */}
          <div className={styles.basicFilters}>
            {/* From City */}
            <div className={styles.formGroup}>
              <SearchableCitySelect
                value={filters.fromCity || ''}
                onChange={(value) => handleFilterChange('fromCity', value)}
                cities={allCities}
                label="من"
                placeholder="اختر مدينة المغادرة..."
                allOptionLabel="جميع المدن"
                id="from-city"
              />
            </div>

            {/* To City */}
            <div className={styles.formGroup}>
              <SearchableCitySelect
                value={filters.toCity || ''}
                onChange={(value) => handleFilterChange('toCity', value)}
                cities={allCities}
                label="إلى"
                placeholder="اختر مدينة الوصول..."
                allOptionLabel="جميع المدن"
                id="to-city"
              />
            </div>

            {/* Departure Date */}
            <div className={styles.formGroup}>
              <label htmlFor="departure-date" className={styles.label}>
                تاريخ المغادرة
              </label>
              <input
                type="date"
                id="departure-date"
                value={filters.departureDate || ''}
                onChange={(e) => handleFilterChange('departureDate', e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Sort By */}
            <div className={styles.formGroup}>
              <label htmlFor="sort-by" className={styles.label}>
                ترتيب حسب
              </label>
              <select
                id="sort-by"
                value={filters.sortBy || 'date'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className={styles.select}
              >
                <option value="date">التاريخ</option>
                <option value="price">السعر</option>
                <option value="rating">التقييم</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={styles.advancedToggle}
            aria-expanded={showAdvancedFilters}
          >
            <span>{showAdvancedFilters ? '🔼' : '🔽'}</span>
            <span>{showAdvancedFilters ? 'إخفاء الفلاتر المتقدمة' : 'فلاتر متقدمة'}</span>
          </button>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className={styles.advancedFilters}>
              <h4 className={styles.advancedTitle}>
                <span>🎛️</span>
                <span>خيارات البحث المتقدم</span>
              </h4>

              <div className={styles.advancedGrid}>
                {/* Full City Lists - Already using searchable selects in basic filters */}
                <div className={styles.formGroup}>
                  <SearchableCitySelect
                    value={filters.fromCity || ''}
                    onChange={(value) => handleFilterChange('fromCity', value)}
                    cities={allCities}
                    label="من (جميع المدن)"
                    placeholder="اختر مدينة المغادرة..."
                    allOptionLabel="جميع المدن"
                    id="from-city-all"
                  />
                </div>

                <div className={styles.formGroup}>
                  <SearchableCitySelect
                    value={filters.toCity || ''}
                    onChange={(value) => handleFilterChange('toCity', value)}
                    cities={allCities}
                    label="إلى (جميع المدن)"
                    placeholder="اختر مدينة الوصول..."
                    allOptionLabel="جميع المدن"
                    id="to-city-all"
                  />
                </div>

                {/* Price Range */}
                <div className={styles.formGroup}>
                  <label htmlFor="min-price" className={styles.label}>
                    السعر الأدنى
                  </label>
                  <input
                    type="number"
                    id="min-price"
                    placeholder="0"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className={styles.input}
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="max-price" className={styles.label}>
                    السعر الأقصى
                  </label>
                  <input
                    type="number"
                    id="max-price"
                    placeholder="1000000"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className={styles.input}
                    min="0"
                  />
                </div>

                {/* Minimum Seats */}
                <div className={styles.formGroup}>
                  <label htmlFor="min-seats" className={styles.label}>
                    عدد المقاعد الأدنى
                  </label>
                  <input
                    type="number"
                    id="min-seats"
                    placeholder="1"
                    value={filters.minSeats || ''}
                    onChange={(e) => handleFilterChange('minSeats', e.target.value)}
                    className={styles.input}
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button
              type="button"
              onClick={handleSearchClick}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              <span>🔍</span>
              <span>بحث</span>
            </button>

            <button
              type="button"
              onClick={onClearFilters}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              <span>🔄</span>
              <span>مسح الفلاتر</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSearchForm;
