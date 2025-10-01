# 🏗️ Iraq Ride-Sharing Web App Architecture

**Stack:**  
- **Frontend:** React 18, React Router, Context API, CSS vars + Tailwind-like utilities, i18n (AR/EN + RTL)  
- **Backend:** Express.js (helmet, cors, rate limiting, morgan, JWT auth)  
- **Database:** PostgreSQL (simple query layer or ORM)  

**Goal:** Solid MVP with offers/requests/bookings + messaging + ratings. Real-time simulated (polling), upgrade later.

---

## 📁 File & Folder Structure

### Frontend — `/client`
```
/client
├─ public/                         # static assets
└─ src/
   ├─ assets/                      # icons, images
   ├─ components/                  # reusable UI
   ├─ contexts/                    # global state providers
   │  ├─ AuthContext.jsx
   │  ├─ OffersContext.jsx
   │  ├─ DemandsContext.jsx
   │  ├─ BookingContext.jsx
   │  ├─ MessagesContext.jsx
   │  ├─ RatingsContext.jsx
   │  └─ LanguageContext.jsx
   ├─ hooks/                       # useAuth, useOffers, etc.
   ├─ i18n/                        # translations + RTL helpers
   ├─ pages/                       # route-level screens
   │  ├─ Home.jsx
   │  ├─ Carpool/
   │  │  ├─ Find.jsx
   │  │  └─ Offer.jsx
   │  ├─ MyRides.jsx
   │  ├─ Messages.jsx
   │  ├─ Profile.jsx
   │  └─ Ratings.jsx
   ├─ router/                      # React Router setup
   │  └─ index.jsx
   ├─ services/                    # API wrappers (axios)
   │  ├─ http.js
   │  ├─ auth.api.js
   │  ├─ offers.api.js
   │  ├─ demands.api.js
   │  ├─ bookings.api.js
   │  ├─ messages.api.js
   │  └─ ratings.api.js
   ├─ styles/                      # global.css, variables
   ├─ utils/                       # helpers (date, currency, validators)
   ├─ App.jsx
   └─ main.jsx
```

### Backend — `/server`
```
/server
├─ config/
│  ├─ db.js                        # pg pool / ORM client
│  └─ env.js                       # loads env vars
├─ middlewares/
│  ├─ auth.js                      # verify JWT
│  ├─ rateLimiters.js              # loginLimiter, apiLimiter
│  ├─ validate.js                  # request validation
│  └─ error.js                     # unified error responses
├─ models/                         # DB access per resource
│  ├─ users.model.js
│  ├─ offers.model.js
│  ├─ demands.model.js
│  ├─ bookings.model.js
│  ├─ messages.model.js
│  └─ ratings.model.js
├─ controllers/                    # request handling logic
│  ├─ auth.controller.js
│  ├─ offers.controller.js
│  ├─ demands.controller.js
│  ├─ bookings.controller.js
│  ├─ messages.controller.js
│  └─ ratings.controller.js
├─ routes/
│  ├─ auth.routes.js
│  ├─ offers.routes.js
│  ├─ demands.routes.js
│  ├─ bookings.routes.js
│  ├─ messages.routes.js
│  └─ ratings.routes.js
├─ utils/
│  ├─ pagination.js
│  ├─ filters.js
│  └─ sanitize.js
├─ app.js                          # app wiring (helmet, cors, routes)
└─ server.js                       # starts HTTP server
```

---

## 🧠 State Management

All existing Contexts **stay as-is**, fetching from backend via `services/`:

- **AuthContext** → user + JWT  
- **OffersContext** → list & filters  
- **DemandsContext** → passenger requests  
- **BookingContext** → create, accept, reject  
- **MessagesContext** → ride-specific chats (polling)  
- **RatingsContext** → submission & cache  
- **LanguageContext** → AR/EN, RTL toggle  

**Pattern:**  
Contexts → call `services/*.api.js` (axios with JWT) → Express routes → Postgres.

---

## 🔗 API Surface

### Auth — `/api/auth`
- `POST /register`
- `POST /login`
- `GET /me`

### Offers — `/api/offers`
- `GET /` (filters + pagination)
- `GET /:id`
- `POST /` (auth)
- `PUT /:id` (auth, owner)
- `DELETE /:id` (auth, owner, soft delete)

### Demands — `/api/demands`
- Same as offers (passenger requests)

### Bookings — `/api/bookings`
- `POST /` (create booking)
- `GET /sent` (my bookings as passenger)
- `GET /received` (bookings on my offers as driver)
- `PUT /:id` (accept/reject/cancel)
- `DELETE /:id` (cancel)

### Messages — `/api/messages`
- `GET /:rideType/:rideId`
- `POST /` → `{ ride_type, ride_id, content }`

### Ratings — `/api/ratings`
- `POST /`
- `GET /user/:id`

---

## 🧩 Data Models (Postgres)

### `users`
- id (UUID, PK)
- name, email (unique), password_hash
- is_driver (bool)
- language_preference
- rating_avg, rating_count (cached)
- created_at, updated_at

### `offers`
- id (UUID, PK)
- driver_id (FK users)
- from_city, to_city
- departure_time (TIMESTAMPTZ)
- seats, price
- is_active (bool)
- created_at, updated_at

### `demands`
- id (UUID, PK)
- passenger_id (FK users)
- from_city, to_city
- earliest_time, latest_time
- seats, budget_max
- is_active (bool)

### `bookings`
- id (UUID, PK)
- offer_id (FK offers)
- passenger_id (FK users)
- status (pending, accepted, rejected, cancelled)
- created_at, updated_at
- Unique: (offer_id, passenger_id)

### `messages`
- id (UUID, PK)
- ride_type (offer|booking)
- ride_id (UUID)
- sender_id (FK users)
- content (text, max 2000)
- created_at

### `ratings`
- id (UUID, PK)
- ride_id
- from_user_id, to_user_id (FK users)
- rating (1–5), comment
- created_at, updated_at
- Unique: (ride_id, from_user_id)

---

## 🔐 Security

- **JWT:** Access token, 2h expiry. `Authorization: Bearer <token>`.  
- **CORS:** Restrict to `http://localhost:3000` in `.env`.  
- **Validation:** `express-validator` or `zod`.  
- **Rate limits:**  
  - Login: 5/min per IP  
  - General API: 120/min per IP  
  - Messages: 300/5min per IP  
- **Error model (unified JSON):**
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "Booking not found"
  }
}
```

---

## ⚙️ Build / Run / Dev Conventions

### Frontend
```bash
cd client
npm install
npm run dev       # vite or CRA
npm run build
```

`.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_DEFAULT_LOCALE=ar
```

### Backend
```bash
cd server
npm install
npm run dev       # nodemon
npm start
```

`.env`:
```
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgres://user:pass@localhost:5432/iraq_rides
JWT_SECRET=replace_me
JWT_EXPIRES_IN=2h
```

---

## 🚦 Next Steps

1. Implement **Postgres migrations** for all tables.  
2. Add **server-side validation** for each POST/PUT.  
3. Connect **contexts → services → routes → DB**.  
4. Add **polling** for `/messages`.  
5. Enforce **one rating per ride**.  

---

## 👉 Suggested Next Prompt

> “Generate SQL migration scripts for Postgres to create all tables (`users`, `offers`, `demands`, `bookings`, `messages`, `ratings`) with PKs, FKs, constraints, indexes, and seed data (2 users, 2 offers, 1 demand, 2 bookings, sample messages, sample ratings).”
