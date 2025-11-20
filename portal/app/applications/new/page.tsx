'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { applications } from '@/lib/api'
import type { ApplicationWithSecret } from '@/lib/types'

export default function NewApplicationPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [environment, setEnvironment] = useState<'dev' | 'prod'>('dev')
  const [createdApp, setCreatedApp] = useState<ApplicationWithSecret | null>(null)
  const [showSecret, setShowSecret] = useState(true)

  const createMutation = useMutation({
    mutationFn: (data: { name: string; environment: 'dev' | 'prod' }) =>
      applications.create(data),
    onSuccess: (data) => {
      setCreatedApp(data.application)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ name, environment })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (createdApp) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Application Created Successfully!
            </h3>
            <p className="text-sm text-yellow-800">
              Save your app_secret now. You won't be able to see it again.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Application Name</label>
              <p className="mt-1 text-gray-900">{createdApp.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Environment</label>
              <p className="mt-1 text-gray-900 capitalize">{createdApp.environment}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">App ID</label>
              <div className="mt-1 flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{createdApp.app_id}</code>
                <button
                  onClick={() => copyToClipboard(createdApp.app_id)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            {showSecret && (
              <div>
                <label className="block text-sm font-medium text-gray-700">App Secret</label>
                <div className="mt-1 flex items-center gap-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                    {createdApp.app_secret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(createdApp.app_secret)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-2 text-xs text-red-600">
                  ⚠️ Save this secret securely. It won't be shown again.
                </p>
              </div>
            )}
            <div className="pt-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Application</h2>
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Application Name
            </label>
            <input
              type="text"
              id="name"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="environment" className="block text-sm font-medium text-gray-700">
              Environment
            </label>
            <select
              id="environment"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as 'dev' | 'prod')}
            >
              <option value="dev">Development</option>
              <option value="prod">Production</option>
            </select>
          </div>
          {createMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-800">
                {(createMutation.error as any)?.response?.data?.error?.message || 'Failed to create application'}
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Application'}
          </button>
        </form>
      </div>
    </div>
  )
}

