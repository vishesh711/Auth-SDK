'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { applications, apiKeys } from '@/lib/api'
import type { ApplicationWithSecret, APIKeyWithPlaintext } from '@/lib/types'

export default function NewApplicationPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [environment, setEnvironment] = useState<'dev' | 'prod'>('dev')
  const [createdApp, setCreatedApp] = useState<ApplicationWithSecret | null>(null)
  const [generatedKey, setGeneratedKey] = useState<APIKeyWithPlaintext | null>(null)
  const [keyError, setKeyError] = useState<string | null>(null)
  const [isGeneratingKey, setIsGeneratingKey] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1'

  const createMutation = useMutation({
    mutationFn: (data: { name: string; environment: 'dev' | 'prod' }) => applications.create(data),
    onSuccess: (data: ApplicationWithSecret) => {
      setCreatedApp(data)
      setGeneratedKey(null)
      setKeyError(null)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ name, environment })
  }

  const copyToClipboard = async (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
  }

  const handleGenerateKey = async () => {
    if (!createdApp) return
    setIsGeneratingKey(true)
    setKeyError(null)
    try {
      const response = await apiKeys.create(createdApp.app_id, { label: 'Primary Key' })
      setGeneratedKey(response)
    } catch (error: any) {
      setKeyError(
        error?.response?.data?.error?.message || 'Unable to generate API key. Please try again.'
      )
    } finally {
      setIsGeneratingKey(false)
    }
  }

  if (createdApp) {
    const sampleCurl = `curl -X POST ${API_BASE_URL}/auth/signup \\
  -H "Content-Type: application/json" \\
  -H "x-app-id: ${createdApp.app_id}" \\
  -H "x-api-key: ${generatedKey?.key ?? '<your-api-key>'}" \\
  -d '{ "email": "user@example.com", "password": "SecurePassword123!" }'`

    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 shadow-2xl">
            <p className="text-sm uppercase tracking-widest text-white/80">Step 2 of 2</p>
            <h1 className="text-3xl font-semibold mt-2">Credentials ready to use</h1>
            <p className="text-white/80 mt-2 max-w-3xl">
              Copy your credentials now. The application secret and API key are visible only once.
              You&apos;ll use these values in your SDKs and direct API calls.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur">
              <h2 className="text-lg font-semibold text-white">Application credentials</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/60 uppercase">Application ID</p>
                  <div className="mt-1 flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm">
                    <span className="truncate">{createdApp.app_id}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdApp.app_id)}
                      className="text-xs text-cyan-300 hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/60 uppercase">Application Secret</p>
                  <div className="mt-1 rounded-xl border border-amber-300/40 bg-amber-50/10 px-3 py-2 font-mono text-sm text-amber-100">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate">{createdApp.app_secret}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(createdApp.app_secret)}
                        className="text-xs text-amber-200 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-amber-200/80">
                      ⚠️ Save this secret securely. It will disappear as soon as you navigate
                      away.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">API key</p>
                    <p className="text-xs text-white/60">
                      One-click key creation so you can test the API immediately.
                    </p>
                  </div>
                  {!generatedKey ? (
                    <button
                      type="button"
                      onClick={handleGenerateKey}
                      disabled={isGeneratingKey}
                      className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20 disabled:opacity-50"
                    >
                      {isGeneratingKey ? 'Generating…' : 'Generate key'}
                    </button>
                  ) : (
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">
                      Key ready
                    </span>
                  )}
                </div>

                {keyError && (
                  <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                    {keyError}
                  </div>
                )}

                {generatedKey && (
                  <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{generatedKey.key}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedKey.key)}
                        className="text-xs text-cyan-300 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-white/60">
                      Header usage: <code>x-api-key: {generatedKey.key}</code>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h3 className="text-lg font-semibold text-white">Next steps</h3>
                <ol className="mt-4 space-y-3 text-sm text-white/80 list-decimal list-inside">
                  <li>Store the App ID, App Secret, and API Key in your secrets manager.</li>
                  <li>Use the API key headers (`x-app-id`, `x-api-key`) to call the DevAuth API.</li>
                  <li>
                    Plug the values into the SDKs or start with the ready-made cURL example below.
                  </li>
                </ol>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="rounded-lg bg-white text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-200"
                  >
                    Go to dashboard
                  </button>
                  <Link
                    href="https://github.com/vishesh/Auth-SDK#readme"
                    target="_blank"
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
                  >
                    View docs
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 font-mono text-sm text-white/80">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-widest text-white/50">Test request</p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(sampleCurl)}
                    className="text-xs text-cyan-300 hover:text-white"
                  >
                    Copy cURL
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-xs leading-relaxed">{sampleCurl}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Step 1 of 2</p>
          <h1 className="text-4xl font-semibold">Create an application</h1>
          <p className="text-white/70 max-w-2xl">
            Every application gets a unique App ID and secret. You&apos;ll use them along with an
            API key to call DevAuth. Choose a clear name so you can recognize the app in logs and
            dashboards.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur space-y-6"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-white">
              Application name
            </label>
            <input
              type="text"
              id="name"
              required
              placeholder="e.g. My SaaS dashboard"
              className="w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-white/50">
              This will appear across the dashboard and audit logs.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="environment" className="block text-sm font-medium text-white">
              Environment
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['dev', 'prod'].map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setEnvironment(env as 'dev' | 'prod')}
                  className={`rounded-xl border px-4 py-4 text-left transition ${
                    environment === env
                      ? 'border-cyan-400 bg-cyan-400/10 text-white'
                      : 'border-white/10 bg-black/30 text-white/70 hover:border-white/30'
                  }`}
                >
                  <p className="text-sm font-medium">
                    {env === 'dev' ? 'Development' : 'Production'}
                  </p>
                  <p className="text-xs text-white/60">
                    {env === 'dev'
                      ? 'Sandbox keys for testing'
                      : 'Use for live traffic only'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {createMutation.isError && (
            <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {(createMutation.error as any)?.response?.data?.error?.message ||
                'Failed to create application'}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating application…' : 'Create application'}
            </button>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm text-white/70 hover:border-white/40"
            >
              Cancel
            </Link>
          </div>
        </form>

        <div className="rounded-2xl border border-white/5 bg-black/30 p-6 text-sm text-white/70">
          <h3 className="text-base font-semibold text-white mb-2">What you get</h3>
          <ul className="list-disc space-y-2 pl-4">
            <li>App ID + secret pair for authenticating SDKs</li>
            <li>Ability to mint API keys tied to this application</li>
            <li>Isolation between dev and prod environments</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

