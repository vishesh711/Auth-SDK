"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import DashboardNav from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Activity,
  Users,
  Key,
  TrendingUp,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { applications as applicationsApi } from "@/lib/api";
import type { Application, ApplicationWithSecret } from "@/lib/types";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuth } from "@/context/auth-context";

export default function DashboardPage() {
  const { loading: authLoading } = useRequireAuth();
  const { developer } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState("");
  const [environment, setEnvironment] = useState<"dev" | "prod">("dev");
  const [createdApp, setCreatedApp] = useState<ApplicationWithSecret | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchApps = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationsApi.list();
      setApps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchApps();
    }
  }, [authLoading]);

  const handleCreate = async () => {
    if (!formName.trim()) {
      setError("Application name is required");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const newApp = await applicationsApi.create({
        name: formName.trim(),
        environment,
      });
      setApps((prev) => [newApp, ...prev]);
      setCreatedApp(newApp);
      setDialogOpen(false);
      setFormName("");
      setEnvironment("dev");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create application");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (appId: string) => {
    setDeleteTarget(appId);
    try {
      await applicationsApi.remove(appId);
      setApps((prev) => prev.filter((app) => app.app_id !== appId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete application");
    } finally {
      setDeleteTarget(null);
    }
  };

  const stats = useMemo(() => {
    const totalApps = apps.length;
    return [
      {
        label: "Applications",
        value: totalApps.toString(),
        change: totalApps ? "+100%" : "0%",
        icon: Activity,
      },
      {
        label: "Environments",
        value: `${apps.filter((a) => a.environment === "prod").length} prod / ${apps.filter((a) => a.environment === "dev").length} dev`,
        change: "",
        icon: Users,
      },
      {
        label: "App IDs",
        value: totalApps ? apps[0].app_id : "-",
        change: "",
        icon: Key,
      },
      {
        label: "Owner",
        value: developer?.email ?? "-",
        change: "",
        icon: TrendingUp,
      },
    ];
  }, [apps, developer]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <h1 className="text-3xl font-bold mb-2">Applications</h1>
                <p className="text-muted-foreground">Manage your authentication applications</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={fetchApps} disabled={loading}>
                  <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
                <Button className="w-full sm:w-auto" onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Application
                </Button>
              </div>
            </motion.div>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            {createdApp ? (
              <Alert>
                <AlertDescription>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">New application created!</span>
                    <span>Name: {createdApp.name}</span>
                    <span>App ID: {createdApp.app_id}</span>
                    <span className="font-mono break-all">Secret: {createdApp.app_secret}</span>
                    <span className="text-xs text-muted-foreground">
                      This secret is only shown once. Store it securely.
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            ) : null}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  {stat.change ? (
                    <span className="text-sm font-medium text-green-500">{stat.change}</span>
                  ) : null}
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading applications...</p>
            ) : apps.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-dashed border-border rounded-xl p-12 text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first application to start using DevAuth for authentication.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first application
                </Button>
              </motion.div>
            ) : (
              apps.map((app, index) => (
                <motion.div
                  key={app.app_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            href={`/dashboard/applications/${app.app_id}`}
                            className="text-xl font-bold group-hover:text-primary transition-colors"
                          >
                            {app.name}
                          </Link>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            app.environment === "prod"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-blue-500/10 text-blue-500"
                          }`}>
                            {app.environment === "prod" ? "Production" : "Development"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          App ID: {app.app_id} • Created {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/applications/${app.app_id}`}>View</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(app.app_id)}
                          disabled={deleteTarget === app.app_id}
                        >
                          <Trash2 className={`w-4 h-4 ${deleteTarget === app.app_id ? "animate-pulse" : ""}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create application</DialogTitle>
            <DialogDescription>Give your app a friendly name and choose the environment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="app-name">Application name</Label>
              <Input
                id="app-name"
                placeholder="My Production API"
                value={formName}
                onChange={(event) => setFormName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Environment</Label>
              <Select value={environment} onValueChange={(value: "dev" | "prod") => setEnvironment(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">Development</SelectItem>
                  <SelectItem value="prod">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
