"""
Application secret encryption utilities
"""

from cryptography.fernet import Fernet
import base64
from app.core.config import settings


def get_encryption_key() -> bytes:
    """
    Get encryption key from settings

    Returns:
        Encryption key bytes
    """
    # Decode base64 key to bytes
    key_bytes = base64.b64decode(settings.APP_SECRET_ENCRYPTION_KEY)
    # Ensure it's 32 bytes for Fernet
    if len(key_bytes) != 32:
        raise ValueError(
            "APP_SECRET_ENCRYPTION_KEY must be 32 bytes when base64 decoded"
        )
    # Fernet requires base64-encoded 32-byte key
    return base64.urlsafe_b64encode(key_bytes[:32])


def encrypt_secret(plaintext: str) -> str:
    """
    Encrypt an application secret using AES-256

    Args:
        plaintext: Plain text secret

    Returns:
        Encrypted secret string (base64 encoded)
    """
    key = get_encryption_key()
    fernet = Fernet(key)
    encrypted = fernet.encrypt(plaintext.encode("utf-8"))
    return encrypted.decode("utf-8")


def decrypt_secret(ciphertext: str) -> str:
    """
    Decrypt an application secret

    Args:
        ciphertext: Encrypted secret string (base64 encoded)

    Returns:
        Decrypted plaintext secret
    """
    key = get_encryption_key()
    fernet = Fernet(key)
    decrypted = fernet.decrypt(ciphertext.encode("utf-8"))
    return decrypted.decode("utf-8")
