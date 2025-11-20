"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import DashboardNav from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, Plus, Eye, EyeOff, Trash2, Search, ArrowLeft, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { apiKeys, applications as applicationsApi, users as usersApi } from "@/lib/api";
import type { APIKey, APIKeyWithPlaintext, Application, UsersResponse } from "@/lib/types";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const appId = params.id;
  const { loading: authLoading } = useRequireAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [users, setUsers] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [createdKey, setCreatedKey] = useState<APIKeyWithPlaintext | null>(null);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const fetchData = async () => {
    if (!appId) return;
    try {
      setLoading(true);
      setError(null);
      const [appsList, keyList, userList] = await Promise.all([
        applicationsApi.list(),
        apiKeys.list(appId),
        usersApi.list(appId, { limit: 100 }),
      ]);
      const currentApp = appsList.find((app) => app.app_id === appId);
      if (!currentApp) {
        setError("Application not found");
      } else {
        setApplication(currentApp);
      }
      setKeys(keyList);
      setUsers(userList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load application");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, appId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      setError("Unable to copy to clipboard");
    });
  };

  const handleCreateKey = async () => {
    if (!appId) return;
    setCreatingKey(true);
    setError(null);
    try {
      const key = await apiKeys.create(appId, { label: newKeyLabel || undefined });
      setCreatedKey(key);
      setKeys((prev) => [key, ...prev]);
      setNewKeyLabel("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create API key");
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!appId) return;
    setRevokeTarget(keyId);
    try {
      await apiKeys.revoke(appId, keyId);
      setKeys((prev) => prev.filter((key) => key.id !== keyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to revoke API key");
    } finally {
      setRevokeTarget(null);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchQuery.trim()) return users.users;
    return users.users.filter((user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [users, searchQuery]);

  if (!appId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="flex items-center gap-2 hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <span>/</span>
            <span>{application?.name ?? appId}</span>
          </div>

          {error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {createdKey ? (
            <Alert className="mb-6">
              <AlertDescription>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">New API key created</span>
                  <code className="bg-muted px-3 py-1 rounded text-sm break-all">{createdKey.key}</code>
                  <span className="text-xs text-muted-foreground">
                    Copy this key now. It will not be shown again.
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          ) : null}

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="keys">API Keys</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Application Details</h3>
                  {loading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : application ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Application ID</label>
                        <div className="flex gap-2">
                          <Input value={application.app_id} readOnly />
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(application.app_id)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Application Secret</label>
                        <div className="flex gap-2">
                          <Input
                            type={showSecret ? "text" : "password"}
                            value={createdKey?.key ?? "Generated during creation"}
                            readOnly
                          />
                          <Button variant="outline" size="icon" onClick={() => setShowSecret(!showSecret)}>
                            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Secrets are only provided once when the app is created. Rotate the app if needed.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Environment</label>
                        <Badge>
                          {application.environment === "prod" ? "Production" : "Development"}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Application not found.</p>
                  )}
                </div>
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-bold">Quick actions</h3>
                  <Button variant="outline" onClick={fetchData} disabled={loading}>
                    <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh data
                  </Button>
                  <Input
                    placeholder="Optional key label"
                    value={newKeyLabel}
                    onChange={(event) => setNewKeyLabel(event.target.value)}
                  />
                  <Button onClick={handleCreateKey} disabled={creatingKey || !application}>
                    {creatingKey ? "Creating key..." : "Generate API key"}
                  </Button>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
                  {loading ? (
                    <p className="p-6 text-muted-foreground">Loading users...</p>
                  ) : filteredUsers.length === 0 ? (
                    <p className="p-6 text-muted-foreground">No users found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-accent/50">
                          <tr>
                            <th className="text-left px-6 py-4 text-xs font-medium">Email</th>
                            <th className="text-left px-6 py-4 text-xs font-medium">Status</th>
                            <th className="text-left px-6 py-4 text-xs font-medium">Created</th>
                            <th className="text-left px-6 py-4 text-xs font-medium">Last Login</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-accent/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-medium">{user.email}</div>
                                <div className="text-xs text-muted-foreground">{user.id}</div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={user.email_verified ? "default" : "secondary"}>
                                  {user.email_verified ? "Verified" : "Unverified"}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                {user.last_login_at
                                  ? new Date(user.last_login_at).toLocaleDateString()
                                  : "Never"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="keys" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-muted-foreground">Manage API keys for authenticating with DevAuth</p>
                  <Button onClick={handleCreateKey} disabled={creatingKey}>
                    <Plus className="w-4 h-4 mr-2" />
                    {creatingKey ? "Creating..." : "Create API Key"}
                  </Button>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <p className="text-muted-foreground">Loading API keys...</p>
                  ) : keys.length === 0 ? (
                    <p className="text-muted-foreground">No API keys yet.</p>
                  ) : (
                    keys.map((key) => (
                      <div key={key.id} className="bg-card border border-border rounded-xl p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold">{key.label || "Untitled Key"}</h3>
                              <Badge variant={key.revoked ? "destructive" : "default"}>
                                {key.revoked ? "Revoked" : "Active"}
                              </Badge>
                            </div>
                            <div className="flex gap-2 mb-2">
                              <code className="text-sm bg-accent px-3 py-1 rounded font-mono">
                                {key.id}
                              </code>
                              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(key.id)}>
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Created {new Date(key.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          {!key.revoked ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevokeKey(key.id)}
                              disabled={revokeTarget === key.id}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {revokeTarget === key.id ? "Revoking..." : "Revoke"}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
