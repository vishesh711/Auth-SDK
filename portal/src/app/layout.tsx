import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Auth8.inc - Enterprise Authentication Infrastructure",
  description: "Secure, scalable authentication platform with JWT tokens, user management, and email verification. Built for developers who demand the best.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const visualEditsScript = process.env.NEXT_PUBLIC_VISUAL_EDITS_SCRIPT_URL;

  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <Providers>
          <ErrorReporter />
          {visualEditsScript ? (
            <Script
              src={visualEditsScript}
              strategy="afterInteractive"
              data-target-origin="*"
              data-message-type="ROUTE_CHANGE"
              data-include-search-params="true"
              data-only-in-iframe="true"
              data-debug="true"
            />
          ) : null}
          {children}
          {visualEditsScript ? <VisualEditsMessenger /> : null}
        </Providers>
      </body>
    </html>
  );
}