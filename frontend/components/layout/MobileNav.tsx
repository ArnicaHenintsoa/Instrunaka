"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Heart, User } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Accueil" },
    { href: "/catalogue", icon: Compass, label: "Explorer" },
    { href: "/favoris", icon: Heart, label: "Favoris" },
    { href: "/profil", icon: User, label: "Profil" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-accent" : "text-content-secondary hover:text-content"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-accent/20" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}