import React, { createContext, useContext, useState, useCallback } from 'react';
import { linesAPI } from '../services/api';

const LinesContext = createContext();

export function useLines() {
  const context = useContext(LinesContext);
  if (!context) {
    throw new Error('useLines must be used within a LinesProvider');
  }
  return context;
}

export function LinesProvider({ children }) {
  // Lines state
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  const [myLines, setMyLines] = useState([]);
  const [mySubscriptions, setMySubscriptions] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    fromCity: '',
    toCity: '',
    lineType: '',
    isLadiesOnly: false,
    minPrice: '',
    maxPrice: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  /**
   * Fetch all lines with filters
   */
  const fetchLines = useCallback(
    async (customFilters = {}) => {
      setLoading(true);
      setError('');

      try {
        const mergedFilters = { ...filters, ...customFilters };
        const response = await linesAPI.getAll(mergedFilters);

        setLines(response.lines || []);
        setPagination({
          page: response.page || 1,
          totalPages: response.totalPages || 1,
          total: response.total || 0,
        });

        return response;
      } catch (err) {
        console.error('Error fetching lines:', err);
        setError('حدث خطأ أثناء جلب الخطوط');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  /**
   * Fetch single line by ID
   */
  const fetchLineById = useCallback(async (lineId) => {
    setLoading(true);
    setError('');

    try {
      const response = await linesAPI.getById(lineId);
      setCurrentLine(response.line);
      return response.line;
    } catch (err) {
      console.error('Error fetching line:', err);
      setError('حدث خطأ أثناء جلب بيانات الخط');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch driver's own lines
   */
  const fetchMyLines = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await linesAPI.getMyLines();
      setMyLines(response.lines || []);
      return response.lines;
    } catch (err) {
      console.error('Error fetching my lines:', err);
      setError('حدث خطأ أثناء جلب خطوطك');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch user's subscriptions
   */
  const fetchMySubscriptions = useCallback(async (status = null) => {
    setLoading(true);
    setError('');

    try {
      const response = await linesAPI.getMySubscriptions(status);
      setMySubscriptions(response.subscriptions || []);
      return response.subscriptions;
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('حدث خطأ أثناء جلب اشتراكاتك');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new line (for drivers)
   */
  const createLine = useCallback(
    async (lineData) => {
      setLoading(true);
      setError('');

      try {
        const response = await linesAPI.create(lineData);
        // Refresh my lines
        await fetchMyLines();
        return response;
      } catch (err) {
        console.error('Error creating line:', err);
        setError(err.message || 'حدث خطأ أثناء إنشاء الخط');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchMyLines]
  );

  /**
   * Subscribe to a line
   */
  const subscribeLine = useCallback(
    async (lineId, subscriptionData) => {
      setLoading(true);
      setError('');

      try {
        const response = await linesAPI.subscribe(lineId, subscriptionData);
        // Refresh subscriptions
        await fetchMySubscriptions();
        return response;
      } catch (err) {
        console.error('Error subscribing:', err);
        setError(err.message || 'حدث خطأ أثناء الاشتراك');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchMySubscriptions]
  );

  /**
   * Unsubscribe from a line
   */
  const unsubscribeLine = useCallback(
    async (lineId) => {
      setLoading(true);
      setError('');

      try {
        const response = await linesAPI.unsubscribe(lineId);
        // Refresh subscriptions
        await fetchMySubscriptions();
        return response;
      } catch (err) {
        console.error('Error unsubscribing:', err);
        setError(err.message || 'حدث خطأ أثناء إلغاء الاشتراك');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchMySubscriptions]
  );

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    setFilters({
      fromCity: '',
      toCity: '',
      lineType: '',
      isLadiesOnly: false,
      minPrice: '',
      maxPrice: '',
      sortBy: 'created_at',
      sortOrder: 'DESC',
    });
  }, []);

  /**
   * Load more lines (pagination)
   */
  const loadMore = useCallback(async () => {
    if (pagination.page >= pagination.totalPages) return;

    try {
      const response = await linesAPI.getAll({
        ...filters,
        page: pagination.page + 1,
      });

      setLines((prev) => [...prev, ...(response.lines || [])]);
      setPagination({
        page: response.page,
        totalPages: response.totalPages,
        total: response.total,
      });
    } catch (err) {
      console.error('Error loading more:', err);
    }
  }, [filters, pagination]);

  const value = {
    // State
    lines,
    currentLine,
    myLines,
    mySubscriptions,
    loading,
    error,
    pagination,
    filters,
    // Actions
    fetchLines,
    fetchLineById,
    fetchMyLines,
    fetchMySubscriptions,
    createLine,
    subscribeLine,
    unsubscribeLine,
    updateFilters,
    resetFilters,
    loadMore,
    setError,
  };

  return <LinesContext.Provider value={value}>{children}</LinesContext.Provider>;
}
