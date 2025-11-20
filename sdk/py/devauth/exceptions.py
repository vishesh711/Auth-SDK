"""
Custom exception classes for DevAuth SDK
"""


class DevAuthError(Exception):
    """Base exception for DevAuth SDK"""
    pass


class AuthenticationError(DevAuthError):
    """Raised when authentication fails"""
    pass


class TokenExpiredError(DevAuthError):
    """Raised when token has expired"""
    pass


class InvalidTokenError(DevAuthError):
    """Raised when token is invalid"""
    pass

