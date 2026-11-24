"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { api, auth } from "@/lib/api";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle"; // ← NOUVEAU
import {
  LayoutDashboard, ShoppingCart, Mic2, Inbox, Library, Users, Ticket, Package, Gift, MessageSquare, History, ChevronLeft, Menu, X
} from "lucide-react";

type User = { id: number; name: string; email: string; is_admin: boolean; };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=" + pathname);
      return;
    }
    async function loadUser() {
      try {
        const res = await api.get("/auth/me");
        if (!res?.user?.is_admin) {
          router.push("/");
          return;
        }
        setUser(res.user);
      } catch {
        auth.removeToken();
        router.push("/connexion");
      } finally {
        setLoading(false);
      }
    }
    void loadUser();
  }, [router, pathname]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  const navGroups = [
    { title: "Vue générale", items: [{ href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true }] },
    { title: "Boutique", items: [{ href: "/admin/commandes", label: "Commandes", icon: ShoppingCart }, { href: "/admin/catalogue", label: "Catalogue", icon: Library }, { href: "/admin/packs", label: "Packs", icon: Package }, { href: "/admin/promotions", label: "Promotions", icon: Gift }, { href: "/admin/codes-promo", label: "Codes promo", icon: Ticket }] },
    { title: "Communauté", items: [{ href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users }, { href: "/admin/demandes-producteur", label: "Producteurs", icon: Mic2 }, { href: "/admin/soumissions", label: "Soumissions", icon: Inbox }, { href: "/admin/avis", label: "Avis", icon: MessageSquare }] },
    { title: "Système", items: [{ href: "/admin/historique", label: "Historique", icon: History }] },
  ];

  const isActive = (href: string, exact = false) => exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 glass border-r border-border h-full shrink-0">
        <div className="h-20 flex items-center justify-between px-6 border-b border-border shrink-0">
          <Logo variant="light" />
          <ThemeToggle /> {/* ← Bouton mode sombre ajouté ici */}
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-3 text-[10px] font-bold text-content-secondary uppercase tracking-wider mb-1">{group.title}</h3>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${active ? "bg-accent-light text-accent" : "text-content-secondary hover:bg-background-secondary hover:text-content"}`}>
                      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-r-full" />}
                      <Icon className={`w-4 h-4 ${active ? "text-accent" : "text-gray-400"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border shrink-0">
          <Link href="/" className="flex items-center gap-2 px-2 py-2 text-sm text-content-secondary hover:text-accent transition-colors">
            <ChevronLeft className="w-4 h-4" /> Retour au site
          </Link>
        </div>
      </aside>

      {/* Mobile Header & Drawer */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass border-b border-border z-30 flex items-center justify-between px-4">
        <Logo variant="light" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 -mr-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-dark/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 glass shadow-xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="h-16 flex items-center px-4 border-b border-border"><Logo variant="light" /></div>
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
              {navGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="px-3 text-[10px] font-bold text-content-secondary uppercase tracking-wider mb-2">{group.title}</h3>
                  <nav className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href, item.exact);
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${active ? "bg-accent-light text-accent" : "text-content-secondary hover:bg-background-secondary"}`}>
                          <Icon className={`w-4 h-4 ${active ? "text-accent" : "text-gray-400"}`} />{item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border">
              <Link href="/" className="flex items-center gap-2 text-sm text-content-secondary hover:text-accent"><ChevronLeft className="w-4 h-4" /> Retour au site</Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}