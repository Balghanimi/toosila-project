# 🚀 دليل النشر النهائي على Railway - مشروع توصيلة

## ✅ تم إصلاح جميع المشاكل

تم حل المشاكل التالية بنجاح:

1. ✅ **تم توليد `client/package-lock.json`** - يحتوي على TypeScript 4.9.5 الصحيح
2. ✅ **تم توليد `server/package-lock.json`** - جميع التبعيات محدثة
3. ✅ **تم تحديث Dockerfile** - ينسخ package-lock.json بشكل صريح
4. ✅ **Express يخدم React** - بدون الحاجة لـ serve منفصل
5. ✅ **حُذف start.sh** - CMD مباشر: `["node", "server/server.js"]`
6. ✅ **تكوين Railway صحيح** - فقط railway.json بدون nixpacks.toml

---

## 📋 الأوامر الطرفية للنشر

### الخطوة 1️⃣: التحقق من التغييرات
```bash
git status
```

**يجب أن ترى:**
- `modified: Dockerfile`
- `modified: package.json`
- `modified: client/package-lock.json` (أو new file)
- `modified: server/package-lock.json` (أو new file)

---

### الخطوة 2️⃣: إضافة جميع الملفات
```bash
git add Dockerfile
git add package.json
git add client/package-lock.json
git add server/package-lock.json
git add railway.json
git add -u
```

---

### الخطوة 3️⃣: عمل Commit
```bash
git commit -m "fix: حل مشاكل البناء على Railway

- توليد client/package-lock.json مع TypeScript 4.9.5
- توليد server/package-lock.json مع جميع التبعيات
- تحديث Dockerfile لنسخ package-lock.json صراحةً
- استخدام npm ci في جميع المراحل
- Express يخدم React مباشرة في الإنتاج
- حذف start.sh واستخدام CMD مباشر
- إزالة npm workspaces لتبسيط البناء

يحل المشكلة: npm ci لا يجد package-lock.json"
```

---

### الخطوة 4️⃣: النشر على Railway
```bash
git push
```

---

## 🔍 مراقبة عملية البناء على Railway

بعد تنفيذ `git push`، افتح Railway Dashboard:

### **مراحل البناء المتوقعة:**

#### 1. المرحلة الأولى: بناء Frontend
```
[1/4] FROM docker.io/library/node:22-alpine
[2/4] WORKDIR /app/client
[3/4] COPY client/package.json client/package-lock.json ./
[4/4] RUN npm ci
✅ نجح: npm ci وجد package-lock.json
[5/4] COPY client/ ./
[6/4] RUN npm run build
✅ نجح: تم بناء React
```

#### 2. المرحلة الثانية: تبعيات Backend
```
[1/4] WORKDIR /app/server
[2/4] COPY server/package.json server/package-lock.json ./
[3/4] RUN npm ci --only=production
✅ نجح: تم تثبيت تبعيات الإنتاج فقط
```

#### 3. المرحلة الثالثة: Production
```
[1/5] FROM node:22-alpine AS production
[2/5] RUN apk add --no-cache wget
[3/5] COPY --from=backend-deps /app/server/node_modules
[4/5] COPY server/ ./server/
[5/5] COPY --from=frontend-builder /app/client/build ./build
✅ نجح: تم نسخ جميع الملفات
```

#### 4. بدء التطبيق
```
CMD ["node", "server/server.js"]
🚀 Server running on port 3000
📱 Frontend URL: https://toosila.railway.app
🌍 Environment: production
✅ Connected to PostgreSQL database
```

---

## 🧪 التحقق من نجاح النشر

### 1. فحص الصحة (Health Check)
```bash
curl https://toosila.railway.app/api/health
```

**النتيجة المتوقعة:**
```json
{
  "ok": true,
  "timestamp": "2025-10-11T...",
  "environment": "production",
  "version": "1.0.0",
  "memory": {
    "heapUsed": "45 MB",
    "heapTotal": "67 MB",
    "rss": "123 MB"
  },
  "uptime": "23 seconds"
}
```

### 2. اختبار الواجهة الأمامية
افتح في المتصفح:
```
https://toosila.railway.app
```
**يجب أن ترى:** صفحة React الرئيسية

### 3. اختبار التوجيه من جانب العميل (Client-Side Routing)
```
https://toosila.railway.app/profile
https://toosila.railway.app/offers
https://toosila.railway.app/demands
```
**يجب أن تعمل جميعها** بدون 404

### 4. اختبار API
```bash
curl https://toosila.railway.app/api/offers
```
**يجب أن ترجع:** بيانات JSON (أو 401 إذا كانت تحتاج مصادقة)

---

## ⚙️ متغيرات البيئة المطلوبة على Railway

تأكد من تعيين هذه المتغيرات في Railway Dashboard → Variables:

### **متغيرات إلزامية:**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/database
JWT_SECRET=your-super-secret-key-here-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-here
CORS_ORIGIN=https://toosila.railway.app
FRONTEND_URL=https://toosila.railway.app
```

### **متغيرات اختيارية (لها قيم افتراضية):**
```bash
PORT=3000  # Railway يستبدله تلقائياً
DB_SSL=true
LOG_LEVEL=info
```

---

## 📊 مقاييس النجاح

| المقياس | المتوقع | كيفية التحقق |
|---------|---------|--------------|
| وقت البناء | 3-5 دقائق | سجلات Railway |
| حجم الصورة | ~400 MB | Build logs → Image size |
| بدء التطبيق | < 10 ثوانٍ | Deployment logs |
| استهلاك الذاكرة | < 300 MB | /api/health endpoint |
| الصحة | 200 OK | curl /api/health |
| الواجهة | تحميل صحيح | فتح الرابط في المتصفح |
| التوجيه | لا يوجد 404 | اختبار /profile، /offers |

---

## 🐛 استكشاف الأخطاء

### المشكلة: البناء يفشل عند `npm ci`

**السبب:** package-lock.json غير موجود أو غير محدث

**الحل:**
```bash
# احذف الملفات القديمة
rm -rf node_modules client/node_modules server/node_modules
rm -f package-lock.json client/package-lock.json server/package-lock.json

# أعد التوليد
cd client && npm install
cd ../server && npm install

# أضف للـ git
git add client/package-lock.json server/package-lock.json
git commit -m "fix: regenerate lockfiles"
git push
```

---

### المشكلة: التطبيق يفشل عند البدء

**تحقق من السجلات في Railway:**
```
Railway Dashboard → Deployments → View Logs
```

**أخطاء شائعة:**

1. **`Cannot find module 'dotenv'`**
   - **السبب:** dependencies مفقودة
   - **الحل:** تأكد من وجود server/package-lock.json

2. **`ECONNREFUSED` للـ Database**
   - **السبب:** DATABASE_URL غير صحيح
   - **الحل:** تحقق من Variables في Railway

3. **`Missing required environment variables`**
   - **السبب:** متغيرات البيئة غير معينة
   - **الحل:** أضف JWT_SECRET، CORS_ORIGIN، إلخ

---

### المشكلة: الواجهة الأمامية لا تظهر

**تحقق من:**
1. Express يخدم الملفات الثابتة:
   ```javascript
   // في server/app.js
   app.use(express.static(path.join(__dirname, '../build')));
   ```

2. NODE_ENV معين كـ production:
   ```bash
   # في Railway Variables
   NODE_ENV=production
   ```

3. ملف build موجود:
   ```dockerfile
   # في Dockerfile
   COPY --from=frontend-builder /app/client/build ./build
   ```

---

### المشكلة: توجيه React لا يعمل (404 على /profile)

**تحقق من:**
```javascript
// في server/app.js - يجب أن يكون بعد جميع routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});
```

**⚠️ مهم:** هذا الكود يجب أن يكون:
- ✅ **بعد** جميع API routes (`/api/*`)
- ✅ **داخل** الشرط `if (config.NODE_ENV === 'production')`
- ✅ **قبل** error handlers

---

## 🎯 بنية Dockerfile النهائية

```dockerfile
# المرحلة 1: بناء Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./  # ← نسخ صريح
RUN npm ci  # ← يستخدم lockfile
COPY client/ ./
RUN npm run build

# المرحلة 2: تبعيات Backend
FROM node:22-alpine AS backend-deps
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./  # ← نسخ صريح
RUN npm ci --only=production  # ← إنتاج فقط

# المرحلة 3: Production
FROM node:22-alpine AS production
RUN apk add --no-cache wget
WORKDIR /app
COPY --from=backend-deps /app/server/node_modules ./server/node_modules
COPY server/ ./server/
COPY --from=frontend-builder /app/client/build ./build
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK CMD wget --spider http://localhost:${PORT}/api/health
CMD ["node", "server/server.js"]  # ← مباشر بدون shell
```

---

## 🔄 خطة الرجوع (Rollback) في حالة الفشل

إذا فشل النشر:

```bash
# العودة للـ commit السابق
git log --oneline -5  # ابحث عن آخر commit ناجح
git revert HEAD       # أو
git reset --hard HEAD~1

# أعد النشر
git push --force
```

Railway سيعيد البناء تلقائياً باستخدام الكود القديم.

---

## 📁 بنية المشروع النهائية

```
toosila-project/
├── client/
│   ├── package.json
│   ├── package-lock.json      ✅ موجود
│   ├── public/
│   └── src/
├── server/
│   ├── package.json
│   ├── package-lock.json      ✅ موجود
│   ├── server.js              ✅ يستمع على PORT
│   ├── app.js                 ✅ يخدم React
│   └── ...
├── Dockerfile                 ✅ ينسخ lockfiles صراحة
├── railway.json               ✅ builder: DOCKERFILE
├── .dockerignore
└── package.json               ✅ بدون workspaces
```

---

## 🎊 النشر جاهز!

بعد تنفيذ جميع الأوامر أعلاه:

1. ✅ Railway سيبدأ البناء تلقائياً
2. ✅ سيستغرق 3-5 دقائق
3. ✅ ستحصل على رابط مثل: `https://toosila.railway.app`
4. ✅ التطبيق سيعمل بنجاح!

### 🔗 الرابط النهائي:
```
https://your-project-name.railway.app
```

**راقب السجلات وتأكد من رؤية:**
```
🚀 Server running on port 3000
✅ Connected to PostgreSQL database
```

---

## 📞 في حالة وجود مشاكل

إذا واجهت أي مشاكل، تحقق من:

1. **سجلات Railway** - كل المعلومات موجودة هناك
2. **متغيرات البيئة** - تأكد من تعيينها جميعاً
3. **package-lock.json** - تأكد من وجودهما في git
4. **الـ Commit** - تأكد من إضافة جميع الملفات المعدلة

**حظاً موفقاً! 🚀 مشروع توصيلة جاهز للانطلاق!**
