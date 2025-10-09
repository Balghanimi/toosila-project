# دليل نشر تطبيق توصيلة (Toosila Deployment Guide)

## المتطلبات الأساسية

### 1. قاعدة البيانات PostgreSQL
- PostgreSQL 14+ مثبت ومُعد
- قاعدة بيانات جديدة للإنتاج
- مستخدم قاعدة بيانات بصلاحيات كاملة

### 2. Node.js و npm
- Node.js 18+ (موصى به: LTS)
- npm 9+ أو yarn

### 3. خادم (Server)
- Ubuntu 20.04+ أو CentOS 8+
- RAM: 2GB كحد أدنى (4GB موصى به)
- مساحة تخزين: 20GB
- نطاق (Domain) مع إمكانية تكوين DNS

---

## خطوات النشر

### المرحلة 1: إعداد الخادم

#### 1.1 تحديث النظام
```bash
sudo apt update && sudo apt upgrade -y
```

#### 1.2 تثبيت Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # يجب أن تكون 18.x أو أحدث
```

#### 1.3 تثبيت PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 1.4 تثبيت Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 1.5 تثبيت PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

---

### المرحلة 2: إعداد قاعدة البيانات

#### 2.1 إنشاء قاعدة البيانات
```bash
sudo -u postgres psql

# داخل PostgreSQL shell:
CREATE DATABASE toosila_production;
CREATE USER toosila_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE toosila_production TO toosila_user;
\q
```

#### 2.2 استيراد Schema
```bash
# رفع ملفات SQL من مجلد server/database/
psql -U toosila_user -d toosila_production -f schema.sql
```

---

### المرحلة 3: نشر Backend

#### 3.1 نسخ الملفات
```bash
# على جهازك المحلي:
cd /path/to/toosila-project
git init
git add .
git commit -m "Initial deployment"
git push origin main

# على الخادم:
cd /var/www
sudo git clone https://github.com/yourusername/toosila.git
sudo chown -R $USER:$USER toosila
cd toosila/server
```

#### 3.2 تثبيت الحزم
```bash
npm install --production
```

#### 3.3 إعداد متغيرات البيئة
```bash
# نسخ ملف البيئة
cp .env.production .env

# تحرير القيم
nano .env
```

**قيم مطلوبة في `.env`:**
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com

DB_HOST=localhost
DB_PORT=5432
DB_NAME=toosila_production
DB_USER=toosila_user
DB_PASSWORD=your_secure_password
DB_SSL=false

JWT_SECRET=generate_a_very_long_random_secret_here_minimum_64_chars
JWT_EXPIRES_IN=7d

CORS_ORIGIN=https://your-domain.com
LOG_LEVEL=info
```

**⚠️ مهم:** لتوليد JWT_SECRET آمن:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 3.4 بدء Backend باستخدام PM2
```bash
pm2 start server.js --name toosila-api
pm2 save
pm2 startup  # اتبع التعليمات التي تظهر
```

#### 3.5 التحقق من عمل Backend
```bash
pm2 status
pm2 logs toosila-api
curl http://localhost:5000/api/auth/login  # يجب أن ترى استجابة JSON
```

---

### المرحلة 4: نشر Frontend

#### 4.1 إعداد متغيرات البيئة
```bash
cd /var/www/toosila/client
cp .env.production .env
```

**محتوى `.env`:**
```env
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_NAME=Toosila
NODE_ENV=production
```

#### 4.2 بناء التطبيق
```bash
npm install
npm run build
```

هذا سينشئ مجلد `build/` يحتوي على ملفات HTML/JS/CSS المُحسّنة.

#### 4.3 نقل الملفات
```bash
sudo mkdir -p /var/www/toosila-frontend
sudo cp -r build/* /var/www/toosila-frontend/
sudo chown -R www-data:www-data /var/www/toosila-frontend
```

---

### المرحلة 5: إعداد Nginx

#### 5.1 نسخ تكوين Nginx
```bash
sudo cp /var/www/toosila/nginx.conf /etc/nginx/sites-available/toosila

# تحرير الملف واستبدال "your-domain.com" بنطاقك الفعلي
sudo nano /etc/nginx/sites-available/toosila
```

#### 5.2 تفعيل الموقع
```bash
sudo ln -s /etc/nginx/sites-available/toosila /etc/nginx/sites-enabled/
sudo nginx -t  # اختبار التكوين
sudo systemctl restart nginx
```

---

### المرحلة 6: إعداد SSL (HTTPS)

#### 6.1 تثبيت Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 6.2 الحصول على شهادة SSL
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

اتبع التعليمات التفاعلية. Certbot سيقوم بـ:
- التحقق من ملكية النطاق
- الحصول على شهادة SSL من Let's Encrypt
- تحديث تكوين Nginx تلقائياً

#### 6.3 تجديد تلقائي
```bash
sudo certbot renew --dry-run  # اختبار التجديد التلقائي
```

---

### المرحلة 7: إعداد Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

---

## التحقق من النشر

### 1. اختبار Backend
```bash
curl https://your-domain.com/api/auth/login
# يجب أن ترى: {"error":"Invalid request"}
```

### 2. اختبار Frontend
افتح المتصفح وانتقل إلى:
```
https://your-domain.com
```

يجب أن ترى صفحة تسجيل الدخول.

### 3. اختبار التسجيل والدخول
- قم بإنشاء حساب جديد
- سجل الدخول
- جرب إنشاء عرض أو طلب

---

## المراقبة والصيانة

### مراقبة الخادم
```bash
# عرض حالة Backend
pm2 status
pm2 monit

# عرض السجلات
pm2 logs toosila-api
pm2 logs toosila-api --lines 100

# إعادة تشغيل
pm2 restart toosila-api

# إيقاف
pm2 stop toosila-api
```

### سجلات Nginx
```bash
sudo tail -f /var/log/nginx/toosila-access.log
sudo tail -f /var/log/nginx/toosila-error.log
```

### سجلات PostgreSQL
```bash
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## النسخ الاحتياطي

### نسخ احتياطي لقاعدة البيانات
```bash
# نسخ احتياطي يومي
pg_dump -U toosila_user toosila_production > backup_$(date +%Y%m%d).sql

# جدولة نسخ احتياطي تلقائي (cron)
crontab -e
# أضف السطر التالي:
0 2 * * * pg_dump -U toosila_user toosila_production > /backups/toosila_$(date +\%Y\%m\%d).sql
```

### استعادة من نسخة احتياطية
```bash
psql -U toosila_user toosila_production < backup_20250103.sql
```

---

## التحديثات

### تحديث Backend
```bash
cd /var/www/toosila/server
git pull origin main
npm install --production
pm2 restart toosila-api
```

### تحديث Frontend
```bash
cd /var/www/toosila/client
git pull origin main
npm install
npm run build
sudo cp -r build/* /var/www/toosila-frontend/
```

---

## استكشاف الأخطاء

### مشكلة: Backend لا يعمل
```bash
pm2 logs toosila-api --err
# تحقق من:
# - متغيرات البيئة صحيحة
# - قاعدة البيانات متاحة
# - المنفذ 5000 غير مستخدم
```

### مشكلة: CORS Errors
```bash
# تأكد من تطابق CORS_ORIGIN في .env مع النطاق الفعلي
# تحقق من سجلات Backend
pm2 logs toosila-api | grep CORS
```

### مشكلة: 502 Bad Gateway
```bash
# تحقق من عمل Backend
pm2 status
# تحقق من تكوين Nginx
sudo nginx -t
# تحقق من السجلات
sudo tail -f /var/log/nginx/toosila-error.log
```

---

## منصات النشر السحابية (بدائل)

### 1. Heroku
```bash
# تثبيت Heroku CLI
npm install -g heroku

# تسجيل الدخول
heroku login

# إنشاء تطبيق
heroku create toosila-app

# إضافة PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# نشر
git push heroku main

# تكوين متغيرات البيئة
heroku config:set JWT_SECRET=your_secret
heroku config:set FRONTEND_URL=https://toosila-app.herokuapp.com
```

### 2. Railway
```bash
# على موقع Railway.app:
# 1. ربط حساب GitHub
# 2. اختيار repository
# 3. إضافة PostgreSQL من Plugins
# 4. تكوين متغيرات البيئة
# 5. النشر تلقائي
```

### 3. DigitalOcean App Platform
```yaml
# app.yaml
name: toosila
services:
  - name: api
    github:
      repo: yourusername/toosila
      branch: main
      deploy_on_push: true
    source_dir: /server
    run_command: npm start
    envs:
      - key: NODE_ENV
        value: production
databases:
  - name: db
    engine: PG
    version: "14"
```

---

## قائمة التحقق النهائية

- [ ] قاعدة البيانات مُعدة ومُهاجَرة
- [ ] متغيرات البيئة صحيحة (خاصة JWT_SECRET)
- [ ] Backend يعمل على PM2
- [ ] Frontend تم بناؤه ونشره
- [ ] Nginx مُكوَّن بشكل صحيح
- [ ] SSL/HTTPS نشط
- [ ] Firewall مُكوَّن
- [ ] النسخ الاحتياطي مُجدول
- [ ] المراقبة نشطة (PM2, logs)
- [ ] تم اختبار جميع الميزات الأساسية

---

## الدعم

لأي مشاكل أو استفسارات:
- راجع سجلات PM2: `pm2 logs`
- راجع سجلات Nginx: `/var/log/nginx/`
- راجع سجلات PostgreSQL: `/var/log/postgresql/`

---

**تم بناء هذا الدليل لتطبيق توصيلة 🚗**
