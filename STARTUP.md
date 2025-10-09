# 🚀 Quick Startup Guide - Toosila App

## ⚡ Fast Track (3 Steps)

### Step 1: Setup Database (One-time only)
Open terminal in project root:
```bash
cd server
node scripts/setup-database.js
```

Expected output:
```
🔄 Setting up database schema...
✅ Database schema setup completed successfully!
📊 Tables created:
   - users
   - categories
   - demands
   - offers
   - bookings
   - messages
   - ratings
   - refresh_tokens
```

### Step 2: Start Backend Server
Keep terminal open and run:
```bash
npm run dev
```

Expected output:
```
✅ Connected to PostgreSQL database
Server running on http://localhost:5000
```

### Step 3: Start Frontend (New Terminal)
Open a NEW terminal:
```bash
cd client
npm start
```

Browser will automatically open at http://localhost:3000

---

## 📖 First Time Testing

### Test 1: Verify Connection
1. Go to http://localhost:3000/test-api
2. Click "اختبار التسجيل" (Test Registration)
3. Should see success message with user details
4. Click "اختبار تسجيل الدخول" (Test Login)
5. Should see success with JWT token

✅ If both work → Backend and Frontend are connected!

### Test 2: Create Driver Account
1. Go to Home page
2. Click Register (if not using test API)
3. Fill form:
   - Name: أحمد السائق
   - Email: driver@test.com
   - Password: 123456
   - User Type: **Driver** (سائق)
4. Click Register

### Test 3: Create Passenger Account
1. Logout (if logged in)
2. Register new account:
   - Name: علي الراكب
   - Email: passenger@test.com
   - Password: 123456
   - User Type: **Passenger** (راكب)

### Test 4: Post a Ride Offer (as Driver)
1. Login as driver@test.com
2. On Home page, select "Offer Ride" (عرض رحلة)
3. Click "Post Offer" button
4. Fill the form:
   - From: بغداد - الكرخ
   - To: أربيل - المركز
   - Date: Tomorrow
   - Time: 08:00 AM
   - Seats: 3
   - Price: 25000
5. Submit

### Test 5: Book a Ride (as Passenger)
1. Logout and login as passenger@test.com
2. On Home page, select "Find Ride" (البحث عن رحلة)
3. Click "View Offers"
4. See the ride posted by driver
5. Click "Book" button
6. Enter number of seats
7. Confirm booking

### Test 6: Accept Booking (as Driver)
1. Logout and login as driver@test.com
2. Go to "My Rides" or check notifications
3. See pending booking request
4. Click "Accept"

### Test 7: Send Message
1. From booking details, click "Message"
2. Type message and send
3. Check Messages page to see conversation

### Test 8: Rate User
1. After ride is completed
2. Go to completed rides
3. Click "Rate"
4. Give rating (1-5 stars) and comment
5. Submit

---

## 🔍 Checking If Everything Works

### Backend Health Check
Visit: http://localhost:5000/api/health

Should see:
```json
{
  "ok": true,
  "timestamp": "2025-10-02T20:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

### Check Database Tables
In your database management tool (or Neon console), verify these tables exist:
- ✅ users
- ✅ offers
- ✅ demands
- ✅ bookings
- ✅ messages
- ✅ ratings
- ✅ categories
- ✅ refresh_tokens

### Check Browser Console
Open Developer Tools (F12) → Console
Should NOT see:
- ❌ CORS errors
- ❌ 404 errors
- ❌ Network errors

Should see:
- ✅ API requests succeeding (200 status)
- ✅ Responses with data

---

## 🐛 Common Problems & Solutions

### Problem: "Cannot connect to database"
**Solution:**
1. Check `.env` file in server directory exists
2. Verify DATABASE_URL is correct
3. Check Neon database is active and accessible
4. Try running setup script again: `node scripts/setup-database.js`

### Problem: "Port 5000 already in use"
**Solution:**
1. Close other apps using port 5000
2. Or change PORT in server/.env to 5001
3. Update REACT_APP_API_BASE_URL in client/.env accordingly

### Problem: "CORS error" in browser
**Solution:**
1. Check CORS_ORIGIN in server/.env matches http://localhost:3000
2. Restart backend server after changing .env
3. Clear browser cache

### Problem: "JWT must be provided"
**Solution:**
1. User needs to login first
2. Check if token is in localStorage:
   - Open DevTools → Application → Local Storage
   - Check for 'token' key
3. If missing, login again

### Problem: "Table does not exist"
**Solution:**
1. Run database setup: `node scripts/setup-database.js`
2. Check Neon console to verify tables were created
3. Check for SQL errors in console output

### Problem: Frontend shows blank page
**Solution:**
1. Check browser console for errors
2. Verify all dependencies installed: `npm install`
3. Clear browser cache
4. Restart frontend: `npm start`

### Problem: "Module not found" errors
**Solution:**
```bash
# In server directory
cd server
npm install

# In client directory
cd client
npm install
```

---

## 📊 Development Workflow

### Daily Development Routine

1. **Start servers** (2 terminals):
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

2. **Make changes** to code

3. **Changes auto-reload:**
   - Backend: nodemon auto-restarts
   - Frontend: React auto-refreshes browser

4. **Test changes** in browser

5. **Stop servers when done:**
   - Press `Ctrl+C` in both terminals

### When to Restart Backend
Restart backend (Ctrl+C, then `npm run dev`) when you:
- Change `.env` file
- Modify middleware
- Change database connection
- Install new npm packages

### When to Restart Frontend
Usually auto-reloads, but restart if:
- Install new npm packages
- Change `.env` file
- Strange caching issues

---

## 🎯 Feature Testing Checklist

Use this to test all features work:

### Authentication
- [ ] Register new user (passenger)
- [ ] Register new user (driver)
- [ ] Login with email/password
- [ ] Logout
- [ ] View profile
- [ ] Edit profile

### Offers (Driver)
- [ ] Create ride offer
- [ ] View my offers
- [ ] Edit offer
- [ ] Delete offer
- [ ] View all offers

### Demands (Passenger)
- [ ] Create ride request
- [ ] View my demands
- [ ] Edit demand
- [ ] Delete demand
- [ ] View all demands

### Bookings
- [ ] Passenger: Request booking on offer
- [ ] Driver: See booking requests
- [ ] Driver: Accept booking
- [ ] Driver: Reject booking
- [ ] Passenger: Cancel booking
- [ ] View booking history

### Messages
- [ ] Send message to another user
- [ ] Receive message
- [ ] View conversation history
- [ ] Mark messages as read
- [ ] See unread count

### Ratings
- [ ] Rate driver after ride
- [ ] Rate passenger after ride
- [ ] View ratings received
- [ ] View user's rating average
- [ ] See rating stats

---

## 💡 Pro Tips

### Faster Development
1. Keep both terminals visible side-by-side
2. Use browser DevTools (F12) constantly
3. Check Network tab to see API calls
4. Check Console tab for errors

### Testing Multiple Users
1. Use different browsers for different users:
   - Chrome: driver@test.com
   - Firefox: passenger@test.com
2. Or use Incognito/Private windows
3. Or clear localStorage between tests

### Database Management
- Use Neon console to view/edit data directly
- Keep backup of test data
- Reset database by running setup script again

### Quick Reset
To start fresh:
```bash
# Reset database
cd server
node scripts/setup-database.js

# Clear browser data
# DevTools → Application → Clear Storage → Clear site data
```

---

## 📞 Need Help?

### Check These First:
1. Backend console for server errors
2. Browser console for frontend errors
3. Network tab for API failures
4. README.md for detailed docs

### Debug Checklist:
- [ ] Backend server running? (http://localhost:5000/api/health)
- [ ] Frontend server running? (http://localhost:3000)
- [ ] Database connected? (check backend console)
- [ ] .env files exist and correct?
- [ ] npm install ran in both directories?
- [ ] Browser console clear of errors?

---

**Happy Coding! 🎉**

Last updated: October 2, 2025
