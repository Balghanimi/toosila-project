# Uber Clone Backend API

A comprehensive backend API for the Uber Clone ride-sharing application built with Node.js and Express.

## 🚀 Features

- **User Authentication**: JWT-based authentication with registration and login
- **Offers Management**: Create, read, update, delete ride offers
- **Demands Management**: Create, read, update, delete ride demands
- **Messaging System**: Real-time messaging between users
- **Booking System**: Complete booking workflow with status tracking
- **Rating System**: Rate and review system for users
- **Security**: Rate limiting, CORS, helmet security headers
- **Validation**: Input validation and error handling

## 📋 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /logout` - Logout user

### Offers (`/api/offers`)
- `POST /` - Create new offer
- `GET /` - Get all offers (with filtering)
- `GET /:id` - Get offer by ID
- `PUT /:id` - Update offer
- `DELETE /:id` - Delete offer
- `GET /my/offers` - Get user's offers

### Demands (`/api/demands`)
- `POST /` - Create new demand
- `GET /` - Get all demands (with filtering)
- `GET /:id` - Get demand by ID
- `PUT /:id` - Update demand
- `DELETE /:id` - Delete demand
- `GET /my/demands` - Get user's demands

### Messages (`/api/messages`)
- `POST /` - Send message
- `GET /conversation/:tripId/:otherUserId` - Get conversation
- `GET /conversations` - Get all conversations
- `PUT /read` - Mark messages as read
- `GET /unread-count` - Get unread count
- `GET /search` - Search messages

### Bookings (`/api/bookings`)
- `POST /` - Create booking request
- `GET /` - Get user's bookings
- `GET /:id` - Get booking by ID
- `PUT /:id/accept` - Accept booking (driver)
- `PUT /:id/reject` - Reject booking (driver)
- `PUT /:id/cancel` - Cancel booking
- `PUT /:id/complete` - Complete booking
- `GET /driver/pending` - Get pending requests (driver)

### Ratings (`/api/ratings`)
- `POST /` - Create rating
- `GET /user/:userId` - Get user's ratings
- `GET /` - Get all ratings (with filtering)
- `GET /:id` - Get rating by ID
- `PUT /:id` - Update rating
- `DELETE /:id` - Delete rating
- `GET /stats/overview` - Get rating statistics

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
```bash
   # Development
   npm run dev
   
   # Production
npm start
```

## 🔧 Configuration

### Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `JWT_SECRET` - JWT secret key

### Rate Limiting

- 100 requests per 15 minutes per IP
- Configurable via environment variables

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Validate all inputs
- **JWT Authentication**: Secure token-based auth

## 📊 Data Models

### User
```javascript
{
  id: number,
  name: string,
  phone: string,
  userType: 'passenger' | 'driver',
  createdAt: string,
  isActive: boolean,
  rating: number,
  totalRides: number
}
```

### Offer
```javascript
{
  id: number,
  driverId: number,
  pickupLocation: string,
  dropLocation: string,
  date: string,
  time: string,
  price: number,
  seats: number,
  availableSeats: number,
  status: 'active' | 'completed' | 'cancelled'
}
```

### Demand
```javascript
{
  id: number,
  passengerId: number,
  pickupLocation: string,
  dropLocation: string,
  date: string,
  time: string,
  maxPrice: number,
  passengers: number,
  status: 'active' | 'completed' | 'cancelled'
}
```

### Message
```javascript
{
  id: number,
  senderId: number,
  receiverId: number,
  tripId: string,
  content: string,
  timestamp: string,
  read: boolean,
  status: 'sent' | 'delivered' | 'read'
}
```

### Booking
```javascript
{
  id: number,
  passengerId: number,
  driverId: number,
  tripId: string,
  tripType: 'offer' | 'demand',
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed',
  tripInfo: object,
  passengerInfo: object,
  paymentStatus: 'pending' | 'paid' | 'refunded'
}
```

### Rating
```javascript
{
  id: number,
  raterId: number,
  ratedUserId: number,
  rating: number, // 1-5
  comment: string,
  tripId: string,
  userType: 'passenger' | 'driver'
}
```

## 🚀 Deployment

### Production Setup

1. **Set environment variables:**
   ```bash
   NODE_ENV=production
   JWT_SECRET=your-production-secret
   FRONTEND_URL=https://your-frontend-domain.com
   ```

2. **Start with PM2:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "uberclone-api"
   ```

3. **Use reverse proxy (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-api-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 🔄 Future Enhancements

- **Database Integration**: MongoDB/PostgreSQL
- **Real-time Features**: WebSocket/Socket.io
- **File Upload**: Profile pictures, documents
- **Email/SMS**: Notifications
- **Payment Gateway**: Stripe integration
- **Push Notifications**: Mobile notifications
- **Analytics**: Usage statistics
- **Admin Panel**: Management interface

## 📝 API Documentation

For detailed API documentation, visit `/api-docs` when running the server (if Swagger is integrated).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.