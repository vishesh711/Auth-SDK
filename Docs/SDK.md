# DevAuth SDK Documentation

## JavaScript/TypeScript SDK

### Installation

```bash
npm install @devauth/js
```

### Basic Usage

```typescript
import { DevAuthClient } from '@devauth/js'

const client = new DevAuthClient({
  appId: 'your-app-id',
  apiKey: 'your-api-key',
  baseUrl: 'https://api.devauth.dev/v1'
})

// Sign up
const user = await client.signup({
  email: 'user@example.com',
  password: 'SecurePassword123!'
})

// Login
const session = await client.login({
  email: 'user@example.com',
  password: 'SecurePassword123!'
})

// Get current user
const currentUser = await client.getMe()

// Logout
await client.logout()
```

### Features

- **Automatic Token Refresh**: SDK automatically refreshes expired tokens
- **Token Storage**: Tokens stored in localStorage (browser) or memory (Node.js)
- **TypeScript Support**: Full type definitions included
- **Error Handling**: Custom error classes for different error types

### API Reference

#### `new DevAuthClient(config: DevAuthConfig)`

Create a new DevAuth client instance.

**Config:**
- `appId` (string, required): Your application ID
- `apiKey` (string, required): Your API key
- `baseUrl` (string, optional): API base URL (default: `https://api.devauth.dev/v1`)
- `storage` ('localStorage' | 'memory', optional): Storage type (auto-detected)

#### `signup(data: SignupData): Promise<User>`

Register a new user.

#### `login(credentials: LoginCredentials): Promise<AuthSession>`

Authenticate user and receive tokens.

#### `getMe(): Promise<User>`

Get current authenticated user.

#### `logout(): Promise<void>`

Logout and revoke session.

#### `verifyEmail(token: string): Promise<void>`

Verify email with token.

#### `requestEmailVerification(email: string): Promise<void>`

Request new verification email.

#### `requestPasswordReset(email: string): Promise<void>`

Request password reset email.

#### `confirmPasswordReset(token: string, newPassword: string): Promise<void>`

Confirm password reset.

#### `isAuthenticated(): boolean`

Check if user is authenticated.

## Python SDK

### Installation

```bash
pip install devauth-py
```

### Basic Usage

```python
from devauth import DevAuthClient

client = DevAuthClient(
    app_id="your-app-id",
    api_key="your-api-key",
    base_url="https://api.devauth.dev/v1"
)

# Verify token
user = await client.verify_token(token)
print(f"User: {user.email}")
```

### FastAPI Integration

```python
from fastapi import FastAPI, Depends
from devauth.integrations.fastapi import init_devauth, get_current_user

app = FastAPI()

# Initialize DevAuth
init_devauth(
    app_id="your-app-id",
    api_key="your-api-key",
    base_url="https://api.devauth.dev/v1"
)

@app.get("/protected")
async def protected_route(user = Depends(get_current_user)):
    return {"user_id": user.id, "email": user.email}
```

### Flask Integration

```python
from flask import Flask
from devauth.integrations.flask import DevAuth, require_auth

app = Flask(__name__)
app.config['DEVAUTH_APP_ID'] = 'your-app-id'
app.config['DEVAUTH_API_KEY'] = 'your-api-key'

devauth = DevAuth(app)

@app.route("/protected")
@require_auth
async def protected_route(user):
    return {"user_id": user.id, "email": user.email}
```

### API Reference

#### `DevAuthClient(app_id: str, api_key: str, base_url: str = "...")`

Create a new DevAuth client.

#### `verify_token(token: str) -> User`

Verify access token and return user info.

#### `introspect_token(token: str) -> TokenIntrospection`

Call introspection endpoint.

#### `close()`

Close HTTP client (use with async context manager).

### FastAPI Dependency

#### `get_current_user(authorization: str, x_app_id: str) -> User`

FastAPI dependency that extracts and validates Bearer token.

### Flask Decorator

#### `@require_auth`

Flask decorator that requires authentication. User is passed as first argument.

## Error Handling

Both SDKs provide custom exception classes:

**JavaScript:**
- `DevAuthError` - Base error class
- `AuthenticationError` - Authentication failed
- `TokenExpiredError` - Token expired

**Python:**
- `DevAuthError` - Base error class
- `AuthenticationError` - Authentication failed
- `TokenExpiredError` - Token expired
- `InvalidTokenError` - Invalid token

