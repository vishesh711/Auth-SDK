# DevAuth React Example

This example demonstrates how to use the DevAuth JavaScript SDK in a Next.js React application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Update `.env` with your DevAuth credentials:
```
NEXT_PUBLIC_DEVAUTH_APP_ID=your-app-id
NEXT_PUBLIC_DEVAUTH_API_KEY=your-api-key
NEXT_PUBLIC_DEVAUTH_BASE_URL=http://localhost:8000/v1
```

4. Run the development server:
```bash
npm run dev
```

## Features Demonstrated

- User signup
- User login
- Protected routes
- Automatic token refresh
- User profile display
- Logout

## Code Structure

- `pages/index.tsx` - Home page with signup/login
- `pages/dashboard.tsx` - Protected dashboard page
- `lib/devauth.ts` - DevAuth client setup
- `components/ProtectedRoute.tsx` - Route protection component

