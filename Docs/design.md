# Design Document

## Overview

DevAuth is a multi-tenant authentication platform built with a microservices-inspired architecture. The system consists of four primary components:

1. **API Backend** - FastAPI-based REST API handling authentication, token management, and admin operations
2. **Developer Portal** - Next.js web application for developer account and application management
3. **Client SDKs** - JavaScript/TypeScript and Python libraries for easy integration
4. **Infrastructure Services** - PostgreSQL database and Redis cache for data persistence and rate limiting

The design prioritizes security, scalability, and developer experience. All authentication flows follow OAuth 2.0 and JWT best practices with RS256 signing, refresh token rotation, and secure credential storage.

## Architecture

### High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Applications"
        WebApp[Web Application]
        MobileApp[Mobile Application]
        BackendService[Backend Service]
    end
    
    subgraph "DevAuth Platform"
        SDK_JS[JavaScript SDK]
        SDK_PY[Python SDK]
        API[API Gateway / Backend]
        Portal[Developer Portal]
        
        subgraph "Core Services"
            AuthService[Auth Service]
            TokenService[Token Service]
            EmailService[Email Service]
            RateLimiter[Rate Limiter]
        end
        
        subgraph "Data Layer"
            PostgreSQL[(PostgreSQL)]
            Redis[(Redis Cache)]
        end
    end
    
    subgraph "External Services"
        SMTP[Email Provider]
    end
    
    WebApp --> SDK_JS
    MobileApp --> SDK_JS
    BackendService --> SDK_PY
    SDK_JS --> API
    SDK_PY --> API
    Portal --> API
    
    API --> AuthService
    API --> TokenService
    API --> RateLimiter
    AuthService --> EmailService
    AuthService --> PostgreSQL
    TokenService --> PostgreSQL
    EmailService --> SMTP
    RateLimiter --> Redis
    
    style API fill:#4A90E2
    style PostgreSQL fill:#336791
    style Redis fill:#DC382D
```

### Technology Stack

**Backend:**
- Framework: FastAPI (Python 3.11+)
- Web Server: Uvicorn with Gunicorn
- Authentication: PyJWT for token operations
- Password Hashing: bcrypt
- Validation: Pydantic models

**Database:**
- Primary: PostgreSQL 15+
- ORM: SQLAlchemy 2.0 with async support
- Migrations: Alembic

**Cache & Rate Limiting:**
- Redis 7+ for rate limiting counters and login attempt tracking
- redis-py async client

**Developer Portal:**
- Framework: Next.js 14 (App Router)
- UI: React 18 with TypeScript
- Styling: Tailwind CSS
- State Management: React Query for API calls

**SDKs:**
- JavaScript/TypeScript: Built with TypeScript, compiled to ES modules and CommonJS
- Python: Python 3.8+ compatible, type hints included

**Infrastructure:**
- Containerization: Docker & Docker Compose
- Deployment: Docker containers (cloud-agnostic)
- Environment Management: python-dotenv

### Component Responsibilities

**API Backend:**
- Request authentication and authorization
- Business logic for auth flows
- Token generation and validation
- Rate limiting enforcement
- API key management
- Developer and application CRUD operations

**Auth Service:**
- User registration and login
- Password hashing and verification
- Email verification token generation
- Password reset token generation
- Session creation and management

**Token Service:**
- JWT access token generation (RS256)
- Refresh token generation and hashing
- Token validation and introspection
- Token rotation logic
- Private/public key management


**Email Service:**
- Template rendering for verification and reset emails
- SMTP integration (configurable provider)
- Async email sending with retry logic
- Email delivery logging

**Rate Limiter:**
- Redis-based sliding window counters
- Per-API-key rate limiting (60 req/min)
- Per-IP failed login tracking
- Automatic counter expiration

**Developer Portal:**
- Developer authentication UI
- Application management interface
- API key generation and display
- User list and search functionality
- Dashboard analytics (user counts, last login)

## Components and Interfaces

### API Endpoints

**Authentication Endpoints (Public):**

```
POST /v1/auth/signup
Headers: x-app-id, x-api-key
Body: { email, password, metadata? }
Response: { user: { id, email, email_verified } }

POST /v1/auth/login
Headers: x-app-id, x-api-key
Body: { email, password }
Response: { access_token, refresh_token, expires_in, user }

GET /v1/auth/me
Headers: Authorization: Bearer <token>, x-app-id
Response: { id, email, email_verified, created_at }

POST /v1/auth/refresh
Headers: x-app-id
Body: { refresh_token }
Response: { access_token, refresh_token?, expires_in }

POST /v1/auth/logout
Headers: x-app-id
Body: { refresh_token }
Response: { success: true }

POST /v1/auth/email/verify/request
Headers: x-app-id, x-api-key
Body: { email }
Response: { success: true }

POST /v1/auth/email/verify/confirm
Headers: x-app-id
Body: { token }
Response: { success: true }

POST /v1/auth/password/reset/request
Headers: x-app-id, x-api-key
Body: { email }
Response: { success: true }

POST /v1/auth/password/reset/confirm
Headers: x-app-id
Body: { token, new_password }
Response: { success: true }
```


**Developer Portal Endpoints (Authenticated):**

```
POST /v1/portal/developers/signup
Body: { email, password, name }
Response: { developer: { id, email, name } }

POST /v1/portal/developers/login
Body: { email, password }
Response: { access_token, developer }

GET /v1/portal/applications
Headers: Authorization: Bearer <dev-token>
Response: { applications: [{ id, name, environment, created_at }] }

POST /v1/portal/applications
Headers: Authorization: Bearer <dev-token>
Body: { name, environment }
Response: { application: { id, name, app_id, app_secret } }

GET /v1/portal/applications/:app_id/users
Headers: Authorization: Bearer <dev-token>
Query: ?page=1&limit=20&search=email
Response: { users: [...], total, page, limit }

POST /v1/portal/applications/:app_id/api-keys
Headers: Authorization: Bearer <dev-token>
Body: { label }
Response: { api_key: { id, key, label, created_at } }

GET /v1/portal/applications/:app_id/api-keys
Headers: Authorization: Bearer <dev-token>
Response: { api_keys: [{ id, label, created_at, revoked }] }

DELETE /v1/portal/applications/:app_id/api-keys/:key_id
Headers: Authorization: Bearer <dev-token>
Response: { success: true }
```

**Token Introspection (For SDKs):**

```
POST /v1/auth/introspect
Headers: x-app-id, x-api-key
Body: { token }
Response: { active: true, user: { id, email, app_id } }
```

### Request/Response Flow Diagrams

**User Signup Flow:**

```mermaid
sequenceDiagram
    participant Client
    participant SDK
    participant API
    participant AuthService
    participant DB
    participant EmailService
    
    Client->>SDK: signup(email, password)
    SDK->>API: POST /auth/signup
    API->>AuthService: create_user()
    AuthService->>AuthService: validate_email()
    AuthService->>AuthService: hash_password()
    AuthService->>DB: INSERT user
    AuthService->>AuthService: generate_verification_token()
    AuthService->>DB: INSERT verification_token
    AuthService->>EmailService: send_verification_email()
    EmailService-->>Client: Email sent
    AuthService->>API: user_data
    API->>SDK: 201 Created
    SDK->>Client: user object
```


**User Login Flow:**

```mermaid
sequenceDiagram
    participant Client
    participant SDK
    participant API
    participant AuthService
    participant TokenService
    participant RateLimiter
    participant DB
    
    Client->>SDK: login(email, password)
    SDK->>API: POST /auth/login
    API->>RateLimiter: check_rate_limit()
    RateLimiter->>API: allowed
    API->>AuthService: authenticate()
    AuthService->>DB: SELECT user WHERE email
    AuthService->>AuthService: verify_password()
    AuthService->>TokenService: generate_tokens()
    TokenService->>TokenService: create_access_token()
    TokenService->>TokenService: create_refresh_token()
    TokenService->>DB: INSERT session
    TokenService->>AuthService: tokens
    AuthService->>API: auth_response
    API->>SDK: 200 OK + tokens
    SDK->>SDK: store_tokens()
    SDK->>Client: session object
```

**Token Refresh Flow:**

```mermaid
sequenceDiagram
    participant Client
    participant SDK
    participant API
    participant TokenService
    participant DB
    
    Client->>SDK: api_call()
    SDK->>API: GET /auth/me
    API->>SDK: 401 Unauthorized
    SDK->>SDK: detect_token_expired()
    SDK->>API: POST /auth/refresh
    API->>TokenService: refresh_tokens()
    TokenService->>DB: SELECT session WHERE refresh_token_hash
    TokenService->>TokenService: validate_not_expired()
    TokenService->>TokenService: generate_new_access_token()
    TokenService->>TokenService: rotate_refresh_token()
    TokenService->>DB: UPDATE session
    TokenService->>API: new_tokens
    API->>SDK: 200 OK + tokens
    SDK->>SDK: store_tokens()
    SDK->>API: GET /auth/me (retry)
    API->>SDK: 200 OK + user
    SDK->>Client: user data
```

## Data Models

### Database Schema

**developers table:**
```sql
CREATE TABLE developers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_developers_email ON developers(email);
```


**applications table:**
```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    environment VARCHAR(20) NOT NULL CHECK (environment IN ('dev', 'prod')),
    app_id VARCHAR(64) UNIQUE NOT NULL,
    app_secret_encrypted TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_applications_developer ON applications(developer_id);
CREATE INDEX idx_applications_app_id ON applications(app_id);
```

**users table:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id VARCHAR(64) NOT NULL REFERENCES applications(app_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    UNIQUE(app_id, email)
);

CREATE INDEX idx_users_app_email ON users(app_id, email);
CREATE INDEX idx_users_app_id ON users(app_id);
```

**sessions table:**
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    app_id VARCHAR(64) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(refresh_token_hash);
CREATE INDEX idx_sessions_expires ON sessions(expires_at) WHERE NOT revoked;
```

**api_keys table:**
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id VARCHAR(64) NOT NULL REFERENCES applications(app_id) ON DELETE CASCADE,
    label VARCHAR(255),
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_api_keys_app ON api_keys(app_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash) WHERE NOT revoked;
```


**email_verification_tokens table:**
```sql
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP
);

CREATE INDEX idx_verification_tokens_user ON email_verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_hash ON email_verification_tokens(token_hash) WHERE NOT used;
```

**password_reset_tokens table:**
```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP
);

CREATE INDEX idx_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_reset_tokens_hash ON password_reset_tokens(token_hash) WHERE NOT used;
```

### Domain Models (Python)

**User Model:**
```python
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from uuid import UUID
from typing import Optional

class User(BaseModel):
    id: UUID
    app_id: str
    email: EmailStr
    email_verified: bool = False
    metadata: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    metadata: Optional[dict] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
```

**Token Models:**
```python
class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "Bearer"

class AccessTokenPayload(BaseModel):
    sub: UUID  # user_id
    app_id: str
    email: str
    iat: int
    exp: int
    type: str = "access"

class RefreshTokenPayload(BaseModel):
    sub: UUID  # user_id
    app_id: str
    session_id: UUID
    iat: int
    exp: int
    type: str = "refresh"
```


**Application Models:**
```python
class Application(BaseModel):
    id: UUID
    developer_id: UUID
    name: str
    environment: str  # 'dev' or 'prod'
    app_id: str
    created_at: datetime
    updated_at: datetime

class ApplicationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    environment: str = Field(..., pattern="^(dev|prod)$")

class ApplicationWithSecret(Application):
    app_secret: str  # Only returned once on creation
```

**API Key Models:**
```python
class APIKey(BaseModel):
    id: UUID
    app_id: str
    label: Optional[str]
    created_at: datetime
    last_used_at: Optional[datetime]
    revoked: bool

class APIKeyCreate(BaseModel):
    label: Optional[str] = None

class APIKeyWithPlaintext(APIKey):
    key: str  # Only returned once on creation
```

### Redis Data Structures

**Rate Limiting:**
```
Key: rate_limit:api_key:{api_key_hash}
Type: String (counter)
Value: request_count
TTL: 60 seconds

Key: rate_limit:ip:{ip_address}
Type: String (counter)
Value: request_count
TTL: 60 seconds
```

**Failed Login Attempts:**
```
Key: login_attempts:{email}:{ip_address}
Type: String (counter)
Value: failed_attempt_count
TTL: 900 seconds (15 minutes)

Key: login_blocked:{email}:{ip_address}
Type: String (flag)
Value: "1"
TTL: 900 seconds (15 minutes)
```

## Error Handling

### Error Response Format

All API errors follow a consistent JSON structure:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect",
    "details": {}
  }
}
```

### Error Codes and HTTP Status Mapping

**400 Bad Request:**
- `INVALID_EMAIL`: Email format is invalid
- `WEAK_PASSWORD`: Password does not meet strength requirements
- `INVALID_TOKEN`: Token format is invalid
- `MISSING_REQUIRED_FIELD`: Required field is missing from request

**401 Unauthorized:**
- `INVALID_CREDENTIALS`: Email or password is incorrect
- `TOKEN_EXPIRED`: Access token has expired
- `INVALID_API_KEY`: API key is invalid or revoked
- `SESSION_REVOKED`: Refresh token session has been revoked


**403 Forbidden:**
- `ACCOUNT_LOCKED`: Account temporarily locked due to failed login attempts
- `EMAIL_NOT_VERIFIED`: Email verification required
- `INSUFFICIENT_PERMISSIONS`: Developer does not have access to resource

**404 Not Found:**
- `USER_NOT_FOUND`: User does not exist
- `APPLICATION_NOT_FOUND`: Application does not exist
- `TOKEN_NOT_FOUND`: Verification or reset token not found

**409 Conflict:**
- `EMAIL_EXISTS`: Email already registered for this application
- `APPLICATION_EXISTS`: Application name already exists for developer

**429 Too Many Requests:**
- `RATE_LIMIT_EXCEEDED`: Request rate limit exceeded
- `TOO_MANY_ATTEMPTS`: Too many failed login attempts

**500 Internal Server Error:**
- `INTERNAL_ERROR`: Unexpected server error
- `DATABASE_ERROR`: Database operation failed
- `EMAIL_SEND_FAILED`: Email delivery failed

### Error Handling Strategy

**Database Errors:**
- Catch SQLAlchemy exceptions and convert to appropriate HTTP errors
- Log full stack trace for debugging
- Return generic error message to client
- Implement retry logic for transient failures

**External Service Failures (Email):**
- Queue failed emails for retry (up to 3 attempts)
- Log failures with context
- Return success to user even if email fails (async operation)
- Provide manual resend option

**Token Validation Errors:**
- Return 401 for expired or invalid tokens
- Include error code to help SDK handle refresh logic
- Log suspicious token validation failures

**Rate Limiting:**
- Return 429 with Retry-After header
- Include current limit and reset time in response
- Differentiate between API key and IP-based limits

## Testing Strategy

### Unit Tests

**Auth Service Tests:**
- Password hashing and verification
- Email validation
- Token generation (verification, reset)
- User creation with duplicate email handling
- Login with invalid credentials
- Session creation and revocation

**Token Service Tests:**
- JWT generation with correct payload
- Token signing with RS256
- Token expiration validation
- Refresh token hashing
- Token rotation logic

**Rate Limiter Tests:**
- Counter increment and expiration
- Rate limit enforcement
- Failed login tracking
- Account lockout logic


### Integration Tests

**API Endpoint Tests:**
- Complete signup flow (signup → verify email → login)
- Login flow with token refresh
- Password reset flow (request → confirm)
- Logout and session revocation
- API key authentication
- Multi-tenant isolation (cross-app access prevention)

**Database Integration:**
- User CRUD operations
- Session management
- Token storage and retrieval
- Cascade deletes (developer → applications → users)

**Redis Integration:**
- Rate limit counter operations
- Failed login tracking
- TTL expiration behavior

### End-to-End Tests

**User Journey Tests:**
1. Developer signs up → creates application → generates API key
2. End user signs up → verifies email → logs in → refreshes token → logs out
3. End user forgets password → requests reset → confirms new password → logs in
4. Rate limit exceeded → receives 429 → waits → succeeds
5. Multiple failed logins → account locked → waits → succeeds

**SDK Integration Tests:**
- JavaScript SDK: signup, login, auto-refresh, logout
- Python SDK: token validation, user retrieval

### Security Tests

**Authentication Security:**
- SQL injection attempts in email/password fields
- Password strength enforcement
- Brute force protection (account lockout)
- Token replay attacks (revoked tokens rejected)

**Authorization Security:**
- Cross-application user access prevention
- API key revocation enforcement
- Developer accessing other developer's applications

**Cryptography:**
- Password hashing with bcrypt (verify work factor)
- JWT signature validation
- Refresh token hashing
- API key hashing

### Performance Tests

**Load Testing:**
- 100 concurrent login requests
- 1000 token refresh requests per minute
- Rate limiter accuracy under load

**Database Performance:**
- Query performance with 10k users
- Index effectiveness
- Connection pool behavior

## Security Considerations

### Cryptographic Standards

**Password Hashing:**
- Algorithm: bcrypt with work factor 12
- Alternative: argon2id (memory-hard)
- Never store plaintext passwords
- Rehash on login if work factor increases


**JWT Signing:**
- Algorithm: RS256 (asymmetric)
- Private key: 2048-bit RSA, stored in environment variable or secrets manager
- Public key: Exposed for SDK validation (future feature)
- Key rotation: Support multiple keys with key ID (kid) in JWT header

**Token Storage:**
- Refresh tokens: SHA-256 hash before database storage
- API keys: SHA-256 hash before database storage
- Application secrets: AES-256 encryption at rest

**Secrets Management:**
- Use environment variables for sensitive config
- Never commit secrets to version control
- Rotate keys periodically
- Use secrets manager in production (AWS Secrets Manager, HashiCorp Vault)

### Attack Prevention

**Brute Force Protection:**
- Track failed login attempts per email + IP
- Lock account for 15 minutes after 5 failed attempts
- Implement exponential backoff for repeated failures
- Consider CAPTCHA for suspicious activity (future)

**Token Security:**
- Short-lived access tokens (15 minutes)
- Refresh token rotation on use
- Bind refresh tokens to session (user_agent, IP)
- Revoke all sessions on password change
- Implement token blacklist for immediate revocation

**SQL Injection Prevention:**
- Use parameterized queries (SQLAlchemy ORM)
- Validate and sanitize all inputs
- Use Pydantic models for request validation

**XSS Prevention:**
- Sanitize user-provided metadata
- Set appropriate CORS headers
- Use Content-Security-Policy headers

**CSRF Prevention:**
- Use SameSite cookie attribute for session cookies
- Implement CSRF tokens for state-changing operations
- Validate Origin and Referer headers

### Data Privacy

**PII Protection:**
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement data retention policies
- Provide user data export and deletion (GDPR compliance)

**Audit Logging:**
- Log authentication events (login, logout, password change)
- Log administrative actions (API key creation, user deletion)
- Include timestamp, IP address, user agent
- Store logs securely with retention policy

**Multi-Tenancy Isolation:**
- Enforce app_id in all queries
- Prevent cross-application data access
- Validate API key belongs to requested application
- Use database row-level security (future enhancement)

## SDK Design Details

### JavaScript/TypeScript SDK

**Package Structure:**
```
@devauth/js/
├── src/
│   ├── client.ts          # Main DevAuthClient class
│   ├── types.ts           # TypeScript interfaces
│   ├── storage.ts         # Token storage (localStorage/memory)
│   ├── errors.ts          # Custom error classes
│   └── utils.ts           # Helper functions
├── package.json
├── tsconfig.json
└── README.md
```


**Core API:**
```typescript
interface DevAuthConfig {
  appId: string;
  apiKey: string;
  baseUrl?: string;
  storage?: 'localStorage' | 'memory';
}

class DevAuthClient {
  constructor(config: DevAuthConfig);
  
  // Authentication
  async signup(data: SignupData): Promise<User>;
  async login(credentials: LoginCredentials): Promise<AuthSession>;
  async logout(): Promise<void>;
  async refreshToken(): Promise<void>;
  
  // User management
  async getMe(): Promise<User>;
  async verifyEmail(token: string): Promise<void>;
  async requestEmailVerification(email: string): Promise<void>;
  async requestPasswordReset(email: string): Promise<void>;
  async confirmPasswordReset(token: string, newPassword: string): Promise<void>;
  
  // Token management
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  isAuthenticated(): boolean;
  
  // Internal
  private async _request(method, path, options): Promise<Response>;
  private async _handleTokenRefresh(): Promise<void>;
}
```

**Auto-Refresh Logic:**
- Intercept 401 responses
- Attempt token refresh automatically
- Retry original request with new token
- Logout if refresh fails
- Prevent multiple simultaneous refresh requests

**Storage Strategy:**
- Browser: localStorage for tokens (with fallback to memory)
- Node.js: In-memory storage only
- Provide custom storage adapter interface

### Python SDK

**Package Structure:**
```
devauth-py/
├── devauth/
│   ├── __init__.py
│   ├── client.py          # Main DevAuthClient class
│   ├── models.py          # Pydantic models
│   ├── exceptions.py      # Custom exceptions
│   ├── integrations/
│   │   ├── fastapi.py     # FastAPI middleware
│   │   └── flask.py       # Flask decorators
│   └── utils.py
├── setup.py
├── pyproject.toml
└── README.md
```

**Core API:**
```python
class DevAuthClient:
    def __init__(
        self,
        app_id: str,
        api_key: str,
        base_url: str = "https://api.devauth.dev/v1"
    ):
        ...
    
    def verify_token(self, token: str) -> User:
        """Verify access token and return user info"""
        ...
    
    def introspect_token(self, token: str) -> TokenIntrospection:
        """Call introspection endpoint"""
        ...
    
    def get_user(self, user_id: str) -> User:
        """Fetch user by ID"""
        ...
```


**FastAPI Integration:**
```python
from devauth.integrations.fastapi import DevAuthMiddleware, get_current_user
from fastapi import Depends, FastAPI

app = FastAPI()

# Add middleware
app.add_middleware(
    DevAuthMiddleware,
    app_id="your-app-id",
    api_key="your-api-key"
)

# Use dependency injection
@app.get("/protected")
async def protected_route(user: User = Depends(get_current_user)):
    return {"user_id": user.id, "email": user.email}
```

**Flask Integration:**
```python
from devauth.integrations.flask import DevAuth, require_auth
from flask import Flask

app = Flask(__name__)
devauth = DevAuth(app, app_id="your-app-id", api_key="your-api-key")

@app.route("/protected")
@require_auth
def protected_route(user):
    return {"user_id": user.id, "email": user.email}
```

## Developer Portal Design

### Pages and Features

**Landing/Login Page:**
- Developer login form
- Link to signup
- Password reset link

**Signup Page:**
- Developer registration form
- Email, password, name fields
- Terms of service acceptance

**Dashboard:**
- List of applications
- Quick stats (total users, API calls today)
- Create new application button

**Application Detail Page:**
- Application info (app_id, environment)
- API keys section:
  - List of keys with labels
  - Create new key button
  - Revoke key action
  - Copy key to clipboard (shown once)
- Users section:
  - Paginated user list
  - Search by email
  - User details (email, verified, created, last login)
- Settings section:
  - Application name
  - Delete application (with confirmation)

### UI Components

**Technology:**
- Next.js 14 App Router
- React Server Components where possible
- Client components for interactive features
- Tailwind CSS for styling
- shadcn/ui for component library

**Key Components:**
- ApplicationCard: Display application summary
- APIKeyList: Manage API keys
- UserTable: Display and search users
- CopyButton: Copy-to-clipboard with feedback
- ConfirmDialog: Confirmation for destructive actions

**State Management:**
- React Query for server state
- URL state for pagination and search
- Local state for UI interactions

## Deployment Architecture

### Container Structure

**Docker Compose (Development):**
```yaml
services:
  api:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
    depends_on: [db, redis]
  
  portal:
    build: ./portal
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
  
  db:
    image: postgres:15
    volumes: [postgres_data:/var/lib/postgresql/data]
  
  redis:
    image: redis:7
    volumes: [redis_data:/data]
```


**Production Deployment:**
- API: Multiple containers behind load balancer
- Portal: Static export deployed to CDN or container
- Database: Managed PostgreSQL (AWS RDS, GCP Cloud SQL)
- Redis: Managed Redis (AWS ElastiCache, Redis Cloud)
- Secrets: Environment variables from secrets manager
- Monitoring: Application logs, metrics, alerts

### Environment Configuration

**Backend (.env):**
```
DATABASE_URL=postgresql://user:pass@host:5432/devauth
REDIS_URL=redis://host:6379/0
JWT_PRIVATE_KEY=<base64-encoded-key>
JWT_PUBLIC_KEY=<base64-encoded-key>
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<api-key>
CORS_ORIGINS=http://localhost:3000,https://portal.devauth.dev
RATE_LIMIT_PER_MINUTE=60
```

**Portal (.env):**
```
NEXT_PUBLIC_API_URL=https://api.devauth.dev/v1
```

## Migration Strategy

### Database Migrations

**Alembic Setup:**
- Initialize Alembic in backend project
- Create migration for each schema change
- Include upgrade and downgrade functions
- Test migrations on staging before production

**Initial Migration:**
1. Create all tables
2. Create indexes
3. Set up foreign key constraints
4. Add check constraints

**Future Migrations:**
- Add columns with defaults
- Create new tables
- Modify constraints
- Data migrations (if needed)

### Backward Compatibility

**API Versioning:**
- Use URL versioning (/v1/, /v2/)
- Maintain v1 for at least 6 months after v2 release
- Deprecation warnings in response headers
- Clear migration guide for developers

**SDK Versioning:**
- Semantic versioning (MAJOR.MINOR.PATCH)
- Breaking changes only in major versions
- Deprecation warnings in code
- Changelog with migration instructions

## Performance Optimization

### Database Optimization

**Indexing Strategy:**
- Index all foreign keys
- Composite index on (app_id, email) for users
- Index on token hashes for fast lookups
- Partial indexes for active sessions/tokens

**Query Optimization:**
- Use SELECT only needed columns
- Implement pagination for large result sets
- Use database connection pooling
- Cache frequently accessed data in Redis

**Connection Pooling:**
- SQLAlchemy pool size: 20
- Pool timeout: 30 seconds
- Pool recycle: 3600 seconds


### API Performance

**Response Time Targets:**
- Authentication endpoints: < 200ms (p95)
- Token refresh: < 100ms (p95)
- User lookup: < 50ms (p95)

**Caching Strategy:**
- Cache application configs in Redis (1 hour TTL)
- Cache public keys for JWT validation
- Don't cache user data (privacy concern)

**Rate Limiting Performance:**
- Use Redis pipelining for counter operations
- Implement sliding window algorithm
- Async rate limit checks (don't block request)

### Frontend Performance

**Portal Optimization:**
- Server-side rendering for initial page load
- Code splitting by route
- Image optimization with Next.js Image
- Lazy load user table data
- Debounce search input

**SDK Optimization:**
- Tree-shakeable exports
- Minimal dependencies
- Gzip compression for npm package
- Bundle size < 50KB (minified + gzipped)

## Monitoring and Observability

### Logging

**Structured Logging:**
- JSON format for all logs
- Include request ID, user ID, app ID
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL

**Log Events:**
- Authentication attempts (success/failure)
- Token operations (issue, refresh, revoke)
- API key operations (create, revoke)
- Rate limit violations
- Email send attempts
- Database errors
- External service failures

### Metrics

**Application Metrics:**
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Authentication success rate
- Token refresh rate
- Active sessions count

**Infrastructure Metrics:**
- Database connection pool usage
- Redis memory usage
- API container CPU/memory
- Database query performance

### Alerting

**Critical Alerts:**
- Error rate > 1% for 5 minutes
- Database connection failures
- Redis unavailable
- Email service failures > 10% for 10 minutes

**Warning Alerts:**
- Response time p95 > 500ms for 10 minutes
- Database connection pool > 80% for 5 minutes
- Failed login rate spike (potential attack)

## Future Enhancements (Post-MVP)

### V2 Features

**Social Login:**
- OAuth integration with Google, GitHub, Microsoft
- Link social accounts to existing users
- Social profile data import

**RBAC (Role-Based Access Control):**
- Define roles per application (admin, user, viewer)
- Assign permissions to roles
- Include roles in access token claims

**Organizations/Teams:**
- Multi-developer organizations
- Team member invitations
- Role-based access for developers

**GraphQL API:**
- GraphQL endpoint alongside REST
- Subscriptions for real-time updates
- Schema-first design

**JWKS Endpoint:**
- Expose public keys at /.well-known/jwks.json
- Enable local token validation in SDKs
- Reduce API calls for token verification

**Passwordless Authentication:**
- Magic link login via email
- OTP via SMS (Twilio integration)
- WebAuthn/FIDO2 support

**Advanced Security:**
- Device fingerprinting
- Anomaly detection (unusual login locations)
- Two-factor authentication (TOTP)
- Security event notifications

**Self-Hosted Option:**
- Docker Compose for easy deployment
- Kubernetes Helm charts
- Configuration management
- Migration tools from hosted to self-hosted

### Scalability Improvements

**Horizontal Scaling:**
- Stateless API design (already implemented)
- Load balancer with health checks
- Database read replicas
- Redis cluster for high availability

**Performance:**
- CDN for static assets
- Database query caching
- Async job processing (Celery/RQ)
- Background token cleanup jobs

This design provides a solid foundation for building DevAuth as a production-ready authentication platform. The architecture is modular, secure, and scalable, with clear separation of concerns and well-defined interfaces between components.
