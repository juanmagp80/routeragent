import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import { Toaster } from "react-hot-toast";
import ClientOnly from "../components/ClientOnly";
import RedirectHandler from "../components/RedirectHandler";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "RouterAI - Router Inteligente de Modelos de IA",
  description: "API que elige automáticamente el mejor modelo de IA (GPT-4, Claude, Mistral, Llama) según costo, velocidad y calidad. Ahorra hasta 70% en costos de IA.",
  keywords: "router IA, optimización costos IA, GPT-4, Claude, Mistral, Llama, API inteligente, ahorro IA, RouterAI",
  authors: [{ name: "RouterAI Team" }],
  creator: "RouterAI",
  publisher: "RouterAI",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://agent-router.com",
    title: "RouterAI - Router Inteligente de Modelos de IA",
    description: "Ahorra hasta 70% en costos de IA. Router que elige automáticamente el mejor modelo según tu tarea.",
    siteName: "RouterAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "RouterAI - Router Inteligente de Modelos de IA",
    description: "Ahorra hasta 70% en costos de IA. Router que elige automáticamente el mejor modelo según tu tarea.",
    creator: "@routerai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground transition-colors duration-200`}>
        <ClientOnly>
          <ThemeProvider>
            <AuthProvider>
              <RedirectHandler />
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(8px)',
                  },
                  success: {
                    style: {
                      background: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid rgb(34, 197, 94)',
                    },
                    iconTheme: {
                      primary: 'rgb(34, 197, 94)',
                      secondary: 'hsl(var(--background))',
                    },
                  },
                  error: {
                    style: {
                      background: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid rgb(239, 68, 68)',
                    },
                    iconTheme: {
                      primary: 'rgb(239, 68, 68)',
                      secondary: 'hsl(var(--background))',
                    },
                  },
                }}
              />
            </AuthProvider>
          </ThemeProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
