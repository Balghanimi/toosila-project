import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLines } from '../../context/LinesContext';
import { useAuth } from '../../context/AuthContext';
import styles from './CreateLine.module.css';

/**
 * CreateLine - Form for drivers to create a new subscription line
 */
const CreateLine = () => {
  const navigate = useNavigate();
  const { createLine, loading } = useLines();
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    line_type: 'students',
    is_ladies_only: false,
    from_city: '',
    to_city: '',
    departure_time: '07:00',
    return_time: '14:00',
    working_days: [0, 1, 2, 3, 4], // Sunday to Thursday
    total_seats: 7,
    monthly_price: '',
    description: '',
  });

  const [stops, setStops] = useState([]);
  const [newStop, setNewStop] = useState({ name: '', time: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Days of week
  const DAYS = [
    { id: 0, name: 'أحد' },
    { id: 1, name: 'اثنين' },
    { id: 2, name: 'ثلاثاء' },
    { id: 3, name: 'أربعاء' },
    { id: 4, name: 'خميس' },
    { id: 5, name: 'جمعة' },
    { id: 6, name: 'سبت' },
  ];

  // Seat options
  const SEAT_OPTIONS = [4, 5, 6, 7, 8, 10, 12, 14, 15, 20, 25, 30];

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle line type selection
  const handleTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, line_type: type }));
  };

  // Handle day toggle
  const handleDayToggle = (dayId) => {
    setFormData((prev) => {
      const days = prev.working_days.includes(dayId)
        ? prev.working_days.filter((d) => d !== dayId)
        : [...prev.working_days, dayId].sort((a, b) => a - b);
      return { ...prev, working_days: days };
    });
  };

  // Handle stop input change
  const handleStopChange = (e) => {
    const { name, value } = e.target;
    setNewStop((prev) => ({ ...prev, [name]: value }));
  };

  // Add stop
  const handleAddStop = () => {
    if (!newStop.name.trim()) return;
    setStops((prev) => [...prev, { ...newStop, order: prev.length + 1 }]);
    setNewStop({ name: '', time: '' });
  };

  // Remove stop
  const handleRemoveStop = (index) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('يرجى إدخال اسم الخط');
      return;
    }
    if (!formData.from_city.trim()) {
      setError('يرجى إدخال مدينة الانطلاق');
      return;
    }
    if (!formData.to_city.trim()) {
      setError('يرجى إدخال مدينة الوصول');
      return;
    }
    if (!formData.monthly_price || formData.monthly_price <= 0) {
      setError('يرجى إدخال سعر الاشتراك الشهري');
      return;
    }
    if (formData.working_days.length === 0) {
      setError('يرجى اختيار أيام العمل');
      return;
    }

    setSubmitting(true);

    try {
      const lineData = {
        ...formData,
        monthly_price: parseInt(formData.monthly_price),
        stops: stops,
      };

      const result = await createLine(lineData);
      if (result) {
        navigate(`/lines/${result.id}`);
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الخط');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if user is logged in
  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.authRequired}>
          <span>🔐</span>
          <p>يجب تسجيل الدخول لإنشاء خط جديد</p>
          <button onClick={() => navigate('/login')}>تسجيل الدخول</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          رجوع
        </button>
        <h1 className={styles.headerTitle}>إنشاء خط جديد</h1>
        <div className={styles.headerSpacer}></div>
      </div>

      {/* Form */}
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Error Message */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Line Name */}
        <div className={styles.section}>
          <label className={styles.label}>اسم الخط *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="مثال: خط جامعة بغداد - المنصور"
            className={styles.input}
          />
        </div>

        {/* Line Type */}
        <div className={styles.section}>
          <label className={styles.label}>نوع الخط *</label>
          <div className={styles.typeButtons}>
            <button
              type="button"
              className={`${styles.typeButton} ${formData.line_type === 'students' ? styles.typeActive : ''}`}
              onClick={() => handleTypeSelect('students')}
            >
              <span>🎓</span>
              <span>طلاب</span>
            </button>
            <button
              type="button"
              className={`${styles.typeButton} ${formData.line_type === 'employees' ? styles.typeActive : ''}`}
              onClick={() => handleTypeSelect('employees')}
            >
              <span>💼</span>
              <span>موظفين</span>
            </button>
            <button
              type="button"
              className={`${styles.typeButton} ${formData.line_type === 'general' ? styles.typeActive : ''}`}
              onClick={() => handleTypeSelect('general')}
            >
              <span>👥</span>
              <span>عام</span>
            </button>
          </div>
        </div>

        {/* Ladies Only */}
        <div className={styles.section}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="is_ladies_only"
              checked={formData.is_ladies_only}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>👩 خط نسائي فقط</span>
          </label>
        </div>

        {/* Route */}
        <div className={styles.section}>
          <label className={styles.label}>المسار *</label>
          <div className={styles.routeInputs}>
            <div className={styles.routeInput}>
              <span className={styles.routeIcon}>📍</span>
              <input
                type="text"
                name="from_city"
                value={formData.from_city}
                onChange={handleChange}
                placeholder="مدينة الانطلاق"
                className={styles.input}
              />
            </div>
            <div className={styles.routeArrow}>←</div>
            <div className={styles.routeInput}>
              <span className={styles.routeIcon}>🏁</span>
              <input
                type="text"
                name="to_city"
                value={formData.to_city}
                onChange={handleChange}
                placeholder="مدينة الوصول"
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Stops */}
        <div className={styles.section}>
          <label className={styles.label}>محطات التوقف (اختياري)</label>
          <div className={styles.stopsContainer}>
            {stops.map((stop, index) => (
              <div key={index} className={styles.stopItem}>
                <span className={styles.stopNumber}>{index + 1}</span>
                <span className={styles.stopName}>{stop.name}</span>
                {stop.time && <span className={styles.stopTime}>{stop.time}</span>}
                <button
                  type="button"
                  className={styles.removeStopButton}
                  onClick={() => handleRemoveStop(index)}
                >
                  ✕
                </button>
              </div>
            ))}
            <div className={styles.addStopRow}>
              <input
                type="text"
                name="name"
                value={newStop.name}
                onChange={handleStopChange}
                placeholder="اسم المحطة"
                className={styles.stopInput}
              />
              <input
                type="time"
                name="time"
                value={newStop.time}
                onChange={handleStopChange}
                className={styles.stopTimeInput}
              />
              <button type="button" className={styles.addStopButton} onClick={handleAddStop}>
                + إضافة
              </button>
            </div>
          </div>
        </div>

        {/* Times */}
        <div className={styles.section}>
          <label className={styles.label}>أوقات الرحلة *</label>
          <div className={styles.timesRow}>
            <div className={styles.timeInput}>
              <span className={styles.timeIcon}>🌅</span>
              <label>وقت الذهاب</label>
              <input
                type="time"
                name="departure_time"
                value={formData.departure_time}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div className={styles.timeInput}>
              <span className={styles.timeIcon}>🌆</span>
              <label>وقت الرجوع</label>
              <input
                type="time"
                name="return_time"
                value={formData.return_time}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Working Days */}
        <div className={styles.section}>
          <label className={styles.label}>أيام العمل *</label>
          <div className={styles.daysGrid}>
            {DAYS.map((day) => (
              <button
                key={day.id}
                type="button"
                className={`${styles.dayButton} ${formData.working_days.includes(day.id) ? styles.dayActive : ''}`}
                onClick={() => handleDayToggle(day.id)}
              >
                {day.name}
              </button>
            ))}
          </div>
        </div>

        {/* Seats */}
        <div className={styles.section}>
          <label className={styles.label}>عدد المقاعد *</label>
          <select
            name="total_seats"
            value={formData.total_seats}
            onChange={handleChange}
            className={styles.select}
          >
            {SEAT_OPTIONS.map((num) => (
              <option key={num} value={num}>
                {num} مقاعد
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className={styles.section}>
          <label className={styles.label}>سعر الاشتراك الشهري *</label>
          <div className={styles.priceInput}>
            <input
              type="number"
              name="monthly_price"
              value={formData.monthly_price}
              onChange={handleChange}
              placeholder="مثال: 150000"
              className={styles.input}
              min="0"
            />
            <span className={styles.priceCurrency}>د.ع</span>
          </div>
        </div>

        {/* Description */}
        <div className={styles.section}>
          <label className={styles.label}>وصف إضافي (اختياري)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="معلومات إضافية عن الخط..."
            className={styles.textarea}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className={styles.submitButton} disabled={submitting || loading}>
          {submitting ? 'جاري الإنشاء...' : 'إنشاء الخط'}
        </button>
      </form>
    </div>
  );
};

export default CreateLine;
