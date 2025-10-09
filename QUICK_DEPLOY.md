# دليل النشر السريع - توصيلة

## ✅ قبل البدء

تأكد من توفر:
- [ ] خادم Ubuntu/CentOS
- [ ] نطاق (Domain) جاهز
- [ ] حساب GitHub

---

## 🚀 خطوات النشر السريع (30 دقيقة)

### 1️⃣ إعداد الخادم (5 دقائق)
```bash
# تحديث وتثبيت المتطلبات
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib nginx git
sudo npm install -g pm2

# التحقق
node --version  # يجب أن تكون 18.x+
npm --version
```

### 2️⃣ إعداد قاعدة البيانات (5 دقائق)
```bash
# إنشاء قاعدة البيانات
sudo -u postgres psql -c "CREATE DATABASE toosila_production;"
sudo -u postgres psql -c "CREATE USER toosila_user WITH PASSWORD 'ChangeThisPassword123!';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE toosila_production TO toosila_user;"

# استيراد Schema (بعد رفع الملفات)
# سيتم في الخطوة 3
```

### 3️⃣ رفع الكود (5 دقائق)
```bash
# على جهازك المحلي:
cd c:\Users\a2z\toosila-project
git init
git add .
git commit -m "Initial deployment"
git remote add origin https://github.com/yourusername/toosila.git
git push -u origin main

# على الخادم:
cd /var/www
sudo git clone https://github.com/yourusername/toosila.git
sudo chown -R $USER:$USER toosila
```

### 4️⃣ إعداد Backend (5 دقائق)
```bash
cd /var/www/toosila/server

# تثبيت الحزم
npm install --production

# إعداد البيئة
cp .env.production .env
nano .env  # عدّل القيم حسب خادمك

# استيراد Schema
psql -U toosila_user -d toosila_production < database/schema.sql

# بدء Backend
pm2 start server.js --name toosila-api
pm2 save
pm2 startup
```

**قيم مهمة في .env:**
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_NAME=toosila_production
DB_USER=toosila_user
DB_PASSWORD=ChangeThisPassword123!
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
CORS_ORIGIN=https://your-domain.com
FRONTEND_URL=https://your-domain.com
```

### 5️⃣ إعداد Frontend (5 دقائق)
```bash
cd /var/www/toosila/client

# إعداد البيئة
echo "REACT_APP_API_URL=https://your-domain.com/api" > .env
echo "NODE_ENV=production" >> .env

# بناء
npm install
npm run build

# نقل الملفات
sudo mkdir -p /var/www/toosila-frontend
sudo cp -r build/* /var/www/toosila-frontend/
sudo chown -R www-data:www-data /var/www/toosila-frontend
```

### 6️⃣ إعداد Nginx (3 دقيقة)
```bash
# نسخ التكوين
sudo cp /var/www/toosila/nginx.conf /etc/nginx/sites-available/toosila

# تعديل النطاق
sudo sed -i 's/your-domain.com/actual-domain.com/g' /etc/nginx/sites-available/toosila

# تفعيل
sudo ln -s /etc/nginx/sites-available/toosila /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7️⃣ إعداد SSL (2 دقيقة)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 8️⃣ Firewall (1 دقيقة)
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## ✅ اختبار النشر

```bash
# 1. اختبار Backend
curl https://your-domain.com/api/auth/login

# 2. اختبار Frontend
# افتح في المتصفح: https://your-domain.com

# 3. تحقق من PM2
pm2 status
pm2 logs toosila-api
```

---

## 🔄 تحديثات سريعة

```bash
# Backend
cd /var/www/toosila/server && git pull && npm install --production && pm2 restart toosila-api

# Frontend
cd /var/www/toosila/client && git pull && npm install && npm run build && sudo cp -r build/* /var/www/toosila-frontend/
```

---

## 🆘 استكشاف الأخطاء السريع

| المشكلة | الحل |
|---------|------|
| Backend لا يعمل | `pm2 logs toosila-api --err` |
| 502 Bad Gateway | `sudo systemctl restart nginx && pm2 restart toosila-api` |
| CORS Error | تحقق من `CORS_ORIGIN` في `.env` |
| Database Error | تحقق من بيانات DB في `.env` |

---

## 📱 منصات سحابية (أسهل)

### Railway.app (الأسهل - مجاني)
1. اذهب إلى https://railway.app
2. ربط GitHub repository
3. إضافة PostgreSQL من Plugins
4. تكوين متغيرات البيئة
5. النشر تلقائي ✅

### Heroku (سهل - مجاني محدود)
```bash
heroku create toosila-app
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku config:set JWT_SECRET=$(openssl rand -hex 64)
```

### Vercel (للـ Frontend فقط)
```bash
cd client
npm install -g vercel
vercel --prod
```

---

## 📋 قائمة تحقق نهائية

- [ ] Backend يعمل: `pm2 status`
- [ ] Database متصلة: `pm2 logs toosila-api`
- [ ] Frontend يظهر: افتح `https://your-domain.com`
- [ ] SSL نشط: قفل أخضر في المتصفح
- [ ] يمكن التسجيل والدخول
- [ ] يمكن إنشاء عرض/طلب
- [ ] الرسائل تعمل

---

**🎉 مبروك! تطبيقك الآن على الإنترنت!**
