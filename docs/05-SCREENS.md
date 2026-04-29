# TasteBuddy - Frontend & Mobile Screens

## 1. Screen Architecture

### Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP NAVIGATION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐                                                │
│  │ Auth Stack  │ (Unauthenticated)                              │
│  ├─────────────┤                                                │
│  │ - Welcome   │                                                │
│  │ - Login     │                                                │
│  │ - Register  │                                                │
│  │ - Forgot PW │                                                │
│  │ - Reset PW  │                                                │
│  └─────────────┘                                                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Main Stack (Authenticated)                               │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │              Bottom Tab Navigator                │    │    │
│  │  ├──────────┬──────────┬──────────┬──────────┬─────┤    │    │
│  │  │   Home   │  Search  │  Review  │  Saved   │Profile    │    │
│  │  │   Feed   │ Discovery│  (FAB)   │ Bookmarks│  Me  │    │    │
│  │  └──────────┴──────────┴──────────┴──────────┴─────┘    │    │
│  │                                                          │    │
│  │  Modal Screens:                                          │    │
│  │  - Venue Detail                                          │    │
│  │  - Item Detail                                           │    │
│  │  - User Profile                                          │    │
│  │  - Review Composer                                       │    │
│  │  - Photo Viewer                                          │    │
│  │  - Settings                                              │    │
│  │  - Notifications                                         │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Screen List

### 2.1 Authentication Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Welcome | `/welcome` | App intro with login/signup CTAs |
| Login | `/login` | Email/password login |
| Register | `/register` | New account creation |
| Forgot Password | `/forgot-password` | Password reset request |
| Reset Password | `/reset-password` | New password entry |
| Email Verification | `/verify-email` | Confirmation screen |
| OAuth Callback | `/auth/callback` | OAuth redirect handling |

### 2.2 Main Tab Screens

| Screen | Route | Tab | Description |
|--------|-------|-----|-------------|
| Home Feed | `/` | Home | Friend activity feed |
| Discover | `/discover` | Search | Browse and search |
| Create Review | `/review/new` | FAB | Start review flow |
| Saved | `/saved` | Saved | Bookmarked venues/items |
| Profile | `/profile` | Profile | Current user profile |

### 2.3 Venue Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Venue Detail | `/venues/:slug` | Full venue information |
| Venue Menu | `/venues/:slug/menu` | All menu items |
| Venue Reviews | `/venues/:slug/reviews` | All venue reviews |
| Venue Photos | `/venues/:slug/photos` | Photo gallery |
| Venue Map | `/venues/:slug/map` | Location view |

### 2.4 Item Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Item Detail | `/items/:id` | Full item information |
| Item Reviews | `/items/:id/reviews` | All item reviews |
| Item Photos | `/items/:id/photos` | Photo gallery |
| Item Comparison | `/items/compare` | Compare similar items |

### 2.5 Review Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Review Detail | `/reviews/:id` | Full review view |
| Review Composer | `/review/new` | Create/edit review |
| Venue Rating | `/review/venue/:id` | Rate venue criteria |
| Item Rating | `/review/item/:id` | Rate item criteria |
| Photo Upload | `/review/photos` | Add photos to review |
| Location Verify | `/review/verify` | GPS verification |
| Review Success | `/review/success` | Confirmation screen |

### 2.6 Profile Screens

| Screen | Route | Description |
|--------|-------|-------------|
| My Profile | `/profile` | Current user profile |
| User Profile | `/users/:username` | Other user profile |
| Edit Profile | `/profile/edit` | Update profile info |
| Profile Settings | `/profile/settings` | Privacy, preferences |
| My Reviews | `/profile/reviews` | User's review history |
| My Photos | `/profile/photos` | User's uploaded photos |

### 2.7 Social Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Friends List | `/friends` | All friends |
| Friend Requests | `/friends/requests` | Pending requests |
| Find Friends | `/friends/find` | Search users |
| Notifications | `/notifications` | All notifications |
| Activity | `/activity` | User's activity history |

### 2.8 Search & Discovery Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Search | `/search` | Global search |
| Search Results | `/search/results` | Filtered results |
| Nearby | `/nearby` | Map-based discovery |
| Top Lists | `/top/:category` | Best items by category |
| Trending | `/trending` | Popular now |
| Categories | `/categories` | Browse by category |

### 2.9 Settings Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Settings | `/settings` | Main settings |
| Account | `/settings/account` | Account management |
| Privacy | `/settings/privacy` | Privacy controls |
| Notifications | `/settings/notifications` | Push preferences |
| Location | `/settings/location` | GPS permissions |
| Help | `/settings/help` | FAQ, support |
| About | `/settings/about` | App info, legal |

### 2.10 Admin Screens (Web Only)

| Screen | Route | Description |
|--------|-------|-------------|
| Dashboard | `/admin` | Overview stats |
| Users | `/admin/users` | User management |
| Venues | `/admin/venues` | Venue management |
| Reviews | `/admin/reviews` | Review moderation |
| Reports | `/admin/reports` | Handle reports |
| Categories | `/admin/categories` | Manage categories |
| Analytics | `/admin/analytics` | Usage stats |

## 3. Screen Wireframes

### 3.1 Home Feed
```
┌─────────────────────────────────┐
│ ← TasteBuddy          🔔  ⚙️   │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Stories: [👤][👤][👤][+]    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 John D. rated           │ │
│ │ ⭐ Margherita Pizza  4.5   │ │
│ │ 📍 Pizza Palace            │ │
│ │ "Amazing crust!"           │ │
│ │ [📷 Photo]                 │ │
│ │ ❤️ 12  💬 3   🔖           │ │
│ │ 2h ago · ✓ Verified        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 Sarah M. reviewed       │ │
│ │ ⭐ The Cocktail Bar  4.2   │ │
│ │ "Great atmosphere!"        │ │
│ │ ❤️ 8   💬 1   🔖           │ │
│ │ 5h ago · ✓ Verified        │ │
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│  🏠    🔍    [+]    🔖    👤   │
└─────────────────────────────────┘
```

### 3.2 Venue Detail
```
┌─────────────────────────────────┐
│ ←                    🔖  ⋮     │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │  [Hero Image Gallery]      │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Pizza Palace           ✓ Verified│
│ ⭐ 4.3 (128 reviews)   $$      │
│ 📍 123 Main St, NYC            │
│ 🕐 Open until 10 PM            │
│                                 │
│ ┌───────┬───────┬───────┐      │
│ │ Menu  │Reviews│ Photos │      │
│ └───────┴───────┴───────┘      │
│                                 │
│ Top Rated Items                 │
│ ┌─────────────────────────────┐ │
│ │ 🍕 Margherita    ⭐ 4.7     │ │
│ │ 🍕 Pepperoni     ⭐ 4.5     │ │
│ │ 🍝 Carbonara     ⭐ 4.3     │ │
│ └─────────────────────────────┘ │
│                                 │
│ Score Breakdown                 │
│ Service      ████████░░  4.1   │
│ Atmosphere   █████████░  4.5   │
│ Cleanliness  ████████░░  4.2   │
│ Value        ████████░░  4.0   │
│                                 │
│ Recent Reviews                  │
│ ┌─────────────────────────────┐ │
│ │ 👤 John   ⭐ 4.5  2h ago   │ │
│ │ "Perfect pizza every time" │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │      [+ Write a Review]     │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 3.3 Item Detail
```
┌─────────────────────────────────┐
│ ←                    🔖  ⋮     │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │  [Item Photo Gallery]       │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Margherita Pizza               │
│ ⭐ 4.7 (87 reviews)   $18.99   │
│ 📍 Pizza Palace                │
│                                 │
│ Fresh mozzarella, San Marzano  │
│ tomatoes, basil, olive oil     │
│                                 │
│ Rating Breakdown                │
│ Taste        █████████░  4.8   │
│ Dough        █████████░  4.6   │
│ Ingredients  █████████░  4.7   │
│ Portion      ████████░░  4.5   │
│ Value        ████████░░  4.3   │
│ Presentation █████████░  4.6   │
│                                 │
│ Compare with Similar            │
│ ┌─────────────────────────────┐ │
│ │ #1 in Pizza near you        │ │
│ │ [View Top 10 Pizzas →]      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Reviews                         │
│ ┌─────────────────────────────┐ │
│ │ 👤 Jane   ⭐ 5.0  1d ago   │ │
│ │ "Best pizza in NYC!"       │ │
│ │ [📷 📷 📷]                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │      [+ Rate This Item]     │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 3.4 Review Composer
```
┌─────────────────────────────────┐
│ ✕ Rate Item           [Submit] │
├─────────────────────────────────┤
│                                 │
│ 📍 Verifying location...       │
│ ✓ You're at Pizza Palace       │
│                                 │
│ Rating: Margherita Pizza        │
│                                 │
│ Taste                           │
│ ☆ ☆ ☆ ☆ ☆                      │
│                                 │
│ Dough Quality                   │
│ ☆ ☆ ☆ ☆ ☆                      │
│                                 │
│ Ingredients                     │
│ ☆ ☆ ☆ ☆ ☆                      │
│                                 │
│ Portion Size                    │
│ ☆ ☆ ☆ ☆ ☆                      │
│                                 │
│ Value for Money                 │
│ ☆ ☆ ☆ ☆ ☆                      │
│                                 │
│ Presentation                    │
│ ☆ ☆ ☆ ☆ ☆                      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Write a review (optional)   │ │
│ │                             │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [📷 Add Photos]             │ │
│ │ [📷] [📷] [+]               │ │
│ └─────────────────────────────┘ │
│                                 │
│ Also rate the venue?            │
│ [ ] Yes, add venue rating       │
│                                 │
└─────────────────────────────────┘
```

### 3.5 Search/Discover
```
┌─────────────────────────────────┐
│ 🔍 Search venues, items...     │
├─────────────────────────────────┤
│                                 │
│ 📍 Near: Current Location  ▼   │
│                                 │
│ Categories                      │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│ │🍕  │ │🍔  │ │🍸  │ │☕  │    │
│ │Pizza│ │Burger│ │Drinks│ │Coffee│   │
│ └────┘ └────┘ └────┘ └────┘    │
│                                 │
│ Top Rated Nearby                │
│ ┌─────────────────────────────┐ │
│ │ 1. Margherita @ Palace 4.7 │ │
│ │ 2. Espresso @ Joe's    4.6 │ │
│ │ 3. Old Fashioned @ Bar 4.5 │ │
│ └─────────────────────────────┘ │
│                                 │
│ Trending This Week              │
│ ┌─────────────────────────────┐ │
│ │ [📷] New York Slice   🔥   │ │
│ │ [📷] Craft Cocktails  🔥   │ │
│ └─────────────────────────────┘ │
│                                 │
│ Friends Are Loving              │
│ ┌─────────────────────────────┐ │
│ │ 👤👤 John & 3 friends rated │ │
│ │ The Coffee Shop  ⭐ 4.4     │ │
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│  🏠    🔍    [+]    🔖    👤   │
└─────────────────────────────────┘
```

### 3.6 User Profile
```
┌─────────────────────────────────┐
│ ←                     ⚙️       │
├─────────────────────────────────┤
│                                 │
│        ┌──────────┐            │
│        │  Avatar  │            │
│        └──────────┘            │
│        John Doe                 │
│        @johndoe                 │
│        🍕 Pizza enthusiast      │
│                                 │
│ ┌─────────┬─────────┬─────────┐│
│ │   87    │   24    │   156   ││
│ │ Reviews │ Venues  │ Friends ││
│ └─────────┴─────────┴─────────┘│
│                                 │
│ [+ Add Friend]  [Message]       │
│                                 │
│ ┌───────┬───────┬───────┐      │
│ │Reviews│ Saved │Activity│      │
│ └───────┴───────┴───────┘      │
│                                 │
│ Recent Reviews                  │
│ ┌─────────────────────────────┐ │
│ │ 🍕 Margherita   ⭐ 4.5     │ │
│ │ Pizza Palace · 2h ago      │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 🍸 Old Fashioned ⭐ 4.8    │ │
│ │ The Bar · 1d ago           │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 🍔 Classic Burger ⭐ 4.2   │ │
│ │ Joe's Diner · 3d ago       │ │
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│  🏠    🔍    [+]    🔖    👤   │
└─────────────────────────────────┘
```

## 4. Component Library

### Core Components

| Component | Description |
|-----------|-------------|
| Button | Primary, Secondary, Outline, Ghost |
| Input | Text, Password, Search, TextArea |
| Card | Venue, Item, Review, User |
| Avatar | User profile pictures |
| Badge | Verified, New, Trending |
| Rating | Star rating display/input |
| RatingBar | Horizontal progress bar |
| Tab | Tab navigation |
| Modal | Bottom sheet, center modal |
| Toast | Success, error, info messages |
| Skeleton | Loading placeholders |
| Map | Mapbox integration |
| PhotoGallery | Image carousel |
| Feed | Virtualized list |
| SearchBar | With autocomplete |
| Filter | Bottom sheet filters |
| EmptyState | No data placeholders |

### Shared Screen Components

| Component | Description |
|-----------|-------------|
| VenueCard | Compact venue preview |
| VenueHeader | Venue detail header |
| ItemCard | Compact item preview |
| ItemHeader | Item detail header |
| ReviewCard | Review in feed/list |
| ReviewDetail | Full review view |
| UserCard | User in list |
| UserHeader | Profile header |
| CriteriaRating | Multi-criteria input |
| ScoreBreakdown | Score visualization |
| PhotoUploader | Multi-photo upload |
| LocationVerifier | GPS check UI |
| FriendButton | Add/remove friend |
| SaveButton | Bookmark toggle |
| LikeButton | Like toggle |
| ShareButton | Share menu |
| NotificationItem | Notification row |
| ActivityItem | Activity feed row |

## 5. Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | 0-639px | Single column |
| Tablet | 640-1023px | 2 columns |
| Desktop | 1024-1279px | Sidebar + content |
| Large | 1280px+ | Max-width container |

## 6. Deep Linking

| Path | Screen |
|------|--------|
| `tastebuddy://venue/:slug` | Venue Detail |
| `tastebuddy://item/:id` | Item Detail |
| `tastebuddy://review/:id` | Review Detail |
| `tastebuddy://user/:username` | User Profile |
| `tastebuddy://search?q=:query` | Search Results |
| `tastebuddy://review/new?venue=:id` | Review Composer |
