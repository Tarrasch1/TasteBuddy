# TasteBuddy - Technical Stack

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Web App       │  │   iOS App       │  │   Android App   │              │
│  │   (Next.js)     │  │   (React Native)│  │   (React Native)│              │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘              │
│           │                    │                    │                        │
│           └────────────────────┼────────────────────┘                        │
│                                │                                             │
│                    ┌───────────▼───────────┐                                 │
│                    │    Shared UI Library  │                                 │
│                    │    (React Native Web) │                                 │
│                    └───────────────────────┘                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTPS/REST + WebSocket
                                 │
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        API Gateway (nginx)                           │    │
│  │                      Rate Limiting, SSL Termination                  │    │
│  └───────────────────────────────┬─────────────────────────────────────┘    │
│                                  │                                           │
│  ┌───────────────────────────────▼─────────────────────────────────────┐    │
│  │                    Node.js Backend (Express + TypeScript)            │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │    │
│  │  │ Auth        │ │ Venues      │ │ Ratings     │ │ Social      │    │    │
│  │  │ Service     │ │ Service     │ │ Service     │ │ Service     │    │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │    │
│  │  │ Search      │ │ Geo         │ │ Media       │ │ Notification│    │    │
│  │  │ Service     │ │ Service     │ │ Service     │ │ Service     │    │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 │
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ PostgreSQL  │  │   Redis     │  │Elasticsearch│  │    S3       │        │
│  │ (Primary DB)│  │  (Cache)    │  │  (Search)   │  │  (Media)    │        │
│  │             │  │             │  │             │  │             │        │
│  │ - Users     │  │ - Sessions  │  │ - Venues    │  │ - Photos    │        │
│  │ - Venues    │  │ - Geo Cache │  │ - Items     │  │ - Avatars   │        │
│  │ - Ratings   │  │ - Feed      │  │ - Reviews   │  │ - Assets    │        │
│  │ - Social    │  │ - Rate Limit│  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
│  PostGIS Extension for geospatial queries                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Technology Choices

### Frontend (Web)
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with SSR/SSG |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 3.x | Utility-first styling |
| Zustand | 4.x | State management |
| React Query | 5.x | Server state management |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |
| Mapbox GL | 3.x | Maps and geolocation |

### Mobile (iOS & Android)
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.73.x | Cross-platform mobile |
| Expo | 50.x | Development toolkit |
| React Navigation | 6.x | Navigation |
| NativeWind | 4.x | TailwindCSS for RN |
| React Native Maps | 1.x | Native maps |
| Expo Location | 16.x | GPS services |
| AsyncStorage | 1.x | Local storage |
| React Native Image Picker | 7.x | Photo capture |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x LTS | Runtime environment |
| Express.js | 4.x | Web framework |
| TypeScript | 5.x | Type safety |
| Prisma | 5.x | ORM |
| PostgreSQL | 16.x | Primary database |
| PostGIS | 3.x | Geospatial extension |
| Redis | 7.x | Caching, sessions |
| Elasticsearch | 8.x | Full-text search |
| JWT | - | Authentication |
| Passport.js | 0.7.x | Auth strategies |
| Multer | 1.x | File uploads |
| Sharp | 0.33.x | Image processing |
| Bull | 4.x | Job queues |
| Socket.io | 4.x | Real-time updates |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| AWS / GCP | Cloud platform |
| Docker | Containerization |
| Kubernetes | Orchestration (scale) |
| Terraform | Infrastructure as Code |
| GitHub Actions | CI/CD |
| Cloudflare | CDN, DDoS protection |
| AWS S3 | Object storage |
| AWS CloudWatch | Monitoring |
| Sentry | Error tracking |
| DataDog | APM |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | Linting |
| Prettier | Code formatting |
| Husky | Git hooks |
| Jest | Unit testing |
| Cypress | E2E testing (web) |
| Detox | E2E testing (mobile) |
| Swagger/OpenAPI | API documentation |
| Storybook | Component library |

## 3. Key Architecture Decisions

### 3.1 Monorepo Structure
Using **Turborepo** for monorepo management:
- Shared TypeScript types
- Shared validation schemas
- Shared utility functions
- Single versioning

### 3.2 API Design
- **REST** for CRUD operations
- **WebSocket** for real-time feed updates
- **GraphQL** consideration for v2 (complex nested queries)

### 3.3 Database Strategy
- **PostgreSQL + PostGIS** for reliability and geospatial
- **Read replicas** for scaling reads
- **Redis** for caching hot data (venue scores, user sessions)
- **Elasticsearch** for search (optional, can start with PostgreSQL full-text)

### 3.4 Authentication Flow
```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Client  │────▶│  API    │────▶│  Auth   │────▶│   DB    │
│         │◀────│ Gateway │◀────│ Service │◀────│         │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
     │                │
     │                │ JWT Access Token (15min)
     │                │ Refresh Token (7 days, httpOnly cookie)
     │                │
     └────────────────┘
```

### 3.5 Geolocation Verification Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Mobile    │     │   Backend   │     │   PostGIS   │
│   GPS API   │────▶│   Verify    │────▶│   Distance  │
│             │     │   Service   │     │   Calc      │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    Haversine Formula
                    Earth radius: 6371km
                    Max distance: 100m
```

### 3.6 Caching Strategy
| Data | TTL | Cache |
|------|-----|-------|
| User session | 15 min | Redis |
| Venue details | 5 min | Redis |
| Item scores | 2 min | Redis |
| Search results | 1 min | Redis |
| Static assets | 1 year | CDN |

### 3.7 Image Processing Pipeline
```
Upload → Validate → Virus Scan → Resize → Optimize → S3 → CDN
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                   Thumbnail              Full Size
                   (200x200)              (1200x1200)
```

## 4. Security Measures

### Authentication
- Bcrypt password hashing (cost factor 12)
- JWT with RS256 signing
- Refresh token rotation
- Account lockout after 5 failed attempts

### API Security
- Rate limiting (100 req/min general, 10 req/min auth)
- CORS with whitelist
- Helmet.js security headers
- Input sanitization
- Parameterized queries (Prisma)

### Data Protection
- Encryption at rest (AES-256)
- TLS 1.3 in transit
- PII anonymization
- GDPR compliance tools
- Right to deletion support

### Mobile Security
- Certificate pinning
- Secure storage for tokens
- Jailbreak/root detection
- Anti-tampering checks

## 5. Scalability Plan

### Phase 1: MVP (0-10k users)
- Single PostgreSQL instance
- Single Node.js instance
- S3 + CloudFront
- Basic Redis

### Phase 2: Growth (10k-100k users)
- PostgreSQL read replicas
- Node.js horizontal scaling (3 instances)
- Elasticsearch for search
- Redis cluster

### Phase 3: Scale (100k-1M users)
- Database sharding by region
- Kubernetes orchestration
- Global CDN
- Microservices extraction
- Event-driven architecture

## 6. Monitoring & Observability

### Metrics
- Request latency (p50, p95, p99)
- Error rates
- Database query times
- Cache hit rates
- Active users

### Logging
- Structured JSON logs
- Correlation IDs
- Log aggregation (ELK stack)
- Retention policy (30 days)

### Alerting
- Error rate > 1%
- Latency p99 > 500ms
- Database connections > 80%
- Disk usage > 80%

## 7. Development Environment

### Local Setup
```bash
# Prerequisites
- Node.js 20.x
- Docker & Docker Compose
- pnpm 8.x

# Commands
pnpm install           # Install dependencies
pnpm dev               # Start all services
pnpm test              # Run tests
pnpm lint              # Lint code
pnpm build             # Production build
```

### Docker Compose Services
- PostgreSQL + PostGIS
- Redis
- Elasticsearch (optional)
- MinIO (S3 compatible)
- Mailhog (email testing)
