# TasteBuddy - User Flows

## 1. Authentication Flows

### 1.1 Registration Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER REGISTRATION FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │ Welcome │───▶│ Register│───▶│ Verify  │───▶│ Profile │───▶│  Home   │   │
│  │ Screen  │    │  Form   │    │  Email  │    │  Setup  │    │  Feed   │   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘   │
│                      │                                                       │
│                      │ Or                                                    │
│                      ▼                                                       │
│               ┌─────────────┐                                               │
│               │ Google/Apple│──────────────────────────────────────────────▶│
│               │   OAuth     │                                               │
│               └─────────────┘                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Steps:**
1. User opens app → Welcome screen with "Sign Up" and "Log In" buttons
2. Taps "Sign Up" → Registration form (email, password, username)
3. Submit form → API creates account, sends verification email
4. User checks email → Clicks verification link
5. App redirects → Profile setup (avatar, display name, bio - optional)
6. Completes setup → Lands on Home Feed

### 1.2 Login Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER LOGIN FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                                  │
│  │ Welcome │───▶│  Login  │───▶│  Home   │                                  │
│  │ Screen  │    │  Form   │    │  Feed   │                                  │
│  └─────────┘    └─────────┘    └─────────┘                                  │
│                      │              ▲                                        │
│                      │ Forgot PW?   │                                        │
│                      ▼              │                                        │
│               ┌─────────────┐   ┌─────────────┐                             │
│               │   Forgot    │──▶│   Reset     │────────────────────────────▶│
│               │  Password   │   │  Password   │                             │
│               └─────────────┘   └─────────────┘                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Steps:**
1. User opens app → Welcome screen
2. Taps "Log In" → Login form (email, password)
3. Submit credentials → API validates, returns tokens
4. Tokens stored securely → Navigate to Home Feed

**Password Reset:**
1. Tap "Forgot Password?" → Enter email
2. Submit → API sends reset email
3. Click email link → Enter new password
4. Submit → Redirect to login

---

## 2. Review Flows

### 2.1 Item Review Flow (Primary)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ITEM REVIEW FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │  Item   │───▶│Location │───▶│  Rate   │───▶│  Add    │───▶│ Submit  │   │
│  │ Detail  │    │ Verify  │    │ Criteria│    │ Photo/  │    │ Success │   │
│  │         │    │         │    │         │    │ Review  │    │         │   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘   │
│       │              │                              │                        │
│       │              │ Failed                       │ Optional               │
│       │              ▼                              ▼                        │
│       │        ┌─────────────┐              ┌─────────────┐                 │
│       │        │  Location   │              │ Also Rate   │                 │
│       │        │  Error      │              │   Venue?    │                 │
│       │        └─────────────┘              └─────────────┘                 │
│       │                                           │                          │
│       │                                           ▼                          │
│       │                                    ┌─────────────┐                  │
│       │                                    │ Rate Venue  │                  │
│       │                                    │  Criteria   │                  │
│       │                                    └─────────────┘                  │
│       │                                                                      │
│       │  Alternative entry points:                                          │
│       ├──────────────────────────────────────────────────────────────────── │
│       │  • FAB "+" button → Search/Select Venue → Select Item → Continue   │
│       │  • Venue Detail → "Rate" button → Select Item → Continue           │
│       │  • Nearby venues → Quick rate → Continue                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Detailed Steps:**

1. **Entry Point** - User arrives at item from:
   - Search results
   - Venue menu page
   - Discovery/Top lists
   - Friend's feed

2. **Location Verification**
   ```
   User taps "Rate This Item"
         │
         ▼
   Request GPS permission (if not granted)
         │
         ├── Permission Denied → Show explanation, offer to continue unverified
         │
         ▼
   Get device location
         │
         ├── Location Error → Retry or continue unverified
         │
         ▼
   Send to API: POST /geo/verify { venueId, coordinates }
         │
         ├── Within 100m → ✓ Proceed with verified badge
         │
         └── Too far → Show distance, offer to continue unverified
   ```

3. **Rating Criteria** (based on item category)
   - For Pizza: Taste, Dough, Ingredients, Portion, Value, Presentation
   - Each criterion: 5-star rating with optional half-stars
   - Show overall score preview as user rates

4. **Review Content** (optional)
   - Text review (max 2000 characters)
   - Add up to 5 photos
   - Camera capture or gallery selection

5. **Venue Rating** (optional)
   - Prompt: "Also rate the venue?"
   - If yes: Show venue criteria (Service, Atmosphere, etc.)

6. **Submit**
   - Show confirmation with preview
   - Submit to API
   - Show success screen with share options

### 2.2 Venue Review Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            VENUE REVIEW FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │ Venue   │───▶│Location │───▶│  Rate   │───▶│  Add    │───▶│ Submit  │   │
│  │ Detail  │    │ Verify  │    │ Venue   │    │ Photo/  │    │ Success │   │
│  │         │    │         │    │Criteria │    │ Review  │    │         │   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘   │
│                                                    │                         │
│                                                    │ Optional                │
│                                                    ▼                         │
│                                             ┌─────────────┐                 │
│                                             │ Also Rate   │                 │
│                                             │   Items?    │                 │
│                                             └─────────────┘                 │
│                                                    │                         │
│                                                    ▼                         │
│                                             ┌─────────────┐                 │
│                                             │ Select &    │                 │
│                                             │ Rate Items  │                 │
│                                             └─────────────┘                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Discovery Flows

### 3.1 Search Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SEARCH FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐                   │
│  │ Search  │───▶│  Type   │───▶│ Results │───▶│ Detail  │                   │
│  │  Bar    │    │  Query  │    │  List   │    │  Page   │                   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘                   │
│                      │                              │                        │
│                      │ Autocomplete                 │ Filter/Sort            │
│                      ▼                              ▼                        │
│               ┌─────────────┐              ┌─────────────┐                  │
│               │ Suggestions │              │   Filters   │                  │
│               │  Dropdown   │              │   Sheet     │                  │
│               └─────────────┘              └─────────────┘                  │
│                                                                              │
│  Filter Options:                                                            │
│  • Type: Venues, Items, Users                                               │
│  • Category: Pizza, Burger, Cocktail...                                     │
│  • Distance: 1km, 5km, 10km, Any                                            │
│  • Rating: 4+, 3+, 2+, Any                                                  │
│  • Price: $, $$, $$$, $$$$                                                  │
│  • Sort: Distance, Rating, Reviews, Trending                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Nearby Discovery Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NEARBY DISCOVERY FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐                   │
│  │ Discover│───▶│ Request │───▶│  Map    │───▶│ Venue   │                   │
│  │   Tab   │    │Location │    │  View   │    │ Detail  │                   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘                   │
│                                     │                                        │
│                                     │ Toggle View                            │
│                                     ▼                                        │
│                              ┌─────────────┐                                │
│                              │   List      │                                │
│                              │   View      │                                │
│                              └─────────────┘                                │
│                                                                              │
│  Map View Features:                                                         │
│  • Cluster pins for dense areas                                             │
│  • Tap pin → Preview card                                                   │
│  • Filter by category                                                       │
│  • Search this area                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 "Best Of" Discovery Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         "BEST OF" DISCOVERY FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Entry: "Best Pizza Near Me" or Category Selection                          │
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐                   │
│  │Category │───▶│ Top 10  │───▶│  Item   │───▶│  Venue  │                   │
│  │ Select  │    │  List   │    │ Detail  │    │ Detail  │                   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘                   │
│                      │                                                       │
│                      │ Change Location                                       │
│                      ▼                                                       │
│               ┌─────────────┐                                               │
│               │  Location   │                                               │
│               │   Picker    │                                               │
│               └─────────────┘                                               │
│                                                                              │
│  Top List Card:                                                             │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │  #1  🍕 Margherita Pizza                    ⭐ 4.7          │            │
│  │      📍 Pizza Palace · 450m away                            │            │
│  │      87 reviews · "Best crust in town!"                     │            │
│  │      $18.99                                                 │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Social Flows

### 4.1 Friend Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRIEND REQUEST FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Sending Request:                                                           │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                                  │
│  │  User   │───▶│   Add   │───▶│ Request │                                  │
│  │ Profile │    │ Friend  │    │  Sent   │                                  │
│  └─────────┘    └─────────┘    └─────────┘                                  │
│                                                                              │
│  Receiving Request:                                                         │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                                  │
│  │  Push   │───▶│ Request │───▶│ Accept/ │───▶  Feed updates with friend   │
│  │ Notif   │    │ Detail  │    │ Reject  │                                  │
│  └─────────┘    └─────────┘    └─────────┘                                  │
│                                                                              │
│  Finding Friends:                                                           │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐                   │
│  │ Friends │───▶│  Find   │───▶│ Search/ │───▶│  User   │                   │
│  │  List   │    │ Friends │    │ Import  │    │ Profile │                   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘                   │
│                                     │                                        │
│                                     │ Import Options                         │
│                                     ▼                                        │
│                              ┌─────────────┐                                │
│                              │ • Contacts  │                                │
│                              │ • Username  │                                │
│                              │ • QR Code   │                                │
│                              └─────────────┘                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Activity Feed Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ACTIVITY FEED FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐                                                                │
│  │  Home   │  ← Pull to refresh                                             │
│  │  Feed   │                                                                │
│  └────┬────┘                                                                │
│       │                                                                      │
│       ├──── Tap Avatar → User Profile                                       │
│       │                                                                      │
│       ├──── Tap Item Name → Item Detail                                     │
│       │                                                                      │
│       ├──── Tap Venue Name → Venue Detail                                   │
│       │                                                                      │
│       ├──── Tap Photo → Full Screen Gallery                                 │
│       │                                                                      │
│       ├──── Tap Like → Toggle like + update count                           │
│       │                                                                      │
│       ├──── Tap Comment → Comments sheet                                    │
│       │     └── Write comment → Submit → Refresh                            │
│       │                                                                      │
│       ├──── Tap Save → Toggle bookmark                                      │
│       │                                                                      │
│       └──── Tap Share → Share sheet (copy link, social apps)                │
│                                                                              │
│  Activity Types in Feed:                                                    │
│  • Friend rated an item                                                     │
│  • Friend reviewed a venue                                                  │
│  • Friend saved an item/venue                                               │
│  • Friend added new photos                                                  │
│  • Friend joined TasteBuddy (for new friends)                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Engagement Flows

### 5.1 Save/Bookmark Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SAVE/BOOKMARK FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                                  │
│  │ Item/   │───▶│  Tap    │───▶│  Saved  │                                  │
│  │ Venue   │    │ 🔖 Save │    │  Toast  │                                  │
│  └─────────┘    └─────────┘    └─────────┘                                  │
│                                                                              │
│  Accessing Saved:                                                           │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                                  │
│  │ Saved   │───▶│ Venues/ │───▶│ Detail  │                                  │
│  │  Tab    │    │  Items  │    │  Page   │                                  │
│  └─────────┘    └─────────┘    └─────────┘                                  │
│                      │                                                       │
│                      │ Sort by: Recent, Rating, Name                         │
│                      │ Filter by: Category                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Notification Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NOTIFICATION FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                                  │
│  │  Push   │───▶│  Notif  │───▶│ Target  │                                  │
│  │ Notif   │    │  List   │    │ Screen  │                                  │
│  └─────────┘    └─────────┘    └─────────┘                                  │
│                      │                                                       │
│                      │ Mark as Read                                          │
│                      │ Mark All as Read                                      │
│                                                                              │
│  Notification Types & Targets:                                              │
│  • Friend request received → Friend profile                                 │
│  • Friend request accepted → Friend profile                                 │
│  • Review liked → Review detail                                             │
│  • Review commented → Review detail (comments)                              │
│  • Mentioned in review → Review detail                                      │
│  • Venue you saved has new top item → Item detail                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Error & Edge Case Flows

### 6.1 Location Permission Denied

```
User attempts to rate
        │
        ▼
Permission denied
        │
        ▼
┌─────────────────────────────────────┐
│  📍 Location Needed                 │
│                                     │
│  To verify your review, we need     │
│  access to your location.           │
│                                     │
│  [Open Settings]  [Skip]            │
│                                     │
│  ⚠️ Reviews without location        │
│  verification will be marked        │
│  as "Unverified"                    │
└─────────────────────────────────────┘
```

### 6.2 Offline Mode

```
User opens app while offline
        │
        ▼
┌─────────────────────────────────────┐
│  📱 You're Offline                  │
│                                     │
│  Some features are limited.         │
│  • Browse saved venues ✓            │
│  • View cached reviews ✓            │
│  • Submit new reviews ✗             │
│  • Search venues ✗                  │
│                                     │
│  [Retry Connection]                 │
└─────────────────────────────────────┘
```

### 6.3 Duplicate Review Prevention

```
User attempts second review for same item
        │
        ▼
┌─────────────────────────────────────┐
│  ⚠️ Already Reviewed                │
│                                     │
│  You rated this item 3 days ago.    │
│                                     │
│  [Edit Your Review]                 │
│  [View Your Review]                 │
│  [Cancel]                           │
└─────────────────────────────────────┘
```

---

## 7. User Flow Summary Matrix

| Flow | Entry Points | Key Steps | Success State |
|------|--------------|-----------|---------------|
| Register | Welcome, App Store | Form → Email → Setup | Home Feed |
| Login | Welcome | Form → Validate | Home Feed |
| Item Review | Item, Venue, FAB, Feed | Verify → Rate → Photo → Submit | Success + Feed |
| Venue Review | Venue, FAB | Verify → Rate → Photo → Submit | Success + Feed |
| Search | Tab, FAB, Header | Query → Filter → Results | Detail View |
| Nearby | Tab | Location → Map/List | Venue/Item |
| Friend | Profile, Search | Request → Accept | Feed Updates |
| Save | Item, Venue, Feed | Tap Bookmark | Saved List |
| Report | Review, Profile | Select Reason → Submit | Confirmation |
