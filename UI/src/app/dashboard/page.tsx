"use client";

import { motion } from "framer-motion";
import DashboardNav from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Plus, Activity, Users, Key, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const applications = [
    {
      id: "app_1",
      name: "Production API",
      environment: "production",
      users: 1247,
      apiCalls: 98234,
      status: "active",
      createdAt: "2024-01-15",
    },
    {
      id: "app_2",
      name: "Staging Environment",
      environment: "development",
      users: 45,
      apiCalls: 3421,
      status: "active",
      createdAt: "2024-02-20",
    },
    {
      id: "app_3",
      name: "Mobile App",
      environment: "production",
      users: 823,
      apiCalls: 45123,
      status: "active",
      createdAt: "2024-03-10",
    },
  ];

  const stats = [
    {
      label: "Total Users",
      value: "2,115",
      change: "+12%",
      icon: Users,
    },
    {
      label: "API Calls Today",
      value: "146K",
      change: "+8%",
      icon: Activity,
    },
    {
      label: "Active Keys",
      value: "8",
      change: "0%",
      icon: Key,
    },
    {
      label: "Success Rate",
      value: "99.9%",
      change: "+0.1%",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <h1 className="text-3xl font-bold mb-2">Applications</h1>
                <p className="text-muted-foreground">
                  Manage your authentication applications
                </p>
              </div>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Application
              </Button>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <span className={`text-sm font-medium ${
                    stat.change.startsWith('+') ? 'text-green-500' : 'text-muted-foreground'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {applications.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Link
                  href={`/dashboard/applications/${app.id}`}
                  className="block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                          {app.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          app.environment === 'production'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {app.environment}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        App ID: {app.id} • Created {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 lg:gap-12">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Users</div>
                        <div className="text-2xl font-bold">{app.users.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">API Calls</div>
                        <div className="text-2xl font-bold">{app.apiCalls.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Empty State (if no applications) */}
          {applications.length === 0 && (
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
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Application
              </Button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
