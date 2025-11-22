# DevAuth - Authentication-as-a-Service Platform

A production-ready, multi-tenant authentication platform built with FastAPI, Next.js, and client SDKs for JavaScript/TypeScript and Python.

## Overview

DevAuth provides a complete authentication solution with:
- **REST API** for authentication, token management, and user operations
- **Developer Portal** for managing applications and users
- **JavaScript/TypeScript SDK** for client-side applications
- **Python SDK** for backend services

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  JavaScript │────▶│  API Backend│
│ Application │     │     SDK     │     │   (FastAPI) │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────┐           │
                    │   Python    │───────────┘
                    │     SDK     │
                    └─────────────┘
                                              │
                    ┌─────────────┐           │
                    │   Developer │───────────┘
                    │    Portal   │
                    │   (Next.js) │
                    └─────────────┘
                                              
                    ┌─────────────┐  ┌─────────────┐
                    │  PostgreSQL │  │    Redis    │
                    └─────────────┘  └─────────────┘
```

## Features

### Authentication
- User registration with email verification
- Password-based login with JWT tokens
- Token refresh with automatic rotation
- Password reset flow
- Session management and logout

### Security
- RS256 JWT signing with RSA keys
- Bcrypt password hashing
- Rate limiting (60 req/min per API key)
- Brute force protection (5 failed attempts = 15 min lockout)
- Multi-tenant data isolation

### Developer Experience
- RESTful API with consistent error handling
- TypeScript SDK with automatic token refresh
- Python SDK with FastAPI/Flask integrations
- Developer portal for application management
- API key management

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)

### Running with Docker Compose

1. Clone the repository:
```bash
git clone <repository-url>
cd Auth-SDK
```

2. Set up environment variables:
```bash
# Generate JWT keys
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

# Base64 encode keys
JWT_PRIVATE_KEY=$(base64 -i private.pem)
JWT_PUBLIC_KEY=$(base64 -i public.pem)

# Generate encryption key
APP_SECRET_ENCRYPTION_KEY=$(openssl rand -base64 32)

# Create .env file
cat > .env << EOF
JWT_PRIVATE_KEY=$JWT_PRIVATE_KEY
JWT_PUBLIC_KEY=$JWT_PUBLIC_KEY
APP_SECRET_ENCRYPTION_KEY=$APP_SECRET_ENCRYPTION_KEY
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM_EMAIL=noreply@devauth.dev
EOF
```

3. Start all services:
```bash
docker-compose up -d
```

4. Run database migrations:
```bash
docker-compose exec api alembic upgrade head
```

5. Access the services:
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Portal: http://localhost:3000

## Project Structure

```
Auth-SDK/
├── backend/          # FastAPI backend application
│   ├── app/
│   │   ├── api/      # API route handlers
│   │   ├── core/     # Configuration and database
│   │   ├── models/   # SQLAlchemy models
│   │   ├── schemas/  # Pydantic schemas
│   │   ├── services/ # Business logic
│   │   └── utils/    # Utilities
│   ├── alembic/      # Database migrations
│   └── main.py       # Application entry point
├── portal/           # Next.js developer portal
│   ├── app/          # Next.js app directory
│   └── components/   # React components
├── sdk/
│   ├── js/           # JavaScript/TypeScript SDK
│   └── py/           # Python SDK
└── docker-compose.yml # Docker Compose configuration
```

## Development

### Backend Development

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Portal Development

```bash
cd portal
npm install
npm run dev
```

### SDK Development

**JavaScript SDK:**
```bash
cd sdk/js
npm install
npm run build
```

**Python SDK:**
```bash
cd sdk/py
pip install -e .
```

## Documentation

Comprehensive documentation is available in the `Docs/` directory:

- **[Quick Start Guide](Docs/QUICK_START.md)** - Get up and running in 5 minutes
- **[Architecture Documentation](Docs/ARCHITECTURE.md)** - System architecture, design decisions, and scalability
- **[API Reference](Docs/API.md)** - Complete API endpoint documentation
- **[SDK Documentation](Docs/SDK.md)** - JavaScript and Python SDK usage guides
- **[Security Guide](Docs/SECURITY.md)** - Security architecture and best practices
- **[Deployment Guide](Docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Design Document](Docs/design.md)** - Detailed design specifications
- **[Requirements](Docs/requirements.md)** - Functional and non-functional requirements

## License

MIT
