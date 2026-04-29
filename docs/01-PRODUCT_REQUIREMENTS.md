# TasteBuddy - Product Requirements Document

## 1. Executive Summary

**TasteBuddy** is a cross-platform social food and venue rating application that helps users discover "what should I eat or drink, and where?" Unlike traditional venue-only rating platforms, TasteBuddy focuses on individual menu items, enabling users to find the best pizza, cocktail, or coffee in their area based on verified, location-authenticated reviews.

## 2. Problem Statement

Current restaurant rating apps only show overall venue ratings, making it difficult for users to:
- Know which specific dishes or drinks are worth ordering
- Compare similar items across different venues
- Trust reviews from users who may never have visited the location
- Get recommendations based on personal taste preferences

## 3. Solution Overview

TasteBuddy solves these problems by:
- Allowing granular item-level ratings with category-specific criteria
- Requiring GPS verification for review authenticity
- Building a social discovery feed with friend recommendations
- Enabling search and comparison across venues for specific items

## 4. Target Users

### Primary Users
- **Food Enthusiasts (25-45)**: People who actively seek new dining experiences
- **Social Diners (21-35)**: Users who value friend recommendations
- **Local Explorers (18-55)**: People wanting to discover hidden gems

### Secondary Users
- **Venue Owners**: Want visibility into customer sentiment
- **Content Creators**: Food bloggers seeking authentic ratings data

## 5. Core Features

### 5.1 User Authentication & Profiles
| Feature | Priority | Description |
|---------|----------|-------------|
| Email/Password Auth | P0 | Basic signup/login |
| Social OAuth | P1 | Google, Apple Sign-In |
| Profile Management | P0 | Avatar, bio, preferences |
| Public Profile | P0 | Show user activity, ratings |
| Privacy Settings | P1 | Control visibility of reviews |
| Taste Profile | P2 | Learning user preferences |

### 5.2 Venue Management
| Feature | Priority | Description |
|---------|----------|-------------|
| Venue Pages | P0 | Name, address, category, hours |
| Venue Ratings | P0 | Aggregated scores from reviews |
| Venue Photos | P1 | User-uploaded images |
| Menu Items | P0 | List of rateable products |
| Venue Search | P0 | By name, category, location |
| Venue Filters | P1 | Price, rating, distance |
| Venue Categories | P0 | Restaurant, bar, café, etc. |

### 5.3 Product/Item Management
| Feature | Priority | Description |
|---------|----------|-------------|
| Item Pages | P0 | Name, description, price, venue |
| Item Ratings | P0 | Category-specific criteria |
| Item Photos | P1 | User-uploaded images |
| Item Search | P0 | Find items across venues |
| Item Comparison | P2 | Compare similar items |
| Item Categories | P0 | Pizza, cocktail, coffee, etc. |

### 5.4 Rating System
| Feature | Priority | Description |
|---------|----------|-------------|
| Multi-criteria Ratings | P0 | Different criteria per category |
| Overall Score Calc | P0 | Weighted average formula |
| Text Reviews | P0 | Optional written feedback |
| Photo Uploads | P1 | Attach images to reviews |
| Review Editing | P1 | Edit within 24 hours |
| Duplicate Prevention | P0 | Rate limit per user/venue/item |
| Rating History | P0 | User's past ratings |

### 5.5 Location Verification
| Feature | Priority | Description |
|---------|----------|-------------|
| GPS Check | P0 | Verify user at venue |
| Radius Config | P0 | Default 100m, configurable |
| Verification Badge | P0 | Show on verified reviews |
| Anti-spoofing | P1 | Detect fake GPS |
| Offline Queueing | P2 | Submit when back online |

### 5.6 Social Features
| Feature | Priority | Description |
|---------|----------|-------------|
| Friend Requests | P0 | Send/accept/reject |
| Activity Feed | P0 | Friend activities |
| Like Reviews | P1 | Engagement metrics |
| Comment on Reviews | P1 | Discussion threads |
| Save/Bookmark | P1 | Save venues/items |
| Share Reviews | P2 | External sharing |
| Notifications | P0 | Push and in-app |

### 5.7 Discovery & Recommendations
| Feature | Priority | Description |
|---------|----------|-------------|
| Nearby Search | P0 | GPS-based discovery |
| Best Items Lists | P0 | Top rated in category |
| Trending Items | P1 | Popular recently |
| Friend Recommendations | P1 | Based on friend activity |
| Personalized Recs | P2 | ML-based suggestions |
| Category Filters | P0 | Food/drink types |

### 5.8 Admin & Moderation
| Feature | Priority | Description |
|---------|----------|-------------|
| Admin Dashboard | P0 | Overview and management |
| User Management | P0 | Ban, warn, verify |
| Venue Management | P0 | Approve, merge, delete |
| Review Moderation | P0 | Report handling |
| Content Flagging | P0 | Automated detection |
| Analytics | P1 | Usage statistics |

## 6. Rating Criteria by Category

### Food Items
| Category | Criteria |
|----------|----------|
| Pizza | Taste, Dough Quality, Ingredients, Portion Size, Price/Performance, Presentation |
| Burger | Taste, Meat Quality, Bun, Toppings, Portion Size, Price/Performance |
| Pasta | Taste, Pasta Quality, Sauce, Portion Size, Price/Performance |
| Dessert | Taste, Freshness, Presentation, Portion Size, Price/Performance |
| Coffee | Taste, Aroma, Temperature, Presentation, Price/Performance |

### Drink Items
| Category | Criteria |
|----------|----------|
| Cocktail | Taste Balance, Alcohol Balance, Presentation, Creativity, Price/Performance |
| Wine | Taste, Aroma, Temperature, Pairing Suggestions, Price/Performance |
| Beer | Taste, Freshness, Temperature, Variety, Price/Performance |
| Non-Alcoholic | Taste, Freshness, Presentation, Price/Performance |

### Venue Criteria
| Criteria | Weight |
|----------|--------|
| Service | 20% |
| Atmosphere | 20% |
| Cleanliness | 15% |
| Price/Performance | 15% |
| Location/Accessibility | 10% |
| Music/Noise Level | 10% |
| Overall Experience | 10% |

## 7. Non-Functional Requirements

### Performance
- Page load time: < 2 seconds
- API response time: < 200ms (95th percentile)
- Support 100,000 concurrent users
- Image upload: < 5 seconds

### Security
- HTTPS everywhere
- JWT with refresh tokens
- Password hashing (bcrypt)
- Rate limiting
- SQL injection prevention
- XSS protection
- GDPR compliance

### Reliability
- 99.9% uptime SLA
- Automated backups daily
- Disaster recovery plan
- Graceful degradation

### Scalability
- Horizontal scaling
- CDN for static assets
- Database read replicas
- Caching layer (Redis)

## 8. Success Metrics

### User Engagement
- DAU/MAU ratio > 40%
- Average session duration > 5 minutes
- Reviews per active user > 2/month

### Growth
- Month-over-month user growth > 15%
- Organic acquisition > 50%
- User retention (30-day) > 40%

### Content Quality
- Verified reviews > 80%
- Reviews with photos > 30%
- Spam/fake review rate < 2%

## 9. Constraints & Assumptions

### Constraints
- Initial launch in English only
- MVP focused on top 3 venue categories
- iOS 14+, Android 10+
- Modern browsers (Chrome, Safari, Firefox, Edge)

### Assumptions
- Users willing to share location
- Venues have accurate GPS coordinates
- Users have smartphones with GPS
- Internet connectivity for verification

## 10. Out of Scope (v1)

- Restaurant reservation booking
- Food delivery integration
- Venue owner dashboard
- Multi-language support
- AR menu scanning
- AI photo recognition
- Payment/tipping features
