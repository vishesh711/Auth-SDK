"""
Token and API key hashing utilities
"""
import hashlib
import secrets
from typing import Tuple


def generate_secure_token(length: int = 32) -> str:
    """
    Generate a cryptographically secure random token
    
    Args:
        length: Length of token in bytes (default 32)
        
    Returns:
        Hex-encoded token string
    """
    return secrets.token_urlsafe(length)


def hash_token(token: str) -> str:
    """
    Hash a token using SHA-256
    
    Args:
        token: Plain text token
        
    Returns:
        SHA-256 hash hex string
    """
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def hash_api_key(api_key: str) -> str:
    """
    Hash an API key using SHA-256
    
    Args:
        api_key: Plain text API key
        
    Returns:
        SHA-256 hash hex string
    """
    return hashlib.sha256(api_key.encode('utf-8')).hexdigest()


def generate_api_key() -> Tuple[str, str]:
    """
    Generate a new API key and its hash
    
    Returns:
        Tuple of (plaintext_key, key_hash)
    """
    plaintext = generate_secure_token(32)
    key_hash = hash_api_key(plaintext)
    return plaintext, key_hash


def verify_token_hash(token: str, token_hash: str) -> bool:
    """
    Verify a token against its hash
    
    Args:
        token: Plain text token
        token_hash: SHA-256 hash
        
    Returns:
        True if token matches hash, False otherwise
    """
    computed_hash = hash_token(token)
    return secrets.compare_digest(computed_hash, token_hash)

