# ========================================
# Dockerfile محسّن لتطبيق Toosila
# Railway Deployment - Express يخدم React
# Force rebuild: 2025-10-13
# ========================================

# ==================== المرحلة 1: بناء الواجهة الأمامية ====================
FROM node:22-alpine AS frontend-builder

WORKDIR /app/client

# نسخ ملفات package أولاً (للاستفادة من cache)
COPY client/package.json ./

# تثبيت جميع التبعيات (بما في ذلك devDependencies للبناء)
# استخدام npm install بدلاً من npm ci لأن package-lock.json غير موجود
RUN npm install

# نسخ كود المصدر
COPY client/ ./

# بناء تطبيق React
RUN npm run build

# ==================== المرحلة 2: تبعيات الخادم ====================
FROM node:22-alpine AS backend-deps

WORKDIR /app/server

# نسخ ملفات package
COPY server/package.json server/package-lock.json ./

# تثبيت التبعيات للإنتاج فقط
RUN npm ci --omit=dev

# ==================== المرحلة 3: الإنتاج ====================
FROM node:22-alpine AS production

# تثبيت wget للـ health check
RUN apk add --no-cache wget

WORKDIR /app

# نسخ تبعيات الخادم من المرحلة السابقة
COPY --from=backend-deps /app/server/node_modules ./server/node_modules

# نسخ كود الخادم
COPY server/ ./server/

# نسخ بناء الواجهة الأمامية
COPY --from=frontend-builder /app/client/build ./build

# تعيين متغيرات البيئة
ENV NODE_ENV=production
ENV PORT=3000

# فتح المنفذ (Railway سيستبدله تلقائياً)
EXPOSE 3000

# فحص صحة التطبيق
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/api/health || exit 1

# بدء الخادم مباشرةً (بدون shell script)
CMD ["node", "server/server.js"]
