import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { createDevAuthClient } from '../lib/devauth'
import type { User } from '../lib/devauth'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const client = createDevAuthClient()

  useEffect(() => {
    if (!client.isAuthenticated()) {
      router.push('/')
      return
    }

    client
      .getMe()
      .then(setUser)
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    await client.logout()
    router.push('/')
  }

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>Dashboard</h1>
      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>User Profile</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Email Verified:</strong> {user.email_verified ? 'Yes' : 'No'}</p>
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
      </div>
      <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </div>
  )
}

