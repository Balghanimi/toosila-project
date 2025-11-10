# Admin Panel - توصيلة (Toosila)

## Overview

Professional admin panel for managing the Toosila ride-sharing platform with comprehensive user management, verification, and analytics features.

## Features

### 1. Dashboard (`/admin`)

- **Real-time Statistics**: Overview of bookings, verifications, offers, demands, ratings, and messages
- **Quick Actions**: Direct access to pending verifications and user management
- **Visual Stats Cards**: Color-coded statistics with gradients and icons

### 2. User Management (`/admin/users`)

- **User Listing**: Paginated table of all users
- **Advanced Filters**: Filter by role, driver/passenger status, active/inactive
- **Search**: Find users by name or email
- **User Actions**: Deactivate users (admins cannot be deactivated)
- **User Details**: View avatar, name, email, type, role, status, and registration date

### 3. Verification Management (`/admin/verification`)

- **Pending Verifications**: Grid view of all pending verification documents
- **Document Preview**: View uploaded verification documents
- **Approve/Reject**: One-click approval or rejection with reason
- **User Context**: See user details for each verification request

### 4. Statistics (`/admin/statistics`)

- **Detailed Analytics**: Comprehensive breakdown of all platform metrics
- **Bookings Analysis**: Total, pending, confirmed, completed, and cancelled
- **Verification Stats**: Pending, approved, and rejected counts
- **Offers & Demands**: Active and total counts
- **Ratings Analytics**: Total ratings, average rating, distribution
- **Messages Metrics**: Total, daily, and weekly message counts

## Access Control

### How to Access

1. **Login**: Sign in with an admin account
2. **Navigate**: Click on your user menu (top right)
3. **Admin Panel**: Click on "لوحة الإدارة" (Admin Panel) button
4. **Direct URL**: Navigate to `/admin`

### Creating Admin Users

Admin users must be created in the database:

```sql
-- Set a user as admin
UPDATE users SET role = 'admin' WHERE email = 'admin@toosila.com';
```

Possible roles:

- `user` - Regular user (default)
- `admin` - Full admin access
- `moderator` - Moderation access (future feature)

### Security

- **Route Guards**: All admin routes protected by `AdminRoute` component
- **JWT Authentication**: Token-based authentication with role verification
- **Auto-redirect**: Non-admin users automatically redirected to home page

## Technical Architecture

### Components

```
client/src/
├── components/
│   └── Admin/
│       ├── AdminRoute.jsx        # Route guard component
│       ├── AdminLayout.jsx       # Main layout with sidebar
│       └── AdminLayout.css       # Professional styling
└── pages/
    └── admin/
        ├── AdminDashboard.js          # Main dashboard
        ├── UserManagement.js          # User management page
        ├── VerificationManagement.js  # Verification page
        └── AdminStatistics.js         # Detailed stats page
```

### API Integration

```javascript
// services/api.js - adminAPI object
adminAPI.getAllUsers(page, limit, filters);
adminAPI.getUserById(userId);
adminAPI.deactivateUser(userId);
adminAPI.getPendingVerifications(page, limit);
adminAPI.approveVerification(docId);
adminAPI.rejectVerification(docId, reason);
adminAPI.getBookingStats();
adminAPI.getRatingStats();
// ... and more
```

### Routing

```javascript
// App.js
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  }
>
  <Route index element={<AdminDashboard />} />
  <Route path="users" element={<UserManagement />} />
  <Route path="verification" element={<VerificationManagement />} />
  <Route path="statistics" element={<AdminStatistics />} />
</Route>
```

## Design System

### Layout

- **Fixed Sidebar**: Professional dark-themed navigation (280px / 80px collapsed)
- **Main Content**: Responsive content area with top bar
- **RTL Support**: Full right-to-left Arabic layout

### Colors

- **Primary**: Green gradient (success/active states)
- **Warning**: Orange (pending/attention needed)
- **Error**: Red (danger/delete actions)
- **Info**: Blue (informational stats)
- **Neutral**: Slate gray (general content)

### Typography

- **Font Family**: Cairo (Arabic optimized)
- **Headings**: Bold 700-800 weight
- **Body**: 400-600 weight
- **Sizes**: Responsive with CSS variables

### Components

- Professional UI components from `components/UI`
- Card, Button, Badge, Input, Alert
- Custom admin-specific styling
- Hover effects and animations

## Backend Requirements

The admin panel expects these backend endpoints:

### User Management

- `GET /api/auth/users?page={page}&limit={limit}` - Get all users
- `GET /api/auth/users/:id` - Get user by ID
- `PUT /api/auth/users/:id/deactivate` - Deactivate user

### Verification Management

- `GET /api/verification/admin/pending?page={page}&limit={limit}` - Get pending
- `GET /api/verification/admin/document/:id` - Get document
- `POST /api/verification/admin/approve/:id` - Approve
- `POST /api/verification/admin/reject/:id` - Reject (with reason)
- `GET /api/verification/admin/stats` - Get stats
- `GET /api/verification/admin/audit/:userId` - Get audit log

### Statistics

- `GET /api/bookings/admin/stats` - Booking statistics
- `GET /api/ratings/admin/stats` - Rating statistics
- `GET /api/offers/admin/stats` - Offer statistics
- `GET /api/demands/admin/stats` - Demand statistics
- `GET /api/messages/admin/stats` - Message statistics

All endpoints require:

- JWT Bearer token in Authorization header
- User role = 'admin' (verified by backend middleware)

## Future Enhancements

### Planned Features

- [ ] Activity logs and audit trail
- [ ] User communication (send messages/notifications)
- [ ] Report generation (PDF/Excel exports)
- [ ] Advanced analytics with charts
- [ ] Moderator role support
- [ ] Content moderation tools
- [ ] System settings configuration
- [ ] Email templates management
- [ ] Real-time notifications
- [ ] Advanced search and filters

### Performance

- [ ] Virtual scrolling for large tables
- [ ] Caching for statistics
- [ ] Lazy loading for images
- [ ] Optimistic UI updates

## Support

For issues or questions:

- Check backend logs for API errors
- Verify admin role in database
- Ensure all backend endpoints are implemented
- Check browser console for client-side errors

## License

Part of the Toosila (توصيلة) ride-sharing platform.
