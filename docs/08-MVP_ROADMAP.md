# TasteBuddy - MVP Development Roadmap

## 1. MVP Scope Definition

### 1.1 What's In MVP

| Feature | Scope |
|---------|-------|
| **Authentication** | Email/password, Google OAuth |
| **User Profiles** | Basic profile, public view |
| **Venues** | CRUD, search by name/location, categories |
| **Items** | CRUD, search, categories, rating criteria |
| **Reviews** | Item ratings, venue ratings, photos |
| **Geolocation** | Basic verification (100m radius) |
| **Social** | Friends, activity feed (read-only) |
| **Discovery** | Nearby, top-rated lists, basic search |
| **Admin** | Basic moderation tools |

### 1.2 What's NOT in MVP

- Apple Sign-In
- Comments on reviews
- Following (friends only)
- Advanced anti-spoofing
- Push notifications
- Personalized recommendations
- Compare items feature
- Venue owner features
- Multi-language support
- Offline mode
- Stories feature

---

## 2. Development Phases

### Phase 0: Project Setup (1 week)

```
Week 1
├── Day 1-2: Repository & Tooling
│   ├── Initialize monorepo with Turborepo
│   ├── Configure ESLint, Prettier, TypeScript
│   ├── Setup Git hooks (Husky)
│   └── Create CI/CD pipeline (GitHub Actions)
│
├── Day 3-4: Infrastructure
│   ├── Docker Compose for local dev
│   ├── PostgreSQL + PostGIS setup
│   ├── Redis setup
│   ├── MinIO (S3 compatible) setup
│   └── Environment configuration
│
└── Day 5: Documentation & Planning
    ├── API documentation setup (Swagger)
    ├── Component documentation (Storybook)
    └── Sprint planning
```

**Deliverables:**
- [ ] Monorepo with all packages
- [ ] Local development environment
- [ ] CI pipeline running
- [ ] Documentation setup

---

### Phase 1: Backend Foundation (2 weeks)

```
Week 2-3
├── Core Infrastructure
│   ├── Express.js server setup
│   ├── Prisma schema & migrations
│   ├── Error handling middleware
│   ├── Logging (Winston/Pino)
│   └── Request validation (Zod)
│
├── Authentication
│   ├── JWT token service
│   ├── Password hashing (bcrypt)
│   ├── Register endpoint
│   ├── Login endpoint
│   ├── Refresh token flow
│   ├── Google OAuth integration
│   └── Auth middleware
│
├── User Management
│   ├── User CRUD operations
│   ├── Profile endpoints
│   └── Account deletion
│
└── Testing
    ├── Unit tests setup (Jest)
    └── Auth endpoint tests
```

**Deliverables:**
- [ ] Authentication working (email + Google)
- [ ] User registration & login
- [ ] Profile management API
- [ ] 80%+ test coverage on auth

---

### Phase 2: Core Domain (2 weeks)

```
Week 4-5
├── Venue Management
│   ├── Venue model & migrations
│   ├── CRUD endpoints
│   ├── Category management
│   ├── Search by name
│   ├── Geospatial queries (PostGIS)
│   └── Nearby venues endpoint
│
├── Item Management
│   ├── Item model & migrations
│   ├── CRUD endpoints
│   ├── Category management
│   ├── Rating criteria system
│   └── Search endpoints
│
├── Photo Upload
│   ├── S3/MinIO integration
│   ├── Image processing (Sharp)
│   ├── Upload endpoint
│   └── CDN URL generation
│
└── Testing
    ├── Venue API tests
    ├── Item API tests
    └── Integration tests
```

**Deliverables:**
- [ ] Venues CRUD working
- [ ] Items CRUD working
- [ ] Photo upload working
- [ ] Geospatial search working
- [ ] Seeded test data

---

### Phase 3: Rating System (2 weeks)

```
Week 6-7
├── Reviews
│   ├── Venue review model
│   ├── Item review model
│   ├── Review CRUD endpoints
│   ├── Multi-criteria scoring
│   ├── Overall score calculation
│   └── Review listing/pagination
│
├── Geolocation Verification
│   ├── Haversine distance calculation
│   ├── Verification endpoint
│   ├── Verification token generation
│   ├── Rate limiting
│   └── Basic spoofing detection
│
├── Score Aggregation
│   ├── Background job (Bull)
│   ├── Venue score recalculation
│   ├── Item score recalculation
│   └── Caching (Redis)
│
└── Testing
    ├── Review API tests
    ├── Geolocation tests
    └── Score calculation tests
```

**Deliverables:**
- [ ] Item reviews with criteria scores
- [ ] Venue reviews with criteria scores
- [ ] Location verification working
- [ ] Automatic score aggregation
- [ ] Rate limiting in place

---

### Phase 4: Social Features (2 weeks)

```
Week 8-9
├── Friendships
│   ├── Friend request model
│   ├── Send request endpoint
│   ├── Accept/reject endpoints
│   ├── Friends list endpoint
│   └── Block functionality
│
├── Activity Feed
│   ├── Activity model
│   ├── Activity creation on review
│   ├── Feed aggregation query
│   ├── Pagination
│   └── Redis caching
│
├── Likes & Saves
│   ├── Review likes
│   ├── Venue saves (bookmarks)
│   ├── Item saves
│   └── Like count updates
│
└── Testing
    ├── Social API tests
    └── Feed generation tests
```

**Deliverables:**
- [ ] Friend request system
- [ ] Activity feed working
- [ ] Like reviews
- [ ] Save venues/items

---

### Phase 5: Web Frontend (3 weeks)

```
Week 10-12
├── Setup
│   ├── Next.js 14 project
│   ├── TailwindCSS configuration
│   ├── Component library setup
│   ├── API client (React Query)
│   └── Auth context (Zustand)
│
├── Core Pages
│   ├── Home/Feed page
│   ├── Login/Register pages
│   ├── Venue detail page
│   ├── Item detail page
│   ├── Search/Discover page
│   ├── User profile page
│   └── Settings page
│
├── Components
│   ├── Navigation (header, tabs)
│   ├── Venue card
│   ├── Item card
│   ├── Review card
│   ├── Rating input
│   ├── Photo gallery
│   ├── Map integration
│   └── Forms
│
├── Features
│   ├── Authentication flow
│   ├── Review submission
│   ├── Location verification
│   ├── Search with filters
│   └── Responsive design
│
└── Testing
    ├── Component tests
    ├── E2E tests (Cypress)
    └── Accessibility audit
```

**Deliverables:**
- [ ] Fully functional web app
- [ ] All MVP screens implemented
- [ ] Mobile-responsive
- [ ] Core user flows working
- [ ] E2E tests passing

---

### Phase 6: Mobile App (3 weeks)

```
Week 13-15
├── Setup
│   ├── Expo project initialization
│   ├── NativeWind configuration
│   ├── Navigation setup
│   ├── API client setup
│   └── Auth storage (SecureStore)
│
├── Core Screens
│   ├── Tab navigator
│   ├── Home/Feed screen
│   ├── Login/Register screens
│   ├── Venue detail screen
│   ├── Item detail screen
│   ├── Search/Discover screen
│   ├── Profile screen
│   └── Review composer
│
├── Native Features
│   ├── GPS location service
│   ├── Camera integration
│   ├── Image picker
│   ├── Native maps
│   └── Deep linking
│
├── Platform Polish
│   ├── iOS specific styling
│   ├── Android specific styling
│   ├── Native animations
│   └── Performance optimization
│
└── Testing
    ├── Manual testing (iOS + Android)
    └── Basic E2E (Detox)
```

**Deliverables:**
- [ ] iOS app working on device
- [ ] Android app working on device
- [ ] Native location verification
- [ ] Camera/photo upload working
- [ ] Ready for TestFlight/Play Store beta

---

### Phase 7: Admin & Polish (1 week)

```
Week 16
├── Admin Panel
│   ├── Dashboard overview
│   ├── User management
│   ├── Venue moderation
│   ├── Review moderation
│   └── Reports handling
│
├── Bug Fixes
│   ├── Address QA findings
│   ├── Performance issues
│   └── Edge cases
│
├── Documentation
│   ├── API documentation complete
│   ├── Deployment guide
│   └── User guide
│
└── Launch Prep
    ├── Production environment
    ├── Monitoring setup
    ├── Error tracking (Sentry)
    └── Analytics (Mixpanel)
```

**Deliverables:**
- [ ] Admin panel functional
- [ ] All critical bugs fixed
- [ ] Production ready
- [ ] Monitoring in place

---

## 3. Sprint Schedule

| Sprint | Weeks | Focus | Key Milestone |
|--------|-------|-------|---------------|
| Sprint 0 | 1 | Setup | Dev environment ready |
| Sprint 1 | 2-3 | Auth | Users can register/login |
| Sprint 2 | 4-5 | Domain | Venues & items working |
| Sprint 3 | 6-7 | Reviews | Rating system complete |
| Sprint 4 | 8-9 | Social | Feed & friends working |
| Sprint 5 | 10-11 | Web UI | Core web flows |
| Sprint 6 | 12 | Web Polish | Web MVP complete |
| Sprint 7 | 13-14 | Mobile | Core mobile flows |
| Sprint 8 | 15 | Mobile Polish | Mobile MVP complete |
| Sprint 9 | 16 | Launch | Production ready |

---

## 4. Team Allocation

### Recommended Team (MVP)

| Role | Count | Focus |
|------|-------|-------|
| Backend Developer | 1-2 | API, database, services |
| Frontend Developer | 1-2 | Web app, shared components |
| Mobile Developer | 1 | React Native app |
| Designer | 0.5 | UI/UX, design system |
| QA | 0.5 | Testing, bug tracking |
| Product/Scrum | 0.5 | Management, planning |

### Solo Developer Path

If building alone, prioritize:
1. Backend + Web together (weeks 1-12)
2. Mobile after web is stable (weeks 13-15)
3. Use Expo for faster mobile development
4. Leverage component sharing between web/mobile

---

## 5. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| GPS accuracy issues | High | Allow unverified reviews, improve UX |
| Fake reviews | High | Verification badges, moderation tools |
| Scale issues | Medium | Start with single region, optimize later |
| App store rejection | Medium | Follow guidelines, prepare appeals |
| Feature creep | High | Strict MVP scope, defer to v1.1 |

---

## 6. Post-MVP Roadmap

### v1.1 (Month 4-5)
- Push notifications
- Apple Sign-In
- Comments on reviews
- Advanced search filters

### v1.2 (Month 6-7)
- Following/followers model
- Personalized recommendations
- Share to social media
- Item comparison

### v2.0 (Month 8+)
- Venue owner dashboard
- Multi-language support
- Offline mode
- AI photo analysis
- Stories feature

---

## 7. Success Metrics for MVP

| Metric | Target | Measurement |
|--------|--------|-------------|
| Beta users | 500 | Sign-ups |
| Reviews created | 2000 | Database count |
| Verified reviews | 80% | Percentage |
| D7 retention | 30% | Analytics |
| App crashes | < 1% | Sentry |
| API latency p95 | < 300ms | DataDog |
| App store rating | 4.0+ | Store metrics |

---

## 8. Launch Checklist

### Pre-Launch
- [ ] Production infrastructure deployed
- [ ] SSL certificates configured
- [ ] Database backups automated
- [ ] Monitoring dashboards set up
- [ ] Error tracking configured
- [ ] Rate limiting enabled
- [ ] Security audit complete
- [ ] GDPR/privacy compliance verified
- [ ] Terms of service published
- [ ] Privacy policy published
- [ ] App store assets prepared
- [ ] Beta testers recruited

### Launch Day
- [ ] Backend scaled appropriately
- [ ] CDN warmed up
- [ ] Support channels ready
- [ ] Social media announcement
- [ ] App store submission

### Post-Launch
- [ ] Monitor error rates
- [ ] Review user feedback
- [ ] Address critical bugs
- [ ] Plan v1.1 features
