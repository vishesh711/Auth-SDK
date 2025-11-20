"use client";

import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function QuickstartPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const steps = [
    {
      id: "step1",
      title: "1. Create an Application",
      description: "Sign up for Auth8.inc and create your first application in the dashboard.",
      code: null,
    },
    {
      id: "step2",
      title: "2. Install the SDK",
      description: "Install the Auth8 JavaScript SDK via npm:",
      code: "npm install @auth8/sdk",
    },
    {
      id: "step3",
      title: "3. Initialize the Client",
      description: "Set up the Auth8 client with your application credentials:",
      code: `import { Auth8Client } from '@auth8/sdk';

const auth = new Auth8Client({
  appId: 'your-app-id',
  apiKey: 'your-api-key'
});`,
    },
    {
      id: "step4",
      title: "4. Implement Sign Up",
      description: "Add user registration to your application:",
      code: `async function handleSignUp(email, password) {
  try {
    const user = await auth.signup({
      email,
      password
    });
    console.log('User created:', user);
  } catch (error) {
    console.error('Signup failed:', error);
  }
}`,
    },
    {
      id: "step5",
      title: "5. Implement Login",
      description: "Add authentication to your application:",
      code: `async function handleLogin(email, password) {
  try {
    const session = await auth.login({
      email,
      password
    });
    console.log('Logged in:', session.user);
    // Access token is automatically stored
  } catch (error) {
    console.error('Login failed:', error);
  }
}`,
    },
    {
      id: "step6",
      title: "6. Access User Information",
      description: "Get the currently authenticated user:",
      code: `async function getCurrentUser() {
  try {
    const user = await auth.getMe();
    console.log('Current user:', user);
  } catch (error) {
    console.error('Not authenticated');
  }
}`,
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 md:py-32 relative overflow-hidden mesh-gradient">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <div className="mb-6">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-secondary transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Documentation
                </Link>
              </div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6 glow-primary"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Get Started in 5 Minutes
                </span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Quickstart
                </span>{" "}
                Guide
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Get started with Auth8.inc in under 5 minutes. Follow these simple steps to add enterprise-grade authentication to your application.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="space-y-12">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center flex-shrink-0 text-primary-foreground font-black text-lg shadow-lg glow-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-black mb-2">{step.title}</h2>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{step.description}</p>
                      
                      {step.code && (
                        <div className="glass rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all">
                          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                            <span className="text-sm font-mono font-semibold text-muted-foreground">
                              {step.id === "step2" ? "terminal" : "javascript"}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCode(step.code!, step.id)}
                              className="hover:bg-primary/10"
                            >
                              {copiedCode === step.id ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                  <span className="text-green-500">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <pre className="p-6 overflow-x-auto">
                            <code className="text-sm text-foreground leading-relaxed">{step.code}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="absolute left-7 top-14 bottom-0 w-0.5 bg-gradient-to-b from-primary to-secondary opacity-30" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 glass rounded-3xl p-8 text-center border border-green-500/30 glow-secondary relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-3xl font-black mb-2">Congratulations! 🎉</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  You've successfully integrated Auth8.inc into your application. Your users can now sign up and log in securely with enterprise-grade authentication.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="py-20 gradient-bg-1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-black mb-8">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Next Steps
                </span>
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Link
                  href="/docs/javascript-sdk"
                  className="block"
                >
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="glass rounded-2xl p-6 border border-border hover:border-primary/50 transition-all h-full"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-4 glow-primary">
                      <span className="text-2xl">📘</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      JavaScript SDK Documentation
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Explore all available methods and advanced features
                    </p>
                  </motion.div>
                </Link>
                <Link
                  href="/docs/python-sdk"
                  className="block"
                >
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="glass rounded-2xl p-6 border border-border hover:border-primary/50 transition-all h-full"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center mb-4 glow-secondary">
                      <span className="text-2xl">🐍</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      Python SDK Documentation
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Learn how to validate tokens on your backend
                    </p>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}