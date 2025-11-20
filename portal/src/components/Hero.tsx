"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRight, Shield, Lock, Zap, Globe, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden mesh-gradient">
      {/* Animated background orbs */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6 glow-primary"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Enterprise-Grade Authentication
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Secure Authentication
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
                Made Simple
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Auth8.inc provides complete authentication infrastructure with JWT tokens, user management, and email verification. Focus on building your product while we handle security.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { icon: Lock, text: "Military-Grade Security", color: "from-primary to-primary" },
                { icon: Zap, text: "5-Minute Setup", color: "from-secondary to-secondary" },
                { icon: Globe, text: "Global CDN", color: "from-primary to-secondary" },
              ].map((item, index) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="group"
                >
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full glass border border-border hover:border-primary/50 transition-all cursor-default`}>
                    <div className={`p-1 rounded-full bg-gradient-to-r ${item.color}`}>
                      <item.icon className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" className="group bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-primary text-lg h-14 px-8" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-14 px-8 glass border-primary/30 hover:bg-accent/50" asChild>
                <Link href="/docs">
                  View Documentation
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-border/50"
            >
              {[
                { value: "50K+", label: "Developers" },
                { value: "500M+", label: "API Calls/Day" },
                { value: "99.99%", label: "Uptime SLA" },
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right content - Code preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="relative glass rounded-2xl p-6 shadow-2xl glow-primary border border-primary/20">
              {/* Terminal header */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-muted-foreground font-mono">auth.js</span>
              </div>

              {/* Code */}
              <pre className="text-sm overflow-x-auto">
                <code className="text-foreground leading-relaxed">{`import { Auth8Client } from '@auth8/sdk';

const auth = new Auth8Client({
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

// Token automatically managed ✨`}</code>
              </pre>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg glow-secondary"
              >
                ✓ JWT Ready
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                className="absolute -bottom-4 -left-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold shadow-lg glow-primary"
              >
                ⚡ Auto Refresh
              </motion.div>
            </div>

            {/* Decorative elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-8 -right-8 w-16 h-16 border-2 border-primary/30 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-8 -left-8 w-20 h-20 border-2 border-secondary/30 rounded-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}