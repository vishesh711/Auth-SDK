"use client";

import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Terminal } from "lucide-react";

export default function PythonSDKPage() {
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
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Terminal className="w-6 h-6 text-green-500" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold">Python SDK</h1>
              </div>
              <p className="text-xl text-muted-foreground mb-8">
                Server-side authentication for Python applications. Validate tokens, protect routes, and manage users in FastAPI, Flask, and Django.
              </p>
              
              {/* Installation */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold mb-4">Installation</h3>
                <pre className="bg-accent/50 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">pip install devauth-py</code>
                </pre>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Basic Usage */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">Basic Usage</h2>
              <div className="bg-card border border-border rounded-xl p-8 mb-8">
                <h3 className="text-xl font-bold mb-4">Initialize the Client</h3>
                <pre className="bg-accent/50 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">{`from devauth import DevAuthClient

client = DevAuthClient(
    app_id="your-app-id",
    api_key="your-api-key"
)`}</code>
                </pre>
              </div>

              <div className="bg-card border border-border rounded-xl p-8">
                <h3 className="text-xl font-bold mb-4">Verify Token</h3>
                <pre className="bg-accent/50 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">{`try:
    user = client.verify_token(access_token)
    print(f"Authenticated user: {user.email}")
except Exception as e:
    print(f"Invalid token: {e}")`}</code>
                </pre>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FastAPI Integration */}
        <section className="py-20 bg-accent/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">FastAPI Integration</h2>
              <div className="bg-card border border-border rounded-xl p-8">
                <pre className="bg-accent/50 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">{`from fastapi import FastAPI, Depends
from devauth.integrations.fastapi import DevAuthMiddleware, get_current_user
from devauth import User

app = FastAPI()

# Add middleware
app.add_middleware(
    DevAuthMiddleware,
    app_id="your-app-id",
    api_key="your-api-key"
)

# Protected route
@app.get("/api/protected")
async def protected_route(user: User = Depends(get_current_user)):
    return {
        "message": f"Hello, {user.email}!",
        "user_id": user.id
    }

# Public route
@app.get("/api/public")
async def public_route():
    return {"message": "This is public"}`}</code>
                </pre>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Flask Integration */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">Flask Integration</h2>
              <div className="bg-card border border-border rounded-xl p-8">
                <pre className="bg-accent/50 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">{`from flask import Flask
from devauth.integrations.flask import DevAuth, require_auth

app = Flask(__name__)
devauth = DevAuth(app, app_id="your-app-id", api_key="your-api-key")

# Protected route
@app.route("/api/protected")
@require_auth
def protected_route(user):
    return {
        "message": f"Hello, {user.email}!",
        "user_id": user.id
    }

# Public route
@app.route("/api/public")
def public_route():
    return {"message": "This is public"}

if __name__ == "__main__":
    app.run()`}</code>
                </pre>
              </div>
            </motion.div>
          </div>
        </section>

        {/* API Reference */}
        <section className="py-20 bg-accent/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">API Reference</h2>
              
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-2 font-mono text-primary">
                    verify_token(token: str) → User
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Verify an access token and return the authenticated user.
                  </p>
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <code className="text-sm">{`user = client.verify_token("access-token-here")
print(user.email)  # user@example.com`}</code>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-2 font-mono text-primary">
                    get_user(user_id: str) → User
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Retrieve user information by user ID.
                  </p>
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <code className="text-sm">{`user = client.get_user("user_123")
print(user.email_verified)  # True/False`}</code>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-2 font-mono text-primary">
                    introspect_token(token: str) → TokenIntrospection
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Get detailed information about a token.
                  </p>
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <code className="text-sm">{`result = client.introspect_token("access-token-here")
print(result.active)  # True/False
print(result.user.email)  # user@example.com`}</code>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Models */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">Data Models</h2>
              <div className="bg-card border border-border rounded-xl p-6">
                <pre className="overflow-x-auto">
                  <code className="text-sm">{`class User:
    id: str
    email: str
    email_verified: bool
    metadata: Optional[dict]
    created_at: datetime
    updated_at: datetime

class TokenIntrospection:
    active: bool
    user: Optional[User]
    expires_at: Optional[datetime]`}</code>
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
