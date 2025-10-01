import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOffers } from '../../context/OffersContext';

export default function PostOffer() {
  // Location selections
  const [fromGov, setFromGov] = useState('');
  const [fromArea, setFromArea] = useState('');
  const [toGov, setToGov] = useState('');
  const [toArea, setToArea] = useState('');
  // Date & Time
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  // Driver info
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [carModel, setCarModel] = useState('');
  const [errors, setErrors] = useState({});
  const [showAddFromArea, setShowAddFromArea] = useState(false);
  const [showAddToArea, setShowAddToArea] = useState(false);
  const [newFromArea, setNewFromArea] = useState('');
  const [newToArea, setNewToArea] = useState('');
  const { addOffer } = useOffers();
  const navigate = useNavigate();

  // Normalize Arabic-Indic digits to English and snap price to 250 IQD steps
  const normalizeDigits = (value) => {
    if (typeof value !== 'string') return value;
    const map = {
      '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9',
      '۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9'
    };
    return value.replace(/[٠-٩۰-۹]/g, (d) => map[d] || d);
  };

  const snapPriceToStep = (val) => {
    const num = Number(val);
    if (Number.isNaN(num) || num <= 0) return '';
    const step = 250;
    return Math.ceil(num / step) * step;
  };

  // Governorates and areas (subset for brevity; extend as needed)
  const IRAQ_REGIONS = useMemo(() => ({
    'بغداد': ['الكرخ', 'الرصافة', 'الأعظمية', 'مدينة الصدر', 'الدورة', 'الكاظمية'],
    'البصرة': ['مركز البصرة', 'الزبير', 'أبو الخصيب', 'القرنة', 'شط العرب'],
    'أربيل': ['مركز أربيل', 'شقلاوة', 'سوران', 'كويا'],
    'السليمانية': ['مركز السليمانية', 'دوكان', 'رانية', 'حلبجة'],
    'نينوى': ['الموصل', 'الحمدانية', 'تلعفر', 'سنجار'],
    'الأنبار': ['الرمادي', 'الفلوجة', 'هيت', 'حديثة'],
    'ديالى': ['بعقوبة', 'الخالص', 'خانقين', 'المقدادية'],
    'كركوك': ['مركز كركوك', 'الحويجة', 'داقوق'],
    'بابل': ['الحلة', 'المسيب', 'المحاويل'],
    'كربلاء': ['مركز كربلاء', 'عين التمر', 'الهندية'],
    'النجف': ['مركز النجف', 'الكوفة', 'المناذرة'],
    'واسط': ['الكوت', 'الحي', 'النعمانية', 'الصويرة'],
    'ميسان': ['العمارة', 'الكحلاء', 'المجر الكبير'],
    'ذي قار': ['الناصرية', 'الشطرة', 'سوق الشيوخ', 'الرفاعي'],
    'المثنى': ['السماوة', 'الرميثة'],
    'القادسية': ['الديوانية', 'عفك', 'الحمزة'],
  }), []);

  const fromAreas = useMemo(() => (fromGov ? IRAQ_REGIONS[fromGov] || [] : []), [fromGov, IRAQ_REGIONS]);
  const toAreas = useMemo(() => (toGov ? IRAQ_REGIONS[toGov] || [] : []), [toGov, IRAQ_REGIONS]);

  // إضافة منطقة جديدة
  const addNewFromArea = () => {
    if (newFromArea.trim() && fromGov) {
      const updatedRegions = { ...IRAQ_REGIONS };
      if (!updatedRegions[fromGov]) {
        updatedRegions[fromGov] = [];
      }
      if (!updatedRegions[fromGov].includes(newFromArea.trim())) {
        updatedRegions[fromGov].push(newFromArea.trim());
        setFromArea(newFromArea.trim());
        setNewFromArea('');
        setShowAddFromArea(false);
      }
    }
  };

  const addNewToArea = () => {
    if (newToArea.trim() && toGov) {
      const updatedRegions = { ...IRAQ_REGIONS };
      if (!updatedRegions[toGov]) {
        updatedRegions[toGov] = [];
      }
      if (!updatedRegions[toGov].includes(newToArea.trim())) {
        updatedRegions[toGov].push(newToArea.trim());
        setToArea(newToArea.trim());
        setNewToArea('');
        setShowAddToArea(false);
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!fromGov) newErrors.fromGov = 'حقل إجباري';
    if (!fromArea) newErrors.fromArea = 'حقل إجباري';
    if (!toGov) newErrors.toGov = 'حقل إجباري';
    if (!toArea) newErrors.toArea = 'حقل إجباري';
    if (!date) newErrors.date = 'حقل إجباري';
    if (!time) newErrors.time = 'حقل إجباري';
    const seatsNum = Number(seats);
    if (!seats || Number.isNaN(seatsNum) || seatsNum <= 0) newErrors.seats = 'يجب أن يكون رقمًا موجبًا';
    const priceNum = Number(price);
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) newErrors.price = 'يجب أن يكون رقمًا موجبًا';
    if (!driverName.trim()) newErrors.driverName = 'اسم السائق مطلوب';
    if (!driverPhone.trim() || driverPhone.trim().length < 7) newErrors.driverPhone = 'رقم هاتف غير صالح';
    if (!carModel.trim()) newErrors.carModel = 'نوع السيارة مطلوب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePost = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const from = `${fromGov} - ${fromArea}`;
    const to = `${toGov} - ${toArea}`;
    const isoDateTime = new Date(`${date}T${time}:00`).toISOString();
    const offer = {
      id: Date.now().toString(),
      from,
      to,
      date: isoDateTime,
      seats: Number(seats),
      price: Number(price),
      negotiable: Boolean(negotiable),
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      carModel: carModel.trim(),
      createdAt: new Date().toISOString(),
    };
    addOffer(offer);
    navigate('/offers');
  };

  const formatIQD = (value) => {
    try {
      return new Intl.NumberFormat('ar-IQ', { style: 'currency', currency: 'IQD', maximumFractionDigits: 0 }).format(Number(value));
    } catch {
      return `${value} IQD`;
    }
  };
  const examplePrice = price ? formatIQD(price) : formatIQD(15000);

  return (
    <div style={{ 
      maxWidth: 600, 
      margin: '1rem auto', 
      padding: '0 16px',
      background: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px 0 16px 0',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '20px'
      }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            background: '#f3f4f6',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#374151',
            marginBottom: '12px'
          }}
        >
          ← رجوع للرئيسية
        </button>
        <h2 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '24px',
          fontWeight: '700',
          color: '#1f2937',
          textAlign: 'center'
        }}>
          🚗 عرض مقعد
        </h2>
        <p style={{ 
          margin: '0',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          أنا سائق أبحث عن ركاب
        </p>
      </div>

      <form onSubmit={handlePost} noValidate style={{ display: 'grid', gap: '20px' }}>
        {/* معلومات السائق */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #0ea5e9',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '20px',
            background: '#0ea5e9',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            معلومات السائق
          </div>
          <div style={{ display: 'grid', gap: '16px', marginTop: '8px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontSize: '14px',
                fontWeight: '600',
                color: '#0369a1'
              }}>
                اسم السائق
              </label>
              <input
                placeholder="أدخل اسمك الكامل"
                value={driverName}
                onChange={(e) => { setDriverName(e.target.value); if (errors.driverName) setErrors((p) => ({ ...p, driverName: undefined })); }}
                aria-invalid={!!errors.driverName}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #0ea5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  background: 'white'
                }}
              />
              {errors.driverName ? <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.driverName}</div> : null}
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontSize: '14px',
                fontWeight: '600',
                color: '#0369a1'
              }}>
                رقم الهاتف
              </label>
              <input
                placeholder="07XXXXXXXX"
                inputMode="tel"
                value={driverPhone}
                onChange={(e) => { setDriverPhone(e.target.value); if (errors.driverPhone) setErrors((p) => ({ ...p, driverPhone: undefined })); }}
                aria-invalid={!!errors.driverPhone}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #0ea5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  background: 'white'
                }}
              />
              {errors.driverPhone ? <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.driverPhone}</div> : null}
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontSize: '14px',
                fontWeight: '600',
                color: '#0369a1'
              }}>
                نوع السيارة
              </label>
              <input
                placeholder="مثال: تويوتا كامري 2020"
                value={carModel}
                onChange={(e) => { setCarModel(e.target.value); if (errors.carModel) setErrors((p) => ({ ...p, carModel: undefined })); }}
                aria-invalid={!!errors.carModel}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #0ea5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  background: 'white'
                }}
              />
              {errors.carModel ? <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.carModel}</div> : null}
            </div>
          </div>
        </div>

        {/* تفاصيل الرحلة */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #22c55e',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '20px',
            background: '#22c55e',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            تفاصيل الرحلة
          </div>
          <div style={{ display: 'grid', gap: '16px', marginTop: '8px' }}>
            {/* من */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#15803d'
                }}>
                  من - المحافظة
                </label>
                <select
                  value={fromGov}
                  onChange={(e) => { setFromGov(e.target.value); setFromArea(''); if (errors.fromGov) setErrors((p) => ({ ...p, fromGov: undefined })); }}
                  aria-invalid={!!errors.fromGov}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #22c55e',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'white'
                  }}
                >
                  <option value="">اختر المحافظة</option>
                  {Object.keys(IRAQ_REGIONS).map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.fromGov ? <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.fromGov}</div> : null}
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#15803d'
                }}>
                  من - المنطقة
                </label>
                <select
                  value={fromArea}
                  onChange={(e) => { 
                    if (e.target.value === 'add-new') {
                      setShowAddFromArea(true);
                    } else {
                      setFromArea(e.target.value); 
                      if (errors.fromArea) setErrors((p) => ({ ...p, fromArea: undefined }));
                    }
                  }}
                  aria-invalid={!!errors.fromArea}
                  required
                  disabled={!fromGov}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #22c55e',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: fromGov ? 'white' : '#f9fafb'
                  }}
                >
                  <option value="">اختر المنطقة</option>
                  {fromAreas.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                  <option value="add-new" style={{ color: '#22c55e', fontWeight: '600' }}>
                    ➕ إضافة منطقة جديدة
                  </option>
                </select>
                {errors.fromArea ? <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.fromArea}</div> : null}
                
                {/* إضافة منطقة جديدة */}
                {showAddFromArea && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '12px', 
                    background: '#f0fdf4', 
                    border: '1px solid #22c55e', 
                    borderRadius: '8px' 
                  }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '6px', 
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#15803d'
                    }}>
                      اسم المنطقة الجديدة
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        placeholder="أدخل اسم المنطقة"
                        value={newFromArea}
                        onChange={(e) => setNewFromArea(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #22c55e',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addNewFromArea();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addNewFromArea}
                        style={{
                          background: '#22c55e',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        إضافة
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddFromArea(false);
                          setNewFromArea('');
                        }}
                        style={{
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* إلى */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#15803d'
                }}>
                  إلى - المحافظة
                </label>
                <select
                  value={toGov}
                  onChange={(e) => { setToGov(e.target.value); setToArea(''); if (errors.toGov) setErrors((p) => ({ ...p, toGov: undefined })); }}
                  aria-invalid={!!errors.toGov}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #22c55e',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'white'
                  }}
                >
                  <option value="">اختر المحافظة</option>
                  {Object.keys(IRAQ_REGIONS).map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.toGov ? <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.toGov}</div> : null}
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#15803d'
                }}>
                  إلى - المنطقة
                </label>
                <select
                  value={toArea}
                  onChange={(e) => { 
                    if (e.target.value === 'add-new') {
                      setShowAddToArea(true);
                    } else {
                      setToArea(e.target.value); 
                      if (errors.toArea) setErrors((p) => ({ ...p, toArea: undefined }));
                    }
                  }}
                  aria-invalid={!!errors.toArea}
                  required
                  disabled={!toGov}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #22c55e',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: toGov ? 'white' : '#f9fafb'
                  }}
                >
                  <option value="">اختر المنطقة</option>
                  {toAreas.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                  <option value="add-new" style={{ color: '#22c55e', fontWeight: '600' }}>
                    ➕ إضافة منطقة جديدة
                  </option>
                </select>
                {errors.toArea ? <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.toArea}</div> : null}
                
                {/* إضافة منطقة جديدة */}
                {showAddToArea && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '12px', 
                    background: '#f0fdf4', 
                    border: '1px solid #22c55e', 
                    borderRadius: '8px' 
                  }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '6px', 
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#15803d'
                    }}>
                      اسم المنطقة الجديدة
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        placeholder="أدخل اسم المنطقة"
                        value={newToArea}
                        onChange={(e) => setNewToArea(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #22c55e',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addNewToArea();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addNewToArea}
                        style={{
                          background: '#22c55e',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        إضافة
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddToArea(false);
                          setNewToArea('');
                        }}
                        style={{
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* التاريخ والوقت */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#15803d'
                }}>
                  التاريخ
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); if (errors.date) setErrors((p) => ({ ...p, date: undefined })); }}
                  aria-invalid={!!errors.date}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #22c55e',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'white'
                  }}
                />
                {errors.date ? <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.date}</div> : null}
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#15803d'
                }}>
                  الوقت
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => { setTime(e.target.value); if (errors.time) setErrors((p) => ({ ...p, time: undefined })); }}
                  aria-invalid={!!errors.time}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #22c55e',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'white'
                  }}
                />
                {errors.time ? <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.time}</div> : null}
              </div>
            </div>
          </div>
        </div>

        {/* السعر والمقاعد */}
        <div style={{ 
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #f59e0b',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '20px',
            background: '#f59e0b',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            السعر والمقاعد
          </div>
          <div style={{ display: 'grid', gap: '16px', marginTop: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#92400e'
                }}>
                  عدد المقاعد المتاحة
                </label>
                <input
                  placeholder="مثال: 3"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  lang="en"
                  dir="ltr"
                  value={seats}
                  onChange={(e) => {
                    const v = normalizeDigits(e.target.value);
                    setSeats(v);
                    if (errors.seats) setErrors((p) => ({ ...p, seats: undefined }));
                  }}
                  aria-invalid={!!errors.seats}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #f59e0b',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'white'
                  }}
                />
                {errors.seats ? <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.seats}</div> : null}
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#92400e'
                }}>
                  السعر لكل مقعد (دينار)
                </label>
                <input
                  placeholder="مثال: 15000"
                  type="number"
                  min={250}
                  step={250}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  lang="en"
                  dir="ltr"
                  value={price}
                  onChange={(e) => {
                    const normalized = normalizeDigits(e.target.value);
                    const snapped = snapPriceToStep(normalized);
                    setPrice(snapped);
                    if (errors.price) setErrors((p) => ({ ...p, price: undefined }));
                  }}
                  aria-invalid={!!errors.price}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #f59e0b',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'white'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#92400e', marginTop: '4px' }}>
                  مثال: {examplePrice}
                </div>
                {errors.price ? <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.price}</div> : null}
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '8px',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <input 
                type="checkbox" 
                checked={negotiable} 
                onChange={(e) => setNegotiable(e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                السعر قابل للتفاوض
              </span>
            </div>
          </div>
        </div>

        {/* زر النشر */}
        <button 
          type="submit"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            padding: '16px 24px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
        >
          🚗 نشر العرض
        </button>
      </form>
    </div>
  );
}
