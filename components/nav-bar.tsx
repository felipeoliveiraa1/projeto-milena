"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Apple, CalendarHeart, Dumbbell, HeartPulse, Pill } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Hoje", icon: CalendarHeart },
  { href: "/dieta", label: "Dieta", icon: Apple },
  { href: "/treino", label: "Treino", icon: Dumbbell },
  { href: "/suplementos", label: "Suple.", icon: Pill },
  { href: "/progresso", label: "Progresso", icon: HeartPulse },
];

export function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-rose-100 bg-white/95 px-2 py-2 backdrop-blur-md md:static md:border-t-0 md:border-b md:bg-transparent md:py-3 md:backdrop-blur-none">
      <div className="mx-auto flex max-w-3xl items-center justify-around gap-1 md:justify-end md:gap-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium transition md:flex-none md:flex-row md:gap-2 md:px-4 md:py-2 md:text-sm",
                active
                  ? "bg-rose-100 text-rose-700"
                  : "text-zinc-500 hover:bg-rose-50 hover:text-rose-700",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
