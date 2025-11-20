# DevAuth Quick Start Guide

## Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)
- Basic understanding of REST APIs

## Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Auth-SDK
```

### 2. Generate Required Keys

```bash
# Generate JWT keys
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

# Base64 encode keys
JWT_PRIVATE_KEY=$(base64 -i private.pem)
JWT_PUBLIC_KEY=$(base64 -i public.pem)

# Generate encryption key
APP_SECRET_ENCRYPTION_KEY=$(openssl rand -base64 32)
```

### 3. Create Environment File

Create a `.env` file in the project root:

```bash
cat > .env << EOF
# JWT Configuration
JWT_PRIVATE_KEY=$JWT_PRIVATE_KEY
JWT_PUBLIC_KEY=$JWT_PUBLIC_KEY

# Application Secret Encryption Key
APP_SECRET_ENCRYPTION_KEY=$APP_SECRET_ENCRYPTION_KEY

# SMTP Configuration (optional for development)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM_EMAIL=noreply@devauth.dev

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Environment
ENVIRONMENT=development
EOF
```

### 4. Start Services

```bash
docker-compose up -d --build
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- API backend (port 8000)
- Developer Portal (port 3000)

### 5. Run Database Migrations

```bash
docker-compose exec api alembic upgrade head
```

### 6. Verify Installation

```bash
# Check API health
curl http://localhost:8000/health

# Check API info
curl http://localhost:8000/

# Access API documentation
open http://localhost:8000/docs
```

## First Steps

### 1. Create a Developer Account

Visit http://localhost:3000/signup and create a developer account.

### 2. Create an Application

1. Login to the portal at http://localhost:3000/login
2. Click "Create Application"
3. Fill in:
   - Name: "My Test App"
   - Environment: "dev"
4. **Save the `app_id` and `app_secret`** - you'll need these!

### 3. Create an API Key

1. Click on your application
2. Go to the "API Keys" tab
3. Click "Create API Key"
4. **Save the API key** - you'll only see it once!

### 4. Test Authentication

```bash
# Sign up a user
curl -X POST http://localhost:8000/v1/auth/signup \
  -H "Content-Type: application/json" \
  -H "x-app-id: YOUR_APP_ID" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'

# Login
curl -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "x-app-id: YOUR_APP_ID" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'

# Get current user (use access_token from login response)
curl http://localhost:8000/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-app-id: YOUR_APP_ID"
```

## Using the SDKs

### JavaScript SDK

```bash
cd examples/react-example
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_DEVAUTH_APP_ID=your-app-id
NEXT_PUBLIC_DEVAUTH_API_KEY=your-api-key
NEXT_PUBLIC_DEVAUTH_BASE_URL=http://localhost:8000/v1
```

```bash
npm run dev
```

### Python SDK

```bash
cd examples/fastapi-example
pip install -r requirements.txt
```

Set environment variables:
```bash
export DEVAUTH_APP_ID=your-app-id
export DEVAUTH_API_KEY=your-api-key
export DEVAUTH_BASE_URL=http://localhost:8000/v1
```

```bash
python main.py
```

## Common Tasks

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f portal
```

### Stop Services

```bash
docker-compose down
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
docker-compose exec api alembic upgrade head
```

### Access Database

```bash
docker-compose exec db psql -U devauth -d devauth
```

### Access Redis

```bash
docker-compose exec redis redis-cli
```

## Troubleshooting

### API won't start

1. Check logs: `docker-compose logs api`
2. Verify environment variables: `docker-compose exec api env | grep JWT`
3. Check database connection: `docker-compose exec api python -c "from app.core.database import engine; print(engine.url)"`

### Portal won't start

1. Check logs: `docker-compose logs portal`
2. Verify API URL: Check `NEXT_PUBLIC_API_URL` in portal container
3. Rebuild: `docker-compose up -d --build portal`

### Database connection errors

1. Verify database is healthy: `docker-compose ps db`
2. Check DATABASE_URL format: Should be `postgresql+asyncpg://...`
3. Wait for database to be ready: `docker-compose exec db pg_isready -U devauth`

### Port already in use

If ports 8000, 3000, 5432, or 6379 are already in use:

1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`

## Next Steps

- Read the [API Documentation](API.md)
- Explore the [SDK Documentation](SDK.md)
- Review the [Architecture Documentation](ARCHITECTURE.md)
- Check out [Deployment Guide](DEPLOYMENT.md) for production setup

## Getting Help

- Check the [API Documentation](API.md) for endpoint details
- Review [Architecture Documentation](ARCHITECTURE.md) for system design
- See [Deployment Guide](DEPLOYMENT.md) for production setup
- Check logs: `docker-compose logs -f`

