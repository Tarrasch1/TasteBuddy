# TasteBuddy - Backend API Design

## 1. API Overview

- **Base URL**: `https://api.tastebuddy.app/v1`
- **Protocol**: HTTPS only
- **Format**: JSON
- **Authentication**: JWT Bearer tokens
- **Rate Limiting**: 100 requests/minute (general), 10 requests/minute (auth)

## 2. Authentication Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-Request-ID: <uuid>
X-Device-ID: <device_uuid>
X-App-Version: 1.0.0
X-Platform: ios|android|web
```

## 3. Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasMore": true
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

## 4. API Endpoints

### 4.1 Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login with email/password | No |
| POST | `/auth/logout` | Logout, invalidate tokens | Yes |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| POST | `/auth/verify-email` | Verify email address | No |
| POST | `/auth/google` | OAuth with Google | No |
| POST | `/auth/apple` | OAuth with Apple | No |

#### POST /auth/register
```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "foodlover",
  "displayName": "John Doe"
}

// Response 201
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123...",
      "email": "user@example.com",
      "username": "foodlover",
      "displayName": "John Doe",
      "avatarUrl": null,
      "isVerified": false
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 900
    }
  }
}
```

#### POST /auth/login
```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// Response 200
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 900
    }
  }
}
```

---

### 4.2 Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Get current user profile | Yes |
| PATCH | `/users/me` | Update current user profile | Yes |
| DELETE | `/users/me` | Delete account | Yes |
| GET | `/users/:username` | Get user public profile | Optional |
| GET | `/users/:username/reviews` | Get user's reviews | Optional |
| GET | `/users/:username/activity` | Get user's activity | Optional |

#### GET /users/me
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "clx123...",
    "email": "user@example.com",
    "username": "foodlover",
    "displayName": "John Doe",
    "avatarUrl": "https://cdn.tastebuddy.app/avatars/...",
    "bio": "Pizza enthusiast",
    "phone": "+1234567890",
    "privacyLevel": "PUBLIC",
    "isVerified": true,
    "stats": {
      "venueReviewCount": 24,
      "itemReviewCount": 87,
      "friendCount": 156,
      "savedVenueCount": 42
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### PATCH /users/me
```json
// Request
{
  "displayName": "John D.",
  "bio": "Pizza and cocktail lover",
  "avatarUrl": "https://cdn.tastebuddy.app/avatars/new.jpg",
  "privacyLevel": "FRIENDS_ONLY"
}

// Response 200
{
  "success": true,
  "data": { ... }
}
```

---

### 4.3 Venues

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/venues` | List/search venues | Optional |
| GET | `/venues/:id` | Get venue details | Optional |
| GET | `/venues/:id/items` | Get venue menu items | Optional |
| GET | `/venues/:id/reviews` | Get venue reviews | Optional |
| GET | `/venues/nearby` | Get nearby venues | Optional |
| GET | `/venues/categories` | Get venue categories | No |
| POST | `/venues` | Create venue (admin) | Admin |
| PATCH | `/venues/:id` | Update venue (admin) | Admin |

#### GET /venues
```
Query params:
- q: Search query
- category: Category slug
- city: City name
- lat: User latitude
- lng: User longitude
- radius: Search radius in meters (default: 5000)
- minRating: Minimum rating (1-5)
- priceLevel: 1,2,3,4 (comma-separated)
- sortBy: distance|rating|reviews|newest
- page: Page number
- limit: Items per page (max 50)
```

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "clx456...",
      "name": "Pizza Palace",
      "slug": "pizza-palace-nyc",
      "address": "123 Main St, New York, NY",
      "category": {
        "id": "clx...",
        "name": "Restaurant",
        "slug": "restaurant"
      },
      "priceLevel": 2,
      "avgOverallScore": 4.3,
      "reviewCount": 128,
      "distance": 450,
      "topItems": [
        {
          "id": "clx789...",
          "name": "Margherita Pizza",
          "avgOverallScore": 4.7
        }
      ],
      "photoUrl": "https://cdn.tastebuddy.app/venues/..."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "hasMore": true
  }
}
```

#### GET /venues/:id
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "clx456...",
    "name": "Pizza Palace",
    "slug": "pizza-palace-nyc",
    "description": "Authentic Italian pizza",
    "address": "123 Main St, New York, NY",
    "city": "New York",
    "state": "NY",
    "country": "US",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "category": { ... },
    "priceLevel": 2,
    "phone": "+1-555-123-4567",
    "website": "https://pizzapalace.com",
    "hours": {
      "monday": { "open": "11:00", "close": "22:00" },
      "tuesday": { "open": "11:00", "close": "22:00" }
    },
    "scores": {
      "overall": 4.3,
      "service": 4.1,
      "atmosphere": 4.5,
      "cleanliness": 4.2,
      "value": 4.0,
      "location": 4.4,
      "noise": 3.8
    },
    "reviewCount": 128,
    "photoCount": 45,
    "itemCount": 32,
    "isVerified": true,
    "isSaved": false,
    "userReview": null,
    "photos": [ ... ],
    "topItems": [ ... ],
    "recentReviews": [ ... ]
  }
}
```

#### GET /venues/nearby
```
Query params:
- lat: User latitude (required)
- lng: User longitude (required)
- radius: Search radius in meters (default: 1000)
- category: Category slug
- limit: Items per page (max 50)
```

---

### 4.4 Items

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/items` | Search items | Optional |
| GET | `/items/:id` | Get item details | Optional |
| GET | `/items/:id/reviews` | Get item reviews | Optional |
| GET | `/items/categories` | Get item categories | No |
| GET | `/items/categories/:id/criteria` | Get rating criteria | No |
| GET | `/items/top` | Get top-rated items | Optional |
| POST | `/venues/:venueId/items` | Add item to venue | Admin |
| PATCH | `/items/:id` | Update item | Admin |

#### GET /items
```
Query params:
- q: Search query
- category: Category slug (pizza, cocktail, etc.)
- venueId: Filter by venue
- lat: User latitude
- lng: User longitude
- radius: Search radius
- minRating: Minimum rating
- sortBy: rating|reviews|distance|newest
- page: Page number
- limit: Items per page
```

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "clx789...",
      "name": "Margherita Pizza",
      "slug": "margherita-pizza",
      "category": {
        "id": "clx...",
        "name": "Pizza",
        "slug": "pizza"
      },
      "venue": {
        "id": "clx456...",
        "name": "Pizza Palace",
        "distance": 450
      },
      "price": 18.99,
      "currency": "USD",
      "avgOverallScore": 4.7,
      "avgCriteriaScores": {
        "taste": 4.8,
        "dough": 4.6,
        "ingredients": 4.7,
        "portion": 4.5,
        "value": 4.3,
        "presentation": 4.6
      },
      "reviewCount": 87,
      "photoUrl": "https://cdn.tastebuddy.app/items/..."
    }
  ],
  "meta": { ... }
}
```

#### GET /items/top
```
Query params:
- category: Category slug (required)
- lat: User latitude
- lng: User longitude
- radius: Search radius (default: 5000)
- limit: Number of items (default: 10)
```

---

### 4.5 Reviews

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/venues/:id/reviews` | Create venue review | Yes |
| PATCH | `/venues/:id/reviews` | Update venue review | Yes |
| DELETE | `/venues/:id/reviews` | Delete venue review | Yes |
| POST | `/items/:id/reviews` | Create item review | Yes |
| PATCH | `/items/:id/reviews` | Update item review | Yes |
| DELETE | `/items/:id/reviews` | Delete item review | Yes |
| POST | `/reviews/:id/like` | Like a review | Yes |
| DELETE | `/reviews/:id/like` | Unlike a review | Yes |
| POST | `/reviews/:id/comments` | Comment on review | Yes |
| GET | `/reviews/:id/comments` | Get review comments | Optional |

#### POST /venues/:id/reviews
```json
// Request
{
  "scores": {
    "service": 4,
    "atmosphere": 5,
    "cleanliness": 4,
    "value": 3,
    "location": 4,
    "noise": 4
  },
  "content": "Great atmosphere!",
  "verification": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timestamp": "2024-03-15T14:30:00Z"
  },
  "photoIds": ["clx...", "clx..."]
}

// Response 201
{
  "success": true,
  "data": {
    "id": "clx123...",
    "overallScore": 4.0,
    "isVerified": true,
    "createdAt": "2024-03-15T14:30:45Z"
  }
}
```

#### POST /items/:id/reviews
```json
// Request
{
  "criteriaScores": {
    "taste": 5,
    "dough": 4,
    "ingredients": 5,
    "portion": 4,
    "value": 4,
    "presentation": 5
  },
  "content": "Best pizza in town!",
  "verification": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timestamp": "2024-03-15T14:30:00Z"
  },
  "photoIds": ["clx..."]
}

// Response 201
{
  "success": true,
  "data": {
    "id": "clx456...",
    "overallScore": 4.5,
    "isVerified": true,
    "createdAt": "2024-03-15T14:31:00Z"
  }
}
```

---

### 4.6 Photos

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/photos/upload` | Upload photo | Yes |
| DELETE | `/photos/:id` | Delete photo | Yes |
| GET | `/venues/:id/photos` | Get venue photos | Optional |
| GET | `/items/:id/photos` | Get item photos | Optional |

#### POST /photos/upload
```
Content-Type: multipart/form-data

Fields:
- file: Image file (max 10MB, jpg/png/webp)
- type: venue|item|review
- targetId: ID of the target entity (optional)
```

```json
// Response 201
{
  "success": true,
  "data": {
    "id": "clx789...",
    "url": "https://cdn.tastebuddy.app/photos/full/...",
    "thumbnailUrl": "https://cdn.tastebuddy.app/photos/thumb/...",
    "width": 1200,
    "height": 800
  }
}
```

---

### 4.7 Social

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/friends` | Get friends list | Yes |
| GET | `/friends/requests` | Get pending requests | Yes |
| POST | `/friends/request/:userId` | Send friend request | Yes |
| POST | `/friends/accept/:requestId` | Accept friend request | Yes |
| POST | `/friends/reject/:requestId` | Reject friend request | Yes |
| DELETE | `/friends/:userId` | Remove friend | Yes |
| POST | `/friends/block/:userId` | Block user | Yes |
| GET | `/feed` | Get activity feed | Yes |
| GET | `/notifications` | Get notifications | Yes |
| PATCH | `/notifications/:id/read` | Mark as read | Yes |
| PATCH | `/notifications/read-all` | Mark all as read | Yes |

#### GET /feed
```
Query params:
- type: all|friends|following
- page: Page number
- limit: Items per page (max 50)
```

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "type": "ITEM_REVIEW",
      "user": {
        "id": "clx...",
        "username": "pizzafan",
        "displayName": "Pizza Fan",
        "avatarUrl": "..."
      },
      "target": {
        "type": "item",
        "item": {
          "id": "clx...",
          "name": "Margherita Pizza"
        },
        "venue": {
          "id": "clx...",
          "name": "Pizza Palace"
        }
      },
      "review": {
        "id": "clx...",
        "overallScore": 4.5,
        "content": "Amazing pizza!",
        "isVerified": true,
        "photos": [...]
      },
      "createdAt": "2024-03-15T14:30:00Z",
      "likeCount": 12,
      "commentCount": 3,
      "isLiked": false
    }
  ],
  "meta": { ... }
}
```

---

### 4.8 Saved Items

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/saved/venues` | Get saved venues | Yes |
| POST | `/saved/venues/:id` | Save venue | Yes |
| DELETE | `/saved/venues/:id` | Unsave venue | Yes |
| GET | `/saved/items` | Get saved items | Yes |
| POST | `/saved/items/:id` | Save item | Yes |
| DELETE | `/saved/items/:id` | Unsave item | Yes |

---

### 4.9 Reports

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/reports` | Submit report | Yes |
| GET | `/admin/reports` | Get reports (admin) | Admin |
| PATCH | `/admin/reports/:id` | Resolve report | Admin |

#### POST /reports
```json
// Request
{
  "targetType": "item_review",
  "targetId": "clx...",
  "reason": "FAKE_REVIEW",
  "description": "User has never been to this restaurant"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "clx...",
    "status": "PENDING"
  }
}
```

---

### 4.10 Search

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/search` | Global search | Optional |
| GET | `/search/suggestions` | Autocomplete | Optional |

#### GET /search
```
Query params:
- q: Search query (required)
- type: all|venues|items|users
- lat: User latitude
- lng: User longitude
- page: Page number
- limit: Items per page
```

```json
// Response 200
{
  "success": true,
  "data": {
    "venues": [ ... ],
    "items": [ ... ],
    "users": [ ... ]
  }
}
```

---

### 4.11 Location Verification

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/geo/verify` | Verify user at venue | Yes |

#### POST /geo/verify
```json
// Request
{
  "venueId": "clx456...",
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10,
    "timestamp": "2024-03-15T14:30:00Z"
  }
}

// Response 200
{
  "success": true,
  "data": {
    "isVerified": true,
    "distance": 45,
    "maxAllowedDistance": 100,
    "verificationToken": "eyJ..." // Use in review submission
  }
}

// Response 403 (too far)
{
  "success": false,
  "error": {
    "code": "LOCATION_TOO_FAR",
    "message": "You must be within 100m of the venue",
    "details": {
      "distance": 250,
      "maxAllowed": 100
    }
  }
}
```

---

### 4.12 Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/dashboard` | Dashboard stats | Admin |
| GET | `/admin/users` | List users | Admin |
| PATCH | `/admin/users/:id` | Update user | Admin |
| POST | `/admin/users/:id/ban` | Ban user | Admin |
| GET | `/admin/venues/pending` | Pending venues | Admin |
| PATCH | `/admin/venues/:id/approve` | Approve venue | Admin |
| GET | `/admin/reviews/flagged` | Flagged reviews | Admin |
| DELETE | `/admin/reviews/:id` | Delete review | Admin |

## 5. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| LOCATION_TOO_FAR | 403 | User not at venue |
| REVIEW_EXISTS | 409 | Review already submitted |
| ACCOUNT_BANNED | 403 | Account is banned |
| SERVER_ERROR | 500 | Internal server error |

## 6. Webhooks (Future)

For venue owners and integrations:
- `review.created` - New review posted
- `review.updated` - Review modified
- `venue.verified` - Venue verified

## 7. API Versioning

- Current version: `v1`
- Version in URL path: `/v1/...`
- Deprecation notice in headers
- 6-month deprecation period
