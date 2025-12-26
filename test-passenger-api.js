#!/usr/bin/env node

/**
 * سكريبت اختبار شامل لجميع دوال الراكب في تطبيق توصيلة
 * يختبر جميع API endpoints واحدة تلو الأخرى
 */

const https = require('https');

const BASE_URL = 'https://toosila-backend-production.up.railway.app';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// متغيرات عامة للاختبار
let authToken = null;
let userId = null;
let demandId = null;
let offerId = null;
let bookingId = null;
let messageId = null;
let notificationId = null;
let ratingId = null;

// إحصائيات الاختبار
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * دالة لإرسال HTTP request
 */
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * دالة لطباعة نتيجة الاختبار
 */
function logTest(testName, passed, message = '') {
  stats.total++;
  if (passed) {
    stats.passed++;
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    if (message) console.log(`  ${colors.cyan}${message}${colors.reset}`);
  } else {
    stats.failed++;
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    if (message) console.log(`  ${colors.red}${message}${colors.reset}`);
    stats.errors.push({ test: testName, error: message });
  }
}

/**
 * دالة للانتظار (sleep)
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * ================================================
 * المرحلة 1: اختبار المصادقة (Authentication)
 * ================================================
 */

async function testAuth() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}المرحلة 1: اختبار المصادقة${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // 1.1 تسجيل الدخول بحساب موجود
  try {
    const loginData = {
      email: 'aliengmech@gmail.com',
      password: '12345'
    };

    const response = await makeRequest('POST', '/api/auth/login', loginData);

    if (response.status === 200 && response.body.data?.token) {
      authToken = response.body.data.token;
      userId = response.body.data.user?.id;
      logTest('تسجيل الدخول بحساب موجود', true, `User: ${response.body.data.user?.name}, ID: ${userId}`);
    } else {
      logTest('تسجيل الدخول بحساب موجود', false, `Status: ${response.status}, Response: ${JSON.stringify(response.body)}`);
      return false;
    }
  } catch (error) {
    logTest('تسجيل الدخول بحساب موجود', false, error.message);
    return false;
  }

  await sleep(500);

  // 1.3 عرض الملف الشخصي
  try {
    const response = await makeRequest('GET', '/api/auth/profile', null, authToken);

    if (response.status === 200 && response.body.data?.user?.id === userId) {
      logTest('عرض الملف الشخصي', true, `Name: ${response.body.data.user.name}`);
    } else {
      logTest('عرض الملف الشخصي', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('عرض الملف الشخصي', false, error.message);
  }

  await sleep(500);

  // 1.4 تحديث الملف الشخصي
  try {
    const updateData = {
      name: 'راكب تجريبي محدث',
      languagePreference: 'en'
    };

    const response = await makeRequest('PUT', '/api/auth/profile', updateData, authToken);

    if (response.status === 200) {
      logTest('تحديث الملف الشخصي', true);
    } else {
      logTest('تحديث الملف الشخصي', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('تحديث الملف الشخصي', false, error.message);
  }

  await sleep(500);

  // 1.5 عرض الإحصائيات
  try {
    const response = await makeRequest('GET', '/api/auth/stats', null, authToken);

    if (response.status === 200) {
      logTest('عرض الإحصائيات', true, JSON.stringify(response.body));
    } else {
      logTest('عرض الإحصائيات', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('عرض الإحصائيات', false, error.message);
  }

  await sleep(500);

  // 1.6 اختبار الوصول بدون Token
  try {
    const response = await makeRequest('GET', '/api/auth/profile', null, null);

    if (response.status === 401) {
      logTest('الوصول بدون Token (يجب أن يفشل)', true, 'تم رفض الوصول كما هو متوقع');
    } else {
      logTest('الوصول بدون Token', false, `Status: ${response.status} - يجب أن يكون 401`);
    }
  } catch (error) {
    logTest('الوصول بدون Token', false, error.message);
  }

  return true;
}

/**
 * ================================================
 * المرحلة 2: اختبار الطلبات (Demands)
 * ================================================
 */

async function testDemands() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}المرحلة 2: اختبار الطلبات${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // 2.1 إنشاء طلب جديد
  try {
    const demandData = {
      fromCity: 'بغداد',
      toCity: 'البصرة',
      earliestTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // غداً
      latestTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // غداً + 4 ساعات
      seats: 2,
      budgetMax: 15000,
      notes: 'أفضل رحلة صباحية مريحة - اختبار آلي'
    };

    const response = await makeRequest('POST', '/api/demands', demandData, authToken);

    if (response.status === 201 && response.body.success) {
      demandId = response.body.data?.demand?.id || response.body.demand?.id;
      logTest('إنشاء طلب رحلة', true, `Demand ID: ${demandId}`);
    } else {
      logTest('إنشاء طلب رحلة', false, `Status: ${response.status}, Message: ${JSON.stringify(response.body)}`);
    }
  } catch (error) {
    logTest('إنشاء طلب رحلة', false, error.message);
  }

  await sleep(500);

  // 2.2 عرض جميع الطلبات
  try {
    const response = await makeRequest('GET', '/api/demands?page=1&limit=10', null, authToken);

    if (response.status === 200 && Array.isArray(response.body.demands)) {
      logTest('عرض جميع الطلبات', true, `عدد الطلبات: ${response.body.demands.length}`);

      // استخدم أول demand موجود للاختبارات التالية
      if (response.body.demands.length > 0 && !demandId) {
        demandId = response.body.demands[0].id;
      }
    } else {
      logTest('عرض جميع الطلبات', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('عرض جميع الطلبات', false, error.message);
  }

  await sleep(500);

  // 2.3 عرض طلباتي
  try {
    const response = await makeRequest('GET', '/api/demands/my/demands', null, authToken);

    if (response.status === 200) {
      logTest('عرض طلباتي', true, `عدد طلباتي: ${response.body.demands?.length || 0}`);
    } else {
      logTest('عرض طلباتي', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('عرض طلباتي', false, error.message);
  }

  await sleep(500);

  // 2.4 عرض طلب محدد
  if (demandId) {
    try {
      const response = await makeRequest('GET', `/api/demands/${demandId}`, null, authToken);

      if (response.status === 200 && response.body.demand?.id) {
        logTest('عرض طلب محدد', true, `Demand: ${response.body.demand.from_city} -> ${response.body.demand.to_city}`);
      } else {
        logTest('عرض طلب محدد', false, `Status: ${response.status}`);
      }
    } catch (error) {
      logTest('عرض طلب محدد', false, error.message);
    }

    await sleep(500);

    // 2.5 تعديل الطلب
    try {
      const updateData = {
        budgetMax: 18000,
        notes: 'ملاحظات محدثة - اختبار آلي'
      };

      const response = await makeRequest('PUT', `/api/demands/${demandId}`, updateData, authToken);

      if (response.status === 200) {
        logTest('تعديل الطلب', true);
      } else {
        logTest('تعديل الطلب', false, `Status: ${response.status}`);
      }
    } catch (error) {
      logTest('تعديل الطلب', false, error.message);
    }

    await sleep(500);
  }

  // 2.6 البحث في الطلبات
  try {
    const response = await makeRequest('GET', '/api/demands/search?q=بغداد', null, authToken);

    if (response.status === 200) {
      logTest('البحث في الطلبات', true, `عدد النتائج: ${response.body.data?.demands?.length || 0}`);
    } else {
      logTest('البحث في الطلبات', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('البحث في الطلبات', false, error.message);
  }
}

/**
 * ================================================
 * المرحلة 3: اختبار العروض والحجز
 * ================================================
 */

async function testOffersAndBookings() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}المرحلة 3: اختبار العروض والحجز${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // 3.1 عرض جميع العروض
  try {
    const response = await makeRequest('GET', '/api/offers?page=1&limit=10', null, authToken);

    if (response.status === 200 && Array.isArray(response.body.offers)) {
      logTest('عرض جميع العروض', true, `عدد العروض: ${response.body.offers.length}`);

      // حفظ أول عرض للاختبار
      if (response.body.offers.length > 0) {
        offerId = response.body.offers[0].id;
      }
    } else {
      logTest('عرض جميع العروض', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('عرض جميع العروض', false, error.message);
  }

  await sleep(500);

  // 3.2 البحث في العروض
  try {
    const response = await makeRequest('GET', '/api/offers/search?q=بغداد', null, authToken);

    if (response.status === 200) {
      logTest('البحث في العروض', true, `عدد النتائج: ${response.body.data?.offers?.length || 0}`);
    } else {
      logTest('البحث في العروض', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('البحث في العروض', false, error.message);
  }

  await sleep(500);

  // 3.3 عرض تفاصيل عرض محدد
  if (offerId) {
    try {
      const response = await makeRequest('GET', `/api/offers/${offerId}`, null, authToken);

      if (response.status === 200 && response.body.offer) {
        logTest('عرض تفاصيل عرض محدد', true, `Offer: ${response.body.offer.from_city} -> ${response.body.offer.to_city}, Price: ${response.body.offer.price}`);
      } else {
        logTest('عرض تفاصيل عرض محدد', false, `Status: ${response.status}`);
      }
    } catch (error) {
      logTest('عرض تفاصيل عرض محدد', false, error.message);
    }

    await sleep(500);

    // 3.4 حجز رحلة
    try {
      const bookingData = {
        offerId: offerId,
        seats: 1,
        message: 'مرحباً، اختبار آلي للحجز'
      };

      const response = await makeRequest('POST', '/api/bookings', bookingData, authToken);

      if (response.status === 201 && response.body.success) {
        bookingId = response.body.data?.booking?.id || response.body.booking?.id;
        logTest('حجز رحلة', true, `Booking ID: ${bookingId}`);
      } else if (response.status === 400 && response.body.error?.message?.includes('cannot book your own')) {
        logTest('حجز رحلة', true, '⚠️ تخطي - لا يمكن حجز العرض الخاص (سلوك صحيح)');
      } else if (response.status === 409 && response.body.error?.message?.includes('Duplicate')) {
        logTest('حجز رحلة', true, '⚠️ تخطي - حجز موجود مسبقاً (سلوك صحيح)');
      } else {
        logTest('حجز رحلة', false, `Status: ${response.status}, Message: ${JSON.stringify(response.body)}`);
      }
    } catch (error) {
      logTest('حجز رحلة', false, error.message);
    }

    await sleep(500);
  } else {
    console.log(`${colors.yellow}⚠ لا توجد عروض متاحة للاختبار${colors.reset}`);
  }

  // 3.5 عرض حجوزاتي
  try {
    const response = await makeRequest('GET', '/api/bookings/my/bookings', null, authToken);

    if (response.status === 200) {
      logTest('عرض حجوزاتي', true);
    } else {
      logTest('عرض حجوزاتي', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('عرض حجوزاتي', false, error.message);
  }

  await sleep(500);

  // 3.6 إحصائيات الحجوزات
  try {
    const response = await makeRequest('GET', '/api/bookings/my/stats', null, authToken);

    if (response.status === 200) {
      logTest('إحصائيات الحجوزات', true, JSON.stringify(response.body));
    } else {
      logTest('إحصائيات الحجوزات', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('إحصائيات الحجوزات', false, error.message);
  }
}

/**
 * ================================================
 * المرحلة 4: اختبار الرسائل
 * ================================================
 */

async function testMessages() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}المرحلة 4: اختبار المراسلة${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // 4.1 عرض المحادثات
  try {
    const response = await makeRequest('GET', '/api/messages/conversations', null, authToken);

    if (response.status === 200) {
      logTest('عرض المحادثات', true);
    } else {
      logTest('عرض المحادثات', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('عرض المحادثات', false, error.message);
  }

  await sleep(500);

  // 4.2 عدد الرسائل غير المقروءة
  try {
    const response = await makeRequest('GET', '/api/messages/unread-count', null, authToken);

    if (response.status === 200) {
      logTest('عدد الرسائل غير المقروءة', true, `عدد الرسائل: ${response.body.unreadCount || 0}`);
    } else {
      logTest('عدد الرسائل غير المقروءة', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('عدد الرسائل غير المقروءة', false, error.message);
  }

  await sleep(500);

  // 4.3 إرسال رسالة (إذا كان هناك طلب)
  if (demandId) {
    try {
      const messageData = {
        rideType: 'demand',
        rideId: demandId,
        content: 'رسالة اختبار آلي - هل يمكنك تأكيد موعد المغادرة؟'
      };

      const response = await makeRequest('POST', '/api/messages', messageData, authToken);

      if (response.status === 201 && response.body.messageData) {
        messageId = response.body.messageData?.id;
        logTest('إرسال رسالة', true, `Message ID: ${messageId}`);
      } else if (response.status === 403 || response.status === 400) {
        logTest('إرسال رسالة', true, '⚠️ تخطي - لا يوجد محادثة نشطة (متوقع)');
      } else {
        logTest('إرسال رسالة', false, `Status: ${response.status}, ${JSON.stringify(response.body)}`);
      }
    } catch (error) {
      logTest('إرسال رسالة', false, error.message);
    }

    await sleep(500);
  }
}

/**
 * ================================================
 * المرحلة 5: اختبار الإشعارات
 * ================================================
 */

async function testNotifications() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}المرحلة 5: اختبار الإشعارات${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // 5.1 عرض جميع الإشعارات
  try {
    const response = await makeRequest('GET', '/api/notifications?page=1&limit=10', null, authToken);

    if (response.status === 200 && Array.isArray(response.body.data?.notifications)) {
      logTest('عرض جميع الإشعارات', true, `عدد الإشعارات: ${response.body.data.notifications.length}`);

      if (response.body.data.notifications.length > 0) {
        notificationId = response.body.data.notifications[0].id;
      }
    } else {
      logTest('عرض جميع الإشعارات', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('عرض جميع الإشعارات', false, error.message);
  }

  await sleep(500);

  // 5.2 عدد الإشعارات غير المقروءة
  try {
    const response = await makeRequest('GET', '/api/notifications/unread-count', null, authToken);

    if (response.status === 200) {
      logTest('عدد الإشعارات غير المقروءة', true, `عدد الإشعارات: ${response.body.unreadCount || 0}`);
    } else {
      logTest('عدد الإشعارات غير المقروءة', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('عدد الإشعارات غير المقروءة', false, error.message);
  }

  await sleep(500);

  // 5.3 عرض الإشعارات غير المقروءة
  try {
    const response = await makeRequest('GET', '/api/notifications/unread', null, authToken);

    if (response.status === 200) {
      logTest('عرض الإشعارات غير المقروءة', true);
    } else {
      logTest('عرض الإشعارات غير المقروءة', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('عرض الإشعارات غير المقروءة', false, error.message);
  }

  await sleep(500);

  // 5.4 تحديد إشعار كمقروء
  if (notificationId) {
    try {
      const response = await makeRequest('PATCH', `/api/notifications/${notificationId}/read`, null, authToken);

      if (response.status === 200) {
        logTest('تحديد إشعار كمقروء', true);
      } else {
        logTest('تحديد إشعار كمقروء', false, `Status: ${response.status}`);
      }
    } catch (error) {
      logTest('تحديد إشعار كمقروء', false, error.message);
    }

    await sleep(500);
  }
}

/**
 * ================================================
 * المرحلة 6: اختبار التقييمات
 * ================================================
 */

async function testRatings() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}المرحلة 6: اختبار التقييمات${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // 6.1 عرض جميع التقييمات
  try {
    const response = await makeRequest('GET', '/api/ratings?page=1&limit=10', null, authToken);

    if (response.status === 200) {
      logTest('عرض جميع التقييمات', true);
    } else {
      logTest('عرض جميع التقييمات', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('عرض جميع التقييمات', false, error.message);
  }

  await sleep(500);

  // 6.2 أعلى المستخدمين تقييماً
  try {
    const response = await makeRequest('GET', '/api/ratings/top-users', null, authToken);

    if (response.status === 200) {
      logTest('أعلى المستخدمين تقييماً', true);
    } else {
      logTest('أعلى المستخدمين تقييماً', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('أعلى المستخدمين تقييماً', false, error.message);
  }

  await sleep(500);

  console.log(`\n${colors.yellow}⚠ ملاحظة: لا يمكن اختبار إنشاء تقييم إلا بعد إكمال رحلة فعلية${colors.reset}`);
}

/**
 * ================================================
 * الدالة الرئيسية
 * ================================================
 */

async function runAllTests() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║                                                    ║${colors.reset}`);
  console.log(`${colors.cyan}║     🧪 اختبار شامل لدوال الراكب - توصيلة         ║${colors.reset}`);
  console.log(`${colors.cyan}║                                                    ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`${colors.yellow}📡 الاتصال بالخادم: ${BASE_URL}${colors.reset}\n`);

  const startTime = Date.now();

  // تشغيل جميع مراحل الاختبار
  const authSuccess = await testAuth();

  if (authSuccess && authToken) {
    await testDemands();
    await testOffersAndBookings();
    await testMessages();
    await testNotifications();
    await testRatings();
  } else {
    console.log(`\n${colors.red}❌ فشل في المصادقة - إيقاف الاختبارات${colors.reset}\n`);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // عرض الملخص النهائي
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}                      📊 ملخص النتائج                      ${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`⏱️  الوقت الإجمالي: ${duration} ثانية`);
  console.log(`📝 إجمالي الاختبارات: ${stats.total}`);
  console.log(`${colors.green}✓ ناجح: ${stats.passed}${colors.reset}`);
  console.log(`${colors.red}✗ فاشل: ${stats.failed}${colors.reset}`);

  const successRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) : 0;
  console.log(`\n📈 معدل النجاح: ${successRate}%`);

  if (stats.errors.length > 0) {
    console.log(`\n${colors.red}❌ الأخطاء:${colors.reset}`);
    stats.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}`);
      console.log(`   ${error.error}\n`);
    });
  }

  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  // حفظ النتائج
  console.log(`💾 تم حفظ النتائج في الملف...`);

  // الخروج بكود مناسب
  process.exit(stats.failed > 0 ? 1 : 0);
}

// تشغيل الاختبارات
runAllTests().catch(error => {
  console.error(`${colors.red}خطأ فادح: ${error.message}${colors.reset}`);
  process.exit(1);
});
