/**
 * DevAuth Client
 * Main client class for authentication operations
 */

import { DevAuthConfig, User, AuthSession, SignupData, LoginCredentials } from './types'
import { DevAuthError, AuthenticationError, TokenExpiredError } from './errors'
import { Storage, getStorage } from './storage'

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'devauth_access_token',
  REFRESH_TOKEN: 'devauth_refresh_token',
}

export class DevAuthClient {
  private config: DevAuthConfig
  private baseUrl: string
  private storage: Storage
  private refreshPromise: Promise<string> | null = null

  constructor(config: DevAuthConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://api.devauth.dev/v1'
    this.storage = getStorage(config.storage)
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = new Headers({
      'Content-Type': 'application/json',
      'x-app-id': this.config.appId,
    })
    if (this.config.apiKey) {
      headers.set('x-api-key', this.config.apiKey)
    }
    if (options.headers) {
      const extra = new Headers(options.headers)
      extra.forEach((value, key) => headers.set(key, value))
    }

    // Add access token if available
    const accessToken = this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
    }

    let response = await fetch(url, {
      ...requestOptions,
    })

    // Handle 401 - try to refresh token
    if (response.status === 401 && accessToken) {
      try {
        const newAccessToken = await this.refreshAccessToken()
        // Retry request with new token
        headers.set('Authorization', `Bearer ${newAccessToken}`)
        response = await fetch(url, {
          ...requestOptions,
        })
      } catch (error) {
        // Refresh failed, logout
        this.logout()
        throw new AuthenticationError('Session expired. Please login again.')
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new DevAuthError(
        errorData.error?.message || 'Request failed',
        errorData.error?.code
      )
    }

    return (await response.json()) as T
  }

  private async refreshAccessToken(): Promise<string> {
    // Prevent concurrent refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.storage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    if (!refreshToken) {
      throw new AuthenticationError('No refresh token available')
    }

    this.refreshPromise = (async () => {
      try {
        const url = `${this.baseUrl}/auth/refresh`
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-app-id': this.config.appId,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })

        if (!response.ok) {
          throw new AuthenticationError('Token refresh failed')
        }

        const data = await response.json()
        const newAccessToken = data.access_token

        // Update stored tokens
        if (newAccessToken) {
          this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken)
        }
        if (data.refresh_token) {
          this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token)
        }

        return newAccessToken
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  async signup(data: SignupData): Promise<User> {
    const response = await this.request<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response
  }

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const response = await this.request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    // Store tokens
    this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token)
    this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token)

    return response
  }

  async logout(): Promise<void> {
    const refreshToken = this.storage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    
    if (refreshToken) {
      try {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
      } catch (error) {
        // Ignore logout errors
      }
    }

    // Clear tokens
    this.storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    this.storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  async getMe(): Promise<User> {
    const response = await this.request<User>('/auth/me')
    return response
  }

  async verifyEmail(token: string): Promise<void> {
    await this.request('/auth/email/verify/confirm', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  async requestEmailVerification(email: string): Promise<void> {
    await this.request('/auth/email/verify/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.request('/auth/password/reset/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    await this.request('/auth/password/reset/confirm', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    })
  }

  isAuthenticated(): boolean {
    return !!this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  }
}
