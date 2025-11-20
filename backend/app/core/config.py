"""
Application configuration using Pydantic settings
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List

DEFAULT_JWT_PRIVATE_KEY = """-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA3kEQEmctafrbY54zSQ73RIzUEXdTJrztng06aeYJBbWdplys
+oAqRW0Evur/JSNQTfNbCNrnaiEHxLxoWSXmqCpbCGw/HSvXCMhcRPpGDDaS9nVU
LuAPyBtAmzFO12WuVaEyEQDXTkJMx+1iSEt/gOZd0Di8iv68dZ5zn5bF9zV//Fn/
dNuzIA2hqTvJswPSgYH6+m7d1WojpWpCz9eFvb7ZIkWtjdm1K05ZrZymaNMjDs8K
aUpDt69IHAu/JitJQGbcDGevH9RmrpDzfNC/GJpH867tOo9sN3p1cWfaoGon5VLA
44+lOCLz22uQSlyZnFLqLoS9yssEVJqbSqcO9QIDAQABAoIBAB1N1NGoWvuLQNv8
ouRyHbYjH18CLauA44+gTOBjnTLshFHIDGKm/WvT+Pk3QNbjthXhDVK4kiSTIFQX
R2bhsWzg0Mnmg9fTzPFygX/yw8OeengWdjgMAOiwdy8/LBcIaBkQPOqzArBl23vM
19WSZshXF2153ZoyBiU39CTJm2aBn2cXJ5v4FnBmUEkIL6VX94ndXgydmVsbQ3u5
PTUdaZ+kZ8I+0IlHaH4PXLwRukhKisKz1GNh1oz7guwen1iirJZpr6UdaNC6Cl0O
A973YW3balEFuHacTYckoFqf0Uh+mlUuKOh1uc/kbKhgU8I/uA+EsjMnnZXoSosJ
rD1Fau0CgYEA9Oc34FGufx+iCrKTd48SqLgNV8BD3CuG61FskJTqr08dVtOIjgsp
BzbJXezdOc20iBX2VOHRR1fBVYXSduxfVU0MFYALKzQTD6p0CBCM2HW7YDnMr7LP
7I2/YErOZQNjaVYGtEKYuMZXVaamwtgACgw0n1ZLd4kxn7dn1CyItQsCgYEA6FMf
2WxcvbgrVv2EThDfzkbOjkCbd+kXbv0inMzJQ6mOeiQeil6T1JLnyvm0in+K8mRI
hAR9C+8NQ+vyIsVGt6ELfoDVzprC7+JqsMsPxtcbOA80w7omLdJ9617TLIvB9Rum
wxuZJgyV1IRQyEZSqA6KYIkRZ798DLulzuGhy/8CgYEAwTQf2rHVzagw9+uFdw7C
E6SPsiiV4H3eRIrJ8Q3qTz9E0Bi1ZAnd5jkMhzK0HEPyJmHdIX280mGivkuCjBtR
4kOUQunu5biBSRyZyTr1Qlcu6Wzv07RnYCE7V0XsqbgQlysswsy/GxYuE/4TFSe+
cC7M3N8BTl5Hbc8M9E/l0Z0CgYAfRRjzVc+Bxakns0W8kC7ff85LfUyvrhL2YGHp
QvMQBWFk9TmbHDG/mepS+psfTR1xlKfiBQyjr5BUhQx5O55SFv4KD+M3RMNaMFp1
408DT26ddAaBFawP3NYP+RppU4JOsGMYvb02TtlX2ltZKYX0kshzR9+s3CwhNpyR
pPL3FwKBgQCKH57jKD29O/WxFToYQAyeUArHc3x4u9cVgZI3xtoUoZIOWpHDEAlR
btbo4hH+RAMTfQsQhdvuxJ1o3tkx6r7g2yB366Y7mky2UKdDPnMFckCnSUj7DvmB
wFFwqF2q1iE8Rw7xa+fMMC2FcXFXqEHdQ8+vXVcqHNWVCBO0vS4zgQ==
-----END RSA PRIVATE KEY-----"""

DEFAULT_JWT_PUBLIC_KEY = """-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3kEQEmctafrbY54zSQ73
RIzUEXdTJrztng06aeYJBbWdplys+oAqRW0Evur/JSNQTfNbCNrnaiEHxLxoWSXm
qCpbCGw/HSvXCMhcRPpGDDaS9nVULuAPyBtAmzFO12WuVaEyEQDXTkJMx+1iSEt/
gOZd0Di8iv68dZ5zn5bF9zV//Fn/dNuzIA2hqTvJswPSgYH6+m7d1WojpWpCz9eF
vb7ZIkWtjdm1K05ZrZymaNMjDs8KaUpDt69IHAu/JitJQGbcDGevH9RmrpDzfNC/
GJpH867tOo9sN3p1cWfaoGon5VLA44+lOCLz22uQSlyZnFLqLoS9yssEVJqbSqcO
9QIDAQAB
-----END PUBLIC KEY-----"""

DEFAULT_APP_SECRET_ENCRYPTION_KEY = "MDEyMzQ1Njc4OUFCQ0RFRjAxMjM0NTY3ODlBQkNERUY="


def _resolve_env_file() -> str | None:
    """
    Determine which .env file to load.

    Priority:
    1. ENV_FILE environment variable
    2. backend/.env (if readable)
    3. repo_root/.env (if readable)
    """
    override = os.getenv("ENV_FILE")
    if override:
        return override

    potential_paths = [
        Path(__file__).resolve().parents[2] / ".env",  # backend/.env
        Path(__file__).resolve().parents[3] / ".env",  # repo/.env
    ]

    for path in potential_paths:
        if path.exists() and os.access(path, os.R_OK):
            return str(path)

    return None


class Settings(BaseSettings):
    """Application settings"""

    # Database
    DATABASE_URL: str = (
        "postgresql+asyncpg://devauth:devauth_password@localhost:5432/devauth"
    )

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_PRIVATE_KEY: str = DEFAULT_JWT_PRIVATE_KEY
    JWT_PUBLIC_KEY: str = DEFAULT_JWT_PUBLIC_KEY
    JWT_ALGORITHM: str = "RS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Application Secret Encryption
    APP_SECRET_ENCRYPTION_KEY: str = DEFAULT_APP_SECRET_ENCRYPTION_KEY

    # SMTP
    SMTP_HOST: str = "smtp.sendgrid.net"
    SMTP_PORT: int = 587
    SMTP_USER: str = "apikey"
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@devauth.dev"
    SMTP_USE_TLS: bool = True

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string into list"""
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Environment
    ENVIRONMENT: str = "development"

    class Config:
        env_file = _resolve_env_file()
        case_sensitive = True


settings = Settings()
