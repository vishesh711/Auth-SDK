"""
DevAuth Python SDK
Main package for backend token validation
"""

from devauth.client import DevAuthClient
from devauth.exceptions import DevAuthError, AuthenticationError

__version__ = "0.1.0"
__all__ = ["DevAuthClient", "DevAuthError", "AuthenticationError"]

