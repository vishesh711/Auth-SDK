# DevAuth Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [Database Schema](#database-schema)
7. [API Architecture](#api-architecture)
8. [Authentication Flow](#authentication-flow)
9. [Deployment Architecture](#deployment-architecture)
10. [Scalability Considerations](#scalability-considerations)
11. [Technology Stack](#technology-stack)

## System Overview

DevAuth is a multi-tenant authentication-as-a-service platform that provides secure, scalable authentication for applications. The system is designed with a microservices-inspired architecture, focusing on:

- **Security**: Industry-standard encryption, JWT tokens, and secure credential storage
- **Scalability**: Stateless API design, horizontal scaling capabilities
- **Multi-tenancy**: Complete data isolation between applications
- **Developer Experience**: Easy-to-use SDKs and comprehensive API

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │  Mobile App  │  │ Backend Svc  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
│                    ┌───────▼────────┐                            │
│                    │  DevAuth SDKs  │                            │
│                    │  (JS/Python)   │                            │
│                    └───────┬────────┘                            │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                      DevAuth Platform                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              API Gateway / FastAPI Backend               │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │   │
│  │  │   Auth    │  │   Token    │  │    Rate    │          │   │
│  │  │  Service  │  │  Service   │  │  Limiter   │          │   │
│  │  └────────────┘  └────────────┘  └────────────┘          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │   │
│  │  │   Email    │  │  Portal    │  │   Audit   │          │   │
│  │  │  Service   │  │  Service   │  │  Service  │          │   │
│  │  └────────────┘  └────────────┘  └────────────┘          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Developer Portal (Next.js)                  │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │   │
│  │  │ Dashboard  │  │ App Mgmt   │  │ User Mgmt  │          │   │
│  │  └────────────┘  └────────────┘  └────────────┘          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Data Layer                             │   │
│  │  ┌────────────┐              ┌────────────┐              │   │
│  │  │ PostgreSQL │              │   Redis    │              │   │
│  │  │  (Primary) │              │   (Cache)  │              │   │
│  │  └────────────┘              └────────────┘              │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                    External Services                             │
│  ┌────────────┐                                                 │
│  │ SMTP/Email │                                                 │
│  │  Provider  │                                                 │
│  └────────────┘                                                 │
└───────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. API Backend (FastAPI)

**Responsibilities:**
- Request routing and validation
- Authentication and authorization
- Token generation and validation
- Rate limiting enforcement
- Business logic orchestration

**Key Components:**
- **Routes** (`app/api/v1/`): HTTP endpoint handlers
- **Services** (`app/services/`): Business logic layer
- **Models** (`app/models/`): Database models (SQLAlchemy)
- **Schemas** (`app/schemas/`): Request/response validation (Pydantic)
- **Middleware** (`app/core/middleware.py`): Authentication, rate limiting
- **Utils** (`app/utils/`): Cryptographic functions, helpers

**Architecture Pattern:** Layered architecture with clear separation of concerns

```
Request → Middleware → Route → Service → Model → Database
                ↓
            Response ← Schema ← Service ← Model ← Database
```

### 2. Developer Portal (Next.js)

**Responsibilities:**
- Developer authentication UI
- Application management interface
- API key management
- User management dashboard

**Key Components:**
- **Pages** (`app/`): Next.js App Router pages
- **API Client** (`lib/api.ts`): Axios-based API client
- **Components**: Reusable UI components
- **State Management**: React Query for server state

**Architecture Pattern:** Component-based architecture with server-side rendering

### 3. JavaScript/TypeScript SDK

**Responsibilities:**
- Client-side authentication
- Token management and storage
- Automatic token refresh
- API request handling

**Key Features:**
- Automatic token refresh on 401 responses
- Token storage (localStorage in browser, memory in Node.js)
- TypeScript type definitions
- Promise-based API

### 4. Python SDK

**Responsibilities:**
- Backend token validation
- Framework integrations (FastAPI, Flask)
- Token introspection

**Key Features:**
- FastAPI dependency injection
- Flask decorator support
- Async/await support
- Type hints

## Data Flow

### User Signup Flow

```
1. Client → SDK: signup(email, password)
2. SDK → API: POST /v1/auth/signup
   Headers: x-app-id, x-api-key
3. API Middleware:
   - Validate API key
   - Check rate limit
4. Auth Service:
   - Validate email format
   - Check duplicate email
   - Hash password (bcrypt)
   - Create user record
   - Generate verification token
5. Email Service:
   - Send verification email
6. API → SDK: 201 Created { user }
7. SDK → Client: User object
```

### User Login Flow

```
1. Client → SDK: login(email, password)
2. SDK → API: POST /v1/auth/login
3. API Middleware:
   - Validate API key
   - Check rate limit
   - Check brute force protection
4. Auth Service:
   - Find user by email
   - Verify password
   - Check account lockout
   - Generate access token (JWT, 15 min)
   - Generate refresh token (JWT, 7 days)
   - Hash refresh token (SHA-256)
   - Create session record
   - Update last_login_at
5. API → SDK: 200 OK { access_token, refresh_token, user }
6. SDK:
   - Store tokens in localStorage/memory
   - Return session to client
```

### Token Refresh Flow

```
1. SDK detects 401 response
2. SDK → API: POST /v1/auth/refresh
   Body: { refresh_token }
3. API:
   - Validate refresh token (JWT signature + expiration)
   - Find session by token hash
   - Verify session not revoked
   - Generate new access token
4. API → SDK: 200 OK { access_token }
5. SDK:
   - Update stored access token
   - Retry original request
```

### Token Validation Flow (Backend)

```
1. Backend Service → Python SDK: verify_token(token)
2. SDK → API: POST /v1/auth/introspect
   Headers: x-app-id, x-api-key
   Body: { token }
3. API:
   - Validate API key
   - Decode and verify JWT token
   - Check expiration
   - Get user from database
4. API → SDK: 200 OK { active: true, user: {...} }
5. SDK → Backend Service: User object
```

## Security Architecture

### Authentication Mechanisms

1. **API Key Authentication**
   - Used for: Application-level authentication
   - Format: `x-api-key` header + `x-app-id` header
   - Storage: Hashed with SHA-256 in database
   - Validation: Check hash, check revocation status

2. **JWT Token Authentication**
   - Used for: User-level authentication
   - Format: `Authorization: Bearer <token>`
   - Algorithm: RS256 (RSA with SHA-256)
   - Access Token: 15 minutes expiration
   - Refresh Token: 7 days expiration

### Encryption & Hashing

1. **Passwords**
   - Algorithm: bcrypt
   - Work Factor: 12 rounds
   - Storage: Hashed in database

2. **Tokens**
   - Refresh Tokens: SHA-256 hash stored in database
   - API Keys: SHA-256 hash stored in database
   - Access Tokens: JWT (not stored, validated via signature)

3. **Application Secrets**
   - Algorithm: AES-256 (Fernet)
   - Key: 32-byte key from environment variable
   - Storage: Encrypted in database

### Security Features

1. **Rate Limiting**
   - Per API key: 60 requests/minute
   - Sliding window algorithm
   - Redis-backed counters

2. **Brute Force Protection**
   - Track failed login attempts per email + IP
   - Lockout: 15 minutes after 5 failed attempts
   - Redis-backed tracking

3. **Multi-Tenant Isolation**
   - All queries filtered by `app_id`
   - Foreign key constraints enforce isolation
   - API key validation ensures correct app_id

4. **Token Security**
   - Refresh tokens hashed before storage
   - Session revocation on password change
   - Token rotation on refresh (optional)

## Database Schema

### Core Tables

1. **developers**
   - Portal developer accounts
   - Fields: id, email, password_hash, name

2. **applications**
   - Multi-tenant applications
   - Fields: id, developer_id, name, environment, app_id, app_secret_encrypted
   - Unique: app_id

3. **users**
   - End-user accounts (per application)
   - Fields: id, app_id, email, password_hash, email_verified, user_metadata
   - Unique: (app_id, email)

4. **sessions**
   - Active user sessions
   - Fields: id, user_id, app_id, refresh_token_hash, expires_at, revoked
   - Indexes: user_id, refresh_token_hash, expires_at

5. **api_keys**
   - Application API keys
   - Fields: id, app_id, key_hash, label, revoked
   - Unique: key_hash

6. **email_verification_tokens**
   - Email verification tokens
   - Fields: id, user_id, token_hash, expires_at, used
   - TTL: 48 hours

7. **password_reset_tokens**
   - Password reset tokens
   - Fields: id, user_id, token_hash, expires_at, used
   - TTL: 1 hour

8. **audit_logs**
   - Audit trail for security events
   - Fields: id, user_id, app_id, developer_id, action, ip_address, event_metadata

### Relationships

```
developers (1) ──< (many) applications
applications (1) ──< (many) users
applications (1) ──< (many) api_keys
users (1) ──< (many) sessions
users (1) ──< (many) email_verification_tokens
users (1) ──< (many) password_reset_tokens
```

## API Architecture

### RESTful Design Principles

- **Resource-based URLs**: `/v1/auth/signup`, `/v1/portal/applications`
- **HTTP Methods**: GET (read), POST (create), DELETE (delete)
- **Status Codes**: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 404 (not found), 429 (rate limited)
- **Consistent Error Format**: `{ error: { code, message, details } }`

### API Versioning

- Current version: `v1`
- Version in URL path: `/v1/auth/...`
- Backward compatibility maintained within major version

### Request/Response Format

**Request Headers:**
```
x-app-id: <application-id>
x-api-key: <api-key>
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Response Format:**
```json
{
  "data": { ... },
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

## Authentication Flow

### End-User Authentication

```
┌─────────┐         ┌──────┐         ┌─────┐         ┌──────────┐
│ Client  │────────▶│ SDK  │────────▶│ API │────────▶│ Database │
└─────────┘         └──────┘         └─────┘         └──────────┘
     │                  │                │                  │
     │  1. signup()     │                │                  │
     │◀─────────────────│                │                  │
     │                  │  2. POST /signup│                  │
     │                  │────────────────▶│                  │
     │                  │                 │  3. Create user  │
     │                  │                 │─────────────────▶│
     │                  │                 │◀─────────────────│
     │                  │  4. 201 Created │                  │
     │                  │◀────────────────│                  │
     │  5. User object  │                 │                  │
     │◀─────────────────│                 │                  │
     │                  │                 │                  │
     │  6. login()      │                 │                  │
     │─────────────────▶│                 │                  │
     │                  │  7. POST /login │                  │
     │                  │────────────────▶│                  │
     │                  │                 │  8. Verify creds │
     │                  │                 │─────────────────▶│
     │                  │                 │◀─────────────────│
     │                  │                 │  9. Create tokens│
     │                  │                 │─────────────────▶│
     │                  │                 │◀─────────────────│
     │                  │ 10. 200 OK      │                  │
     │                  │◀────────────────│                  │
     │ 11. Session      │                 │                  │
     │◀─────────────────│                 │                  │
```

### Developer Portal Authentication

Similar flow but uses developer credentials and returns developer tokens (app_id="portal").

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────┐
│         Docker Compose                  │
│  ┌──────────┐  ┌──────────┐            │
│  │   API    │  │  Portal  │            │
│  │ :8000    │  │  :3000   │            │
│  └────┬─────┘  └────┬─────┘            │
│       │             │                   │
│  ┌────▼─────┐  ┌────▼─────┐            │
│  │PostgreSQL│  │  Redis   │            │
│  │  :5432   │  │  :6379   │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

### Production Environment

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
│                  (nginx/traefik)                        │
└────────────┬───────────────────────┬────────────────────┘
             │                       │
    ┌────────▼────────┐     ┌────────▼────────┐
    │   API Instance  │     │   API Instance  │
    │   (Container)   │     │   (Container)   │
    └────────┬────────┘     └────────┬────────┘
             │                       │
    ┌────────▼───────────────────────▼────────┐
    │         PostgreSQL (Primary)              │
    │    ┌──────────┐      ┌──────────┐        │
    │    │  Read    │      │  Read    │        │
    │    │ Replica  │      │ Replica  │        │
    │    └──────────┘      └──────────┘        │
    └──────────────────────────────────────────┘
             │
    ┌────────▼────────┐
    │  Redis Cluster  │
    │  (3+ nodes)     │
    └─────────────────┘
```

### Container Architecture

**API Container:**
- Base: Python 3.11-slim
- Process: Uvicorn with Gunicorn workers
- Health Check: `/health` endpoint
- Port: 8000

**Portal Container:**
- Base: Node 20-alpine
- Process: Next.js standalone server
- Health Check: HTTP check on port 3000
- Port: 3000

**Database Container:**
- Image: PostgreSQL 15
- Persistence: Docker volume
- Health Check: `pg_isready`

**Redis Container:**
- Image: Redis 7-alpine
- Persistence: Docker volume
- Health Check: `redis-cli ping`

## Scalability Considerations

### Horizontal Scaling

**API Backend:**
- Stateless design (no session storage in memory)
- Can scale horizontally behind load balancer
- Database connection pooling (20 connections per instance)

**Portal:**
- Stateless Next.js application
- Can scale horizontally
- API calls go to load-balanced API

**Database:**
- Read replicas for read-heavy workloads
- Connection pooling per API instance
- Indexes on frequently queried columns

**Redis:**
- Redis Cluster for high availability
- Sharding by API key hash
- TTL-based expiration for automatic cleanup

### Performance Optimizations

1. **Database:**
   - Indexes on foreign keys and frequently queried columns
   - Partial indexes for active records (e.g., non-revoked sessions)
   - Connection pooling

2. **Caching:**
   - Redis for rate limiting counters
   - Redis for brute force tracking
   - API key validation could be cached (future enhancement)

3. **Background Jobs:**
   - APScheduler for token cleanup
   - Runs daily at 2 AM UTC
   - Prevents database bloat

### Limitations & Future Enhancements

**Current Limitations:**
- Single database instance (no read replicas)
- Single Redis instance (no cluster)
- No CDN for static assets
- No API response caching

**Future Enhancements:**
- Database read replicas
- Redis Cluster
- CDN integration
- API response caching (Redis)
- Webhook system for events
- Multi-region support

## Technology Stack

### Backend

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Framework | FastAPI | 0.104+ | Async support, automatic OpenAPI docs, high performance |
| Web Server | Uvicorn | 0.24+ | ASGI server, async support |
| ORM | SQLAlchemy | 2.0+ | Mature, async support, type hints |
| Migrations | Alembic | 1.12+ | Standard for SQLAlchemy |
| Validation | Pydantic | 2.5+ | Type validation, settings management |
| JWT | python-jose | 3.3+ | JWT support with cryptography |
| Password | bcrypt | 4.1+ | Industry standard, configurable work factor |
| Redis | redis | 5.0+ | Async support, connection pooling |
| Email | aiosmtplib | 3.0+ | Async SMTP client |
| Scheduler | APScheduler | 3.10+ | Background job scheduling |

### Frontend

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Framework | Next.js | 16.0+ | React framework, SSR, App Router |
| Language | TypeScript | 5.0+ | Type safety, better DX |
| Styling | Tailwind CSS | 4.0+ | Utility-first CSS, fast development |
| State | React Query | 5.17+ | Server state management, caching |
| HTTP | Axios | 1.6+ | HTTP client with interceptors |

### Infrastructure

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Database | PostgreSQL | 15+ | ACID compliance, JSONB support, mature |
| Cache | Redis | 7+ | Fast, in-memory, pub/sub support |
| Container | Docker | Latest | Standardization, portability |
| Orchestration | Docker Compose | Latest | Local development, simple deployment |

### SDKs

| SDK | Language | Build Tool | Rationale |
|-----|----------|------------|-----------|
| JavaScript | TypeScript | tsup | ES modules + CommonJS, tree-shaking |
| Python | Python 3.8+ | setuptools | Wide compatibility, type hints |

## Design Decisions

### Why FastAPI?

- **Async Support**: Native async/await for high concurrency
- **Performance**: One of the fastest Python frameworks
- **Type Safety**: Pydantic integration for validation
- **Documentation**: Automatic OpenAPI/Swagger docs
- **Modern**: Built for Python 3.8+ with modern features

### Why Next.js?

- **SSR**: Server-side rendering for better SEO and performance
- **App Router**: Modern routing with layouts and loading states
- **TypeScript**: First-class TypeScript support
- **Ecosystem**: Large ecosystem, great developer experience

### Why PostgreSQL?

- **ACID Compliance**: Strong consistency guarantees
- **JSONB**: Native JSON support for metadata
- **Mature**: Battle-tested, excellent performance
- **Features**: Full-text search, arrays, custom types

### Why Redis?

- **Speed**: In-memory, sub-millisecond latency
- **Data Structures**: Sets, sorted sets for rate limiting
- **TTL**: Automatic expiration for cleanup
- **Pub/Sub**: Future webhook support

### Why JWT with RS256?

- **Stateless**: No need to store tokens in database
- **Verifiable**: Public key allows token validation without API call
- **Standard**: Industry-standard format
- **RS256**: Asymmetric keys provide better security than HS256

## Monitoring & Observability

### Logging

- **Format**: Structured JSON logs
- **Fields**: timestamp, level, logger, message, request_id, user_id, app_id
- **Levels**: INFO, WARNING, ERROR
- **Destination**: stdout (container logs)

### Metrics (Future)

- Request rate per API key
- Authentication success/failure rates
- Token refresh rates
- Database query performance
- Redis cache hit rates

### Health Checks

- **API**: `GET /health` - Returns 200 if healthy
- **Database**: Connection pool health
- **Redis**: Connection health
- **Container**: Docker health checks

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "additional context"
    }
  }
}
```

### Error Categories

1. **Client Errors (4xx)**
   - 400: Validation errors, bad requests
   - 401: Authentication failures
   - 404: Resource not found
   - 409: Conflict (e.g., email exists)
   - 429: Rate limit exceeded

2. **Server Errors (5xx)**
   - 500: Internal server error
   - 503: Service unavailable

### Error Logging

- All errors logged with stack traces
- Request ID included for tracing
- User/app context included when available

## Future Architecture Enhancements

1. **Microservices Split**
   - Separate auth service from portal API
   - Independent scaling
   - Service mesh for communication

2. **Event-Driven Architecture**
   - Webhook system for events
   - Event bus (Kafka/RabbitMQ)
   - Async event processing

3. **Multi-Region**
   - Database replication across regions
   - Regional API instances
   - Geo-routing for low latency

4. **Caching Layer**
   - API response caching
   - User session caching
   - Application metadata caching

5. **API Gateway**
   - Request routing
   - Rate limiting at edge
   - Authentication at edge
   - Request/response transformation

