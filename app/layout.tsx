import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppLoader from "./components/AppLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindScope AI — Premium AI Psychology & Reality Mirror Coach",
  description: "Understand yourself better, build confidence, recover from rejection, and enhance your communication skills using MindScope AI. Experience reality mirror analysis and growth accountability.",
  keywords: [
    "AI Psychology Coach",
    "Reality Mirror Analysis",
    "Rejection Recovery",
    "Self Improvement Coach",
    "Emotional Intelligence AI",
    "Relationship dynamics",
    "Confidence building",
    "Communication skill development"
  ],
  authors: [{ name: "MindScope Team" }],
  metadataBase: new URL("https://mindscope-ai.vercel.app"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "MindScope AI — Ultimate AI Psychology Coach",
    description: "Reflect. Understand. Grow. Master emotional intelligence and interpersonal communication through reality mirror analysis.",
    url: "https://mindscope-ai.vercel.app",
    siteName: "MindScope AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MindScope AI — Ultimate AI Psychology Coach",
    description: "Reflect. Understand. Grow. Master emotional intelligence and interpersonal communication through reality mirror analysis.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`dark ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppLoader>
          {children}
        </AppLoader>
      </body>
    </html>
  );
}