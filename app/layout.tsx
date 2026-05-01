import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { MedicalDisclaimer } from "@/components/medical-disclaimer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Treino & Dieta · Milena",
  description: "Plano alimentar, treino e check-in diário",
};

export const viewport: Viewport = {
  themeColor: "#fff7f9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full" suppressHydrationWarning>
        <header className="border-b border-rose-100 bg-white/60 backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 py-4 md:px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">
              Plano da Milena
            </p>
            <h1 className="text-lg font-semibold text-zinc-900">
              Mais leve, mais forte
            </h1>
          </div>
          <div className="hidden md:block">
            <NavBar />
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 pb-32 pt-6 md:px-6 md:pb-10">
          {children}
          <MedicalDisclaimer />
        </main>
        <div className="md:hidden">
          <NavBar />
        </div>
      </body>
    </html>
  );
}
