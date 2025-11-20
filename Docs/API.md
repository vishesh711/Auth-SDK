# DevAuth API Reference

## Base URL

```
http://localhost:8000/v1
```

## Authentication

Most endpoints require authentication via API keys or Bearer tokens.

### API Key Authentication

Include the following headers:
```
x-app-id: your-application-id
x-api-key: your-api-key
```

### Bearer Token Authentication

Include the following headers:
```
Authorization: Bearer your-access-token
x-app-id: your-application-id
```

## Authentication Endpoints

### Sign Up

Create a new user account.

**Endpoint:** `POST /v1/auth/signup`

**Headers:**
- `x-app-id` (required)
- `x-api-key` (required)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "metadata": {}
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "email_verified": false,
  "app_id": "app-id",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Login

Authenticate a user and receive access/refresh tokens.

**Endpoint:** `POST /v1/auth/login`

**Headers:**
- `x-app-id` (required)
- `x-api-key` (required)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "jwt-token",
  "refresh_token": "jwt-token",
  "expires_in": 900,
  "token_type": "Bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "email_verified": false
  }
}
```

### Get Current User

Get the authenticated user's information.

**Endpoint:** `GET /v1/auth/me`

**Headers:**
- `Authorization: Bearer <token>` (required)
- `x-app-id` (required)

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "email_verified": true,
  "app_id": "app-id",
  "created_at": "2024-01-01T00:00:00Z",
  "last_login_at": "2024-01-01T00:00:00Z"
}
```

### Refresh Token

Get a new access token using a refresh token.

**Endpoint:** `POST /v1/auth/refresh`

**Headers:**
- `x-app-id` (required)

**Request Body:**
```json
{
  "refresh_token": "refresh-token"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "new-jwt-token",
  "refresh_token": "new-refresh-token",
  "expires_in": 900,
  "token_type": "Bearer"
}
```

### Logout

Revoke a session and invalidate refresh token.

**Endpoint:** `POST /v1/auth/logout`

**Headers:**
- `x-app-id` (required)

**Request Body:**
```json
{
  "refresh_token": "refresh-token"
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

### Email Verification

#### Request Verification Email

**Endpoint:** `POST /v1/auth/email/verify/request`

**Headers:**
- `x-app-id` (required)
- `x-api-key` (required)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### Confirm Email Verification

**Endpoint:** `POST /v1/auth/email/verify/confirm`

**Headers:**
- `x-app-id` (required)

**Request Body:**
```json
{
  "token": "verification-token"
}
```

### Password Reset

#### Request Password Reset

**Endpoint:** `POST /v1/auth/password/reset/request`

**Headers:**
- `x-app-id` (required)
- `x-api-key` (required)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### Confirm Password Reset

**Endpoint:** `POST /v1/auth/password/reset/confirm`

**Headers:**
- `x-app-id` (required)

**Request Body:**
```json
{
  "token": "reset-token",
  "new_password": "NewSecurePassword123!"
}
```

### Token Introspection

Validate an access token and get user information.

**Endpoint:** `POST /v1/auth/introspect`

**Headers:**
- `x-app-id` (required)
- `x-api-key` (required)

**Request Body:**
```json
{
  "token": "access-token"
}
```

**Response:** `200 OK`
```json
{
  "active": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "app_id": "app-id"
  }
}
```

## Developer Portal Endpoints

### Developer Signup

**Endpoint:** `POST /v1/portal/developers/signup`

**Request Body:**
```json
{
  "email": "developer@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

### Developer Login

**Endpoint:** `POST /v1/portal/developers/login`

**Request Body:**
```json
{
  "email": "developer@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "access_token": "jwt-token",
  "developer": {
    "id": "uuid",
    "email": "developer@example.com",
    "name": "John Doe"
  }
}
```

### List Applications

**Endpoint:** `GET /v1/portal/applications`

**Headers:**
- `Authorization: Bearer <dev-token>` (required)

### Create Application

**Endpoint:** `POST /v1/portal/applications`

**Headers:**
- `Authorization: Bearer <dev-token>` (required)

**Request Body:**
```json
{
  "name": "My App",
  "environment": "dev"
}
```

**Response:**
```json
{
  "application": {
    "id": "uuid",
    "name": "My App",
    "environment": "dev",
    "app_id": "generated-app-id",
    "app_secret": "generated-secret"
  }
}
```

### List Users

**Endpoint:** `GET /v1/portal/applications/:app_id/users?page=1&limit=20&search=email`

**Headers:**
- `Authorization: Bearer <dev-token>` (required)

### Create API Key

**Endpoint:** `POST /v1/portal/applications/:app_id/api-keys`

**Headers:**
- `Authorization: Bearer <dev-token>` (required)

**Request Body:**
```json
{
  "label": "Production API Key"
}
```

### List API Keys

**Endpoint:** `GET /v1/portal/applications/:app_id/api-keys`

**Headers:**
- `Authorization: Bearer <dev-token>` (required)

### Revoke API Key

**Endpoint:** `DELETE /v1/portal/applications/:app_id/api-keys/:key_id`

**Headers:**
- `Authorization: Bearer <dev-token>` (required)

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `INVALID_CREDENTIALS` - Email or password incorrect
- `EMAIL_EXISTS` - Email already registered
- `INVALID_TOKEN` - Token invalid or expired
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `ACCOUNT_LOCKED` - Account locked due to failed attempts
- `VALIDATION_ERROR` - Request validation failed

## Rate Limiting

- Rate limit: 60 requests per minute per API key
- Response headers:
  - `X-RateLimit-Limit`: Maximum requests per minute
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `Retry-After`: Seconds to wait when rate limited

## Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required or failed
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

