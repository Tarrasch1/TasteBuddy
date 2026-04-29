# TasteBuddy

A cross-platform social food and venue rating application.

## Overview

TasteBuddy helps users discover "what should I eat or drink, and where?" by enabling granular ratings of individual menu items at venues, with location-verified reviews.

## Features

- 🍕 Rate individual food and drink items with category-specific criteria
- 📍 Location-verified reviews for authenticity
- 👥 Social features with friend activity feeds
- 🔍 Discover top-rated items nearby
- 📱 Cross-platform: Web, iOS, and Android

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Web**: Next.js 14, React, TailwindCSS
- **Mobile**: React Native, Expo
- **Infrastructure**: Docker, Redis, S3

## Project Structure

```
tastebuddy/
├── apps/
│   ├── api/          # Backend API (Express + TypeScript)
│   ├── web/          # Web application (Next.js)
│   └── mobile/       # Mobile app (React Native + Expo)
├── packages/
│   ├── shared/       # Shared types and utilities
│   ├── ui/           # Shared UI components
│   └── config/       # Shared configuration
├── docs/             # Documentation
└── docker/           # Docker configurations
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 16+ with PostGIS

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tastebuddy.git
cd tastebuddy

# Install dependencies
pnpm install

# Start infrastructure (PostgreSQL, Redis)
docker-compose up -d

# Setup database
pnpm db:generate
pnpm db:push
pnpm db:seed

# Start development
pnpm dev
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tastebuddy?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AWS S3 / MinIO
S3_BUCKET="tastebuddy"
S3_REGION="us-east-1"
S3_ACCESS_KEY="your-access-key"
S3_SECRET_KEY="your-secret-key"
S3_ENDPOINT="http://localhost:9000"
```

## Development

```bash
# Run all apps in development
pnpm dev

# Run specific app
pnpm --filter api dev
pnpm --filter web dev
pnpm --filter mobile start

# Run tests
pnpm test

# Lint
pnpm lint

# Format
pnpm format
```

## Documentation

See the [docs](./docs) folder for:

- [Product Requirements](./docs/01-PRODUCT_REQUIREMENTS.md)
- [Tech Stack](./docs/02-TECH_STACK.md)
- [Database Schema](./docs/03-DATABASE_SCHEMA.md)
- [API Design](./docs/04-API_DESIGN.md)
- [Screens](./docs/05-SCREENS.md)
- [Geolocation](./docs/06-GEOLOCATION.md)
- [User Flows](./docs/07-USER_FLOWS.md)
- [MVP Roadmap](./docs/08-MVP_ROADMAP.md)

## License

MIT
