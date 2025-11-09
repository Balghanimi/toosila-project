# Toosila API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [Rate Limiting](#rate-limiting)
5. [API Endpoints](#api-endpoints)
6. [Error Handling](#error-handling)
7. [Code Examples](#code-examples)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Welcome to the **Toosila API Documentation**. Toosila is a modern ride-sharing platform for Iraq, connecting drivers and passengers for inter-city travel.

### Base URL
- **Production**: `https://toosila-production.up.railway.app/api`
- **Development**: `http://localhost:3000/api`

### API Version
Current Version: **v1.0.0**

### Interactive Documentation
Access the interactive Swagger UI documentation at:
- **Production**: `https://toosila-production.up.railway.app/api-docs`
- **Development**: `http://localhost:3000/api-docs`

---

## Getting Started

### Prerequisites
- Node.js 18+ (for development)
- Valid email address for account registration
- JWT token for authenticated endpoints

### Quick Start Guide

#### 1. Register a New Account
```bash
curl -X POST https://toosila-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "password": "SecurePass123!",
    "isDriver": false,
    "languagePreference": "ar"
  }'
```

#### 2. Verify Your Email
Check your email inbox for the verification link and click it to verify your account.

#### 3. Login
```bash
curl -X POST https://toosila-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "SecurePass123!"
  }'
```

You'll receive a JWT token in the response. Use this token for all authenticated requests.

#### 4. Make Authenticated Requests
```bash
curl -X GET https://toosila-production.up.railway.app/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Authentication

### JWT Bearer Token

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Obtaining a Token

1. **Register** a new account at `/api/auth/register`
2. **Verify** your email address
3. **Login** at `/api/auth/login` to receive your JWT token

### Token Expiration

- Access tokens are valid for **24 hours**
- After expiration, you must login again to obtain a new token

### Security Best Practices

- Never share your JWT token
- Store tokens securely (use environment variables, secure storage)
- Always use HTTPS in production
- Implement token refresh logic in your client applications

---

## Rate Limiting

To ensure fair usage and prevent abuse, the Toosila API implements rate limiting on various endpoints.

### General Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authentication (`/api/auth/login`, `/api/auth/register`) | 5 requests | 15 minutes |
| Password Reset | 3 requests | 15 minutes |
| Content Creation (offers, demands) | 10 requests | 15 minutes |
| General API | 100 requests | 15 minutes |

### Rate Limit Headers

Each API response includes rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699564800
```

### Handling Rate Limits

When you exceed the rate limit, the API returns:

**Status Code**: `429 Too Many Requests`

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |
| DELETE | `/api/auth/delete-account` | Delete account | Yes |

### Ride Offers Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/offers` | Get all offers | No |
| GET | `/api/offers/search` | Search offers | No |
| GET | `/api/offers/:id` | Get offer by ID | No |
| POST | `/api/offers` | Create new offer | Yes (Driver) |
| PUT | `/api/offers/:id` | Update offer | Yes (Owner) |
| PUT | `/api/offers/:id/deactivate` | Deactivate offer | Yes (Owner) |
| GET | `/api/offers/my/offers` | Get my offers | Yes |

### Ride Demands Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/demands` | Get all demands | No |
| GET | `/api/demands/search` | Search demands | No |
| GET | `/api/demands/:id` | Get demand by ID | Yes |
| POST | `/api/demands` | Create new demand | Yes |
| PUT | `/api/demands/:id` | Update demand | Yes (Owner) |
| PUT | `/api/demands/:id/deactivate` | Deactivate demand | Yes (Owner) |
| GET | `/api/demands/my/demands` | Get my demands | Yes |

### Booking Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bookings` | Create booking | Yes |
| GET | `/api/bookings` | Get all bookings | Yes |
| GET | `/api/bookings/:id` | Get booking by ID | Yes |
| PUT | `/api/bookings/:id/status` | Update booking status | Yes |
| PUT | `/api/bookings/:id/cancel` | Cancel booking | Yes |
| GET | `/api/bookings/my/bookings` | Get my bookings | Yes |

### Messaging Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/messages` | Send message | Yes |
| GET | `/api/messages/inbox` | Get inbox | Yes |
| GET | `/api/messages/conversation/:userId` | Get conversation | Yes |
| GET | `/api/messages/unread-count` | Get unread count | Yes |
| PUT | `/api/messages/:id/read` | Mark as read | Yes |

### Rating Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/ratings` | Create rating | Yes |
| GET | `/api/ratings` | Get all ratings | No |
| GET | `/api/ratings/user/:userId` | Get user ratings | No |
| GET | `/api/ratings/user/:userId/average` | Get average rating | No |
| PUT | `/api/ratings/:id` | Update rating | Yes (Owner) |

### Notification Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get notifications | Yes |
| GET | `/api/notifications/unread-count` | Get unread count | Yes |
| PATCH | `/api/notifications/:id/read` | Mark as read | Yes |
| PATCH | `/api/notifications/mark-all-read` | Mark all as read | Yes |
| DELETE | `/api/notifications/:id` | Delete notification | Yes |

---

## Error Handling

### Standard Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": []
  }
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing authentication token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Common Error Codes

| Error Code | Description |
|------------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `INVALID_CREDENTIALS` | Invalid email or password |
| `USER_EXISTS` | Email already registered |
| `EMAIL_NOT_VERIFIED` | Email verification required |
| `UNAUTHORIZED` | Invalid or expired token |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

### Error Examples

#### Validation Error (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

#### Authentication Error (401)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

#### Not Found Error (404)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Offer not found"
  }
}
```

---

## Code Examples

### JavaScript (Fetch API)

#### Register User
```javascript
const registerUser = async (userData) => {
  try {
    const response = await fetch('https://toosila-production.up.railway.app/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        password: 'SecurePass123!',
        isDriver: false,
        languagePreference: 'ar'
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('Registration successful:', data.data);
    } else {
      console.error('Registration failed:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

#### Login and Get Profile
```javascript
const loginAndGetProfile = async (email, password) => {
  try {
    // Login
    const loginResponse = await fetch('https://toosila-production.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const loginData = await loginResponse.json();

    if (!loginData.success) {
      throw new Error(loginData.error.message);
    }

    const token = loginData.data.token;

    // Get Profile
    const profileResponse = await fetch('https://toosila-production.up.railway.app/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const profileData = await profileResponse.json();

    if (profileData.success) {
      console.log('User profile:', profileData.data);
      return profileData.data;
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

#### Search for Rides
```javascript
const searchRides = async (origin, destination, date) => {
  try {
    const params = new URLSearchParams({
      origin,
      destination,
      date,
      page: 1,
      limit: 10
    });

    const response = await fetch(
      `https://toosila-production.up.railway.app/api/offers/search?${params}`
    );

    const data = await response.json();

    if (data.success) {
      console.log('Found rides:', data.data);
      console.log('Pagination:', data.pagination);
      return data.data;
    }
  } catch (error) {
    console.error('Search error:', error);
  }
};

// Usage
searchRides('بغداد', 'البصرة', '2025-11-15');
```

#### Create a Booking
```javascript
const createBooking = async (offerId, seats, message, token) => {
  try {
    const response = await fetch('https://toosila-production.up.railway.app/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        offerId,
        seats,
        message
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('Booking created:', data.data);
      return data.data;
    } else {
      console.error('Booking failed:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

### cURL Examples

#### Create Ride Offer
```bash
curl -X POST https://toosila-production.up.railway.app/api/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "origin": "بغداد",
    "destination": "البصرة",
    "departureTime": "2025-11-15T08:00:00Z",
    "availableSeats": 3,
    "pricePerSeat": 50000,
    "vehicleType": "سيدان",
    "vehicleModel": "Toyota Camry 2020",
    "notes": "رحلة مريحة مع مكيف"
  }'
```

#### Search Demands
```bash
curl -X GET "https://toosila-production.up.railway.app/api/demands/search?origin=أربيل&destination=السليمانية&page=1&limit=10"
```

#### Send Message
```bash
curl -X POST https://toosila-production.up.railway.app/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "receiverId": "recipient-user-id",
    "content": "مرحبا، هل الرحلة متاحة؟"
  }'
```

### Python Example
```python
import requests
import json

# Base URL
BASE_URL = "https://toosila-production.up.railway.app/api"

# Register user
def register_user(name, email, password):
    url = f"{BASE_URL}/auth/register"
    payload = {
        "name": name,
        "email": email,
        "password": password,
        "isDriver": False,
        "languagePreference": "ar"
    }

    response = requests.post(url, json=payload)
    return response.json()

# Login
def login(email, password):
    url = f"{BASE_URL}/auth/login"
    payload = {
        "email": email,
        "password": password
    }

    response = requests.post(url, json=payload)
    data = response.json()

    if data['success']:
        return data['data']['token']
    else:
        raise Exception(data['error']['message'])

# Get offers with authentication
def get_offers(token, page=1, limit=10):
    url = f"{BASE_URL}/offers"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    params = {
        "page": page,
        "limit": limit
    }

    response = requests.get(url, headers=headers, params=params)
    return response.json()

# Usage
try:
    # Register
    registration = register_user("أحمد محمد", "ahmed@example.com", "SecurePass123!")
    print("Registration:", registration)

    # Login
    token = login("ahmed@example.com", "SecurePass123!")
    print("Token:", token)

    # Get offers
    offers = get_offers(token)
    print("Offers:", offers)

except Exception as e:
    print(f"Error: {e}")
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Invalid or expired token" Error

**Problem**: Getting 401 Unauthorized error

**Solutions**:
- Verify your token hasn't expired (24-hour validity)
- Ensure you're including `Bearer` prefix: `Authorization: Bearer YOUR_TOKEN`
- Login again to get a fresh token
- Check for extra spaces or formatting issues in the Authorization header

#### 2. "Email verification required" Error

**Problem**: Cannot create offers/demands

**Solutions**:
- Check your email inbox for verification link
- Request a new verification email at `/api/email-verification/resend`
- Check spam folder for verification email
- Ensure email was sent successfully during registration

#### 3. Rate Limit Exceeded

**Problem**: Getting 429 Too Many Requests

**Solutions**:
- Wait for the rate limit window to reset (check `X-RateLimit-Reset` header)
- Implement exponential backoff in your client
- Cache responses when possible
- Batch operations if applicable

#### 4. Validation Errors

**Problem**: Getting 400 Bad Request with validation details

**Solutions**:
- Check the `error.details` array for specific field errors
- Ensure all required fields are provided
- Verify data types match the API specification
- Check field length constraints (e.g., password min 8 characters)

#### 5. CORS Errors (Web Browsers)

**Problem**: CORS policy blocking requests

**Solutions**:
- Ensure you're using the correct API URL
- Include credentials in your fetch/axios configuration
- Server already has CORS enabled for all origins
- Check browser console for specific CORS error messages

#### 6. Database/Server Errors (500)

**Problem**: Internal Server Error

**Solutions**:
- Retry the request after a short delay
- Check API status/health endpoint: `/api/health`
- If persistent, contact support with request details
- Verify all required fields are in correct format

### Getting Help

If you encounter issues not covered here:

1. **Check Swagger Docs**: Visit `/api-docs` for detailed endpoint documentation
2. **Review Error Codes**: Check the error code and message for specific guidance
3. **Test with cURL**: Isolate issues by testing with simple cURL commands
4. **Contact Support**: Email support@toosila.com with:
   - Endpoint URL
   - Request payload
   - Error response
   - Timestamp of the request

### Health Check

Monitor API status:
```bash
curl https://toosila-production.up.railway.app/api/health
```

Response:
```json
{
  "ok": true,
  "timestamp": "2025-11-09T10:30:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "uptime": "86400 seconds"
}
```

---

## Best Practices

### 1. Error Handling
Always check the `success` field in responses:
```javascript
if (data.success) {
  // Handle success
} else {
  // Handle error using data.error
}
```

### 2. Pagination
Use pagination for list endpoints to improve performance:
```javascript
const params = {
  page: 1,
  limit: 20  // Reasonable page size
};
```

### 3. Token Storage
- **Web**: Use httpOnly cookies or secure localStorage
- **Mobile**: Use platform-specific secure storage (Keychain, KeyStore)
- **Never**: Hardcode tokens or commit them to version control

### 4. Request Optimization
- Cache static data (cities, categories)
- Implement debouncing for search queries
- Use conditional requests with ETags
- Batch multiple operations when possible

### 5. Security
- Always use HTTPS in production
- Validate and sanitize user input
- Implement proper token refresh logic
- Handle sensitive data securely

---

## Changelog

### Version 1.0.0 (2025-11-09)
- Initial API release
- Complete Swagger/OpenAPI documentation
- Authentication system with JWT
- Ride offers and demands management
- Booking system
- Messaging functionality
- Rating and review system
- Email verification
- Password reset functionality

---

## Support

For additional support or questions:

- **Email**: support@toosila.com
- **Documentation**: [/api-docs](https://toosila-production.up.railway.app/api-docs)
- **GitHub**: [Toosila Project Repository]

---

**Last Updated**: November 9, 2025
**API Version**: 1.0.0
