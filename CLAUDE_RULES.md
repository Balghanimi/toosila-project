# 📜 Claude Code Rules & Thinking Methodology
## For Toosila Project (توصيلة)

---

## 🔒 GOLDEN RULE: DO NOT TOUCH WORKING CODE (القاعدة الذهبية)

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚨 STOP! BEFORE CHANGING ANY FILE, ASK YOURSELF:           ║
║                                                               ║
║   "Does this file NEED to change for THIS SPECIFIC task?"    ║
║                                                               ║
║   If NO → DO NOT TOUCH IT                                    ║
║   If YES → Make MINIMAL changes only                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

### BEFORE Making Any Changes:
```
1. IDENTIFY which files MUST change (not "might be nice to change")
2. LIST files that are WORKING FINE → DO NOT TOUCH THEM
3. ANNOUNCE your plan: "I will modify X.js and Y.js. I will NOT touch Z.js"
4. Proceed with minimal changes
```

### NEVER Change:
```
❌ Files not mentioned in the task
❌ Code that already works correctly
❌ Unrelated components or pages
❌ "Improvements" you noticed while working
❌ Refactoring that wasn't requested
❌ Adding features that weren't asked for
```

### ALWAYS:
```
✅ Make MINIMAL changes only
✅ Change ONE file at a time
✅ Test after EACH change
✅ If something breaks → REVERT immediately
✅ If unsure → ASK before changing
```

### WHEN FIXING A BUG:
```
✅ Fix ONLY the bug
✅ Touch ONLY the file with the bug
❌ Do NOT "improve" other code
❌ Do NOT refactor
❌ Do NOT add features
❌ Do NOT change working pages
```

---

## 🧠 THE THREE-WAY THINKING (التفكير الثلاثي)

Before ANY action, think through ALL THREE perspectives:

### 1. 👤 As a Regular User (كمستخدم عادي)
```
├── What do I see on the screen?
├── Is it clear what I should do?
├── Does the flow make sense?
├── Is the Arabic text correct and natural?
└── Does RTL layout look right?
```

### 2. 🔧 As an Expert Developer (كخبير تقني)
```
├── Is the code correct and efficient?
├── Are there any bugs or edge cases?
├── Is security properly handled?
├── Is error handling complete?
└── Does it follow best practices?
```

### 3. 💡 Outside the Box (خارج الصندوق)
```
├── Am I solving the right problem?
├── Is there a simpler solution?
├── What am I missing?
└── What would break if I do this?
```

---

## 📋 WORKFLOW RULES (قواعد سير العمل)

### Before Starting:
```
1. □ Read and understand the requirement
2. □ Identify which files MUST be changed
3. □ List files that should NOT be touched
4. □ ANNOUNCE: "I will change X. I will NOT touch Y, Z"
5. □ Proceed with the task
```

### While Working:
```
1. □ Work on ONE file at a time
2. □ Make the SMALLEST change possible
3. □ Test after EACH change
4. □ DO NOT touch files outside your plan
```

### After Completing:
```
1. □ Review all changes made
2. □ List all files modified
3. □ Provide testing instructions
```

---

## 🚫 ABSOLUTE DON'Ts (ممنوعات مطلقة)

```
❌ Modify files outside the scope of the task
❌ "Improve" code that wasn't mentioned
❌ Refactor working code while fixing a bug
❌ Add new npm packages without asking
❌ Delete or rename existing files without asking
❌ Change database schema without asking
❌ Make "improvements" not requested
```

---

## ✅ CODE STANDARDS (معايير الكود)

### Error Handling:
```javascript
// ✅ GOOD
try {
  const data = await api.fetchData();
  setData(data);
} catch (error) {
  console.error('Failed to fetch data:', error);
  setError('حدث خطأ في تحميل البيانات');
}
```

### API Calls:
```javascript
// ✅ GOOD
const fetchData = async () => {
  setLoading(true);
  try {
    const response = await api.getData();
    setData(response.data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

---

## 🇮🇶 TOOSILA-SPECIFIC RULES (قواعد خاصة بتوصيلة)

### Arabic & RTL:
```
✅ Always test with Arabic text
✅ Check RTL layout looks correct
✅ Currency format: "150,000 د.ع"
✅ Phone format: Iraqi format (+964)
```

### Mode Context:
```javascript
// mode === 'driver' → Show driver features (الطلبات)
// mode === 'passenger' → Show passenger features (العروض)

// IMPORTANT: When fixing mode-related issues:
// - ONLY change the specific component mentioned
// - DO NOT change ViewOffers.js when fixing ViewDemands.js
```

### Cities:
```javascript
const IRAQI_CITIES = [
  'بغداد', 'البصرة', 'أربيل', 'الموصل',
  'كربلاء', 'النجف', 'السليمانية', 'دهوك',
  'الناصرية', 'كركوك', 'الحلة', 'الديوانية'
];
```

---

## 🔍 DEBUGGING (تصحيح الأخطاء)

```
1. REPRODUCE → Can I see the bug?
2. ISOLATE → Which file has the bug?
3. IDENTIFY → What is the root cause?
4. FIX → Minimal fix, ONLY this file
5. VERIFY → Is it fixed? Did anything break?
```

---

## 📁 FILE ORGANIZATION

```
client/src/
├── pages/           # Route-level components
├── components/      # Reusable UI
├── context/         # Global state
├── services/        # API calls
└── styles/          # CSS files

server/
├── routes/          # API routes
├── controllers/     # Request handlers
├── models/          # Database queries
└── middlewares/     # Auth, validation
```

---

## 🎯 QUICK CHECKLIST

```
□ Did I ONLY change files mentioned in the task?
□ Did I touch any working file? (If yes → REVERT!)
□ Is this the SIMPLEST solution?
□ Did I find the ROOT CAUSE?
□ Did I test it?
```

---

## 🚀 REMEMBER

```
╔═══════════════════════════════════════════════════════════════╗
║   🔒 GOLDEN RULE: DO NOT TOUCH WORKING CODE                  ║
║   "إذا كان يعمل، لا تلمسه"                                     ║
╚═══════════════════════════════════════════════════════════════╝
```

**You are a SENIOR DEVELOPER.**
**You NEVER touch working code.**
**You change ONLY what needs to be changed.**

---

*Project: Toosila (توصيلة) - Iraqi Ride-Sharing App*