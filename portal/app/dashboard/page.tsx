'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applications } from '@/lib/api'
import type { Application } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('dev_token')) {
      router.push('/login')
    }
  }, [router])

  const { data: apps, isLoading } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: () => applications.list(),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">DevAuth Portal</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  localStorage.removeItem('dev_token')
                  router.push('/login')
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
            <Link
              href="/applications/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Application
            </Link>
          </div>

          {!apps || apps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No applications yet</p>
              <Link
                href="/applications/new"
                className="text-blue-600 hover:text-blue-700"
              >
                Create your first application
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {apps.map((app) => (
                <Link
                  key={app.id}
                  href={`/applications/${app.app_id}`}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {app.environment === 'dev' ? 'Development' : 'Production'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 font-mono">{app.app_id}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

