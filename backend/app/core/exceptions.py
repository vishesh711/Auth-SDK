"""
Custom exception classes
"""

from fastapi import HTTPException, status


class DevAuthException(HTTPException):
    """Base exception for DevAuth"""

    def __init__(
        self, code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST
    ):
        super().__init__(
            status_code=status_code, detail={"code": code, "message": message}
        )


class AuthenticationError(DevAuthException):
    """Authentication error"""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__("AUTHENTICATION_ERROR", message, status.HTTP_401_UNAUTHORIZED)


class AuthorizationError(DevAuthException):
    """Authorization error"""

    def __init__(self, message: str = "Not authorized"):
        super().__init__("AUTHORIZATION_ERROR", message, status.HTTP_403_FORBIDDEN)


class NotFoundError(DevAuthException):
    """Resource not found error"""

    def __init__(self, message: str = "Resource not found"):
        super().__init__("NOT_FOUND", message, status.HTTP_404_NOT_FOUND)


class ValidationError(DevAuthException):
    """Validation error"""

    def __init__(self, message: str = "Validation failed"):
        super().__init__("VALIDATION_ERROR", message, status.HTTP_400_BAD_REQUEST)


class ConflictError(DevAuthException):
    """Conflict error"""

    def __init__(self, message: str = "Resource already exists"):
        super().__init__("CONFLICT", message, status.HTTP_409_CONFLICT)


class RateLimitError(DevAuthException):
    """Rate limit error"""

    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(
            "RATE_LIMIT_EXCEEDED", message, status.HTTP_429_TOO_MANY_REQUESTS
        )
