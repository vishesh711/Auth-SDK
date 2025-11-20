# @devauth/js

DevAuth JavaScript/TypeScript SDK for client-side authentication.

## Installation

```bash
npm install @devauth/js
```

## Usage

```typescript
import { DevAuthClient } from '@devauth/js'

const client = new DevAuthClient({
  appId: 'your-app-id',
  apiKey: 'your-api-key',
  baseUrl: 'https://api.devauth.dev/v1'
})

// Sign up a new user
const user = await client.signup({
  email: 'user@example.com',
  password: 'securepassword'
})

// Login
const session = await client.login({
  email: 'user@example.com',
  password: 'securepassword'
})

// Get current user
const currentUser = await client.getMe()
```

## Features

- Automatic token refresh on expiration
- Token storage (localStorage in browser, memory in Node.js)
- TypeScript support
- Promise-based API

