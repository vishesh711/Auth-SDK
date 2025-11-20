# DevAuth Integration Guide

This guide helps you integrate DevAuth into your application, whether you're building a web app, mobile app, or backend service.

## Table of Contents

1. [Choosing the Right SDK](#choosing-the-right-sdk)
2. [Web Application Integration](#web-application-integration)
3. [Mobile Application Integration](#mobile-application-integration)
4. [Backend Service Integration](#backend-service-integration)
5. [Common Integration Patterns](#common-integration-patterns)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

## Choosing the Right SDK

### JavaScript/TypeScript SDK

**Use when:**
- Building a web application (React, Vue, Angular, etc.)
- Building a mobile app with React Native
- Need client-side authentication
- Want automatic token refresh

**Features:**
- Automatic token refresh
- Token storage (localStorage/memory)
- Promise-based API
- TypeScript support

### Python SDK

**Use when:**
- Building a backend service (FastAPI, Flask, Django)
- Need to validate tokens server-side
- Want framework integrations
- Building microservices

**Features:**
- Token validation via introspection
- FastAPI dependency injection
- Flask decorator support
- Type hints

## Web Application Integration

### React Example

```typescript
import { DevAuthClient } from '@devauth/js'

// Initialize client
const client = new DevAuthClient({
  appId: process.env.REACT_APP_DEVAUTH_APP_ID!,
  apiKey: process.env.REACT_APP_DEVAUTH_API_KEY!,
  baseUrl: process.env.REACT_APP_DEVAUTH_BASE_URL || 'https://api.devauth.dev/v1'
})

// Signup component
function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = await client.signup({ email, password })
      console.log('User created:', user)
      // Redirect to login or dashboard
    } catch (error) {
      console.error('Signup failed:', error)
    }
  }

  return (
    <form onSubmit={handleSignup}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
      />
      <button type="submit">Sign Up</button>
    </form>
  )
}

// Login component
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const session = await client.login({ email, password })
      console.log('Logged in:', session.user)
      // Store session, redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      {/* Form fields */}
    </form>
  )
}

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (client.isAuthenticated()) {
      client.getMe()
        .then(setUser)
        .catch(() => {
          // Not authenticated, redirect to login
          window.location.href = '/login'
        })
        .finally(() => setLoading(false))
    } else {
      window.location.href = '/login'
    }
  }, [])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return <>{children}</>
}
```

### Next.js Example

```typescript
// lib/devauth.ts
import { DevAuthClient } from '@devauth/js'

export const devAuthClient = new DevAuthClient({
  appId: process.env.NEXT_PUBLIC_DEVAUTH_APP_ID!,
  apiKey: process.env.NEXT_PUBLIC_DEVAUTH_API_KEY!,
  baseUrl: process.env.NEXT_PUBLIC_DEVAUTH_BASE_URL,
})

// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { devAuthClient } from '@/lib/devauth'

export default function DashboardPage() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    devAuthClient.getMe()
      .then(setUser)
      .catch(() => {
        // Redirect to login
        window.location.href = '/login'
      })
  }, [])

  if (!user) return <div>Loading...</div>

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.email}!</p>
    </div>
  )
}
```

## Mobile Application Integration

### React Native Example

```typescript
import { DevAuthClient } from '@devauth/js'

// Use memory storage for React Native
const client = new DevAuthClient({
  appId: 'your-app-id',
  apiKey: 'your-api-key',
  baseUrl: 'https://api.devauth.dev/v1',
  storage: 'memory' // Use memory instead of localStorage
})

// Login screen
async function handleLogin(email: string, password: string) {
  try {
    const session = await client.login({ email, password })
    // Store tokens securely (use SecureStore or Keychain)
    await SecureStore.setItemAsync('access_token', session.access_token)
    await SecureStore.setItemAsync('refresh_token', session.refresh_token)
    // Navigate to home
  } catch (error) {
    Alert.alert('Login Failed', error.message)
  }
}
```

### Native iOS/Android

For native apps, use the REST API directly:

```swift
// iOS Swift example
func login(email: String, password: String) async throws -> AuthSession {
    let url = URL(string: "https://api.devauth.dev/v1/auth/login")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("your-app-id", forHTTPHeaderField: "x-app-id")
    request.setValue("your-api-key", forHTTPHeaderField: "x-api-key")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let body = ["email": email, "password": password]
    request.httpBody = try JSONSerialization.data(withJSONObject: body)
    
    let (data, _) = try await URLSession.shared.data(for: request)
    return try JSONDecoder().decode(AuthSession.self, from: data)
}
```

## Backend Service Integration

### FastAPI Integration

```python
from fastapi import FastAPI, Depends
from devauth.integrations.fastapi import init_devauth, get_current_user
from devauth.client import User

app = FastAPI()

# Initialize DevAuth
init_devauth(
    app_id=os.getenv("DEVAUTH_APP_ID"),
    api_key=os.getenv("DEVAUTH_API_KEY"),
    base_url=os.getenv("DEVAUTH_BASE_URL", "https://api.devauth.dev/v1"),
)

@app.get("/api/protected")
async def protected_endpoint(user: User = Depends(get_current_user)):
    """Protected endpoint - requires valid Bearer token"""
    return {
        "message": f"Hello {user.email}",
        "user_id": user.id,
        "app_id": user.app_id,
    }

@app.get("/api/public")
async def public_endpoint():
    """Public endpoint - no authentication required"""
    return {"message": "This is public"}
```

### Flask Integration

```python
from flask import Flask, jsonify
from devauth.integrations.flask import DevAuth, require_auth

app = Flask(__name__)
app.config['DEVAUTH_APP_ID'] = os.getenv('DEVAUTH_APP_ID')
app.config['DEVAUTH_API_KEY'] = os.getenv('DEVAUTH_API_KEY')
app.config['DEVAUTH_BASE_URL'] = os.getenv('DEVAUTH_BASE_URL', 'https://api.devauth.dev/v1')

devauth = DevAuth(app)

@app.route('/api/protected')
@require_auth
async def protected_endpoint(user):
    """Protected endpoint - requires valid Bearer token"""
    return jsonify({
        "message": f"Hello {user.email}",
        "user_id": user.id,
    })

@app.route('/api/public')
def public_endpoint():
    """Public endpoint"""
    return jsonify({"message": "This is public"})
```

### Django Integration

```python
# middleware.py
from devauth import DevAuthClient
import os

class DevAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.client = DevAuthClient(
            app_id=os.getenv('DEVAUTH_APP_ID'),
            api_key=os.getenv('DEVAUTH_API_KEY'),
            base_url=os.getenv('DEVAUTH_BASE_URL', 'https://api.devauth.dev/v1'),
        )

    async def __call__(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
            try:
                user = await self.client.verify_token(token)
                request.user = user  # Attach user to request
            except Exception:
                request.user = None
        else:
            request.user = None
        
        response = await self.get_response(request)
        return response

# views.py
from django.http import JsonResponse

async def protected_view(request):
    if not hasattr(request, 'user') or not request.user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    return JsonResponse({
        'message': f'Hello {request.user.email}',
        'user_id': request.user.id,
    })
```

## Common Integration Patterns

### Pattern 1: Protected Routes

**Web Application:**
```typescript
// Check authentication before rendering
if (!client.isAuthenticated()) {
  router.push('/login')
  return null
}

// Fetch user data
const user = await client.getMe()
```

**Backend Service:**
```python
# Use dependency injection (FastAPI)
@app.get("/protected")
async def protected(user: User = Depends(get_current_user)):
    return {"user": user.email}

# Or middleware (Flask/Django)
@require_auth
async def protected(user):
    return {"user": user.email}
```

### Pattern 2: Token Refresh

**JavaScript SDK (Automatic):**
```typescript
// SDK handles token refresh automatically
// On 401 response, it:
// 1. Attempts to refresh token
// 2. Retries original request
// 3. Logs out if refresh fails

const user = await client.getMe() // Automatically handles refresh
```

**Manual Refresh:**
```typescript
try {
  const session = await client.login({ email, password })
} catch (error) {
  if (error.code === 'TOKEN_EXPIRED') {
    // SDK will automatically refresh, but you can also:
    await client.refreshToken()
  }
}
```

### Pattern 3: Logout

**Web Application:**
```typescript
async function handleLogout() {
  await client.logout()
  // Clear any local state
  router.push('/login')
}
```

**Backend Service:**
```python
# Logout is handled client-side
# Backend validates tokens on each request
# Revoked sessions are rejected automatically
```

### Pattern 4: Email Verification

```typescript
// Request verification email
await client.requestEmailVerification(email)

// Verify email with token from email link
await client.verifyEmail(token)
```

### Pattern 5: Password Reset

```typescript
// Request password reset
await client.requestPasswordReset(email)

// Confirm password reset with token from email
await client.confirmPasswordReset(token, newPassword)
```

## Error Handling

### JavaScript SDK

```typescript
import { DevAuthError, AuthenticationError, TokenExpiredError } from '@devauth/js'

try {
  const user = await client.login({ email, password })
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Invalid credentials
    console.error('Login failed:', error.message)
  } else if (error instanceof TokenExpiredError) {
    // Token expired (should be handled automatically)
    console.error('Token expired')
  } else if (error instanceof DevAuthError) {
    // Other DevAuth errors
    console.error('Error:', error.code, error.message)
  } else {
    // Network or other errors
    console.error('Unexpected error:', error)
  }
}
```

### Python SDK

```python
from devauth.exceptions import AuthenticationError, TokenExpiredError, DevAuthError

try:
    user = await client.verify_token(token)
except AuthenticationError as e:
    # Invalid token
    print(f"Authentication failed: {e}")
except TokenExpiredError as e:
    # Token expired
    print(f"Token expired: {e}")
except DevAuthError as e:
    # Other DevAuth errors
    print(f"Error: {e}")
```

### API Error Responses

All API errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

**Common Error Codes:**
- `INVALID_CREDENTIALS` - Email or password incorrect
- `EMAIL_EXISTS` - Email already registered
- `INVALID_TOKEN` - Token invalid or expired
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `ACCOUNT_LOCKED` - Account locked due to failed attempts
- `VALIDATION_ERROR` - Request validation failed

## Best Practices

### 1. Store Credentials Securely

**✅ Good:**
```typescript
// Environment variables
const client = new DevAuthClient({
  appId: process.env.REACT_APP_DEVAUTH_APP_ID,
  apiKey: process.env.REACT_APP_DEVAUTH_API_KEY,
})
```

**❌ Bad:**
```typescript
// Hardcoded credentials
const client = new DevAuthClient({
  appId: 'my-app-id', // Never do this!
  apiKey: 'my-api-key',
})
```

### 2. Handle Errors Gracefully

**✅ Good:**
```typescript
try {
  const user = await client.getMe()
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Redirect to login
    router.push('/login')
  } else {
    // Show error message
    showError(error.message)
  }
}
```

### 3. Implement Token Refresh

**✅ Good:**
```typescript
// SDK handles this automatically, but ensure you're using it correctly
const client = new DevAuthClient({ ... })
// SDK will automatically refresh on 401
```

### 4. Validate User State

**✅ Good:**
```typescript
// Check authentication before making requests
if (client.isAuthenticated()) {
  const user = await client.getMe()
}
```

### 5. Use HTTPS in Production

**✅ Good:**
```typescript
const client = new DevAuthClient({
  baseUrl: 'https://api.devauth.dev/v1', // HTTPS
})
```

### 6. Implement Proper Logout

**✅ Good:**
```typescript
async function logout() {
  await client.logout()
  // Clear local state
  setUser(null)
  // Redirect
  router.push('/login')
}
```

### 7. Handle Network Errors

**✅ Good:**
```typescript
try {
  const user = await client.getMe()
} catch (error) {
  if (error.message.includes('network')) {
    // Show network error message
    showError('Network error. Please check your connection.')
  }
}
```

## Testing Your Integration

### Test Authentication Flow

```bash
# 1. Signup
curl -X POST http://localhost:8000/v1/auth/signup \
  -H "x-app-id: YOUR_APP_ID" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# 2. Login
curl -X POST http://localhost:8000/v1/auth/login \
  -H "x-app-id: YOUR_APP_ID" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# 3. Get current user (use access_token from login)
curl http://localhost:8000/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-app-id: YOUR_APP_ID"
```

### Test Error Handling

```bash
# Test invalid credentials
curl -X POST http://localhost:8000/v1/auth/login \
  -H "x-app-id: YOUR_APP_ID" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"WrongPassword"}'

# Test invalid token
curl http://localhost:8000/v1/auth/me \
  -H "Authorization: Bearer invalid-token" \
  -H "x-app-id: YOUR_APP_ID"
```

## Troubleshooting

### Common Issues

1. **"Not authenticated" errors**
   - Check if tokens are stored correctly
   - Verify token hasn't expired
   - Check API base URL

2. **Token refresh not working**
   - Ensure refresh token is stored
   - Check network connectivity
   - Verify API base URL

3. **CORS errors**
   - Check CORS_ORIGINS configuration
   - Verify request origin
   - Check API base URL

4. **Rate limit errors**
   - Check rate limit (60 req/min)
   - Implement request queuing
   - Use exponential backoff

## Next Steps

- Read the [API Reference](API.md) for detailed endpoint documentation
- Check the [SDK Documentation](SDK.md) for SDK-specific details
- Review [Security Guide](SECURITY.md) for security best practices
- See [Architecture Documentation](ARCHITECTURE.md) for system design

