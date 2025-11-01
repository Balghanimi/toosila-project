# 🚗 توصيلة (Toosila) - Iraq Ride-Sharing Platform

A full-stack ride-sharing web application for Iraq with bilingual support (Arabic/English), built with React and Express.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Core Features
- ✅ **User Authentication** - Secure JWT-based registration and login
- ✅ **Ride Offers** - Drivers can post available rides
- ✅ **Ride Requests** - Passengers can post ride demands
- ✅ **Booking System** - Request, accept, reject, and cancel bookings with complete UI
- ✅ **Real-time Notifications** - Pending bookings and unread messages with auto-refresh
- ✅ **Messaging** - Direct messaging between users with conversation threads
- ✅ **Rating System** - Rate and review after completed rides
- ✅ **User Dashboard** - Statistics, quick actions, and recent activity
- ✅ **Advanced Search & Filters** - Price range, seat count, and multiple sorting options
- ✅ **Bilingual Support** - Arabic (RTL) and English
- ✅ **Responsive Design** - Works on desktop and mobile

### Security Features
- 🔒 Helmet security headers
- 🔒 CORS protection
- 🔒 Rate limiting
- 🔒 Input validation
- 🔒 JWT authentication
- 🔒 Password hashing with bcrypt

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router 6** - Client-side routing
- **Context API** - State management
- **CSS3** - Styling with custom properties

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **PostgreSQL** - Database (Neon)
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Development Tools
- **nodemon** - Server auto-reload
- **React Scripts** - Build tools

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn installed
- PostgreSQL database (using Neon cloud database)

### Installation

1. **Clone the repository**
```bash
cd C:\Users\a2z\toosila-project
```

2. **Install Backend Dependencies**
```bash
cd server
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../client
npm install
```

4. **Set up Environment Variables**

Backend `.env` is already configured:
```
PORT=5000
NODE_ENV=development
DATABASE_URL=[Neon PostgreSQL URL]
JWT_SECRET=toosila_super_secret_key_2025_change_this_in_production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

Frontend `.env` is already configured:
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_DEFAULT_LOCALE=ar
```

5. **Initialize Database**
```bash
cd server
node scripts/setup-database.js
```

This will create all necessary tables:
- users
- offers
- demands
- bookings
- messages
- ratings
- categories
- refresh_tokens

6. **Start the Backend Server**
```bash
cd server
npm run dev
```
Backend will run on http://localhost:5000

7. **Start the Frontend (in a new terminal)**
```bash
cd client
npm start
```
Frontend will run on http://localhost:3000

## 📁 Project Structure

```
toosila-project/
├── client/                      # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── Auth/          # Login/Register forms
│   │   │   ├── Chat/          # Chat components
│   │   │   ├── Navegation/    # Header & navigation
│   │   │   ├── BookingModal.js
│   │   │   ├── BottomNav.js
│   │   │   ├── DateTimeSelector.js
│   │   │   └── RatingModal.js
│   │   ├── context/           # React Context providers
│   │   │   ├── AuthContext.js
│   │   │   ├── BookingContext.js
│   │   │   ├── DemandsContext.js
│   │   │   ├── LanguageContext.js
│   │   │   ├── MessagesContext.js
│   │   │   ├── OffersContext.js
│   │   │   └── RatingContext.js
│   │   ├── pages/             # Page components
│   │   │   ├── demands/       # Demand pages
│   │   │   ├── offers/        # Offer pages
│   │   │   ├── Home.js
│   │   │   ├── Messages.js
│   │   │   ├── Profile.js
│   │   │   ├── SimpleTestAPI.jsx
│   │   │   └── [Rating pages]
│   │   ├── services/          # API services
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   └── package.json
│
└── server/                      # Express backend
    ├── config/
    │   ├── db.js               # PostgreSQL connection
    │   └── env.js              # Environment config
    ├── controllers/            # Request handlers
    │   ├── auth.controller.js
    │   ├── bookings.controller.js
    │   ├── demands.controller.js
    │   ├── messages.controller.js
    │   ├── offers.controller.js
    │   └── ratings.controller.js
    ├── middlewares/
    │   ├── auth.js             # JWT verification
    │   ├── error.js            # Error handling
    │   ├── rateLimiters.js     # Rate limiting
    │   └── validate.js         # Input validation
    ├── models/                 # Database models
    │   ├── bookings.model.js
    │   ├── demands.model.js
    │   ├── messages.model.js
    │   ├── offers.model.js
    │   ├── ratings.model.js
    │   └── users.model.js
    ├── routes/                 # API routes
    │   ├── auth.routes.js
    │   ├── bookings.routes.js
    │   ├── demands.routes.js
    │   ├── messages.routes.js
    │   ├── offers.routes.js
    │   └── ratings.routes.js
    ├── scripts/
    │   ├── init-db.sql         # Database schema
    │   └── setup-database.js   # Setup script
    ├── app.js                  # Express app setup
    ├── server.js               # Server entry point
    ├── .env
    └── package.json
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST `/auth/register`
Register a new user
```json
{
  "name": "أحمد محمد",
  "email": "ahmad@example.com",
  "password": "123456",
  "isDriver": false
}
```

#### POST `/auth/login`
Login user
```json
{
  "email": "ahmad@example.com",
  "password": "123456"
}
```

#### GET `/auth/profile`
Get current user profile (requires authentication)

### Offers Endpoints

#### GET `/offers`
Get all offers (with optional filters)
```
Query params: ?from_city=بغداد&to_city=أربيل&is_active=true
```

#### POST `/offers`
Create new offer (requires authentication)
```json
{
  "from_city": "بغداد",
  "to_city": "أربيل",
  "departure_time": "2025-10-03T08:00:00Z",
  "seats": 3,
  "price": 25000
}
```

#### PUT `/offers/:id`
Update offer (requires authentication, owner only)

#### DELETE `/offers/:id`
Delete offer (requires authentication, owner only)

### Demands Endpoints

Similar structure to Offers:
- `GET /demands` - Get all demands
- `POST /demands` - Create demand
- `PUT /demands/:id` - Update demand
- `DELETE /demands/:id` - Delete demand

### Bookings Endpoints

#### POST `/bookings`
Create booking request
```json
{
  "offer_id": "uuid",
  "seats": 2
}
```

#### GET `/bookings/my/bookings`
Get my bookings as passenger

#### GET `/bookings/my/offers`
Get bookings on my offers as driver

#### PUT `/bookings/:id/status`
Update booking status (accept/reject)
```json
{
  "status": "accepted"
}
```

### Messages Endpoints

#### GET `/messages/conversations`
Get list of conversations

#### GET `/messages/conversation/:userId`
Get messages with specific user

#### POST `/messages`
Send message
```json
{
  "ride_type": "offer",
  "ride_id": "uuid",
  "content": "مرحبا"
}
```

### Ratings Endpoints

#### POST `/ratings`
Create rating
```json
{
  "ride_id": "uuid",
  "to_user_id": "uuid",
  "rating": 5,
  "comment": "سائق ممتاز"
}
```

#### GET `/ratings/user/:userId`
Get user ratings

## 🪝 Git Hooks - Automated Testing

This project includes **automated testing** via Git hooks. Tests run automatically before each commit!

### Quick Start
```bash
# Normal commit - tests run automatically
git commit -m "feat: add new feature"

# Skip tests once (if needed)
git commit --no-verify -m "WIP: work in progress"

# Skip tests always (not recommended)
export SKIP_TESTS_ON_COMMIT=1  # Linux/Mac
$env:SKIP_TESTS_ON_COMMIT = "1"  # PowerShell
```

### What Gets Tested?
- ✅ Backend tests (Jest)
- ✅ Frontend tests (React Testing Library)

### Options
```bash
# Test backend only
export TEST_MODE=backend

# Test frontend only
export TEST_MODE=frontend
```

📖 **Full Guide**: See [GIT-HOOKS-GUIDE.md](GIT-HOOKS-GUIDE.md) for complete documentation

---

## 🧪 Testing the Application

### 1. Test API Connection
Navigate to: http://localhost:3000/test-api

This page allows you to:
- Test user registration
- Test user login
- Verify backend connection

### 2. Test User Flow

#### As a Passenger:
1. Register new account (userType: passenger)
2. Go to Home → Switch to "Find Ride"
3. Click "View Offers" to see available rides
4. Book a ride
5. Check Messages for communication
6. After ride completion, rate the driver

#### As a Driver:
1. Register new account (userType: driver)
2. Go to Home → Switch to "Offer Ride"
3. Click "Post Offer" to create a ride
4. View booking requests on your offers
5. Accept/Reject bookings
6. Check Messages
7. After ride completion, rate passengers

## 🐛 Troubleshooting

### Backend Issues

**Problem: Server won't start**
- Check if PORT 5000 is already in use
- Verify `.env` file exists in server directory
- Run `npm install` in server directory

**Problem: Database connection fails**
- Check DATABASE_URL in `.env`
- Verify Neon database is accessible
- Run database setup: `node scripts/setup-database.js`

**Problem: "JWT must be provided" error**
- Clear localStorage in browser
- Re-login to get new token
- Check Authorization header is being sent

### Frontend Issues

**Problem: API calls fail with CORS error**
- Check CORS_ORIGIN in server `.env` matches frontend URL
- Verify backend is running on correct port
- Check browser console for actual error

**Problem: "Cannot read property of undefined" errors**
- Check if user is logged in
- Verify context providers are wrapping components correctly
- Check API response format matches expected structure

**Problem: Styles not loading**
- Check `index.css` is imported in `index.js`
- Clear browser cache
- Verify CSS custom properties are defined

### Common Issues

**Problem: Page is blank**
- Check browser console for errors
- Verify all dependencies are installed (`npm install`)
- Check React Router routes are configured correctly

**Problem: Authentication not persisting**
- Check localStorage has `token` and `currentUser`
- Verify token hasn't expired
- Check AuthContext is properly set up

**Problem: Arabic text not displaying correctly**
- Verify `direction: rtl` is set
- Check font supports Arabic characters
- Verify language context is working

## 📝 Development Notes

### Adding New Features

1. **Backend**:
   - Add model in `models/`
   - Add controller in `controllers/`
   - Add routes in `routes/`
   - Add validation in `middlewares/validate.js`

2. **Frontend**:
   - Add API functions in `services/api.js`
   - Create context in `context/` if needed
   - Add page in `pages/`
   - Add route in `App.js`

### Database Migrations

To add new tables or modify schema:
1. Update `scripts/init-db.sql`
2. Run `node scripts/setup-database.js`

### Environment Variables

Never commit `.env` files with real credentials!
Use `.env.example` for documentation.

## 🚀 Production Deployment

### Quick Deploy (30 minutes)
See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for rapid deployment guide.

### Complete Deployment Guide
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step instructions including:
- Server setup (Ubuntu/CentOS)
- Database configuration
- Nginx setup
- SSL/HTTPS with Let's Encrypt
- PM2 process management
- Monitoring and maintenance
- Cloud platform alternatives (Heroku, Railway, DigitalOcean)

### Security Checklist
See [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) before deploying to production.

### Files Created for Deployment
- `server/.env.example` - Template for environment variables
- `server/.env.production` - Production environment template
- `client/.env.example` - Frontend environment template
- `client/.env.production` - Frontend production template
- `nginx.conf` - Nginx configuration file
- `ecosystem.config.js` - PM2 cluster configuration
- `package.json` - Root package with deployment scripts

## 📄 License

This project is private and proprietary.

## 👥 Support

For issues or questions, contact the development team.

---

**Last Updated:** October 2, 2025
**Version:** 1.0.0
