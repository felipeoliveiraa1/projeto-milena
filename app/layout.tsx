import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { MedicalDisclaimer } from "@/components/medical-disclaimer";
import { BrandMark, Wordmark } from "@/components/brand";
import { HeaderStatus } from "@/components/header-status";
import { Splash } from "@/components/splash";

const display = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const sans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Milena · mais leve, mais forte",
  description: "Protocolo Desinflama-se, treino e check-in diário",
  applicationName: "Milena",
  appleWebApp: {
    capable: true,
    title: "Milena",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#fbf7f2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full" suppressHydrationWarning>
        <Splash />

        <header className="sticky top-0 z-40 border-b border-line/70 bg-bone/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-3.5 md:px-6">
            <BrandMark className="h-10 w-10" />
            <Wordmark />
            <div className="ml-auto">
              <HeaderStatus />
            </div>
          </div>
          <div className="hidden border-t border-line/70 md:block">
            <NavBar />
          </div>
        </header>

        {/* Só o conteúdo da página participa da transição — o cabeçalho e o
            dock ficam parados, como em app nativo. */}
        <ViewTransition name="page">
          <main className="mx-auto max-w-3xl px-5 pb-36 pt-6 md:px-6 md:pb-12">
            {children}
            <MedicalDisclaimer />
          </main>
        </ViewTransition>

        <div className="md:hidden">
          <NavBar />
        </div>
      </body>
    </html>
  );
}
