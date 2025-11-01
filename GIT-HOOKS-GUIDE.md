# 🪝 دليل Git Hooks - تطبيق توصيلة

## ما هو Git Hook؟

Git Hook هو سكريبت يتم تشغيله تلقائياً عند حدوث أحداث معينة في Git (مثل commit, push, إلخ). في هذا المشروع، قمنا بإعداد **pre-commit hook** الذي يقوم بتشغيل الاختبارات تلقائياً قبل كل commit.

---

## 🚀 البدء السريع

### 1. التفعيل
الـ hook مُفعّل تلقائياً في المشروع. إذا احتجت لإعادة التفعيل:

```bash
# في Git Bash أو Terminal
chmod +x .git/hooks/pre-commit

# أو استخدم السكريبت
./setup-git-hooks.sh
```

### 2. الاستخدام العادي
```bash
git add .
git commit -m "feat: add new feature"
# ✅ سيتم تشغيل الاختبارات تلقائياً
```

---

## ⚙️ خيارات متقدمة

### تخطي الاختبارات مرة واحدة
```bash
git commit -m "WIP: work in progress" --no-verify
```

### تخطي الاختبارات دائماً
```bash
# في PowerShell
$env:SKIP_TESTS_ON_COMMIT = "1"

# في Git Bash / Linux
export SKIP_TESTS_ON_COMMIT=1
```

### اختبار Backend فقط
```bash
# في PowerShell
$env:TEST_MODE = "backend"

# في Git Bash / Linux
export TEST_MODE=backend
```

### اختبار Frontend فقط
```bash
# في PowerShell
$env:TEST_MODE = "frontend"

# في Git Bash / Linux
export TEST_MODE=frontend
```

---

## 📋 ما الذي يحدث عند الـ Commit؟

```
1. git commit -m "message"
   ↓
2. Pre-commit hook يبدأ التشغيل
   ↓
3. تشغيل اختبارات Backend (Jest)
   ├─ ✅ نجحت → متابعة
   └─ ❌ فشلت → إيقاف الـ commit
   ↓
4. تشغيل اختبارات Frontend (React Testing Library)
   ├─ ✅ نجحت → متابعة
   └─ ❌ فشلت → إيقاف الـ commit
   ↓
5. ✅ كل الاختبارات نجحت
   ↓
6. الـ Commit يتم بنجاح
```

---

## 🛠️ استكشاف الأخطاء

### المشكلة: الـ hook لا يعمل
**الحل:**
```bash
# تأكد من صلاحيات التنفيذ
chmod +x .git/hooks/pre-commit

# أو
./setup-git-hooks.sh
```

### المشكلة: الاختبارات بطيئة جداً
**الحل:**
```bash
# اختبر جزء واحد فقط
export TEST_MODE=backend  # أو frontend
```

### المشكلة: الاختبارات تفشل دائماً
**الحلول:**
1. **إصلاح الاختبارات** (الطريقة الصحيحة):
   ```bash
   # اختبر Backend
   cd server && npm test

   # اختبر Frontend
   cd client && npm test
   ```

2. **التخطي المؤقت**:
   ```bash
   git commit --no-verify -m "message"
   ```

3. **تعطيل الـ hook مؤقتاً**:
   ```bash
   mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled
   ```

4. **إعادة التفعيل**:
   ```bash
   mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
   ```

---

## 📁 ملفات الـ Hooks

| الملف | الوصف |
|-------|-------|
| `.git/hooks/pre-commit` | الـ hook الرئيسي (Bash script) |
| `.git/hooks/pre-commit.ps1` | نسخة PowerShell |
| `.git/hooks/README.md` | توثيق الـ hooks |
| `setup-git-hooks.sh` | سكريبت الإعداد |
| `GIT-HOOKS-GUIDE.md` | هذا الدليل |

---

## 💡 نصائح

### 1. تشغيل الاختبارات يدوياً قبل الـ Commit
```bash
# Backend
cd server && npm test

# Frontend
cd client && npm test
```

### 2. إصلاح الاختبارات تدريجياً
```bash
# اعمل على فرع منفصل
git checkout -b fix/tests

# أصلح اختبار واحد في كل مرة
# ثم commit
git commit -m "test: fix user authentication test"
```

### 3. استخدام CI/CD
يمكن دمج نفس الاختبارات مع GitHub Actions أو GitLab CI:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Backend Tests
        run: cd server && npm install && npm test
      - name: Frontend Tests
        run: cd client && npm install && npm test
```

---

## 🎯 الهدف من الـ Hook

✅ **منع** commit كود معطوب
✅ **ضمان** جودة الكود
✅ **توفير** الوقت في اكتشاف الأخطاء مبكراً
✅ **تحسين** سير العمل الجماعي

---

## 📞 الدعم

إذا واجهت أي مشكلة:

1. راجع التوثيق في `.git/hooks/README.md`
2. اختبر الـ hooks يدوياً: `sh .git/hooks/pre-commit`
3. تأكد من تثبيت dependencies: `npm install` في server و client

---

**🚀 Happy Coding with Toosila!**

*آخر تحديث: 2025-10-31*
