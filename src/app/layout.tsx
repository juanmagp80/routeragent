import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientOnly from "../components/ClientOnly";
import RedirectHandler from "../components/RedirectHandler";
import { AuthProvider } from "../contexts/AuthContext";
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
  authors: [{ name: "AgentRouter Team" }],
  creator: "AgentRouter",
  publisher: "AgentRouter",
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
    creator: "@agentrouter",
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
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ClientOnly>
          <AuthProvider>
            <RedirectHandler />
            {children}
          </AuthProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
