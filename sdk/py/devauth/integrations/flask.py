"""
Flask integration for DevAuth
"""
from typing import Optional, Callable
from functools import wraps
from flask import request, jsonify
from devauth.client import DevAuthClient, User
from devauth.exceptions import AuthenticationError


class DevAuth:
    """Flask extension for DevAuth"""
    
    def __init__(self, app=None):
        self.app = app
        self.client: Optional[DevAuthClient] = None
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app, app_id: str = None, api_key: str = None, base_url: str = None):
        """Initialize DevAuth with Flask app"""
        app_id = app_id or app.config.get("DEVAUTH_APP_ID")
        api_key = api_key or app.config.get("DEVAUTH_API_KEY")
        base_url = base_url or app.config.get("DEVAUTH_BASE_URL", "https://api.devauth.dev/v1")
        
        if not app_id or not api_key:
            raise ValueError("DEVAUTH_APP_ID and DEVAUTH_API_KEY must be set")
        
        self.client = DevAuthClient(app_id=app_id, api_key=api_key, base_url=base_url)
        
        # Store client in app context
        app.devauth_client = self.client


def require_auth(f: Callable) -> Callable:
    """
    Flask decorator to require authentication
    
    Usage:
        @app.route("/protected")
        @require_auth
        def protected_route(user):
            return {"user_id": user.id}
    """
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        # Get client from Flask app
        client: Optional[DevAuthClient] = None
        if hasattr(request, "app"):
            client = getattr(request.app, "devauth_client", None)
        
        if client is None:
            return jsonify({"error": "DevAuth client not initialized"}), 500
        
        # Extract token
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Invalid authorization header"}), 401
        
        token = auth_header[7:]  # Remove "Bearer " prefix
        
        # Get app_id from header
        app_id = request.headers.get("x-app-id")
        if not app_id:
            return jsonify({"error": "x-app-id header required"}), 400
        
        try:
            user = await client.verify_token(token)
            # Verify app_id matches
            if user.app_id != app_id:
                return jsonify({"error": "Token does not belong to this application"}), 401
            
            # Pass user as first argument
            return await f(user, *args, **kwargs)
        except AuthenticationError as e:
            return jsonify({"error": str(e)}), 401
    
    return decorated_function
