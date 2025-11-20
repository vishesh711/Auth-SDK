"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Code, Users, Lock, Globe, Key, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Features() {
  const features = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Military-grade encryption with RS256 JWT, bcrypt password hashing, and secure token storage.",
      gradient: "from-primary to-primary",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Sub-50ms token validation with global edge network. 99.99% uptime SLA guaranteed.",
      gradient: "from-secondary to-secondary",
    },
    {
      icon: Code,
      title: "Developer First",
      description: "Clean APIs, comprehensive SDKs for JavaScript and Python, and excellent documentation.",
      gradient: "from-primary to-secondary",
    },
    {
      icon: Users,
      title: "Multi-Tenant Ready",
      description: "Complete data isolation between applications. Perfect for SaaS and white-label products.",
      gradient: "from-secondary to-primary",
    },
    {
      icon: Key,
      title: "Token Management",
      description: "Automatic token refresh, session management, and secure API key handling built-in.",
      gradient: "from-primary to-secondary",
    },
    {
      icon: Mail,
      title: "Email Verification",
      description: "Built-in email verification and password reset flows with customizable templates.",
      gradient: "from-secondary to-primary",
    },
  ];

  const integrations = [
    { name: "React", logo: "⚛️" },
    { name: "Next.js", logo: "▲" },
    { name: "FastAPI", logo: "⚡" },
    { name: "Flask", logo: "🧪" },
    { name: "Django", logo: "🎸" },
    { name: "Express", logo: "🚂" },
  ];

  return (
    <section id="features" className="py-20 md:py-32 relative overflow-hidden gradient-bg-2">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6 glow-primary"
          >
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Complete Authentication Suite
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Everything You Need for{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Authentication
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure, scalable, and easy to integrate. Auth8.inc handles the complex parts so you don't have to.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative"
            >
              <div className="relative glass rounded-2xl p-6 h-full border border-border hover:border-primary/50 transition-all">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 glow-primary shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Integrations section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl md:text-4xl font-black mb-4">
            Works with Your{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Favorite Frameworks
            </span>
          </h3>
          <p className="text-muted-foreground mb-8">
            Seamless integration with popular web frameworks and libraries
          </p>
        </motion.div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-16">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="glass rounded-2xl p-6 flex flex-col items-center justify-center border border-border hover:border-primary/50 transition-all"
            >
              <div className="text-4xl mb-2">{integration.logo}</div>
              <div className="text-sm font-semibold">{integration.name}</div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center glass rounded-3xl p-12 border border-primary/30 glow-primary relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10" />
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Globe className="w-16 h-16 text-primary mx-auto mb-6" />
            </motion.div>
            <h3 className="text-3xl md:text-4xl font-black mb-4">
              Ready to{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Get Started?
              </span>
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers building secure applications with Auth8.inc. Start free, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-primary text-lg h-14 px-8" asChild>
                <Link href="/signup">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-14 px-8 glass border-primary/30 hover:bg-accent/50" asChild>
                <Link href="/docs/quickstart">View Quickstart</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}