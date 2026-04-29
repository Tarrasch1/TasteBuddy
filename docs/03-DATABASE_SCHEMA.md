# TasteBuddy - Database Schema

## 1. Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │   venues     │       │    items     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ email        │       │ name         │       │ venue_id(FK) │
│ password_hash│       │ description  │       │ name         │
│ username     │       │ address      │       │ description  │
│ display_name │       │ location     │◀──────│ category_id  │
│ avatar_url   │       │ category_id  │       │ price        │
│ bio          │       │ price_level  │       │ photo_url    │
│ created_at   │       │ phone        │       │ avg_score    │
│ updated_at   │       │ website      │       │ review_count │
└──────┬───────┘       │ hours        │       │ is_available │
       │               │ avg_score    │       │ created_at   │
       │               │ review_count │       │ updated_at   │
       │               │ verified     │       └──────┬───────┘
       │               │ created_at   │              │
       │               │ updated_at   │              │
       │               └──────┬───────┘              │
       │                      │                      │
       │     ┌────────────────┼──────────────────────┘
       │     │                │
       ▼     ▼                ▼
┌──────────────────────────────────────┐
│           venue_reviews              │
├──────────────────────────────────────┤
│ id (PK)                              │
│ user_id (FK)                         │
│ venue_id (FK)                        │
│ service_score                        │
│ atmosphere_score                     │
│ cleanliness_score                    │
│ value_score                          │
│ location_score                       │
│ noise_score                          │
│ overall_score                        │
│ content                              │
│ is_verified                          │
│ verification_lat                     │
│ verification_lng                     │
│ created_at                           │
│ updated_at                           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│           item_reviews               │
├──────────────────────────────────────┤
│ id (PK)                              │
│ user_id (FK)                         │
│ item_id (FK)                         │
│ venue_id (FK)                        │
│ criteria_scores (JSONB)              │
│ overall_score                        │
│ content                              │
│ is_verified                          │
│ verification_lat                     │
│ verification_lng                     │
│ created_at                           │
│ updated_at                           │
└──────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐
│ friendships  │       │  activities  │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ requester_id │       │ user_id (FK) │
│ addressee_id │       │ type         │
│ status       │       │ target_type  │
│ created_at   │       │ target_id    │
│ updated_at   │       │ metadata     │
└──────────────┘       │ created_at   │
                       └──────────────┘
```

## 2. Complete Schema Definition (Prisma)

```prisma
// This is a Prisma schema file for TasteBuddy

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]
}

// ============================================
// USER MANAGEMENT
// ============================================

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  passwordHash   String?   @map("password_hash")
  username       String    @unique
  displayName    String?   @map("display_name")
  avatarUrl      String?   @map("avatar_url")
  bio            String?
  phone          String?
  isVerified     Boolean   @default(false) @map("is_verified")
  isAdmin        Boolean   @default(false) @map("is_admin")
  isBanned       Boolean   @default(false) @map("is_banned")
  banReason      String?   @map("ban_reason")
  privacyLevel   PrivacyLevel @default(PUBLIC) @map("privacy_level")
  
  // OAuth
  googleId       String?   @unique @map("google_id")
  appleId        String?   @unique @map("apple_id")
  
  // Timestamps
  lastLoginAt    DateTime? @map("last_login_at")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  deletedAt      DateTime? @map("deleted_at")
  
  // Relations
  venueReviews      VenueReview[]
  itemReviews       ItemReview[]
  photos            Photo[]
  sentFriendships   Friendship[] @relation("FriendshipRequester")
  receivedFriendships Friendship[] @relation("FriendshipAddressee")
  activities        Activity[]
  notifications     Notification[]
  savedVenues       SavedVenue[]
  savedItems        SavedItem[]
  reviewLikes       ReviewLike[]
  reviewComments    ReviewComment[]
  reports           Report[]       @relation("ReportAuthor")
  receivedReports   Report[]       @relation("ReportTarget")
  refreshTokens     RefreshToken[]
  
  @@index([email])
  @@index([username])
  @@map("users")
}

enum PrivacyLevel {
  PUBLIC
  FRIENDS_ONLY
  PRIVATE
}

model RefreshToken {
  id          String    @id @default(cuid())
  token       String    @unique
  userId      String    @map("user_id")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt   DateTime  @map("expires_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  revokedAt   DateTime? @map("revoked_at")
  
  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}

// ============================================
// VENUE MANAGEMENT
// ============================================

model VenueCategory {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  icon        String?
  description String?
  parentId    String?   @map("parent_id")
  parent      VenueCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    VenueCategory[] @relation("CategoryHierarchy")
  venues      Venue[]
  createdAt   DateTime  @default(now()) @map("created_at")
  
  @@map("venue_categories")
}

model Venue {
  id             String    @id @default(cuid())
  name           String
  slug           String    @unique
  description    String?
  
  // Location (PostGIS)
  address        String
  city           String
  state          String?
  country        String
  postalCode     String?   @map("postal_code")
  latitude       Float
  longitude      Float
  // location    Unsupported("geometry(Point, 4326)")? -- PostGIS
  
  // Details
  categoryId     String    @map("category_id")
  category       VenueCategory @relation(fields: [categoryId], references: [id])
  priceLevel     Int       @default(2) @map("price_level") // 1-4
  phone          String?
  website        String?
  hours          Json?     // {"mon": {"open": "09:00", "close": "22:00"}, ...}
  
  // Aggregated scores
  avgServiceScore     Float?  @map("avg_service_score")
  avgAtmosphereScore  Float?  @map("avg_atmosphere_score")
  avgCleanlinessScore Float?  @map("avg_cleanliness_score")
  avgValueScore       Float?  @map("avg_value_score")
  avgLocationScore    Float?  @map("avg_location_score")
  avgNoiseScore       Float?  @map("avg_noise_score")
  avgOverallScore     Float?  @map("avg_overall_score")
  reviewCount         Int     @default(0) @map("review_count")
  
  // Status
  isVerified     Boolean   @default(false) @map("is_verified")
  isActive       Boolean   @default(true) @map("is_active")
  
  // Timestamps
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  
  // Relations
  items          Item[]
  reviews        VenueReview[]
  photos         Photo[]
  savedBy        SavedVenue[]
  
  @@index([categoryId])
  @@index([city])
  @@index([latitude, longitude])
  @@index([avgOverallScore])
  @@map("venues")
}

// ============================================
// ITEM (FOOD/DRINK) MANAGEMENT
// ============================================

model ItemCategory {
  id               String    @id @default(cuid())
  name             String    @unique
  slug             String    @unique
  icon             String?
  description      String?
  type             ItemType
  ratingCriteria   RatingCriterion[]
  items            Item[]
  createdAt        DateTime  @default(now()) @map("created_at")
  
  @@map("item_categories")
}

enum ItemType {
  FOOD
  DRINK
}

model RatingCriterion {
  id          String    @id @default(cuid())
  categoryId  String    @map("category_id")
  category    ItemCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  name        String    // e.g., "taste", "presentation"
  label       String    // e.g., "Taste", "Presentation"
  description String?
  weight      Float     @default(1.0) // For weighted average
  order       Int       @default(0)
  
  @@unique([categoryId, name])
  @@map("rating_criteria")
}

model Item {
  id             String    @id @default(cuid())
  venueId        String    @map("venue_id")
  venue          Venue     @relation(fields: [venueId], references: [id], onDelete: Cascade)
  categoryId     String    @map("category_id")
  category       ItemCategory @relation(fields: [categoryId], references: [id])
  
  name           String
  slug           String
  description    String?
  price          Decimal?  @db.Decimal(10, 2)
  currency       String    @default("USD")
  photoUrl       String?   @map("photo_url")
  
  // Aggregated scores
  avgOverallScore Float?   @map("avg_overall_score")
  avgCriteriaScores Json?  @map("avg_criteria_scores") // {"taste": 4.5, "presentation": 4.2}
  reviewCount    Int       @default(0) @map("review_count")
  
  // Status
  isAvailable    Boolean   @default(true) @map("is_available")
  isVerified     Boolean   @default(false) @map("is_verified")
  
  // Timestamps
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  
  // Relations
  reviews        ItemReview[]
  photos         Photo[]
  savedBy        SavedItem[]
  
  @@unique([venueId, slug])
  @@index([categoryId])
  @@index([avgOverallScore])
  @@map("items")
}

// ============================================
// REVIEWS & RATINGS
// ============================================

model VenueReview {
  id                String    @id @default(cuid())
  userId            String    @map("user_id")
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  venueId           String    @map("venue_id")
  venue             Venue     @relation(fields: [venueId], references: [id], onDelete: Cascade)
  
  // Scores (1-5)
  serviceScore      Float     @map("service_score")
  atmosphereScore   Float     @map("atmosphere_score")
  cleanlinessScore  Float     @map("cleanliness_score")
  valueScore        Float     @map("value_score")
  locationScore     Float     @map("location_score")
  noiseScore        Float     @map("noise_score")
  overallScore      Float     @map("overall_score")
  
  // Content
  content           String?   @db.Text
  
  // Verification
  isVerified        Boolean   @default(false) @map("is_verified")
  verificationLat   Float?    @map("verification_lat")
  verificationLng   Float?    @map("verification_lng")
  verificationTime  DateTime? @map("verification_time")
  
  // Moderation
  isHidden          Boolean   @default(false) @map("is_hidden")
  hideReason        String?   @map("hide_reason")
  
  // Engagement
  likeCount         Int       @default(0) @map("like_count")
  commentCount      Int       @default(0) @map("comment_count")
  
  // Timestamps
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  // Relations
  photos            Photo[]
  likes             ReviewLike[]
  comments          ReviewComment[]
  
  @@unique([userId, venueId]) // One review per user per venue
  @@index([venueId])
  @@index([userId])
  @@index([createdAt])
  @@map("venue_reviews")
}

model ItemReview {
  id                String    @id @default(cuid())
  userId            String    @map("user_id")
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemId            String    @map("item_id")
  item              Item      @relation(fields: [itemId], references: [id], onDelete: Cascade)
  venueId           String    @map("venue_id") // Denormalized for queries
  
  // Scores - stored as JSONB for flexibility
  criteriaScores    Json      @map("criteria_scores") // {"taste": 5, "presentation": 4}
  overallScore      Float     @map("overall_score")
  
  // Content
  content           String?   @db.Text
  
  // Verification
  isVerified        Boolean   @default(false) @map("is_verified")
  verificationLat   Float?    @map("verification_lat")
  verificationLng   Float?    @map("verification_lng")
  verificationTime  DateTime? @map("verification_time")
  
  // Moderation
  isHidden          Boolean   @default(false) @map("is_hidden")
  hideReason        String?   @map("hide_reason")
  
  // Engagement
  likeCount         Int       @default(0) @map("like_count")
  commentCount      Int       @default(0) @map("comment_count")
  
  // Timestamps
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  // Relations
  photos            Photo[]
  likes             ReviewLike[]
  comments          ReviewComment[]
  
  @@index([itemId])
  @@index([userId])
  @@index([venueId])
  @@index([createdAt])
  @@map("item_reviews")
}

model ReviewLike {
  id              String    @id @default(cuid())
  userId          String    @map("user_id")
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  venueReviewId   String?   @map("venue_review_id")
  venueReview     VenueReview? @relation(fields: [venueReviewId], references: [id], onDelete: Cascade)
  itemReviewId    String?   @map("item_review_id")
  itemReview      ItemReview? @relation(fields: [itemReviewId], references: [id], onDelete: Cascade)
  createdAt       DateTime  @default(now()) @map("created_at")
  
  @@unique([userId, venueReviewId])
  @@unique([userId, itemReviewId])
  @@map("review_likes")
}

model ReviewComment {
  id              String    @id @default(cuid())
  userId          String    @map("user_id")
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  venueReviewId   String?   @map("venue_review_id")
  venueReview     VenueReview? @relation(fields: [venueReviewId], references: [id], onDelete: Cascade)
  itemReviewId    String?   @map("item_review_id")
  itemReview      ItemReview? @relation(fields: [itemReviewId], references: [id], onDelete: Cascade)
  parentId        String?   @map("parent_id")
  parent          ReviewComment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies         ReviewComment[] @relation("CommentReplies")
  content         String    @db.Text
  isHidden        Boolean   @default(false) @map("is_hidden")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  @@index([venueReviewId])
  @@index([itemReviewId])
  @@map("review_comments")
}

// ============================================
// PHOTOS
// ============================================

model Photo {
  id              String    @id @default(cuid())
  userId          String    @map("user_id")
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Polymorphic relations
  venueId         String?   @map("venue_id")
  venue           Venue?    @relation(fields: [venueId], references: [id], onDelete: Cascade)
  itemId          String?   @map("item_id")
  item            Item?     @relation(fields: [itemId], references: [id], onDelete: Cascade)
  venueReviewId   String?   @map("venue_review_id")
  venueReview     VenueReview? @relation(fields: [venueReviewId], references: [id], onDelete: Cascade)
  itemReviewId    String?   @map("item_review_id")
  itemReview      ItemReview? @relation(fields: [itemReviewId], references: [id], onDelete: Cascade)
  
  // Image data
  url             String
  thumbnailUrl    String?   @map("thumbnail_url")
  width           Int?
  height          Int?
  mimeType        String?   @map("mime_type")
  sizeBytes       Int?      @map("size_bytes")
  caption         String?
  
  // Moderation
  isApproved      Boolean   @default(true) @map("is_approved")
  
  createdAt       DateTime  @default(now()) @map("created_at")
  
  @@index([venueId])
  @@index([itemId])
  @@map("photos")
}

// ============================================
// SOCIAL FEATURES
// ============================================

model Friendship {
  id            String    @id @default(cuid())
  requesterId   String    @map("requester_id")
  requester     User      @relation("FriendshipRequester", fields: [requesterId], references: [id], onDelete: Cascade)
  addresseeId   String    @map("addressee_id")
  addressee     User      @relation("FriendshipAddressee", fields: [addresseeId], references: [id], onDelete: Cascade)
  status        FriendshipStatus @default(PENDING)
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([requesterId, addresseeId])
  @@index([addresseeId])
  @@map("friendships")
}

enum FriendshipStatus {
  PENDING
  ACCEPTED
  REJECTED
  BLOCKED
}

model Activity {
  id            String    @id @default(cuid())
  userId        String    @map("user_id")
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  type          ActivityType
  targetType    String?   @map("target_type") // "venue", "item", "review"
  targetId      String?   @map("target_id")
  metadata      Json?     // Additional context
  createdAt     DateTime  @default(now()) @map("created_at")
  
  @@index([userId])
  @@index([createdAt])
  @@map("activities")
}

enum ActivityType {
  VENUE_REVIEW
  ITEM_REVIEW
  LIKE_REVIEW
  COMMENT_REVIEW
  SAVE_VENUE
  SAVE_ITEM
  FOLLOW_USER
  PHOTO_UPLOAD
}

model Notification {
  id            String    @id @default(cuid())
  userId        String    @map("user_id")
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  type          NotificationType
  title         String
  body          String
  data          Json?     // Payload for deep linking
  isRead        Boolean   @default(false) @map("is_read")
  readAt        DateTime? @map("read_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  
  @@index([userId])
  @@index([isRead])
  @@map("notifications")
}

enum NotificationType {
  FRIEND_REQUEST
  FRIEND_ACCEPTED
  REVIEW_LIKE
  REVIEW_COMMENT
  MENTION
  SYSTEM
}

model SavedVenue {
  id        String    @id @default(cuid())
  userId    String    @map("user_id")
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  venueId   String    @map("venue_id")
  venue     Venue     @relation(fields: [venueId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now()) @map("created_at")
  
  @@unique([userId, venueId])
  @@map("saved_venues")
}

model SavedItem {
  id        String    @id @default(cuid())
  userId    String    @map("user_id")
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemId    String    @map("item_id")
  item      Item      @relation(fields: [itemId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now()) @map("created_at")
  
  @@unique([userId, itemId])
  @@map("saved_items")
}

// ============================================
// MODERATION & REPORTS
// ============================================

model Report {
  id            String    @id @default(cuid())
  reporterId    String    @map("reporter_id")
  reporter      User      @relation("ReportAuthor", fields: [reporterId], references: [id], onDelete: Cascade)
  targetUserId  String?   @map("target_user_id")
  targetUser    User?     @relation("ReportTarget", fields: [targetUserId], references: [id], onDelete: Cascade)
  targetType    String    @map("target_type") // "user", "venue", "item", "venue_review", "item_review"
  targetId      String    @map("target_id")
  reason        ReportReason
  description   String?   @db.Text
  status        ReportStatus @default(PENDING)
  resolvedBy    String?   @map("resolved_by")
  resolvedAt    DateTime? @map("resolved_at")
  resolution    String?
  createdAt     DateTime  @default(now()) @map("created_at")
  
  @@index([status])
  @@index([targetType, targetId])
  @@map("reports")
}

enum ReportReason {
  SPAM
  FAKE_REVIEW
  OFFENSIVE_CONTENT
  HARASSMENT
  INCORRECT_INFO
  DUPLICATE
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWING
  RESOLVED
  DISMISSED
}
```

## 3. PostGIS Geospatial Queries

```sql
-- Create spatial index
CREATE INDEX idx_venues_location ON venues USING GIST (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
);

-- Find venues within radius (meters)
SELECT id, name, 
  ST_Distance(
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
    ST_SetSRID(ST_MakePoint(:user_lng, :user_lat), 4326)::geography
  ) AS distance
FROM venues
WHERE ST_DWithin(
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
  ST_SetSRID(ST_MakePoint(:user_lng, :user_lat), 4326)::geography,
  :radius_meters
)
ORDER BY distance;

-- Verify user is at venue (within 100m)
SELECT EXISTS(
  SELECT 1 FROM venues
  WHERE id = :venue_id
  AND ST_DWithin(
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
    ST_SetSRID(ST_MakePoint(:user_lng, :user_lat), 4326)::geography,
    100
  )
) AS is_at_venue;
```

## 4. Database Migrations

Migration files will be auto-generated by Prisma:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 5. Indexes Summary

| Table | Index | Columns | Type |
|-------|-------|---------|------|
| users | idx_users_email | email | BTREE |
| users | idx_users_username | username | BTREE |
| venues | idx_venues_category | category_id | BTREE |
| venues | idx_venues_city | city | BTREE |
| venues | idx_venues_location | latitude, longitude | BTREE |
| venues | idx_venues_score | avg_overall_score | BTREE |
| venues | idx_venues_geo | location | GIST |
| items | idx_items_category | category_id | BTREE |
| items | idx_items_score | avg_overall_score | BTREE |
| venue_reviews | idx_vr_venue | venue_id | BTREE |
| venue_reviews | idx_vr_user | user_id | BTREE |
| venue_reviews | idx_vr_created | created_at | BTREE |
| item_reviews | idx_ir_item | item_id | BTREE |
| item_reviews | idx_ir_user | user_id | BTREE |
| item_reviews | idx_ir_venue | venue_id | BTREE |
| activities | idx_act_user | user_id | BTREE |
| activities | idx_act_created | created_at | BTREE |

## 6. Data Seeding

See `prisma/seed.ts` for:
- Venue categories (Restaurant, Bar, Café, etc.)
- Item categories (Pizza, Burger, Cocktail, etc.)
- Rating criteria per item category
- Sample venues and items
- Admin user account
