# Toosila Penetration Testing Guide

## Overview

This guide provides comprehensive instructions for conducting security penetration testing on the Toosila ride-sharing platform. It is designed for security professionals, developers, and QA teams to validate the security posture of the application.

**Target Security Score: 95+/100**

---

## Table of Contents

1. [Testing Environment Setup](#testing-environment-setup)
2. [OWASP Top 10 Testing](#owasp-top-10-testing)
3. [Authentication & Authorization Testing](#authentication--authorization-testing)
4. [Input Validation Testing](#input-validation-testing)
5. [API Security Testing](#api-security-testing)
6. [Rate Limiting Testing](#rate-limiting-testing)
7. [File Upload Testing](#file-upload-testing)
8. [Session Management Testing](#session-management-testing)
9. [Tools & Automation](#tools--automation)
10. [Reporting](#reporting)

---

## Testing Environment Setup

### Prerequisites

**Required Tools:**
- OWASP ZAP or Burp Suite
- Postman or curl
- Node.js (for running test scripts)
- PostgreSQL client
- Browser DevTools

**Test Environment:**
```bash
# Clone repository
git clone https://github.com/toosila/toosila-project
cd toosila-project

# Install dependencies
cd server && npm install
cd ../client && npm install

# Setup test database
createdb toosila_test

# Run in development mode
npm run dev
```

**Test Accounts:**
```
Regular User:
- Email: test.user@example.com
- Password: TestUser123!

Driver:
- Email: test.driver@example.com
- Password: TestDriver123!

Admin:
- Email: admin@toosila.com
- Password: [Contact security team]
```

### Responsible Testing Rules

**DO:**
- ✅ Test only on approved test/staging environments
- ✅ Document all findings
- ✅ Report critical issues immediately
- ✅ Respect rate limits during automated testing
- ✅ Clean up test data after testing

**DON'T:**
- ❌ Test on production without explicit permission
- ❌ Perform denial of service attacks
- ❌ Access other users' data without authorization
- ❌ Modify or delete production data
- ❌ Share credentials publicly

---

## OWASP Top 10 Testing

### A01: Broken Access Control

#### Test Cases

**1. Horizontal Privilege Escalation**

Test if users can access other users' data:

```bash
# Get your offers
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/offers/my/offers

# Try to access another user's offer by ID
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/offers/OTHER_USER_OFFER_ID

# Expected: 403 Forbidden or filtered results
```

**2. Vertical Privilege Escalation**

Test if regular users can access admin endpoints:

```bash
# Try to access admin users list
curl -H "Authorization: Bearer USER_TOKEN" \
  http://localhost:5001/api/auth/users

# Expected: 403 Forbidden - "Admin access required"
```

**3. IDOR (Insecure Direct Object Reference)**

```bash
# Try to modify another user's offer
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 1000}' \
  http://localhost:5001/api/offers/OTHER_USER_OFFER_ID

# Expected: 403 Forbidden - "You can only modify your own offers"
```

**4. Path Traversal**

```bash
# Try to access files outside allowed directories
curl http://localhost:5001/api/../../../etc/passwd

# Expected: 404 or proper error handling
```

**Expected Results:**
- ✅ All IDOR attempts blocked
- ✅ Admin routes require admin role
- ✅ Users can only access their own resources
- ✅ Path traversal attempts handled safely

---

### A02: Cryptographic Failures

#### Test Cases

**1. Password Storage**

```bash
# Register a user and check database
psql toosila_test -c "SELECT password_hash FROM users WHERE email='test@example.com';"

# Expected: bcrypt hash (starts with $2b$)
# Should NOT be plain text or weak hash
```

**2. JWT Token Security**

```bash
# Decode JWT token (using jwt.io)
echo "YOUR_JWT_TOKEN" | base64 -d

# Check:
# - Strong secret used (32+ chars)
# - Appropriate expiry time
# - No sensitive data in payload
```

**3. HTTPS Enforcement**

```bash
# Try HTTP request in production
curl -I http://production-url.com

# Expected: 301/302 redirect to HTTPS
# Or connection refused
```

**Expected Results:**
- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT secrets are strong (32+ chars)
- ✅ HTTPS enforced in production
- ✅ No sensitive data in logs

---

### A03: Injection

#### Test Cases

**1. SQL Injection**

```bash
# Classic SQL injection in login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@toosila.com",
    "password": "anything OR 1=1--"
  }'

# Expected: Invalid credentials (not bypassed)

# Union-based SQL injection
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com UNION SELECT * FROM users--",
    "password": "test123"
  }'

# Expected: Sanitization or parameterized query prevents injection

# Time-based blind SQL injection
curl "http://localhost:5001/api/offers?fromCity=Baghdad' AND SLEEP(5)--"

# Expected: No delay, query rejected or sanitized
```

**2. NoSQL Injection** (if using MongoDB)

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": {"$ne": null},
    "password": {"$ne": null}
  }'

# Expected: Invalid input - operators rejected
```

**3. Command Injection**

```bash
# Try to inject OS commands
curl -X POST http://localhost:5001/api/offers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromCity": "Baghdad; ls -la",
    "toCity": "Basra"
  }'

# Expected: Sanitized or validation error
```

**Expected Results:**
- ✅ All SQL injection attempts fail
- ✅ Parameterized queries used everywhere
- ✅ Input sanitization blocks dangerous patterns
- ✅ No command execution from user input

---

### A04: Insecure Design

#### Test Cases

**1. Authentication Flow**

```bash
# Test rate limiting on login
for i in {1..10}; do
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "wrong"}' &
done

# Expected: Rate limit after 5 attempts
```

**2. Business Logic Flaws**

```bash
# Try to book negative seats
curl -X POST http://localhost:5001/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "offerId": 123,
    "seats": -5
  }'

# Expected: Validation error - "Seats must be between 1 and 7"

# Try to book more seats than available
curl -X POST http://localhost:5001/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "offerId": 123,
    "seats": 100
  }'

# Expected: Business logic validation - "Only X seats available"
```

**Expected Results:**
- ✅ Rate limiting prevents brute force
- ✅ Business rules enforced
- ✅ Edge cases handled properly
- ✅ Email verification required

---

### A05: Security Misconfiguration

#### Test Cases

**1. Error Messages**

```bash
# Trigger an error
curl http://localhost:5001/api/users/999999

# Expected: Generic error message, no stack traces
# Should NOT reveal: Database details, file paths, versions
```

**2. Default Credentials**

```bash
# Try common default credentials
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@admin.com", "password": "admin"}'

# Expected: Invalid credentials (no defaults exist)
```

**3. Security Headers**

```bash
# Check security headers
curl -I http://localhost:5001/api/health

# Expected headers:
# - Strict-Transport-Security
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - Content-Security-Policy
# - X-XSS-Protection
```

**4. Dependency Vulnerabilities**

```bash
cd server && npm audit
cd ../client && npm audit

# Expected: 0 critical or high vulnerabilities
```

**Expected Results:**
- ✅ No stack traces in error responses
- ✅ No default credentials
- ✅ Security headers present (A+ rating)
- ✅ Dependencies up to date

---

### A06: Vulnerable Components

#### Test Cases

**1. npm Audit**

```bash
# Check server dependencies
cd server
npm audit --audit-level=high

# Check client dependencies
cd ../client
npm audit --audit-level=high

# Expected: 0 high or critical vulnerabilities
```

**2. Outdated Packages**

```bash
npm outdated

# Check for major version updates
# Review and update as needed
```

**Expected Results:**
- ✅ No critical/high npm vulnerabilities
- ✅ Dependencies reasonably up to date
- ✅ Security patches applied

---

### A07: Authentication Failures

#### Test Cases

**1. Brute Force Protection**

```bash
# Automated brute force test
for i in {1..10}; do
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"test@example.com\", \"password\": \"wrong$i\"}"
  echo "Attempt $i"
done

# Expected: Rate limited after 5 attempts
# Expected: Account locked after 5 failed attempts
```

**2. Credential Stuffing**

```bash
# Try multiple username/password combinations
# (Use a small list for testing, not production data)

while read line; do
  email=$(echo $line | cut -d: -f1)
  pass=$(echo $line | cut -d: -f2)
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$email\", \"password\": \"$pass\"}"
done < test_credentials.txt

# Expected: Rate limiting kicks in quickly
```

**3. Session Timeout**

```bash
# Login and wait for token expiry
TOKEN=$(curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestUser123!"}' \
  | jq -r '.data.token')

# Wait for expiry (7 days default)
# Or manually expire in database for testing

sleep 10
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/auth/profile

# Expected: 403 Forbidden - expired token
```

**Expected Results:**
- ✅ Rate limiting prevents brute force
- ✅ Account lockout after 5 failed attempts
- ✅ Strong password requirements
- ✅ Token expiry enforced

---

### A08: Software and Data Integrity

#### Test Cases

**1. JWT Signature Validation**

```bash
# Tamper with JWT token
# Change payload without changing signature
# Use jwt.io to modify token

curl -H "Authorization: Bearer TAMPERED_TOKEN" \
  http://localhost:5001/api/auth/profile

# Expected: 403 Forbidden - Invalid token
```

**2. CSRF Protection**

```bash
# Try to perform state-changing action without CSRF token
curl -X POST http://localhost:5001/api/offers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Origin: http://malicious-site.com" \
  -d '{"fromCity": "Baghdad", "toCity": "Basra"}'

# Expected: CSRF validation or origin check
```

**Expected Results:**
- ✅ JWT signatures validated
- ✅ Tampered tokens rejected
- ✅ CSRF protection active
- ✅ Origin header validated

---

### A09: Security Logging Failures

#### Test Cases

**1. Security Events Logged**

```bash
# Trigger security events and check logs
# Failed login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrong"}'

# Check audit logs
psql toosila_test -c "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;"

# Expected: Login failure logged with IP, timestamp
```

**2. Sensitive Data Not Logged**

```bash
# Check application logs for sensitive data
grep -r "password" logs/
grep -r "token" logs/

# Expected: No passwords or full tokens in logs
```

**Expected Results:**
- ✅ Failed logins logged
- ✅ Security events tracked
- ✅ No sensitive data in logs
- ✅ Audit logs queryable

---

### A10: Server-Side Request Forgery (SSRF)

#### Test Cases

**1. URL Parameter Validation**

```bash
# Try to access internal resources
curl -X POST http://localhost:5001/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:5432"}'

# Try to access cloud metadata
curl -X POST http://localhost:5001/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{"url": "http://169.254.169.254/latest/meta-data/"}'

# Expected: URL validation rejects internal IPs
```

**Expected Results:**
- ✅ Internal URLs rejected
- ✅ Cloud metadata endpoints blocked
- ✅ URL validation enforced

---

## Authentication & Authorization Testing

### JWT Token Testing

**1. Token Expiration**

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestUser123!"}' \
  | jq -r '.data.token')

# Decode and check expiry
echo $TOKEN | cut -d. -f2 | base64 -d | jq .exp

# Use token after expiry
# Expected: 403 Forbidden
```

**2. Token Manipulation**

```bash
# Try to change user ID in token
# Use jwt.io to modify payload
# Expected: Signature validation fails
```

### Role-Based Access Control

```bash
# Regular user trying admin endpoint
curl -H "Authorization: Bearer USER_TOKEN" \
  http://localhost:5001/api/auth/users

# Expected: 403 Forbidden

# Driver accessing non-driver routes
# Expected: Proper authorization checks
```

---

## Input Validation Testing

### XSS Testing

**1. Reflected XSS**

```bash
# Try XSS in query parameters
curl "http://localhost:5001/api/offers?search=<script>alert('XSS')</script>"

# Expected: Input sanitized or escaped
```

**2. Stored XSS**

```bash
# Try to store XSS in offer description
curl -X POST http://localhost:5001/api/offers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromCity": "<script>alert(\"XSS\")</script>",
    "toCity": "Basra",
    "departureTime": "2025-01-15T10:00:00Z",
    "seats": 3,
    "price": 50000
  }'

# Expected: Input sanitized with HTML escaped
```

**3. DOM-based XSS** (Client-side)

```javascript
// Check if user input is directly inserted into DOM
// Test React components for dangerouslySetInnerHTML
// Expected: All user content properly escaped
```

### SQL Injection Testing (Comprehensive)

**Test all input fields:**

```bash
# Search functionality
curl "http://localhost:5001/api/offers?fromCity=Baghdad' OR '1'='1"

# Numeric parameters
curl "http://localhost:5001/api/offers/1 OR 1=1"

# Date parameters
curl "http://localhost:5001/api/offers?date=2025-01-01' OR '1'='1"

# Expected: All attempts blocked or sanitized
```

---

## API Security Testing

### REST API Tests

**1. Method Tampering**

```bash
# Try unauthorized methods
curl -X DELETE http://localhost:5001/api/offers/123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Only owner or admin should succeed
# Expected: 403 if not owner
```

**2. Mass Assignment**

```bash
# Try to set admin role during registration
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestUser123!",
    "name": "Test User",
    "role": "admin"
  }'

# Expected: Role parameter ignored or validation error
```

**3. API Rate Limiting**

```bash
# Spam API requests
for i in {1..600}; do
  curl http://localhost:5001/api/offers &
done

# Expected: 429 Too Many Requests after 500 requests
```

---

## Rate Limiting Testing

### Endpoint-Specific Limits

```bash
# Authentication: 5 attempts / 15 min
for i in {1..10}; do
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "wrong"}'
done
# Expected: Limited after 5 attempts

# Registration: 3 attempts / 1 hour
for i in {1..5}; do
  curl -X POST http://localhost:5001/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"test$i@example.com\", \"password\": \"Test123!\", \"name\": \"Test\"}"
done
# Expected: Limited after 3 attempts

# Offer creation: 10 offers / hour
# Test by creating 15 offers rapidly
# Expected: Limited after 10
```

---

## File Upload Testing

### Malicious File Upload

**1. File Type Bypass**

```bash
# Try to upload PHP file renamed as JPG
cp malicious.php malicious.jpg
curl -X POST http://localhost:5001/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@malicious.jpg"

# Expected: Magic number validation rejects
```

**2. Path Traversal in Filename**

```bash
# Try path traversal in filename
curl -X POST http://localhost:5001/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.jpg;filename=../../../etc/passwd"

# Expected: Filename sanitized
```

**3. XXE (XML External Entity)**

```bash
# Upload SVG with XXE payload
curl -X POST http://localhost:5001/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@xxe.svg"

# Expected: SVG uploads blocked or sanitized
```

**4. File Size Limits**

```bash
# Try to upload oversized file
dd if=/dev/zero of=large.jpg bs=1M count=20
curl -X POST http://localhost:5001/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@large.jpg"

# Expected: 400 Bad Request - File too large
```

---

## Session Management Testing

### Cookie Security

```bash
# Check cookie attributes
curl -I -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestUser123!"}'

# Expected cookie attributes:
# - HttpOnly
# - Secure (in production)
# - SameSite=Strict or Lax
```

### Session Fixation

```bash
# Try to reuse session token across different users
# Expected: Token tied to specific user, cannot be transferred
```

---

## Tools & Automation

### OWASP ZAP

```bash
# Install OWASP ZAP
# Run automated scan
zap-cli quick-scan -s xss,sqli http://localhost:5001

# Run full scan
zap-cli active-scan http://localhost:5001
```

### Burp Suite

1. Configure browser to use Burp proxy
2. Navigate through application
3. Review HTTP history
4. Run active scanner
5. Check for vulnerabilities

### Custom Test Scripts

```bash
# Run comprehensive security tests
node tests/security/comprehensive-test.js

# Test specific vulnerability
node tests/security/test-sql-injection.js
node tests/security/test-xss.js
node tests/security/test-csrf.js
```

### npm Audit

```bash
# Server dependencies
cd server
npm audit --audit-level=moderate

# Client dependencies
cd ../client
npm audit --audit-level=moderate

# Fix vulnerabilities
npm audit fix
```

---

## Reporting

### Vulnerability Report Template

```markdown
# Vulnerability Report

**Title:** [Brief description]
**Severity:** Critical | High | Medium | Low
**CVSS Score:** [If applicable]

## Description
[Detailed description of the vulnerability]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Impact
[Security impact of the vulnerability]

## Proof of Concept
```bash
[Commands or code demonstrating the vulnerability]
```

## Remediation
[Suggested fix]

## References
- [Related CVEs]
- [OWASP guidelines]
```

### Severity Classification

**Critical (9.0-10.0):**
- Remote code execution
- SQL injection allowing data exfiltration
- Authentication bypass

**High (7.0-8.9):**
- Privilege escalation
- Stored XSS
- IDOR allowing sensitive data access

**Medium (4.0-6.9):**
- Reflected XSS
- CSRF
- Information disclosure

**Low (0.1-3.9):**
- Security misconfiguration (minor)
- Missing security headers
- Verbose error messages

---

## Testing Checklist

### Authentication
- [ ] Brute force protection tested
- [ ] Account lockout working
- [ ] Password strength enforced
- [ ] JWT tokens validated properly
- [ ] Token expiration working
- [ ] Session timeout enforced

### Authorization
- [ ] RBAC working correctly
- [ ] Horizontal privilege escalation blocked
- [ ] Vertical privilege escalation blocked
- [ ] IDOR protection verified

### Input Validation
- [ ] SQL injection blocked
- [ ] XSS attempts sanitized
- [ ] Command injection prevented
- [ ] Path traversal blocked
- [ ] NoSQL injection prevented

### API Security
- [ ] Rate limiting enforced
- [ ] CORS properly configured
- [ ] Mass assignment prevented
- [ ] Method tampering blocked

### File Upload
- [ ] File type validation working
- [ ] Magic number verification active
- [ ] File size limits enforced
- [ ] Path traversal in filenames blocked

### Security Headers
- [ ] CSP configured
- [ ] HSTS enabled
- [ ] X-Frame-Options set
- [ ] X-Content-Type-Options set
- [ ] securityheaders.com grade A+

### Audit Logging
- [ ] Security events logged
- [ ] Failed logins tracked
- [ ] Sensitive data not logged
- [ ] Audit logs queryable

---

## Post-Test Actions

1. **Document Findings**
   - Create detailed vulnerability reports
   - Include proof of concepts
   - Provide remediation steps

2. **Prioritize Fixes**
   - Critical: Immediate fix required
   - High: Fix within 1 week
   - Medium: Fix within 1 month
   - Low: Fix in next sprint

3. **Verify Fixes**
   - Re-test after fixes deployed
   - Confirm vulnerability closed
   - Update documentation

4. **Update Security Tests**
   - Add regression tests
   - Update automated security scans
   - Document new attack vectors

---

## Contact

**Security Team:** security@toosila.com
**Bug Bounty:** https://toosila.com/security/bounty

---

**Remember: Always test responsibly. Unauthorized testing is illegal and unethical.**
