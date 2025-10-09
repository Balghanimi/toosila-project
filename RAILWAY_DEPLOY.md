# 🚂 دليل النشر على Railway.app - مجاني

**الوقت المطلوب:** 15-20 دقيقة
**التكلفة:** مجاني ($5 رصيد شهري مجاني)
**المتطلبات:** حساب GitHub فقط

---

## 📋 الخطوات بالتفصيل

### الخطوة 1: تجهيز المشروع على GitHub (5 دقائق)

#### 1.1 إنشاء Repository على GitHub
- افتح https://github.com/new
- اسم Repository: toosila
- اجعله Private أو Public (حسب رغبتك)
- اضغط Create Repository

#### 1.2 رفع الكود
```bash
cd c:\Users\a2z\toosila-project
git init
git add .
git commit -m "Initial commit: Toosila ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/toosila.git
git branch -M main
git push -u origin main
```

**تحقق:** افتح رابط GitHub يجب أن ترى الملفات

---

### الخطوة 2: إنشاء حساب على Railway (دقيقتان)

1. افتح: https://railway.app
2. اضغط "Start a New Project"
3. اختر "Login with GitHub"
4. اسمح لـ Railway بالوصول لحسابك

**تحقق:** يجب أن ترى Dashboard فارغ

---

### الخطوة 3: نشر Backend (5 دقائق)

#### 3.1 إنشاء مشروع جديد
1. في Railway Dashboard اضغط "+ New Project"
2. اختر "Deploy from GitHub repo"
3. اختر repository: toosila
4. اضغط "Deploy Now"

#### 3.2 إضافة PostgreSQL
1. في نفس Project اضغط "+ New"
2. اختر "Database"
3. اختر "Add PostgreSQL"
4. انتظر حتى يتم الإنشاء (30 ثانية)

#### 3.3 توليد JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
انسخ الناتج

#### 3.4 إضافة متغيرات البيئة
في Railway:
1. اختر service "toosila" (Backend)
2. اذهب إلى تبويب "Variables"
3. اضغط "+ New Variable"
4. أضف المتغيرات:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=[الصق القيمة من الخطوة 3.3]
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
FRONTEND_URL=https://toosila-frontend.up.railway.app
```

#### 3.5 ربط PostgreSQL
1. في نفس صفحة Variables
2. اضغط "+ New Variable"
3. اختر "Add Reference"
4. اختر "postgres" → "DATABASE_URL"

#### 3.6 تكوين Root Directory
1. في Settings
2. Root Directory: server
3. Start Command: npm start
4. اضغط "Deploy"

**تحقق:** انتظر 2-3 دقائق، ثم انسخ رابط Backend

---

### الخطوة 4: نشر Frontend (3 دقائق)

#### 4.1 إضافة Frontend Service
1. في نفس Project اضغط "+ New"
2. اختر "GitHub Repo"
3. اختر نفس repo: toosila

#### 4.2 تكوين Frontend
في Variables أضف:
```
REACT_APP_API_URL=https://your-backend.up.railway.app/api
NODE_ENV=production
```
استبدل your-backend.up.railway.app برابط Backend الفعلي

#### 4.3 تكوين Build Settings
1. في Settings
2. Root Directory: client
3. Build Command: npm install && npm run build
4. Start Command: npx serve -s build -l $PORT
5. اضغط "Deploy"

**تحقق:** انتظر 3-5 دقائق، ثم انسخ رابط Frontend

---

### الخطوة 5: تحديث CORS (دقيقة واحدة)

1. ارجع لـ Backend service
2. في Variables عدّل CORS_ORIGIN
3. ضع رابط Frontend الفعلي
4. اضغط "Redeploy"

---

### الخطوة 6: إعداد قاعدة البيانات (3 دقائق)

#### خيار 1: استخدام Railway Query (الأسهل)
1. في Railway Dashboard اختر postgres
2. اضغط "Query" tab
3. انسخ محتوى ملف: server/database/schema.sql
4. الصق في Query editor
5. اضغط "Run"

#### خيار 2: استخدام pgAdmin
1. في postgres اضغط "Connect"
2. انسخ بيانات الاتصال
3. افتح pgAdmin وأضف server جديد
4. نفذ schema.sql

**تحقق:** يجب أن ترى 7 جداول

---

### الخطوة 7: الاختبار النهائي

#### 7.1 اختبار Backend
افتح: https://your-backend.up.railway.app/api/health

يجب أن ترى:
```json
{
  "ok": true,
  "environment": "production"
}
```

#### 7.2 اختبار Frontend
افتح: https://your-frontend.up.railway.app

يجب أن ترى صفحة تسجيل الدخول

#### 7.3 اختبار التسجيل
1. اضغط "تسجيل حساب جديد"
2. املأ البيانات وسجل
3. يجب أن تنتقل للصفحة الرئيسية

---

## 🎉 تهانينا! تطبيقك على الإنترنت مجاناً!

---

## 📊 المراقبة والصيانة

### مراقبة الاستخدام
- في Railway Dashboard → Usage
- شاهد Hours used و Data transfer

### عرض السجلات
- اختر service → Deployments
- اضغط على آخر deployment
- شاهد Logs مباشرة

### إعادة النشر
```bash
git add .
git commit -m "Update"
git push origin main
```
Railway سينشر تلقائياً!

---

## 💰 التكاليف

### المجاني:
- $5 رصيد شهري مجاني
- 500 ساعة تشغيل
- 100 GB نقل بيانات
- كافي لـ 1000+ مستخدم شهرياً

### عند الترقية:
- $5/شهر Developer plan
- $20/شهر Team plan

---

## ❓ حل المشاكل

### Backend لا يعمل:
1. تحقق من DATABASE_URL موجود
2. تحقق من Logs
3. تأكد Root Directory = server

### Frontend يظهر CORS errors:
1. تأكد CORS_ORIGIN يطابق رابط Frontend
2. Redeploy Backend

### Database connection failed:
1. تأكد PostgreSQL موجود
2. تأكد DATABASE_URL مُضاف
3. تأكد schema.sql تم تنفيذه

---

## ✅ قائمة التحقق

- [ ] حساب Railway
- [ ] Repo على GitHub
- [ ] Backend منشور
- [ ] PostgreSQL مُضاف
- [ ] المتغيرات مُكوّنة
- [ ] Frontend منشور
- [ ] Database schema مُنفذ
- [ ] اختبار التسجيل يعمل
- [ ] شارك الرابط!

---

**🎉 مبروك! تطبيقك مجاني على الإنترنت! 🚗💨**
