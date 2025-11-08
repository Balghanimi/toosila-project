# AI Content Moderation System - Setup Guide

## Overview

Toosila now includes an AI-powered content moderation system using **Anthropic Claude API** to automatically review ride offers and ride demands for spam, fraud, and inappropriate content.

---

## Features

- **Automatic Content Analysis**: Every new offer/demand is analyzed by Claude AI
- **Three-tier Decision System**:
  - ✅ **Approved**: Clean content, published immediately
  - 🚩 **Flagged**: Borderline content, requires manual admin review
  - ❌ **Rejected**: Clear violations, blocked automatically
- **Audit Logging**: All moderation decisions are logged in `moderation_logs` table
- **Graceful Degradation**: If API key is missing, system auto-approves (development mode)
- **Iraqi Context-Aware**: Understands Iraqi geography, pricing, and Arabic language

---

## Setup Instructions

### 1. Database Migration

Run the migration to add moderation fields:

```bash
cd server
psql $DATABASE_URL -f database/migrations/009_add_ai_moderation.sql
```

Or connect to Railway database and run the migration manually.

**What it does:**
- Adds `moderation_status`, `moderation_reason`, `moderated_at`, `moderated_by` to `offers` table
- Adds same fields to `demands` table
- Creates `moderation_logs` table for audit trail
- Marks all existing content as `approved` (grandfathered in)

---

### 2. Get Anthropic API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up / Log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

**Pricing** (as of Jan 2025):
- Claude 3.5 Sonnet: ~$3 per million input tokens, ~$15 per million output tokens
- Estimated cost: ~$0.001-0.002 per moderation (very affordable)

---

### 3. Environment Variables

Add to your `.env` file (both local and Railway):

```bash
# AI Content Moderation
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=1024
```

**Railway Deployment:**
```bash
# Set in Railway dashboard under Variables tab:
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=1024
```

---

### 4. Install Dependencies

```bash
cd server
npm install @anthropic-ai/sdk
```

Already installed! ✅

---

### 5. Deploy & Test

**Deploy to Railway:**
```bash
git add .
git commit -m "feat: add AI content moderation system"
git push origin main
```

Railway will auto-deploy.

**Test Locally:**
```bash
cd server
npm run dev
```

Create a test offer/demand via API or frontend - check the moderation response!

---

## How It Works

### Workflow

1. **User creates offer/demand** → POST `/api/offers` or `/api/demands`

2. **Content is saved to database** with `moderation_status='pending'`

3. **AI analyzes content**:
   - Checks Iraqi locations (all cities, neighborhoods, districts)
   - Validates pricing (2,000 - 200,000 IQD based on distance)
   - Detects spam, fraud, offensive language
   - Returns decision: `approved`, `flagged`, or `rejected`

4. **Database is updated** with moderation result

5. **Moderation log is created** for audit trail

6. **Response to user**:
   - ✅ Approved → "تم إنشاء العرض بنجاح" (published immediately)
   - 🚩 Flagged → "تم إنشاء العرض وهو قيد المراجعة اليدوية" (pending admin review)
   - ❌ Rejected → "تم رفض العرض من قبل نظام المراجعة التلقائية" (not published)

---

## Files Created

### Backend Services

**`server/services/claude.service.js`**
- Handles communication with Anthropic API
- Sends moderation requests
- Parses JSON responses
- Handles errors gracefully

**`server/agents/moderation.agent.js`**
- Contains AI system prompt with Iraqi context
- Analyzes offers and demands
- Returns structured moderation decisions
- Batch analysis support

### Database

**`server/database/migrations/009_add_ai_moderation.sql`**
- Adds moderation columns to `offers` and `demands` tables
- Creates `moderation_logs` table
- Adds indexes for performance
- Grandfathers existing content as approved

### Controllers Updated

**`server/controllers/offers.controller.js`**
- `createOffer()` now includes AI moderation
- Updates database with moderation result
- Logs decision to `moderation_logs`
- Returns appropriate response to user

**`server/controllers/demands.controller.js`**
- `createDemand()` now includes AI moderation
- Same flow as offers

---

## AI Moderation Prompt

The AI is instructed to:

### Geographic Context
- Support **ALL Iraqi locations**: cities, provinces, neighborhoods, districts, areas
- Examples: Baghdad, Karada, Mansour, Basra, Zubair, Erbil, Ankawa, Najaf, Kufa
- Be **flexible** with spelling variations (Arabic, English, transliterations)
- Focus on detecting **fake/non-existent** locations, not valid Iraqi places

### Pricing Context (Iraqi Dinar)
- Short trips (within city): 2,000 - 15,000 IQD
- Medium trips (between neighborhoods): 10,000 - 50,000 IQD
- Long trips (between provinces): 30,000 - 150,000 IQD
- Very long trips (cross-country): 50,000 - 200,000 IQD
- Allow market flexibility - don't be too strict on pricing

### Language Support
- Arabic (Iraqi dialect + Modern Standard Arabic)
- English
- Mixed language (Arabizi)
- Spelling variations

### Detection Rules

**REJECT if:**
- Spam (repeated posts, promotional ads, unrelated content)
- Fraud (scams, phishing, fake payment schemes)
- Offensive (hate speech, harassment, discrimination, explicit sexual content)
- Dangerous (illegal activities, violence, weapons, drugs)
- Fake locations (clearly made up, not just rare Iraqi locations)
- Impossible routes (geographic nonsense)
- Extremely suspicious prices (10x above/below reasonable range)

**FLAG for manual review if:**
- Borderline pricing (high/low but not impossible)
- Unusual routes (valid locations but uncommon combinations)
- Ambiguous content (needs human judgment)
- Unclear locations (could be typo or real place)

**APPROVE if:**
- Valid Iraqi locations
- Reasonable pricing for route distance
- Clean, professional language
- Clear ride details

---

## Response Format

AI returns JSON:

```json
{
  "approved": true,
  "flagged": false,
  "rejected": false,
  "reason": "Valid ride offer with reasonable pricing",
  "confidence": 0.95,
  "issues": [],
  "suggestions": null
}
```

---

## Admin Dashboard (Future Enhancement)

**Suggested Features:**
- View flagged content
- Manually approve/reject flagged items
- View moderation logs
- Override AI decisions
- Ban users who repeatedly violate policies
- Moderation statistics dashboard

**Database Support:**
- `moderation_status` field allows filtering: `WHERE moderation_status = 'flagged'`
- `moderation_logs` table provides full audit trail

---

## Cost Estimation

**Assumptions:**
- 100 offers/demands created per day
- Average 200 input tokens per request
- Average 100 output tokens per response

**Daily Cost:**
- Input: 100 × 200 = 20,000 tokens = 20K × $3/1M = $0.06
- Output: 100 × 100 = 10,000 tokens = 10K × $15/1M = $0.15
- **Total: ~$0.21/day = $6.30/month**

Very affordable for the value provided! 💰

---

## Monitoring & Logs

**Check moderation stats:**
```sql
-- Count by status
SELECT moderation_status, COUNT(*)
FROM offers
GROUP BY moderation_status;

-- Recent moderations
SELECT * FROM moderation_logs
ORDER BY created_at DESC
LIMIT 20;

-- Approval rate
SELECT
  COUNT(*) as total,
  COUNT(CASE WHEN new_status = 'approved' THEN 1 END) as approved,
  COUNT(CASE WHEN new_status = 'flagged' THEN 1 END) as flagged,
  COUNT(CASE WHEN new_status = 'rejected' THEN 1 END) as rejected
FROM moderation_logs
WHERE created_at > NOW() - INTERVAL '7 days';
```

**Application logs:**
```bash
# Check for moderation errors
railway logs | grep "moderation"
railway logs | grep "Claude API error"
```

---

## Troubleshooting

### Problem: All content is auto-approved

**Cause**: `ANTHROPIC_API_KEY` not set

**Solution**:
1. Check Railway environment variables
2. Verify API key is correct (starts with `sk-ant-`)
3. Restart server after adding env var

---

### Problem: API errors or rate limits

**Cause**: Invalid API key or exceeded quota

**Solution**:
1. Verify API key at https://console.anthropic.com/
2. Check billing/usage limits
3. System will auto-flag content for manual review on API errors (safe default)

---

### Problem: Too many items flagged

**Cause**: AI prompt may need tuning for Iraqi context

**Solution**:
1. Review `moderation_logs` to see common issues
2. Adjust system prompt in `server/agents/moderation.agent.js`
3. Add more Iraqi location examples
4. Adjust pricing ranges

---

### Problem: Migration failed

**Cause**: Database connection issues

**Solution**:
```bash
# Get Railway database URL
railway variables | grep DATABASE

# Run migration manually
psql $DATABASE_URL -f server/database/migrations/009_add_ai_moderation.sql

# Or via Railway CLI
railway run psql $DATABASE_URL -f server/database/migrations/009_add_ai_moderation.sql
```

---

## Development Mode (No API Key)

If `ANTHROPIC_API_KEY` is not set:
- System logs warning: `⚠️  ANTHROPIC_API_KEY not found. AI moderation will be disabled.`
- All content is **auto-approved**
- `moderated_by` field set to `'auto'`
- No API calls are made
- Perfect for local development without API key

---

## Security Considerations

- ✅ API key stored in environment variables (never committed to Git)
- ✅ All moderation decisions are logged for audit trail
- ✅ On API errors, content is **flagged** (not auto-approved) for safety
- ✅ System prompt prevents gaming (can't trick AI with meta-instructions)
- ✅ Admin can override AI decisions via manual review

---

## Next Steps

1. ✅ **Run database migration** (see step 1)
2. ✅ **Add API key to Railway** (see step 2)
3. ✅ **Deploy to production** (git push)
4. 📊 **Monitor logs** for first few days
5. 🎨 **Build admin dashboard** to review flagged content
6. 📈 **Track metrics**: approval rate, false positives, user complaints

---

## Support

**Claude AI Documentation:**
- https://docs.anthropic.com/

**Toosila Team:**
- Report issues in GitHub
- Check moderation_logs for AI decisions
- Review flagged content in database

---

**Built with ❤️ using Anthropic Claude AI**

**Last Updated:** 2025-01-08
