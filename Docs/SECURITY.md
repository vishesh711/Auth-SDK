# DevAuth Security Documentation

## Security Overview

DevAuth implements industry-standard security practices to protect user data and prevent unauthorized access. This document outlines the security measures, threat model, and best practices.

## Security Architecture

### Defense in Depth

DevAuth employs multiple layers of security:

1. **Network Layer**: HTTPS/TLS encryption
2. **Application Layer**: Authentication, authorization, input validation
3. **Data Layer**: Encryption at rest, secure credential storage
4. **Infrastructure Layer**: Container isolation, network segmentation

## Authentication & Authorization

### API Key Authentication

**Purpose**: Authenticate applications making API requests

**Implementation**:
- API keys generated using cryptographically secure random (32 bytes)
- Keys hashed with SHA-256 before storage
- Plaintext key shown only once during creation
- Keys can be revoked immediately

**Security Features**:
- Keys never stored in plaintext
- Revocation tracked with timestamp
- Rate limiting per API key
- Last used timestamp for monitoring

### JWT Token Authentication

**Purpose**: Authenticate end users

**Implementation**:
- RS256 algorithm (RSA with SHA-256)
- Asymmetric key pair (private for signing, public for verification)
- Access tokens: 15-minute expiration
- Refresh tokens: 7-day expiration, hashed before storage

**Security Features**:
- Tokens cannot be modified (signature verification)
- Short-lived access tokens limit exposure
- Refresh tokens hashed in database
- Session revocation on password change
- Token introspection endpoint for validation

### Password Security

**Hashing**:
- Algorithm: bcrypt
- Work Factor: 12 rounds (~300ms per hash)
- Salt: Automatically generated per password

**Validation**:
- Minimum length: 8 characters
- Complexity requirements (optional, configurable)
- Password strength validation on signup/reset

**Storage**:
- Passwords never stored in plaintext
- Hashes stored in database
- No password in logs or error messages

## Data Protection

### Encryption

**Application Secrets**:
- Algorithm: AES-256 (Fernet)
- Key: 32-byte key from environment variable
- Storage: Encrypted in database
- Decryption: Only when needed, never logged

**Database**:
- Data encrypted at rest (PostgreSQL)
- Connection encryption (TLS)
- Credentials in environment variables

**Transmission**:
- HTTPS/TLS for all API communication
- No sensitive data in URLs
- Secure headers (HSTS, CSP)

### Multi-Tenant Isolation

**Database Level**:
- All queries filtered by `app_id`
- Foreign key constraints enforce isolation
- Unique constraints per application

**Application Level**:
- API key validation ensures correct `app_id`
- Token validation includes `app_id` check
- No cross-application data access possible

## Rate Limiting & DDoS Protection

### Rate Limiting

**Per API Key**:
- Limit: 60 requests per minute
- Algorithm: Sliding window
- Storage: Redis counters
- Response: 429 with Retry-After header

**Benefits**:
- Prevents API abuse
- Protects against DDoS
- Fair usage enforcement

### Brute Force Protection

**Login Attempts**:
- Tracked per email + IP address
- Limit: 5 failed attempts
- Lockout: 15 minutes
- Storage: Redis with TTL

**Password Reset**:
- Rate limited per email
- Token expiration: 1 hour
- One-time use tokens

## Input Validation & Sanitization

### Request Validation

**Pydantic Models**:
- Type validation
- Format validation (email, UUID)
- Length constraints
- Required field validation

**SQL Injection Prevention**:
- SQLAlchemy ORM (parameterized queries)
- No raw SQL queries
- Input sanitization

**XSS Prevention**:
- Content-Type validation
- JSON-only API responses
- No HTML rendering from user input

## Secure Coding Practices

### Error Handling

**Information Disclosure**:
- Generic error messages for authentication failures
- Detailed errors only for validation
- No stack traces in production
- Request IDs for tracing

**Logging**:
- No passwords in logs
- No tokens in logs (except request IDs)
- No sensitive data in error messages
- Structured logging with context

### Dependency Management

**Security Updates**:
- Regular dependency updates
- Vulnerability scanning
- Pinned versions in requirements.txt
- Security advisories monitoring

## Token Security

### Access Tokens

**Characteristics**:
- Short expiration (15 minutes)
- Stateless (JWT)
- Signed with RS256
- Contains minimal user info

**Best Practices**:
- Stored securely in client
- Sent only over HTTPS
- Validated on every request
- Revoked on logout

### Refresh Tokens

**Characteristics**:
- Longer expiration (7 days)
- Hashed before storage
- Linked to session
- Revocable

**Security**:
- Stored hashed in database
- Session tracking
- Revocation on password change
- Rotation on refresh (optional)

## API Security

### Request Security

**Headers**:
- API key in custom header (not Authorization)
- Bearer token in Authorization header
- Content-Type validation
- CORS protection

**Validation**:
- Request size limits
- Content-Type checking
- Parameter validation
- Path traversal prevention

### Response Security

**Headers**:
- No sensitive data in headers
- Security headers (CORS, CSP)
- No caching of sensitive responses

**Data**:
- No passwords in responses
- No tokens in error messages
- Minimal user data exposure

## Infrastructure Security

### Container Security

**Base Images**:
- Official images only
- Minimal base images (alpine, slim)
- Regular updates
- No root user in containers

**Network**:
- Internal Docker network
- No exposed ports (except necessary)
- Health checks
- Resource limits

### Database Security

**Access Control**:
- Separate database user
- Limited privileges
- Connection pooling
- No direct external access

**Backup**:
- Regular backups
- Encrypted backups
- Tested restore procedures

## Security Monitoring

### Audit Logging

**Events Logged**:
- User signup
- Login (success and failure)
- Logout
- Password reset
- API key creation/revocation
- Application creation

**Log Fields**:
- Timestamp
- User ID / App ID
- IP address
- User agent
- Action type
- Request ID

### Monitoring

**Metrics**:
- Failed login attempts
- Rate limit hits
- Token validation failures
- API errors

**Alerts**:
- Unusual login patterns
- High error rates
- Rate limit violations
- Security events

## Threat Model

### Identified Threats

1. **Credential Theft**
   - Mitigation: Password hashing, rate limiting, brute force protection

2. **Token Theft**
   - Mitigation: Short expiration, HTTPS, secure storage

3. **API Abuse**
   - Mitigation: Rate limiting, API key validation

4. **SQL Injection**
   - Mitigation: ORM, parameterized queries

5. **XSS Attacks**
   - Mitigation: JSON-only API, input validation

6. **DDoS Attacks**
   - Mitigation: Rate limiting, connection limits

7. **Data Breach**
   - Mitigation: Encryption, access controls, audit logs

### Attack Vectors

**External**:
- API endpoints
- Developer portal
- Email links

**Internal**:
- Database access
- Redis access
- Container compromise

## Security Best Practices

### For Developers Using DevAuth

1. **Store Credentials Securely**
   - Never commit API keys or secrets
   - Use environment variables
   - Rotate keys regularly

2. **Use HTTPS**
   - Always use HTTPS in production
   - Validate SSL certificates
   - Use HSTS

3. **Handle Tokens Securely**
   - Store tokens securely (localStorage for web, secure storage for mobile)
   - Never log tokens
   - Implement token refresh

4. **Validate Input**
   - Validate all user input
   - Sanitize before display
   - Use parameterized queries

5. **Monitor Usage**
   - Monitor authentication events
   - Set up alerts for anomalies
   - Review audit logs regularly

### For DevAuth Operators

1. **Key Management**
   - Rotate JWT keys periodically
   - Store keys securely (secrets management)
   - Use different keys per environment

2. **Access Control**
   - Limit database access
   - Use least privilege principle
   - Regular access reviews

3. **Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Test updates in staging

4. **Monitoring**
   - Monitor security events
   - Set up alerts
   - Regular security audits

## Compliance Considerations

### Data Protection

- **GDPR**: User data deletion, right to access
- **CCPA**: User data access, deletion
- **SOC 2**: Security controls, audit trails

### Security Standards

- **OWASP Top 10**: Addressed in design
- **CWE Top 25**: Common vulnerabilities prevented
- **NIST**: Security framework alignment

## Incident Response

### Security Incident Procedure

1. **Detection**: Monitor logs and alerts
2. **Containment**: Revoke compromised credentials
3. **Investigation**: Review audit logs
4. **Remediation**: Fix vulnerabilities
5. **Communication**: Notify affected users
6. **Post-Mortem**: Document and improve

### Response Actions

**Compromised API Key**:
- Immediate revocation
- Generate new key
- Review usage logs
- Notify developer

**Compromised User Account**:
- Force password reset
- Revoke all sessions
- Review access logs
- Notify user

**Data Breach**:
- Contain breach
- Assess impact
- Notify affected users
- Regulatory reporting if required

## Security Checklist

### Development

- [ ] All passwords hashed
- [ ] No secrets in code
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak information
- [ ] Dependencies up to date
- [ ] Security headers configured

### Deployment

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database credentials secured
- [ ] JWT keys secured
- [ ] Rate limiting enabled
- [ ] Monitoring configured
- [ ] Backups configured
- [ ] Access logs enabled

### Operations

- [ ] Regular security audits
- [ ] Dependency updates
- [ ] Key rotation schedule
- [ ] Incident response plan
- [ ] Security monitoring
- [ ] Access reviews

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not** create a public GitHub issue
2. Email security@devauth.dev (or maintainer email)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to resolve the issue.

## Security Updates

Security updates are released as:
- **Critical**: Immediate patch release
- **High**: Next minor release
- **Medium/Low**: Next major release

Subscribe to security advisories to stay informed.

