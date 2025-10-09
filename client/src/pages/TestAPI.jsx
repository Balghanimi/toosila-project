import React, { useState } from 'react';
import { authAPI } from '../services/api';

export default function TestAPI() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testRegister = async () => {
    setLoading(true);
    setResult('جاري الاختبار...');
    
    try {
      const testUser = {
        name: 'مستخدم تجريبي',
        email: `test${Date.now()}@test.com`,
        password: '123456',
        userType: 'passenger'
      };
      
      console.log('📤 Sending request to Backend...');
      const response = await authAPI.register(testUser);
      console.log('✅ Response received:', response);
      
      setResult('✅ نجح الاتصال!\n\n' + JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('❌ Error:', error);
      setResult('❌ فشل الاتصال:\n' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        اختبار الربط بين Frontend و Backend
      </h1>
      
      <button
        onClick={testRegister}
        disabled={loading}
        style={{
          width: '100%',
          padding: '20px',
          fontSize: '18px',
          background: loading ? '#999' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}
      >
        {loading ? 'جاري الاختبار...' : 'اختبار التسجيل'}
      </button>

      <div style={{
        background: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        minHeight: '300px',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        {result || 'اضغط الزر لاختبار الاتصال'}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#e3f2fd',
        borderRadius: '8px'
      }}>
        <strong>ملاحظات:</strong>
        <ul>
          <li>افتح Console (F12) لرؤية التفاصيل</li>
          <li>افتح Network Tab لرؤية الطلبات</li>
          <li>Backend يجب أن يعمل على port 5001</li>
        </ul>
      </div>
    </div>
  );
}
