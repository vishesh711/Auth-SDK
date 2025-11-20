/**
 * Token storage abstraction
 * Supports localStorage (browser) and memory (Node.js)
 */

export interface Storage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

class MemoryStorage implements Storage {
  private data: Map<string, string> = new Map()

  getItem(key: string): string | null {
    return this.data.get(key) || null
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }
}

class LocalStorageAdapter implements Storage {
  getItem(key: string): string | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // Ignore storage errors
    }
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Ignore storage errors
    }
  }
}

export function getStorage(storageType?: 'localStorage' | 'memory'): Storage {
  if (storageType === 'memory') {
    return new MemoryStorage()
  }
  
  // Auto-detect: use localStorage in browser, memory in Node.js
  if (typeof window !== 'undefined' && window.localStorage) {
    return new LocalStorageAdapter()
  }
  
  return new MemoryStorage()
}

