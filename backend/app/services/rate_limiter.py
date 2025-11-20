"""
Rate limiting service using Redis
"""
from datetime import timedelta
from fastapi import HTTPException, status
from app.core.redis import get_redis
from typing import Optional
import time


class RateLimiter:
    """Rate limiting service"""
    
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.window_seconds = 60
    
    async def check_rate_limit(
        self,
        identifier: str,
        limit: Optional[int] = None
    ) -> tuple[bool, int]:
        """
        Check if rate limit is exceeded using sliding window algorithm
        
        Args:
            identifier: Unique identifier (API key hash, IP address, etc.)
            limit: Optional custom limit (defaults to requests_per_minute)
            
        Returns:
            Tuple of (is_allowed, remaining_requests)
        """
        limit = limit or self.requests_per_minute
        redis_client = await get_redis()
        
        key = f"rate_limit:{identifier}"
        now = time.time()
        window_start = now - self.window_seconds
        
        # Use sorted set for sliding window
        pipe = redis_client.pipeline()
        
        # Remove expired entries
        pipe.zremrangebyscore(key, 0, window_start)
        
        # Count current requests in window
        pipe.zcard(key)
        
        # Add current request
        pipe.zadd(key, {str(now): now})
        
        # Set expiration
        pipe.expire(key, self.window_seconds)
        
        results = await pipe.execute()
        current_count = results[1]  # Count before adding current request
        
        if current_count >= limit:
            # Still add the request for tracking, but return False
            await redis_client.zadd(key, {str(now): now})
            await redis_client.expire(key, self.window_seconds)
            return False, 0
        
        remaining = limit - current_count - 1
        return True, remaining
    
    async def get_remaining_requests(self, identifier: str) -> int:
        """Get remaining requests for an identifier"""
        redis_client = await get_redis()
        key = f"rate_limit:{identifier}"
        count = await redis_client.zcard(key)
        return max(0, self.requests_per_minute - count)


class BruteForceProtection:
    """Brute force protection service"""
    
    def __init__(self, max_attempts: int = 5, lockout_minutes: int = 15):
        self.max_attempts = max_attempts
        self.lockout_seconds = lockout_minutes * 60
    
    async def record_failed_attempt(
        self,
        email: str,
        ip_address: str
    ) -> tuple[bool, int]:
        """
        Record a failed login attempt
        
        Args:
            email: User email
            ip_address: Client IP address
            
        Returns:
            Tuple of (is_locked, remaining_attempts)
        """
        redis_client = await get_redis()
        key = f"login_attempts:{email}:{ip_address}"
        
        # Increment counter
        attempts = await redis_client.incr(key)
        await redis_client.expire(key, self.lockout_seconds)
        
        if attempts >= self.max_attempts:
            # Set lockout flag
            lockout_key = f"login_blocked:{email}:{ip_address}"
            await redis_client.setex(lockout_key, self.lockout_seconds, "1")
            return True, 0
        
        remaining = self.max_attempts - attempts
        return False, remaining
    
    async def check_lockout(
        self,
        email: str,
        ip_address: str
    ) -> bool:
        """
        Check if account is locked out
        
        Args:
            email: User email
            ip_address: Client IP address
            
        Returns:
            True if locked out, False otherwise
        """
        redis_client = await get_redis()
        lockout_key = f"login_blocked:{email}:{ip_address}"
        blocked = await redis_client.get(lockout_key)
        return blocked is not None
    
    async def clear_attempts(
        self,
        email: str,
        ip_address: str
    ):
        """Clear failed attempts on successful login"""
        redis_client = await get_redis()
        attempts_key = f"login_attempts:{email}:{ip_address}"
        lockout_key = f"login_blocked:{email}:{ip_address}"
        await redis_client.delete(attempts_key, lockout_key)
    
    async def get_remaining_attempts(
        self,
        email: str,
        ip_address: str
    ) -> int:
        """Get remaining login attempts"""
        redis_client = await get_redis()
        key = f"login_attempts:{email}:{ip_address}"
        attempts = await redis_client.get(key)
        if attempts is None:
            return self.max_attempts
        attempts = int(attempts)
        return max(0, self.max_attempts - attempts)


# Global instances
rate_limiter = RateLimiter(requests_per_minute=60)
brute_force_protection = BruteForceProtection(max_attempts=5, lockout_minutes=15)

