/**
 * Custom error classes for DevAuth SDK
 */

export class DevAuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'DevAuthError'
  }
}

export class AuthenticationError extends DevAuthError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class TokenExpiredError extends DevAuthError {
  constructor(message: string = 'Token has expired') {
    super(message, 'TOKEN_EXPIRED')
    this.name = 'TokenExpiredError'
  }
}

