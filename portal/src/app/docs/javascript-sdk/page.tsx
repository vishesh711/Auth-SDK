"use client";

import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Code } from "lucide-react";

export default function JavaScriptSDKPage() {
  const methods = [
    {
      name: "constructor(config)",
      description: "Initialize the DevAuth client",
      params: [
        { name: "appId", type: "string", required: true, description: "Your application ID" },
        { name: "apiKey", type: "string", required: true, description: "Your API key" },
        { name: "baseUrl", type: "string", required: false, description: "Custom API URL (optional)" },
      ],
      example: `const auth = new DevAuthClient({
  appId: 'your-app-id',
  apiKey: 'your-api-key'
});`,
    },
    {
      name: "signup(data)",
      description: "Register a new user",
      params: [
        { name: "email", type: "string", required: true, description: "User's email address" },
        { name: "password", type: "string", required: true, description: "User's password (min 8 characters)" },
        { name: "metadata", type: "object", required: false, description: "Additional user data" },
      ],
      returns: "Promise<User>",
      example: `const user = await auth.signup({
  email: 'user@example.com',
  password: 'secure-password',
  metadata: { firstName: 'John', lastName: 'Doe' }
});`,
    },
    {
      name: "login(credentials)",
      description: "Authenticate a user",
      params: [
        { name: "email", type: "string", required: true, description: "User's email address" },
        { name: "password", type: "string", required: true, description: "User's password" },
      ],
      returns: "Promise<AuthSession>",
      example: `const session = await auth.login({
  email: 'user@example.com',
  password: 'secure-password'
});
console.log('Access token:', session.accessToken);`,
    },
    {
      name: "logout()",
      description: "End the current session",
      params: [],
      returns: "Promise<void>",
      example: `await auth.logout();
// Tokens are automatically cleared`,
    },
    {
      name: "getMe()",
      description: "Get the current authenticated user",
      params: [],
      returns: "Promise<User>",
      example: `const user = await auth.getMe();
console.log('Current user:', user.email);`,
    },
    {
      name: "refreshToken()",
      description: "Manually refresh the access token",
      params: [],
      returns: "Promise<void>",
      example: `await auth.refreshToken();
// New access token is automatically stored`,
    },
    {
      name: "verifyEmail(token)",
      description: "Verify user's email address",
      params: [
        { name: "token", type: "string", required: true, description: "Verification token from email" },
      ],
      returns: "Promise<void>",
      example: `await auth.verifyEmail('verification-token-from-email');`,
    },
    {
      name: "requestPasswordReset(email)",
      description: "Request a password reset email",
      params: [
        { name: "email", type: "string", required: true, description: "User's email address" },
      ],
      returns: "Promise<void>",
      example: `await auth.requestPasswordReset('user@example.com');`,
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-accent/30 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <div className="mb-6">
                <Link href="/docs" className="text-sm text-primary hover:underline">
                  ← Back to Documentation
                </Link>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Code className="w-6 h-6 text-blue-500" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold">JavaScript SDK</h1>
              </div>
              <p className="text-xl text-muted-foreground mb-8">
                Complete reference for the DevAuth JavaScript/TypeScript SDK. Build secure authentication flows in your web and mobile applications.
              </p>
              
              {/* Installation */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold mb-4">Installation</h3>
                <pre className="bg-accent/50 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">npm install @devauth/js</code>
                </pre>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Methods Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="space-y-12">
              {methods.map((method, index) => (
                <motion.div
                  key={method.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-xl p-8"
                  id={method.name.split('(')[0]}
                >
                  <div className="mb-6">
                    <code className="text-2xl font-bold font-mono text-primary">
                      {method.name}
                    </code>
                    <p className="text-muted-foreground mt-2">{method.description}</p>
                  </div>

                  {method.params.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold mb-3">Parameters</h4>
                      <div className="space-y-2">
                        {method.params.map((param) => (
                          <div key={param.name} className="flex gap-4">
                            <code className="text-sm bg-accent px-2 py-1 rounded font-mono flex-shrink-0">
                              {param.name}
                              {param.required && <span className="text-red-500">*</span>}
                            </code>
                            <div className="flex-1">
                              <span className="text-sm text-muted-foreground">
                                {param.type} - {param.description}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {method.returns && (
                    <div className="mb-6">
                      <h4 className="font-bold mb-2">Returns</h4>
                      <code className="text-sm bg-accent px-2 py-1 rounded font-mono">
                        {method.returns}
                      </code>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold mb-3">Example</h4>
                    <pre className="bg-accent/50 p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm">{method.example}</code>
                    </pre>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Types Section */}
        <section className="py-20 bg-accent/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">TypeScript Types</h2>
              <div className="bg-card border border-border rounded-xl p-6">
                <pre className="overflow-x-auto">
                  <code className="text-sm">{`interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

interface DevAuthConfig {
  appId: string;
  apiKey: string;
  baseUrl?: string;
  storage?: 'localStorage' | 'memory';
}`}</code>
                </pre>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
