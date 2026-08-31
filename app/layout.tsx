import type { Metadata } from "next";
import { Cinzel, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { MarketingPageTheme } from "@/components/MarketingPageTheme";
import { GoogleAuthProvider } from "@/components/GoogleAuthProvider";
import { LangAttr } from "@/components/LangAttr";
import { StoreHydration } from "@/components/StoreHydration";

const display = Cinzel({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const sans = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "JERIB — Pamir heritage wear",
  description: "Custom clothing with Pamir heritage. Design with Jerib — local partners produce and deliver.",
  icons: {
    icon: "/brand/jerib-logo-trim.png",
    apple: "/brand/jerib-logo-trim.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-ink font-sans text-paper antialiased">
        <GoogleAuthProvider>
          <StoreHydration />
          <LangAttr />
          <MarketingPageTheme />
          <Header />
          {children}
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
