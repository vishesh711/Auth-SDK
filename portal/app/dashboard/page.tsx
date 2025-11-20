'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applications } from '@/lib/api'
import type { Application } from '@/lib/types'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('dev_token')) {
      router.push('/login')
    }
  }, [router])

  const { data: apps, isLoading } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: () => applications.list(),
  })

  const deleteMutation = useMutation({
    mutationFn: (appId: string) => applications.remove(appId),
    onMutate: (appId) => {
      setDeletingAppId(appId)
      setDeleteError(null)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
    onError: (error: any) => {
      setDeleteError(error?.response?.data?.error?.message || 'Failed to delete application')
    },
    onSettled: () => {
      setDeletingAppId(null)
    },
  })

  const handleDeleteApplication = (
    event: React.MouseEvent,
    appId: string,
    appName: string
  ) => {
    event.preventDefault()
    event.stopPropagation()
    if (
      confirm(
        `Delete "${appName}"? This removes the application, its API keys, and users. This cannot be undone.`
      )
    ) {
      deleteMutation.mutate(appId)
    }
  }

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

          {deleteError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {deleteError}
            </div>
          )}

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
                <div
                  key={app.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/applications/${app.app_id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') router.push(`/applications/${app.app_id}`)
                  }}
                  className="relative cursor-pointer rounded-lg bg-white p-6 shadow transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
                      <p className="text-sm text-gray-500">
                        {app.environment === 'dev' ? 'Development' : 'Production'}
                      </p>
                    </div>
                    <button
                      onClick={(event) => handleDeleteApplication(event, app.app_id, app.name)}
                      className="rounded-full border border-red-100 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      disabled={deletingAppId === app.app_id}
                    >
                      {deletingAppId === app.app_id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div>
                      <p className="text-xs uppercase text-gray-400">App ID</p>
                      <p className="font-mono text-sm text-gray-600 truncate">{app.app_id}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      Created {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

