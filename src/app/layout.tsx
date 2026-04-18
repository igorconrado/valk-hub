import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ValkToaster } from "@/components/ds";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valk Hub",
  description: "Valk Hub - Your centralized platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@200,300,400,500,600,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-mono/style.min.css"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <TooltipProvider>
          {children}
          <ValkToaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
