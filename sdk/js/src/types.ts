/**
 * TypeScript type definitions for DevAuth SDK
 */

export interface DevAuthConfig {
  appId: string
  apiKey: string
  baseUrl?: string
  storage?: 'localStorage' | 'memory'
}

export interface User {
  id: string
  email: string
  email_verified: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  last_login_at?: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: User
}

export interface SignupData {
  email: string
  password: string
  metadata?: Record<string, any>
}

export interface LoginCredentials {
  email: string
  password: string
}

