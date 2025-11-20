'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiKeys, users } from '@/lib/api'
import type { APIKey, User } from '@/lib/types'
import Link from 'next/link'

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const appId = params.appId as string
  const [activeTab, setActiveTab] = useState<'keys' | 'users'>('keys')
  const [newKeyLabel, setNewKeyLabel] = useState('')
  const [showNewKey, setShowNewKey] = useState(false)
  const [createdKey, setCreatedKey] = useState<APIKey & { key?: string } | null>(null)
  const queryClient = useQueryClient()

  const { data: apiKeysList, isLoading: keysLoading } = useQuery<APIKey[]>({
    queryKey: ['api-keys', appId],
    queryFn: () => apiKeys.list(appId),
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', appId],
    queryFn: () => users.list(appId, { page: 1, limit: 20 }),
  })

  const createKeyMutation = useMutation({
    mutationFn: (label?: string) => apiKeys.create(appId, { label }),
    onSuccess: (data) => {
      setCreatedKey(data.api_key)
      queryClient.invalidateQueries({ queryKey: ['api-keys', appId] })
      setShowNewKey(false)
      setNewKeyLabel('')
    },
  })

  const revokeKeyMutation = useMutation({
    mutationFn: (keyId: string) => apiKeys.revoke(appId, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', appId] })
    },
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Application: {appId}</h2>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('keys')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'keys'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                API Keys
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users
              </button>
            </nav>
          </div>

          {/* API Keys Tab */}
          {activeTab === 'keys' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">API Keys</h3>
                <button
                  onClick={() => setShowNewKey(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create API Key
                </button>
              </div>

              {createdKey && createdKey.key && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">New API Key Created</h4>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-white px-2 py-1 rounded font-mono">
                      {createdKey.key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(createdKey.key!)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-yellow-800 mt-2">
                    ⚠️ Save this key now. It won't be shown again.
                  </p>
                </div>
              )}

              {showNewKey && (
                <div className="bg-white rounded-lg shadow p-4 mb-4">
                  <input
                    type="text"
                    placeholder="Label (optional)"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => createKeyMutation.mutate(newKeyLabel || undefined)}
                      disabled={createKeyMutation.isPending}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowNewKey(false)
                        setNewKeyLabel('')
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {keysLoading ? (
                <div className="text-gray-600">Loading...</div>
              ) : !apiKeysList || apiKeysList.length === 0 ? (
                <div className="text-gray-600">No API keys yet</div>
              ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Label
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {apiKeysList.map((key) => (
                        <tr key={key.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {key.label || 'No label'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(key.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                key.revoked
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {key.revoked ? 'Revoked' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {!key.revoked && (
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to revoke this API key?')) {
                                    revokeKeyMutation.mutate(key.id)
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Users ({usersData?.total || 0})
              </h3>
              {usersLoading ? (
                <div className="text-gray-600">Loading...</div>
              ) : !usersData || usersData.users.length === 0 ? (
                <div className="text-gray-600">No users yet</div>
              ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Verified
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Last Login
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {usersData.users.map((user: User) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.email_verified
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {user.email_verified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.last_login_at
                              ? new Date(user.last_login_at).toLocaleDateString()
                              : 'Never'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

