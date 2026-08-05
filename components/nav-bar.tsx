"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Apple, Dumbbell, Home, LineChart, ListChecks, ShoppingBasket } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Hoje", icon: Home },
  { href: "/dieta", label: "Dieta", icon: Apple },
  { href: "/treino", label: "Treino", icon: Dumbbell },
  { href: "/rotina", label: "Rotina", icon: ListChecks },
  { href: "/lista", label: "Lista", icon: ShoppingBasket },
  { href: "/progresso", label: "Peso", icon: LineChart },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:static md:px-0 md:pb-0">
      <div className="pointer-events-auto mx-auto flex max-w-3xl items-center justify-between gap-0.5 rounded-full border border-ink/10 bg-ink/95 p-1.5 shadow-[0_18px_40px_-18px_rgba(25,21,18,0.7)] backdrop-blur-xl md:justify-start md:gap-1 md:border-0 md:bg-transparent md:p-0 md:py-1.5 md:shadow-none">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex flex-1 flex-col items-center justify-center gap-1 rounded-full px-2 py-2.5 text-[0.6875rem] font-semibold transition md:flex-none md:flex-row md:gap-2 md:px-4 md:py-2 md:text-sm",
                active
                  ? "bg-bone text-ink md:bg-brand md:text-bone"
                  : "text-bone/60 hover:text-bone md:text-ink-muted md:hover:bg-line-soft md:hover:text-ink",
              )}
            >
              <Icon
                className={cn("h-5 w-5 transition", active && "scale-105")}
                strokeWidth={active ? 2.4 : 1.9}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
