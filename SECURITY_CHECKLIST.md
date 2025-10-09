# قائمة الأمان للإنتاج - توصيلة

## ✅ قائمة التحقق من الأمان قبل النشر

### 1️⃣ متغيرات البيئة

- [ ] **JWT_SECRET**: مولّد عشوائياً (64 حرف على الأقل)
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] **DB_PASSWORD**: كلمة مرور قوية (16+ حرف، أرقام، رموز)
- [ ] **لا توجد بيانات حساسة** في الكود المرفوع على Git
- [ ] ملف `.env` مدرج في `.gitignore`

### 2️⃣ قاعدة البيانات

- [ ] مستخدم قاعدة البيانات له صلاحيات محدودة (ليس superuser)
- [ ] الاتصال بـ SSL إذا كانت قاعدة البيانات بعيدة
- [ ] نسخ احتياطي يومي مجدول
- [ ] تشفير البيانات الحساسة (كلمات المرور مُشفرة ببcrypt ✅)

### 3️⃣ الخادم (Server)

- [ ] Firewall مفعّل (UFW أو iptables)
- [ ] فقط المنافذ الضرورية مفتوحة (80, 443, 22)
- [ ] SSH بمفتاح فقط (تعطيل Password Authentication)
  ```bash
  sudo nano /etc/ssh/sshd_config
  # PasswordAuthentication no
  sudo systemctl restart sshd
  ```
- [ ] تحديثات أمان تلقائية
  ```bash
  sudo apt install unattended-upgrades
  sudo dpkg-reconfigure --priority=low unattended-upgrades
  ```

### 4️⃣ HTTPS/SSL

- [ ] SSL/TLS مفعّل (Let's Encrypt)
- [ ] إعادة توجيه HTTP → HTTPS
- [ ] HSTS Header مفعّل
- [ ] شهادة SSL صالحة ومحدثة
- [ ] TLS 1.2+ فقط (تعطيل TLS 1.0, 1.1)

### 5️⃣ Headers الأمان

تحقق من وجود هذه في `app.js`:

- [x] **Helmet.js** مُثبت ✅
- [x] **X-Content-Type-Options**: nosniff ✅
- [x] **X-Frame-Options**: SAMEORIGIN ✅
- [x] **X-XSS-Protection**: 1; mode=block ✅
- [ ] **Content-Security-Policy**: مُكوّن بشكل صحيح

### 6️⃣ CORS

- [ ] `CORS_ORIGIN` محدد بالنطاق الفعلي (ليس `*`)
- [ ] `credentials: true` فقط إذا لزم الأمر
- [ ] قائمة بيضاء للنطاقات المسموح بها

### 7️⃣ Rate Limiting

- [x] Rate Limiting مفعّل للـ API ✅
- [ ] حدود مناسبة للإنتاج:
  ```javascript
  // في rateLimiters.js
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100 // 100 طلب لكل IP
  ```
- [ ] حدود خاصة لـ Login/Register (منع Brute Force)

### 8️⃣ التحقق من المدخلات

- [x] `express-validator` مستخدم ✅
- [ ] جميع المدخلات مُنظفة (sanitized)
- [ ] حماية من SQL Injection (استخدام Parameterized Queries ✅)
- [ ] حماية من XSS (تنظيف HTML tags)
- [ ] حماية من NoSQL Injection (إذا استخدمت MongoDB)

### 9️⃣ المصادقة والترخيص

- [x] JWT مُطبق بشكل صحيح ✅
- [x] كلمات المرور مُشفرة ببcrypt ✅
- [ ] Session timeout مناسب (7 أيام حالياً)
- [ ] تسجيل خروج من جميع الأجهزة (optional)
- [ ] Two-Factor Authentication (optional, للمستقبل)

### 🔟 السجلات (Logging)

- [ ] تسجيل جميع الأخطاء
- [ ] تسجيل محاولات الدخول الفاشلة
- [ ] **عدم** تسجيل بيانات حساسة (كلمات المرور، tokens)
- [ ] دوران السجلات (log rotation)
  ```bash
  sudo nano /etc/logrotate.d/pm2
  ```

### 1️⃣1️⃣ الاعتماديات (Dependencies)

- [ ] تحديث جميع الحزم لآخر إصدار آمن
  ```bash
  npm audit
  npm audit fix
  ```
- [ ] فحص الثغرات بشكل دوري
  ```bash
  npm audit
  ```
- [ ] استخدام `npm ci` في الإنتاج بدلاً من `npm install`

### 1️⃣2️⃣ ملفات حساسة

- [ ] عدم رفع `.env` على Git ✅
- [ ] عدم رفع `node_modules` ✅
- [ ] عدم رفع ملفات النسخ الاحتياطي
- [ ] فحص Git History من بيانات حساسة
  ```bash
  git log --all --full-history -- .env
  ```

---

## 🛡️ اختبارات الأمان الموصى بها

### اختبار Headers
```bash
curl -I https://your-domain.com
# ابحث عن:
# - Strict-Transport-Security
# - X-Content-Type-Options
# - X-Frame-Options
```

### اختبار SSL
```bash
# استخدم SSL Labs
https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com
```

### اختبار CORS
```bash
curl -H "Origin: https://malicious-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://your-domain.com/api/auth/login
# يجب أن يُرفض
```

### اختبار Rate Limiting
```bash
for i in {1..150}; do
  curl https://your-domain.com/api/auth/login
done
# بعد 100 طلب يجب أن ترى 429 Too Many Requests
```

### اختبار SQL Injection
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com'\'' OR '\''1'\''='\''1","password":"anything"}'
# يجب أن يفشل
```

---

## 🚨 إجراءات الطوارئ

### في حالة اختراق محتمل:

1. **إيقاف الخادم فوراً**
   ```bash
   pm2 stop all
   sudo systemctl stop nginx
   ```

2. **تغيير جميع كلمات المرور**
   - JWT_SECRET
   - DB_PASSWORD
   - كلمات مرور المستخدمين (إجبار reset)

3. **فحص السجلات**
   ```bash
   pm2 logs --lines 1000 > security-incident.log
   sudo cat /var/log/nginx/access.log | grep "POST"
   ```

4. **استعادة من نسخة احتياطية نظيفة**

5. **إبلاغ المستخدمين**

---

## 📊 مراقبة الأمان المستمرة

### أدوات مراقبة موصى بها:

1. **Sentry.io** - تتبع الأخطاء
2. **LogRocket** - session replay
3. **Uptime Robot** - مراقبة التوفر
4. **New Relic** - مراقبة الأداء

### فحص دوري:

- [ ] أسبوعياً: `npm audit`
- [ ] شهرياً: مراجعة السجلات
- [ ] شهرياً: تحديث الاعتماديات
- [ ] ربع سنوياً: penetration testing

---

## 🔐 توصيات إضافية للمستقبل

1. **Implement 2FA** (Two-Factor Authentication)
2. **Email Verification** عند التسجيل
3. **Password Reset** عبر Email
4. **Account Lockout** بعد محاولات فاشلة
5. **IP Whitelisting** للـ Admin Panel
6. **Audit Logs** لجميع العمليات الحساسة
7. **Data Encryption at Rest** لبيانات المستخدمين
8. **Regular Security Audits** بواسطة خبير

---

**آخر تحديث:** 2025-01-03
**الحالة:** جاهز للإنتاج مع تطبيق هذه الإجراءات ✅
