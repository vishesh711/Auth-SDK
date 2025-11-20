"use client";

import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BookOpen, Code, Terminal, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  const quickLinks = [
    {
      title: "Quickstart Guide",
      description: "Get started with DevAuth in under 5 minutes",
      icon: Zap,
      href: "/docs/quickstart",
      color: "text-yellow-500",
    },
    {
      title: "JavaScript SDK",
      description: "Client-side authentication for web and mobile apps",
      icon: Code,
      href: "/docs/javascript-sdk",
      color: "text-blue-500",
    },
    {
      title: "Python SDK",
      description: "Server-side token validation and user management",
      icon: Terminal,
      href: "/docs/python-sdk",
      color: "text-green-500",
    },
    {
      title: "API Reference",
      description: "Complete REST API documentation",
      icon: BookOpen,
      href: "/docs/api-reference",
      color: "text-purple-500",
    },
  ];

  const guides = [
    {
      category: "Getting Started",
      items: [
        "Installation",
        "Authentication Basics",
        "Token Management",
        "Email Verification",
      ],
    },
    {
      category: "Integration Guides",
      items: [
        "React Integration",
        "Next.js Integration",
        "FastAPI Integration",
        "Flask Integration",
      ],
    },
    {
      category: "Advanced Topics",
      items: [
        "Multi-Tenant Setup",
        "Rate Limiting",
        "Session Management",
        "Security Best Practices",
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Documentation
              </h1>
              <p className="text-xl text-muted-foreground">
                Everything you need to integrate DevAuth into your application
              </p>
            </motion.div>

            {/* Quick Links Grid */}
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-20">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0 ${link.color}`}>
                        <link.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                          {link.title}
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-muted-foreground">{link.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Guides Section */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {guides.map((guide, index) => (
                <motion.div
                  key={guide.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h3 className="text-lg font-bold mb-4">{guide.category}</h3>
                  <ul className="space-y-2">
                    {guide.items.map((item) => (
                      <li key={item}>
                        <Link
                          href="#"
                          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                        >
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Code Example Section */}
        <section className="py-20 bg-accent/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-bold mb-8 text-center">Quick Example</h2>
              <div className="bg-card border border-border rounded-xl p-6 overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-sm text-muted-foreground">JavaScript</span>
                </div>
                <pre className="text-sm overflow-x-auto">
                  <code className="text-foreground">{`import { DevAuthClient } from '@devauth/js';

const auth = new DevAuthClient({
  appId: 'your-app-id',
  apiKey: 'your-api-key'
});

// Sign up a new user
const user = await auth.signup({
  email: 'user@example.com',
  password: 'secure-password'
});

// Log in
const session = await auth.login({
  email: 'user@example.com',
  password: 'secure-password'
});

console.log('Access token:', session.accessToken);`}</code>
                </pre>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our support team is here to help you integrate DevAuth successfully.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
