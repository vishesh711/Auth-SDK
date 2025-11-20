"use client";

import { Shield, Twitter, Github, Linkedin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const footerLinks = {
    Product: [
      { name: "Features", href: "/#features" },
      { name: "Pricing", href: "/pricing" },
      { name: "Documentation", href: "/docs" },
      { name: "API Reference", href: "/docs" },
    ],
    Company: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
    ],
    Resources: [
      { name: "Quickstart", href: "/docs/quickstart" },
      { name: "JavaScript SDK", href: "/docs/javascript-sdk" },
      { name: "Python SDK", href: "/docs/python-sdk" },
      { name: "Status", href: "#" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Security", href: "#" },
      { name: "Compliance", href: "#" },
    ],
  };

  return (
    <footer className="relative border-t border-border/50 bg-card overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-secondary/5 pointer-events-none" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-secondary rounded-xl flex items-center justify-center shadow-lg glow-primary group-hover:scale-110 transition-all">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-black bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                  Auth8
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground -mt-1">
                  .inc
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Enterprise-grade authentication infrastructure for modern applications.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg glass border border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-all hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg glass border border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-all hover:scale-110"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg glass border border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Auth8.inc</span> — All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}