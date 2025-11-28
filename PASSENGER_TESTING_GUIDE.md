# دليل اختبار شامل للركاب - Toosila
## Comprehensive Passenger Testing Guide

---

## 🎯 نظرة عامة / Overview

هذا الدليل يحتوي على خطوات مفصلة لاختبار جميع ميزات الركاب في تطبيق Toosila يدوياً.
This guide contains detailed steps to manually test all passenger features in the Toosila application.

**تاريخ الإنشاء / Created:** November 25, 2025
**الإصدار / Version:** 1.0

---

## 📋 جدول المحتويات / Table of Contents

1. [اختبارات التسجيل والدخول](#1-authentication-tests)
2. [اختبارات البحث والتصفح](#2-search-browse-tests)
3. [اختبارات الحجوزات](#3-booking-tests)
4. [اختبارات حجوزاتي](#4-my-bookings-tests)
5. [اختبارات المراسلة](#5-messaging-tests)
6. [اختبارات الطلبات](#6-demands-tests)
7. [اختبارات التقييمات](#7-ratings-tests)
8. [اختبارات معالجة الأخطاء](#8-error-handling-tests)
9. [خلاصة النتائج](#9-test-summary)

---

## ⚙️ الإعدادات الأولية / Initial Setup

قبل البدء بالاختبار، تأكد من:
Before starting testing, ensure:

- [ ] المتصفح مفتوح على وضع التصفح الخاص (Incognito/Private)
- [ ] أدوات المطور مفتوحة (F12)
- [ ] تبويب Console مرئي لمراقبة الأخطاء
- [ ] لديك اتصال إنترنت مستقر
- [ ] تطبيق الويب يعمل على: https://toosila-production.up.railway.app
- [ ] Backend يعمل على: https://toosila-backend-production.up.railway.app

---

## 1. Authentication Tests
## 🔐 اختبارات التسجيل والدخول

### Test 1.1: تسجيل حساب راكب جديد / New Passenger Registration

**الخطوات / Steps:**

1. افتح الصفحة الرئيسية
   - Go to: https://toosila-production.up.railway.app

2. اضغط على زر "تسجيل حساب" أو "Register"
   - Click the register/signup button

3. املأ النموذج بالبيانات التالية:
   - Fill the form with:
   ```
   الاسم / Name: أحمد الركاب
   البريد الإلكتروني / Email: passenger.test@toosila.com
   كلمة المرور / Password: Test@123456
   تأكيد كلمة المرور / Confirm Password: Test@123456
   نوع الحساب / Account Type: راكب / Passenger
   ```

4. اضغط "تسجيل" / Click "Submit"

**النتيجة المتوقعة / Expected Result:**

✅ يظهر رسالة نجاح: "تم إنشاء الحساب بنجاح"
✅ Success message appears: "Account created successfully"

✅ يتم توجيهك للوحة التحكم / Redirected to dashboard

✅ في Console لا توجد أخطاء / No errors in console

**ما يجب تصويره / Screenshot:**
- صورة للوحة التحكم بعد التسجيل الناجح
- Screenshot of dashboard after successful registration

**التحقق من البيانات / Data Verification:**
```bash
# Run in terminal (backend server)
node -e "require('dotenv').config(); const {query} = require('./server/config/db'); query('SELECT id, name, email, is_driver FROM users WHERE email = \\'passenger.test@toosila.com\\'').then(r => console.log(r.rows));"
```

**النتيجة المتوقعة في Console:**
```javascript
[
  {
    id: 'uuid-here',
    name: 'أحمد الركاب',
    email: 'passenger.test@toosila.com',
    is_driver: false
  }
]
```

---

### Test 1.2: تسجيل الدخول / Login

**الخطوات / Steps:**

1. افتح الصفحة الرئيسية في نافذة جديدة (Incognito)

2. اضغط على "تسجيل الدخول" / Click "Login"

3. أدخل البيانات:
   ```
   Email: passenger.test@toosila.com
   Password: Test@123456
   ```

4. اضغط "دخول" / Click "Submit"

**النتيجة المتوقعة / Expected Result:**

✅ رسالة نجاح: "مرحباً أحمد الركاب"
✅ Success: "Welcome Ahmed"

✅ توجيه للوحة التحكم / Redirected to dashboard

✅ الاسم يظهر في الشريط العلوي / Name visible in header

✅ في Console تجد:
```javascript
console.log('✅ Login successful')
console.log('👤 User:', { name: 'أحمد الركاب', email: '...' })
```

**ما يجب تصويره / Screenshot:**
- صورة للوحة التحكم مع اسم المستخدم ظاهر
- Dashboard with username visible

---

### Test 1.3: الملف الشخصي / Profile View

**الخطوات / Steps:**

1. وأنت مسجل دخول، اضغط على اسمك في الشريط العلوي

2. اختر "الملف الشخصي" / Click "Profile"

**النتيجة المتوقعة / Expected Result:**

✅ تظهر صفحة الملف الشخصي بها:
- الاسم: أحمد الركاب
- البريد: passenger.test@toosila.com
- نوع الحساب: راكب / Passenger
- تاريخ التسجيل
- عدد الحجوزات (0 في البداية)

✅ Profile page shows:
- Name, email, account type
- Registration date
- Booking count

**ما يجب تصويره / Screenshot:**
- صورة لصفحة الملف الشخصي كاملة
- Full profile page screenshot

---

### Test 1.4: تسجيل الخروج / Logout

**الخطوات / Steps:**

1. اضغط على اسمك في الشريط العلوي

2. اختر "تسجيل الخروج" / Click "Logout"

**النتيجة المتوقعة / Expected Result:**

✅ رسالة: "تم تسجيل الخروج بنجاح"
✅ Success: "Logged out successfully"

✅ توجيه للصفحة الرئيسية / Redirected to home

✅ اسم المستخدم لا يظهر في الشريط / Username not visible

✅ localStorage تم مسحه:
```javascript
// In browser console
console.log(localStorage.getItem('token')); // null
console.log(localStorage.getItem('currentUser')); // null
```

**ما يجب تصويره / Screenshot:**
- صورة للصفحة الرئيسية بعد تسجيل الخروج
- Home page after logout

---

## 2. Search & Browse Tests
## 🔍 اختبارات البحث والتصفح

### Test 2.1: عرض جميع العروض المتاحة / View All Offers

**الخطوات / Steps:**

1. سجل دخولك كراكب

2. من الصفحة الرئيسية، اضغط "ابحث عن رحلة" أو "View Offers"

3. أو اذهب مباشرة إلى: `/offers`

**النتيجة المتوقعة / Expected Result:**

✅ تظهر قائمة العروض المتاحة

✅ كل عرض يحتوي على:
- من: [المدينة]
- إلى: [المدينة]
- الوقت: بتنسيق 24 ساعة (مثل: 14:30)
- السعر: بالأرقام الإنجليزية (مثل: 12000)
- عدد المقاعد المتاحة: بالأرقام الإنجليزية (مثل: 3)
- اسم السائق
- تقييم السائق
- زر "احجز الآن"

✅ Offers list shows:
- From/To cities
- Time in 24h format
- Price in English numerals (0-9)
- Available seats in English numerals
- Driver name and rating
- "Book Now" button

✅ في Console:
```javascript
console.log('📦 Loaded X offers')
console.log('🔢 All numbers in English (0-9)')
```

**ما يجب تصويره / Screenshot:**
- صورة لقائمة العروض مع التركيز على الأرقام (يجب أن تكون إنجليزية)
- Offers list with focus on numerals (must be English 0-9)

**التحقق من الأرقام الإنجليزية / English Numerals Verification:**

⚠️ **مهم جداً / CRITICAL:** تأكد أن جميع الأرقام المعروضة هي (0-9) وليس (٠-٩)

Check that displayed numbers are:
- ✅ 2, 3, 12000 (English)
- ❌ ٢، ٣، ١٢٠٠٠ (Arabic) - should NOT appear

---

### Test 2.2: البحث بالمدن / Search by Cities

**الخطوات / Steps:**

1. في صفحة العروض، ابحث عن نموذج البحث

2. اختر:
   ```
   من: بغداد
   إلى: كربلاء
   ```

3. اضغط "بحث" / Click "Search"

**النتيجة المتوقعة / Expected Result:**

✅ تظهر فقط العروض من بغداد إلى كربلاء

✅ Only offers matching Baghdad → Karbala appear

✅ في Console:
```javascript
console.log('🔍 Search filters applied')
console.log('📦 Results:', filteredOffers.length)
```

**ما يجب تصويره / Screenshot:**
- صورة للنتائج المفلترة
- Filtered search results

---

### Test 2.3: تفاصيل عرض واحد / Single Offer Details

**الخطوات / Steps:**

1. من قائمة العروض، اضغط على أي عرض (أو زر "احجز الآن")

**النتيجة المتوقعة / Expected Result:**

✅ يظهر Modal (نافذة منبثقة) بتفاصيل العرض:
- العنوان: "تفاصيل الرحلة"
- من → إلى
- وقت المغادرة (بالأرقام الإنجليزية)
- السعر (بالأرقام الإنجليزية)
- عدد المقاعد المتاحة (بالأرقام الإنجليزية)
- معلومات السائق
- حقل رسالة (اختياري)
- زر "تأكيد الحجز"
- زر "إلغاء"

✅ Modal appears with:
- Trip details (from, to, time, price)
- All numbers in English numerals
- Driver info
- Message field (optional)
- "Confirm Booking" button
- "Cancel" button

✅ الـ Modal يظهر في **منتصف الشاشة** بغض النظر عن موضع التمرير

✅ Modal appears **centered in viewport** regardless of scroll position

**ما يجب تصويره / Screenshot:**
- صورة للـ Modal مفتوح
- Screenshot of open booking modal

---

### Test 2.4: التحقق من Sticky Footer في Modal

**الخطوات / Steps:**

1. افتح Modal الحجز (من الاختبار السابق)

2. إذا كانت محتويات الـ Modal طويلة، حاول التمرير داخل الـ Modal

**النتيجة المتوقعة / Expected Result:**

✅ المحتوى الأوسط (تفاصيل العرض) قابل للتمرير
✅ Middle content is scrollable

✅ زر "تأكيد الحجز" **يبقى ظاهراً دائماً** في الأسفل (Sticky)
✅ "Confirm Booking" button **always visible** at bottom (sticky)

✅ لا حاجة للتمرير لرؤية الزر
✅ No scrolling needed to see the button

**ما يجب تصويره / Screenshot:**
- صورة للـ Modal مع المحتوى المُمرّر وزر التأكيد ظاهر
- Modal with scrolled content and button still visible

---

## 3. Booking Tests
## 📅 اختبارات الحجوزات

### Test 3.1: إنشاء حجز جديد / Create New Booking

**الخطوات / Steps:**

1. من صفحة العروض، اضغط "احجز الآن" على عرض متاح

2. في Modal الحجز:
   - تأكد من تفاصيل العرض
   - (اختياري) اكتب رسالة للسائق: "السلام عليكم، أرجو التأكيد"

3. اضغط "تأكيد الحجز" / Click "Confirm Booking"

**النتيجة المتوقعة / Expected Result:**

✅ في Console تجد السجلات التالية بالترتيب:

```javascript
console.log('🎯 BOOKING ATTEMPT STARTED')
console.log('📦 Booking Data:', {
  offerId: '...',
  seats: 1,
  message: '...',
  offerRoute: 'بغداد → كربلاء'
})
console.log('📤 Sending POST request to /api/bookings...')
console.log('✅ Response received in XXXms')
console.log('📥 Response Data:', { success: true, booking: {...} })
console.log('✅ Booking confirmed as successful by backend')
console.log('📝 Booking ID:', '...')
```

✅ رسالة نجاح تظهر: "✅ تم إرسال طلب الحجز بنجاح!"

✅ Success message: "Booking request sent successfully!"

✅ توجيه تلقائي لصفحة "حجوزاتي" بعد 1.5 ثانية

✅ Automatically redirected to "My Bookings" after 1.5s

✅ الحجز يظهر في قائمة "حجوزاتي" بحالة: "pending" (قيد الانتظار)

✅ Booking appears in "My Bookings" with status: "pending"

**⚠️ ما يجب التأكد منه / CRITICAL Verification:**

**يجب أن ترى response.success = true في Console**
**You MUST see response.success = true in console**

إذا رأيت success message لكن **لا يوجد حجز** في قاعدة البيانات، هذا خطأ خطير (Fake Success Bug)

If you see success message but **no booking in database**, this is the Fake Success Bug

**ما يجب تصويره / Screenshot:**
1. صورة لـ Console logs الكاملة
2. صورة لرسالة النجاح
3. صورة لصفحة "حجوزاتي" تظهر الحجز الجديد

**التحقق من البيانات / Database Verification:**

```bash
node -e "require('dotenv').config(); const {query} = require('./server/config/db'); query('SELECT id, offer_id, passenger_id, status, seats, created_at FROM bookings ORDER BY created_at DESC LIMIT 5').then(r => {console.log('📊 Recent Bookings:'); r.rows.forEach((b,i) => console.log(\`\${i+1}. ID: \${b.id} | Status: \${b.status} | Seats: \${b.seats}\`))});"
```

**النتيجة المتوقعة / Expected Output:**
```
📊 Recent Bookings:
1. ID: uuid... | Status: pending | Seats: 1
```

---

### Test 3.2: محاولة حجز مع عدم توفر مقاعد / Booking with No Available Seats

**الخطوات / Steps:**

1. ابحث عن عرض يظهر "0 مقاعد متاحة"
   - أو احجز جميع المقاعد المتاحة لعرض ما

2. حاول الحجز من نفس العرض

**النتيجة المتوقعة / Expected Result:**

✅ رسالة خطأ تظهر: "لا توجد مقاعد متاحة" أو "Only 0 seat(s) available"

✅ Error message: "No seats available"

✅ في Console:
```javascript
console.log('❌ BOOKING FAILED WITH EXCEPTION')
console.log('❌ Error Message:', 'Only 0 seat(s) available')
```

✅ **لا تظهر رسالة نجاح**
✅ **No success message shown**

✅ لا يتم إنشاء حجز في قاعدة البيانات
✅ No booking created in database

**ما يجب تصويره / Screenshot:**
- صورة لرسالة الخطأ
- Error message screenshot

---

### Test 3.3: التحقق من تحديث المقاعد المتاحة / Verify Available Seats Update

**الخطوات / Steps:**

1. افتح صفحة العروض وابحث عن عرض يظهر "4 مقاعد متاحة"

2. احجز مقعد واحد من هذا العرض

3. ارجع لصفحة العروض وابحث عن نفس العرض

**النتيجة المتوقعة / Expected Result:**

✅ العرض الآن يظهر "3 مقاعد متاحة" (وليس 4)

✅ Offer now shows "3 seats available" (not 4)

✅ في Console (عند تحميل العروض):
```javascript
console.log('📦 Offer ID:', '...')
console.log('🪑 Available Seats:', 3)
console.log('🪑 Total Seats:', 4)
```

**ما يجب تصويره / Screenshot:**
- صورة للعرض قبل الحجز (4 مقاعد)
- صورة للعرض بعد الحجز (3 مقاعد)

---

## 4. My Bookings Tests
## 📋 اختبارات حجوزاتي

### Test 4.1: عرض جميع حجوزاتي / View All My Bookings

**الخطوات / Steps:**

1. من القائمة الرئيسية، اضغط "حجوزاتي" أو "My Bookings"

2. أو اذهب إلى: `/bookings`

**النتيجة المتوقعة / Expected Result:**

✅ تظهر قائمة بجميع حجوزاتك

✅ كل حجز يحتوي على:
- من → إلى
- وقت المغادرة (أرقام إنجليزية)
- السعر (أرقام إنجليزية)
- اسم السائق
- حالة الحجز:
  - 🟡 pending (قيد الانتظار)
  - 🟢 accepted (مقبول)
  - 🔴 cancelled (ملغي)
- تاريخ الإنشاء
- أزرار الإجراءات (حسب الحالة)

✅ My bookings list shows:
- Trip details (from/to, time, price)
- All numbers in English numerals
- Driver name
- Booking status badge
- Action buttons

✅ في Console:
```javascript
console.log('📦 Loaded X bookings')
console.log('🔢 All numbers in English (0-9)')
```

**ما يجب تصويره / Screenshot:**
- صورة لقائمة حجوزاتي
- My bookings list screenshot

---

### Test 4.2: عرض تفاصيل حجز واحد / View Single Booking Details

**الخطوات / Steps:**

1. من قائمة "حجوزاتي"، اضغط على أي حجز

**النتيجة المتوقعة / Expected Result:**

✅ تظهر صفحة أو Modal بتفاصيل الحجز:
- معلومات الرحلة الكاملة
- معلومات السائق
- حالة الحجز
- الرسالة المرسلة (إن وجدت)
- تاريخ الإنشاء
- تاريخ آخر تحديث

✅ Booking details page shows:
- Full trip information
- Driver details
- Booking status
- Message (if any)
- Created/Updated timestamps

**ما يجب تصويره / Screenshot:**
- صورة لصفحة تفاصيل الحجز
- Booking details page screenshot

---

### Test 4.3: إلغاء حجز / Cancel Booking

**الخطوات / Steps:**

1. من قائمة "حجوزاتي"، ابحث عن حجز بحالة "pending"

2. اضغط "إلغاء الحجز" أو "Cancel"

3. أكّد الإلغاء

**النتيجة المتوقعة / Expected Result:**

✅ رسالة تأكيد: "هل أنت متأكد من إلغاء الحجز؟"

✅ Confirmation dialog: "Are you sure you want to cancel?"

✅ بعد التأكيد، رسالة نجاح: "تم إلغاء الحجز بنجاح"

✅ Success: "Booking cancelled successfully"

✅ حالة الحجز تتغير إلى "cancelled"

✅ Booking status changes to "cancelled"

✅ في Console:
```javascript
console.log('✅ Booking cancelled')
console.log('📝 Booking ID:', '...')
console.log('📝 New Status:', 'cancelled')
```

**ما يجب تصويره / Screenshot:**
1. صورة لمربع التأكيد
2. صورة لرسالة النجاح
3. صورة للحجز بحالة "cancelled"

**التحقق من البيانات / Database Verification:**

```bash
node -e "require('dotenv').config(); const {query} = require('./server/config/db'); query('SELECT id, status, updated_at FROM bookings WHERE id = \\'YOUR_BOOKING_ID\\'').then(r => console.log(r.rows[0]));"
```

**النتيجة المتوقعة / Expected:**
```javascript
{
  id: 'uuid...',
  status: 'cancelled',
  updated_at: '2025-11-25T...'
}
```

---

### Test 4.4: فلترة الحجوزات حسب الحالة / Filter Bookings by Status

**الخطوات / Steps:**

1. في صفحة "حجوزاتي"، ابحث عن خيارات الفلترة

2. اختر فلتر "pending" (قيد الانتظار)

**النتيجة المتوقعة / Expected Result:**

✅ تظهر فقط الحجوزات بحالة "pending"

✅ Only "pending" bookings appear

✅ في Console:
```javascript
console.log('🔍 Filter applied: pending')
console.log('📦 Filtered results:', X)
```

**ما يجب تصويره / Screenshot:**
- صورة للنتائج المفلترة
- Filtered bookings screenshot

---

## 5. Messaging Tests
## 💬 اختبارات المراسلة

### Test 5.1: فتح محادثة مع سائق / Open Chat with Driver

**الخطوات / Steps:**

1. من قائمة "حجوزاتي"، اختر حجز بحالة "accepted"

2. اضغط "المحادثة" أو "Chat" أو أيقونة الرسائل

**النتيجة المتوقعة / Expected Result:**

✅ تفتح نافذة المحادثة

✅ Chat window opens

✅ تظهر رأسية (header) بها:
- اسم السائق
- معلومات الرحلة (من → إلى)

✅ Header shows:
- Driver name
- Trip info

✅ منطقة الرسائل فارغة أو تحتوي على رسائل سابقة

✅ Message area shows previous messages (if any)

✅ في الأسفل: حقل إدخال النص وزر "إرسال"

✅ At bottom: text input and "Send" button

**ما يجب تصويره / Screenshot:**
- صورة لنافذة المحادثة المفتوحة
- Open chat window screenshot

---

### Test 5.2: إرسال رسالة / Send Message

**الخطوات / Steps:**

1. في نافذة المحادثة، اكتب رسالة:
   ```
   السلام عليكم، متى سنلتقي؟
   ```

2. اضغط "إرسال" أو اضغط Enter

**النتيجة المتوقعة / Expected Result:**

✅ الرسالة تظهر فوراً في المحادثة

✅ Message appears immediately in chat

✅ الرسالة محاذاة لليمين (رسالتك)

✅ Message aligned to right (your message)

✅ يظهر وقت الإرسال (بالأرقام الإنجليزية)

✅ Timestamp shown (English numerals)

✅ في Console:
```javascript
console.log('📤 Sending message:', '...')
console.log('✅ Message sent successfully')
console.log('📝 Message ID:', '...')
```

**ما يجب تصويره / Screenshot:**
- صورة للرسالة المُرسلة في المحادثة
- Sent message in chat screenshot

---

### Test 5.3: استقبال رسالة (Real-time) / Receive Message

**⚠️ ملاحظة:** هذا الاختبار يتطلب مستخدم سائق آخر أو استخدام Postman لمحاكاة رسالة واردة.

**الخطوات / Steps:**

1. افتح نافذة المحادثة

2. استخدم Postman أو حساب سائق لإرسال رسالة إليك

**Postman Request:**
```
POST https://toosila-backend-production.up.railway.app/api/messages
Headers:
  Authorization: Bearer [DRIVER_TOKEN]
  Content-Type: application/json
Body:
{
  "rideType": "offer",
  "rideId": "YOUR_OFFER_ID",
  "content": "تمام، أراك في الموعد المحدد"
}
```

**النتيجة المتوقعة / Expected Result:**

✅ الرسالة تظهر **تلقائياً** في المحادثة بدون تحديث الصفحة

✅ Message appears **automatically** without page refresh

✅ الرسالة محاذاة لليسار (رسالة السائق)

✅ Message aligned to left (driver's message)

✅ يظهر اسم السائق فوق الرسالة

✅ Driver name shown above message

✅ في Console:
```javascript
console.log('📥 New message received (Socket.IO)')
console.log('💬 From:', 'Driver Name')
console.log('📝 Content:', '...')
```

**ما يجب تصويره / Screenshot:**
- صورة للرسالة الواردة في المحادثة
- Received message screenshot

---

### Test 5.4: عدد الرسائل غير المقروءة / Unread Messages Count

**الخطوات / Steps:**

1. سجّل خروجك

2. أرسل رسالة إليك من حساب سائق (عبر Postman أو حساب آخر)

3. سجّل دخولك مرة أخرى

4. لاحظ أيقونة الرسائل في الشريط العلوي

**النتيجة المتوقعة / Expected Result:**

✅ يظهر badge (شارة) بعدد الرسائل غير المقروءة

✅ Badge shows unread message count

✅ الرقم يظهر بالأرقام الإنجليزية (مثل: 1, 2, 3)

✅ Number shown in English numerals

✅ في Console:
```javascript
console.log('📬 Unread messages:', X)
```

**ما يجب تصويره / Screenshot:**
- صورة لأيقونة الرسائل مع badge العدد
- Messages icon with unread badge

---

## 6. Demands Tests
## 📢 اختبارات الطلبات

### Test 6.1: إنشاء طلب جديد / Create New Demand

**الخطوات / Steps:**

1. من القائمة الرئيسية، اضغط "أنشئ طلب" أو "Post Demand"

2. املأ النموذج:
   ```
   من: بغداد
   إلى: البصرة
   تاريخ المغادرة: [اختر تاريخ في المستقبل]
   الوقت: 10:00
   عدد المقاعد: 2
   السعر المقترح: 25000
   ملاحظات: أفضل سيارة مريحة
   ```

3. اضغط "نشر الطلب" / Click "Post Demand"

**النتيجة المتوقعة / Expected Result:**

✅ رسالة نجاح: "تم نشر طلبك بنجاح"

✅ Success: "Demand posted successfully"

✅ توجيه لصفحة "طلباتي" أو "My Demands"

✅ Redirected to "My Demands" page

✅ الطلب الجديد يظهر في القائمة

✅ New demand appears in list

✅ في Console:
```javascript
console.log('✅ Demand created')
console.log('📝 Demand ID:', '...')
console.log('📍 Route:', 'بغداد → البصرة')
```

**ما يجب تصويره / Screenshot:**
1. صورة لنموذج إنشاء الطلب
2. صورة لرسالة النجاح
3. صورة للطلب في قائمة "طلباتي"

**التحقق من البيانات / Database Verification:**

```bash
node -e "require('dotenv').config(); const {query} = require('./server/config/db'); query('SELECT id, from_city, to_city, seats, price, created_at FROM demands ORDER BY created_at DESC LIMIT 3').then(r => {console.log('📊 Recent Demands:'); r.rows.forEach((d,i) => console.log(\`\${i+1}. \${d.from_city} → \${d.to_city} | Seats: \${d.seats} | Price: \${d.price}\`))});"
```

---

### Test 6.2: عرض جميع طلباتي / View My Demands

**الخطوات / Steps:**

1. اذهب إلى "طلباتي" / Go to "My Demands"

**النتيجة المتوقعة / Expected Result:**

✅ تظهر قائمة بجميع طلباتك

✅ My demands list appears

✅ كل طلب يحتوي على:
- من → إلى
- التاريخ والوقت (بالأرقام الإنجليزية)
- عدد المقاعد (بالأرقام الإنجليزية)
- السعر (بالأرقام الإنجليزية)
- عدد الردود من السائقين
- أزرار: "عرض الردود"، "تعديل"، "حذف"

✅ Each demand shows:
- Route, date/time (English numerals)
- Seats, price (English numerals)
- Response count from drivers
- Action buttons

**ما يجب تصويره / Screenshot:**
- صورة لقائمة طلباتي
- My demands list screenshot

---

### Test 6.3: عرض ردود السائقين على طلب / View Driver Responses

**الخطوات / Steps:**

1. من قائمة "طلباتي"، اضغط "عرض الردود" على أحد الطلبات

**النتيجة المتوقعة / Expected Result:**

✅ تظهر قائمة بردود السائقين (إن وجدت)

✅ Driver responses list appears (if any)

✅ كل رد يحتوي على:
- اسم السائق
- تقييم السائق
- السعر المقترح (بالأرقام الإنجليزية)
- رسالة السائق
- تاريخ الرد
- زر "قبول العرض"

✅ Each response shows:
- Driver name and rating
- Proposed price (English numerals)
- Driver message
- Response date
- "Accept Offer" button

✅ إذا لم يكن هناك ردود:
```
لا توجد ردود حتى الآن
No responses yet
```

**ما يجب تصويره / Screenshot:**
- صورة لقائمة ردود السائقين
- Driver responses list screenshot

---

### Test 6.4: تعديل طلب / Edit Demand

**الخطوات / Steps:**

1. من قائمة "طلباتي"، اضغط "تعديل" على أحد الطلبات

2. غيّر السعر إلى: 30000

3. اضغط "حفظ التعديلات" / Click "Save Changes"

**النتيجة المتوقعة / Expected Result:**

✅ رسالة نجاح: "تم تحديث طلبك بنجاح"

✅ Success: "Demand updated successfully"

✅ السعر الجديد يظهر في القائمة (30000 بالأرقام الإنجليزية)

✅ New price shows in list (30000 in English numerals)

**ما يجب تصويره / Screenshot:**
1. صورة لنموذج التعديل
2. صورة للطلب المُحدّث

---

### Test 6.5: حذف طلب / Delete Demand

**الخطوات / Steps:**

1. من قائمة "طلباتي"، اضغط "حذف" على أحد الطلبات

2. أكّد الحذف

**النتيجة المتوقعة / Expected Result:**

✅ رسالة تأكيد: "هل أنت متأكد من حذف هذا الطلب؟"

✅ Confirmation: "Are you sure you want to delete?"

✅ بعد التأكيد، رسالة نجاح: "تم حذف الطلب بنجاح"

✅ Success: "Demand deleted successfully"

✅ الطلب يختفي من القائمة

✅ Demand removed from list

**ما يجب تصويره / Screenshot:**
1. صورة لمربع التأكيد
2. صورة لرسالة النجاح

---

## 7. Ratings Tests
## ⭐ اختبارات التقييمات

### Test 7.1: تقييم سائق بعد رحلة / Rate Driver After Trip

**⚠️ المتطلبات / Requirements:**
- يجب أن يكون لديك حجز بحالة "accepted" أو "completed"

**الخطوات / Steps:**

1. من قائمة "حجوزاتي"، ابحث عن حجز منتهي أو مقبول

2. اضغط "تقييم السائق" أو "Rate Driver"

3. في نافذة التقييم:
   - اختر عدد النجوم: 5 ⭐⭐⭐⭐⭐
   - اكتب تعليق: "سائق ممتاز، رحلة مريحة جداً"

4. اضغط "إرسال التقييم" / Click "Submit Rating"

**النتيجة المتوقعة / Expected Result:**

✅ رسالة نجاح: "شكراً لك! تم إرسال تقييمك بنجاح"

✅ Success: "Thank you! Rating submitted successfully"

✅ نافذة التقييم تغلق

✅ Rating modal closes

✅ لا يمكنك تقييم نفس الحجز مرة أخرى

✅ Cannot rate same booking again

✅ في Console:
```javascript
console.log('✅ Rating submitted')
console.log('⭐ Stars:', 5)
console.log('💬 Comment:', '...')
console.log('👤 Rated Driver ID:', '...')
```

**ما يجب تصويره / Screenshot:**
1. صورة لنافذة التقييم
2. صورة لرسالة النجاح

**التحقق من البيانات / Database Verification:**

```bash
node -e "require('dotenv').config(); const {query} = require('./server/config/db'); query('SELECT id, rating, comment, created_at FROM ratings ORDER BY created_at DESC LIMIT 3').then(r => {console.log('⭐ Recent Ratings:'); r.rows.forEach((rt,i) => console.log(\`\${i+1}. Rating: \${rt.rating}/5 | Comment: \${rt.comment}\`))});"
```

---

### Test 7.2: عرض تقييمات سائق / View Driver Ratings

**الخطوات / Steps:**

1. من صفحة العروض، اضغط على اسم أي سائق

2. أو اضغط "عرض التقييمات" بجانب اسم السائق

**النتيجة المتوقعة / Expected Result:**

✅ تظهر صفحة أو Modal بتقييمات السائق:

✅ Driver ratings page shows:

- **المعدل العام:** 4.5/5 ⭐ (بالأرقام الإنجليزية)
- **Average Rating:** 4.5/5 ⭐ (English numerals)

- **عدد التقييمات:** 12 (بالأرقام الإنجليزية)
- **Total Ratings:** 12 (English numerals)

- **قائمة بالتعليقات:**
  - اسم الراكب
  - عدد النجوم
  - التعليق
  - التاريخ

**ما يجب تصويره / Screenshot:**
- صورة لصفحة تقييمات السائق
- Driver ratings page screenshot

---

### Test 7.3: محاولة تقييم مرة أخرى / Attempt Duplicate Rating

**الخطوات / Steps:**

1. حاول تقييم نفس الحجز الذي قيّمته سابقاً

**النتيجة المتوقعة / Expected Result:**

✅ إما:
- زر "تقييم السائق" غير ظاهر
- أو رسالة: "لقد قمت بتقييم هذه الرحلة بالفعل"

✅ Either:
- "Rate Driver" button not visible
- Or message: "You have already rated this trip"

✅ في Console:
```javascript
console.log('⚠️ Duplicate rating prevented')
```

**ما يجب تصويره / Screenshot:**
- صورة للرسالة أو الحجز بدون زر التقييم
- Screenshot of message or booking without rating button

---

## 8. Error Handling Tests
## ⚠️ اختبارات معالجة الأخطاء

### Test 8.1: تسجيل دخول ببيانات خاطئة / Login with Wrong Credentials

**الخطوات / Steps:**

1. سجّل خروجك إن كنت مسجل دخول

2. حاول تسجيل الدخول بـ:
   ```
   Email: wrong@email.com
   Password: wrongpassword
   ```

**النتيجة المتوقعة / Expected Result:**

✅ رسالة خطأ: "بيانات الدخول غير صحيحة" أو "Invalid credentials"

✅ Error: "Invalid credentials"

✅ لا يتم توجيهك للوحة التحكم

✅ Not redirected to dashboard

✅ في Console:
```javascript
console.log('❌ Login failed')
console.log('❌ Error:', 'Invalid credentials')
```

**ما يجب تصويره / Screenshot:**
- صورة لرسالة الخطأ
- Error message screenshot

---

### Test 8.2: محاولة الوصول لصفحة محمية بدون تسجيل دخول / Access Protected Page Without Login

**الخطوات / Steps:**

1. سجّل خروجك

2. حاول الوصول مباشرة إلى: `/bookings`

**النتيجة المتوقعة / Expected Result:**

✅ توجيهك تلقائياً لصفحة تسجيل الدخول

✅ Auto-redirected to login page

✅ رسالة: "يرجى تسجيل الدخول أولاً" أو "Please login first"

✅ Message: "Please login first"

**ما يجب تصويره / Screenshot:**
- صورة لصفحة تسجيل الدخول مع الرسالة
- Login page with message screenshot

---

### Test 8.3: إدخال بيانات غير صحيحة في نموذج الحجز / Invalid Booking Data

**الخطوات / Steps:**

1. حاول إنشاء حجز بدون اختيار عرض (إن أمكن)

2. أو حاول حجز 0 مقاعد

**النتيجة المتوقعة / Expected Result:**

✅ رسالة خطأ: "يرجى اختيار عرض" أو "seats must be between 1 and 7"

✅ Error: "Invalid data" or "seats must be between 1 and 7"

✅ في Console:
```javascript
console.log('❌ Validation failed')
console.log('❌ Error:', '...')
```

**ما يجب تصويره / Screenshot:**
- صورة لرسالة الخطأ
- Validation error screenshot

---

### Test 8.4: فقدان الاتصال بالإنترنت / Network Connection Lost

**الخطوات / Steps:**

1. افتح أدوات المطور (F12)

2. اذهب إلى تبويب "Network"

3. فعّل "Offline" mode

4. حاول تحميل صفحة العروض أو إنشاء حجز

**النتيجة المتوقعة / Expected Result:**

✅ رسالة خطأ: "خطأ في الاتصال بالشبكة" أو "Network connection error"

✅ Error: "Network connection error. Please check your internet connection"

✅ في Console:
```javascript
console.log('❌ Network error:', 'fetch failed')
```

**ما يجب تصويره / Screenshot:**
- صورة لرسالة الخطأ مع Network tab showing "Offline"
- Error message with offline indicator

---

### Test 8.5: انتهاء صلاحية الجلسة / Session Expiration

**⚠️ ملاحظة:** هذا الاختبار يتطلب انتظار انتهاء صلاحية الـ Token (عادة 7 أيام) أو تعديل يدوي للـ Token في localStorage.

**الخطوات / Steps:**

1. سجّل دخولك

2. في Console المتصفح، نفّذ:
```javascript
localStorage.setItem('token', 'invalid_expired_token_12345');
```

3. حاول الوصول لصفحة محمية مثل `/bookings`

**النتيجة المتوقعة / Expected Result:**

✅ يتم توجيهك تلقائياً لصفحة تسجيل الدخول

✅ Auto-redirected to login page

✅ رسالة: "جلستك انتهت. يرجى تسجيل الدخول مرة أخرى" أو "Session expired. Please login again"

✅ Message: "Session expired. Please login again."

✅ localStorage تم مسحه تلقائياً:
```javascript
console.log(localStorage.getItem('token')); // null
console.log(localStorage.getItem('currentUser')); // null
```

**ما يجب تصويره / Screenshot:**
- صورة لصفحة تسجيل الدخول مع رسالة انتهاء الجلسة
- Login page with session expired message

---

## 9. Test Summary
## 📊 خلاصة النتائج

بعد إكمال جميع الاختبارات، املأ هذا الجدول:

After completing all tests, fill this table:

| Test Category | Total Tests | Passed ✅ | Failed ❌ | Notes |
|---------------|-------------|-----------|-----------|-------|
| Authentication | 4 | | | |
| Search & Browse | 4 | | | |
| Bookings | 3 | | | |
| My Bookings | 4 | | | |
| Messaging | 4 | | | |
| Demands | 5 | | | |
| Ratings | 3 | | | |
| Error Handling | 5 | | | |
| **TOTAL** | **32** | | | |

---

## ✅ Critical Checks Checklist
## قائمة التحققات الحرجة

تأكد من هذه النقاط الحرجة:

- [ ] **جميع الأرقام بالتنسيق الإنجليزي (0-9) وليس العربي (٠-٩)**
  - All numbers displayed in English format (0-9) not Arabic (٠-٩)

- [ ] **زر "تأكيد الحجز" يبقى ظاهراً في أسفل Modal (Sticky Footer)**
  - "Confirm Booking" button always visible at bottom (Sticky Footer)

- [ ] **Modal يظهر في منتصف الشاشة بغض النظر عن موضع التمرير**
  - Modal appears centered in viewport regardless of scroll position

- [ ] **عند نجاح الحجز، يجب أن ترى `response.success = true` في Console**
  - On booking success, you MUST see `response.success = true` in console

- [ ] **لا تظهر رسالة نجاح إلا عندما يكون الحجز قد تم فعلاً**
  - Success message ONLY appears when booking actually succeeded

- [ ] **عدد المقاعد المتاحة يتناقص بعد كل حجز**
  - Available seats decrease after each booking

- [ ] **لا يمكن الحجز عندما لا توجد مقاعد متاحة**
  - Cannot book when no seats available

- [ ] **الرسائل تصل في الوقت الفعلي (Real-time) بدون تحديث الصفحة**
  - Messages arrive in real-time without page refresh

- [ ] **لا توجد أخطاء JavaScript في Console أثناء الاستخدام العادي**
  - No JavaScript errors in console during normal usage

- [ ] **جميع الصور والأيقونات تعمل بشكل صحيح**
  - All images and icons load correctly

---

## 🐛 Reporting Issues
## الإبلاغ عن المشاكل

إذا وجدت أي مشكلة، سجّلها بهذا التنسيق:

If you find any issues, report them in this format:

```markdown
### Bug Report

**Test Number:** [e.g., Test 3.1]

**Test Name:** [e.g., Create New Booking]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Console Errors:**
```
[Paste console errors here]
```

**Screenshots:**
[Attach screenshots]

**Browser:** [e.g., Chrome 120, Firefox 121]

**OS:** [e.g., Windows 11, macOS 14]

**Severity:**
- [ ] Critical (blocks user from completing task)
- [ ] High (major issue but workaround exists)
- [ ] Medium (minor issue, doesn't block workflow)
- [ ] Low (cosmetic issue)
```

---

## 📝 Additional Notes
## ملاحظات إضافية

- **لغة الواجهة:** تأكد أن التطبيق يدعم اللغة العربية بشكل صحيح
  - **Language:** Ensure app supports Arabic properly

- **الاستجابة:** اختبر على أحجام شاشات مختلفة (هاتف، تابلت، سطح مكتب)
  - **Responsiveness:** Test on different screen sizes (mobile, tablet, desktop)

- **السرعة:** لاحظ إذا كانت هناك تأخيرات في التحميل
  - **Performance:** Note any loading delays

- **الأمان:** لا تشارك Tokens أو بيانات حساسة
  - **Security:** Don't share tokens or sensitive data

---

## ✨ Conclusion
## الخلاصة

هذا الدليل يغطي جميع السيناريوهات الأساسية لاختبار تطبيق Toosila من منظور الراكب.

This guide covers all essential scenarios for testing Toosila app from passenger perspective.

**نتمنى لك اختباراً موفقاً!**
**Happy Testing!**

---

**آخر تحديث / Last Updated:** November 25, 2025
**الإصدار / Version:** 1.0
**تم الإنشاء بواسطة / Generated with:** Claude Code 🤖
