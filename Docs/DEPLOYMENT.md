# Deployment Guide

## Prerequisites

- Docker and Docker Compose
- PostgreSQL 15+ (if not using Docker)
- Redis 7+ (if not using Docker)
- SMTP server credentials (SendGrid, AWS SES, etc.)

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql+asyncpg://devauth:password@db:5432/devauth

# Redis
REDIS_URL=redis://redis:6379/0

# JWT Keys (base64 encoded)
JWT_PRIVATE_KEY=<base64-encoded-private-key>
JWT_PUBLIC_KEY=<base64-encoded-public-key>

# Encryption Key (32 bytes, base64 encoded)
APP_SECRET_ENCRYPTION_KEY=<base64-encoded-key>

# SMTP Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
SMTP_FROM_EMAIL=noreply@yourdomain.com

# CORS
CORS_ORIGINS=https://yourdomain.com,https://portal.yourdomain.com

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Environment
ENVIRONMENT=production
```

### Portal (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/v1
```

## Generating Keys

### JWT Keys

```bash
# Generate RSA key pair
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

# Base64 encode
JWT_PRIVATE_KEY=$(base64 -i private.pem)
JWT_PUBLIC_KEY=$(base64 -i public.pem)
```

### Encryption Key

```bash
APP_SECRET_ENCRYPTION_KEY=$(openssl rand -base64 32)
```

## Docker Deployment

### 1. Build Images

```bash
docker-compose build
```

### 2. Start Services

```bash
docker-compose up -d
```

### 3. Run Migrations

```bash
docker-compose exec api alembic upgrade head
```

### 4. Verify Services

- API: http://localhost:8000/docs
- Portal: http://localhost:3000

## Production Deployment

### Using Docker Compose

1. Update `docker-compose.yml` with production settings
2. Set environment variables in `.env`
3. Use Docker secrets for sensitive data
4. Configure reverse proxy (nginx/traefik)
5. Set up SSL certificates (Let's Encrypt)

### Using Kubernetes

1. Create ConfigMaps for non-sensitive config
2. Create Secrets for sensitive data
3. Deploy PostgreSQL and Redis
4. Deploy API and Portal services
5. Configure ingress with SSL

### Database Migrations

Migrations run automatically on startup, but for production:

```bash
# Run migrations manually
docker-compose exec api alembic upgrade head

# Rollback if needed
docker-compose exec api alembic downgrade -1
```

## Monitoring

### Health Checks

- API: `GET /health`
- Database: Check connection pool
- Redis: Check connection

### Logging

- Structured JSON logs
- Request IDs for tracing
- Log levels: INFO, WARNING, ERROR

### Metrics

Consider adding:
- Prometheus metrics endpoint
- Application performance monitoring (APM)
- Error tracking (Sentry)

## Security Checklist

- [ ] JWT keys stored securely (not in code)
- [ ] Encryption key stored securely
- [ ] Database credentials secured
- [ ] Redis password set (if exposed)
- [ ] CORS origins configured correctly
- [ ] Rate limiting enabled
- [ ] HTTPS enabled
- [ ] SMTP credentials secured
- [ ] Environment variables not committed to git

## Scaling

### Horizontal Scaling

- API: Stateless, can scale horizontally
- Portal: Stateless, can scale horizontally
- Database: Use read replicas
- Redis: Use Redis Cluster

### Load Balancing

- Use nginx or cloud load balancer
- Session affinity not required (stateless)
- Health checks configured

## Backup

### Database

```bash
# Backup
docker-compose exec db pg_dump -U devauth devauth > backup.sql

# Restore
docker-compose exec -T db psql -U devauth devauth < backup.sql
```

### Redis

- Enable Redis persistence (AOF/RDB)
- Regular backups of Redis data

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check DATABASE_URL
   - Verify database is running
   - Check network connectivity

2. **Redis connection errors**
   - Check REDIS_URL
   - Verify Redis is running

3. **JWT validation errors**
   - Verify JWT keys are correctly base64 encoded
   - Check key format (RSA keys)

4. **Email sending failures**
   - Verify SMTP credentials
   - Check SMTP server accessibility
   - Review email service logs

## Maintenance

### Regular Tasks

- Monitor disk space
- Review logs for errors
- Update dependencies
- Rotate API keys periodically
- Review audit logs

### Updates

1. Pull latest code
2. Run migrations: `alembic upgrade head`
3. Rebuild images: `docker-compose build`
4. Restart services: `docker-compose up -d`

