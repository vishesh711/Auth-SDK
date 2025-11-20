"""
Password hashing and validation utilities
"""
import bcrypt
import re
from typing import Tuple


# Password strength requirements
MIN_PASSWORD_LENGTH = 8
PASSWORD_COMPLEXITY_PATTERN = re.compile(
    r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
)


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt with work factor 12
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
    """
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify a password against a hash
    
    Args:
        password: Plain text password
        password_hash: Bcrypt hash string
        
    Returns:
        True if password matches, False otherwise
    """
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def validate_password_strength(password: str) -> Tuple[bool, str]:
    """
    Validate password strength
    
    Args:
        password: Plain text password
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(password) < MIN_PASSWORD_LENGTH:
        return False, f"Password must be at least {MIN_PASSWORD_LENGTH} characters long"
    
    # Optional: Enforce complexity (commented out for MVP simplicity)
    # if not PASSWORD_COMPLEXITY_PATTERN.match(password):
    #     return False, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    
    return True, ""

