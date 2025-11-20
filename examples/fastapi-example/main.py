"""
FastAPI example using DevAuth Python SDK
"""
from fastapi import FastAPI, Depends, HTTPException
from devauth.integrations.fastapi import init_devauth, get_current_user
from devauth.client import User
import os

app = FastAPI(title="DevAuth FastAPI Example")

# Initialize DevAuth
# In production, get these from environment variables
init_devauth(
    app_id=os.getenv("DEVAUTH_APP_ID", "your-app-id"),
    api_key=os.getenv("DEVAUTH_API_KEY", "your-api-key"),
    base_url=os.getenv("DEVAUTH_BASE_URL", "http://localhost:8000/v1"),
)


@app.get("/")
async def root():
    """Public endpoint"""
    return {"message": "Welcome to DevAuth FastAPI Example"}


@app.get("/protected")
async def protected_route(user: User = Depends(get_current_user)):
    """
    Protected endpoint requiring authentication
    
    The get_current_user dependency automatically:
    - Extracts Bearer token from Authorization header
    - Validates the token via introspection endpoint
    - Returns User object if valid
    - Raises 401 if invalid or expired
    """
    return {
        "message": "This is a protected route",
        "user": {
            "id": user.id,
            "email": user.email,
            "app_id": user.app_id,
        },
    }


@app.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return {
        "id": user.id,
        "email": user.email,
        "app_id": user.app_id,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

