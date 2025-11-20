"use client";

import { motion } from "framer-motion";
import DashboardNav from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Plus, Eye, EyeOff, Trash2, Search } from "lucide-react";
import { useState } from "react";

export default function ApplicationDetailPage() {
  const [showSecret, setShowSecret] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const apiKeys = [
    {
      id: "key_1",
      label: "Production Key",
      key: "sk_live_1234567890abcdef",
      createdAt: "2024-01-15",
      lastUsed: "2 hours ago",
      revoked: false,
    },
    {
      id: "key_2",
      label: "Development Key",
      key: "sk_test_abcdef1234567890",
      createdAt: "2024-02-20",
      lastUsed: "1 day ago",
      revoked: false,
    },
  ];

  const users = [
    {
      id: "user_1",
      email: "alice@example.com",
      emailVerified: true,
      createdAt: "2024-01-20",
      lastLogin: "2024-03-15",
    },
    {
      id: "user_2",
      email: "bob@example.com",
      emailVerified: true,
      createdAt: "2024-02-05",
      lastLogin: "2024-03-14",
    },
    {
      id: "user_3",
      email: "charlie@example.com",
      emailVerified: false,
      createdAt: "2024-03-10",
      lastLogin: "2024-03-10",
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Would show toast notification here
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <a href="/dashboard" className="hover:text-foreground">Applications</a>
              <span>/</span>
              <span>Production API</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Production API</h1>
            <p className="text-muted-foreground">
              App ID: app_1 • Created January 15, 2024
            </p>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="keys">API Keys</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* Application Details */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Application Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Application ID</label>
                      <div className="flex gap-2">
                        <Input value="app_1" readOnly />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard("app_1")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Application Secret</label>
                      <div className="flex gap-2">
                        <Input
                          type={showSecret ? "text" : "password"}
                          value="sk_live_1234567890abcdefghijklmnopqrstuvwxyz"
                          readOnly
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard("sk_live_1234567890abcdefghijklmnopqrstuvwxyz")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Keep this secret safe. Never expose it in client-side code.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Environment</label>
                      <Input value="Production" readOnly />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4">Usage Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Users</span>
                        <span className="text-xl font-bold">1,247</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">API Calls Today</span>
                        <span className="text-xl font-bold">98,234</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Success Rate</span>
                        <span className="text-xl font-bold text-green-500">99.9%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by email..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-accent/50">
                        <tr>
                          <th className="text-left px-6 py-4 text-sm font-medium">Email</th>
                          <th className="text-left px-6 py-4 text-sm font-medium">Status</th>
                          <th className="text-left px-6 py-4 text-sm font-medium">Created</th>
                          <th className="text-left px-6 py-4 text-sm font-medium">Last Login</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-accent/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium">{user.email}</div>
                              <div className="text-xs text-muted-foreground">{user.id}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.emailVerified
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-yellow-500/10 text-yellow-500'
                              }`}>
                                {user.emailVerified ? 'Verified' : 'Unverified'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {new Date(user.lastLogin).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="keys" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-muted-foreground">
                    Manage API keys for authenticating with DevAuth
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create API Key
                  </Button>
                </div>

                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="bg-card border border-border rounded-xl p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold">{key.label}</h3>
                            {!key.revoked && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 mb-2">
                            <code className="text-sm bg-accent px-3 py-1 rounded font-mono">
                              {key.key}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(key.key)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Created {new Date(key.createdAt).toLocaleDateString()} • Last used {key.lastUsed}
                          </div>
                        </div>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Revoke
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
