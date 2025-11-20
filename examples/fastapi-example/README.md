# DevAuth FastAPI Example

This example demonstrates how to use the DevAuth Python SDK in a FastAPI application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
```bash
export DEVAUTH_APP_ID=your-app-id
export DEVAUTH_API_KEY=your-api-key
export DEVAUTH_BASE_URL=http://localhost:8000/v1
```

3. Run the server:
```bash
python main.py
# Or with uvicorn:
uvicorn main:app --reload --port 8001
```

## Testing

### Public Endpoint
```bash
curl http://localhost:8001/
```

### Protected Endpoint (requires token)
```bash
# First, get a token from DevAuth API
TOKEN="your-access-token"

curl -H "Authorization: Bearer $TOKEN" \
     -H "x-app-id: your-app-id" \
     http://localhost:8001/protected
```

## Features Demonstrated

- FastAPI integration with `get_current_user` dependency
- Automatic token validation
- Protected routes
- User context extraction

## Code Structure

- `main.py` - FastAPI application with protected routes
- Uses `devauth.integrations.fastapi.get_current_user` for authentication

