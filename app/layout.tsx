import type { Metadata, Viewport } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Load Quicksand font - playful yet readable
const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DreamTales AI - Personalized Bedtime Stories",
  description:
    "Create magical, personalized bedtime stories for your child with AI-generated narratives and soothing voice narration. Make bedtime special with DreamTales AI.",
  keywords: [
    "bedtime stories",
    "children stories",
    "AI stories",
    "personalized stories",
    "kids audiobook",
    "text to speech",
    "story generator",
  ],
  authors: [{ name: "DreamTales AI" }],
  creator: "DreamTales AI",
  publisher: "DreamTales AI",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dreamtales.ai",
    siteName: "DreamTales AI",
    title: "DreamTales AI - Personalized Bedtime Stories",
    description:
      "Create magical, personalized bedtime stories with AI. Featuring voice narration for the perfect bedtime experience.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DreamTales AI - Magical Bedtime Stories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DreamTales AI - Personalized Bedtime Stories",
    description:
      "Create magical bedtime stories for your child with AI-generated narratives and soothing voice narration.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ff" },
    { media: "(prefers-color-scheme: dark)", color: "#4c1d95" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={quicksand.variable}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
