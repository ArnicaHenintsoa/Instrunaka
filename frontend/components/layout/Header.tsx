"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import UserMenu from "./UserMenu";
import ThemeToggle from "./ThemeToggle";
import Logo from "@/components/ui/Logo";
import { auth, api } from "@/lib/api";
import { Search, Menu, X } from "lucide-react";

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  is_producer: boolean;
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const logged = auth.isAuthenticated();
    setIsLoggedIn(logged);
    setMobileMenuOpen(false);

    if (logged) {
      api.get("/auth/me")
        .then((res) => {
          const userData = res?.data?.user ?? res?.user ?? res?.data ?? res;
          setUser(userData);
        })
        .catch((err) => {
          if (err?.status !== 401 && err?.response?.status !== 401) {
            console.error("Header: Erreur /auth/me =", err);
          }
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const isHomePage = pathname === "/";
  const isTransparent = isHomePage && !isScrolled;

  const headerClass = isTransparent
    ? "bg-transparent border-transparent"
    : "glass border-b border-border shadow-sm";

  const navLinks = [
    { label: "Explorer", href: "/catalogue" },
    { label: "Genres", href: "/genres" },
    { label: "Producteurs", href: "/producteurs" },
    { label: "Packs", href: "/packs" },
    { label: "Licences", href: "/licences" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${headerClass}`}>
      <div className="w-full px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Logo variant={isTransparent ? "dark" : "light"} />
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-accent relative ${
                    isTransparent ? "text-white/90" : "text-content-secondary"
                  } ${isActive ? "text-accent" : ""}`}
                >
                  {link.label}
                  {isActive && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-accent rounded-full" />}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <ThemeToggle />

            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-full transition-colors ${
                  isTransparent
                    ? "text-white hover:bg-white/10"
                    : "text-content hover:bg-background-secondary"
                }`}
              >
                <Search className="w-5 h-5" />
              </button>

              {searchOpen && (
                <form onSubmit={handleSearch} className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-xl shadow-xl border border-border p-2 z-[70] animate-in">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full px-4 py-2 rounded-lg bg-background-secondary text-content text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                    autoFocus
                  />
                </form>
              )}
            </div>

            {isLoggedIn ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/connexion">
                  <button className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    isTransparent
                      ? "text-white hover:bg-white/10"
                      : "text-content hover:bg-background-secondary"
                  }`}>Se connecter</button>
                </Link>
                <Link href="/inscription">
                  <button className="px-5 py-2.5 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20">Créer un compte</button>
                </Link>
              </div>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className={`p-2 ${isTransparent ? "text-white" : "text-content"}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border bg-surface rounded-b-2xl absolute top-full w-full left-0 shadow-xl z-[60] animate-in">
            <div className="container mx-auto px-4">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg hover:bg-background-secondary text-content font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-border my-2" />
                {isLoggedIn ? (
                  <button
                    onClick={() => { auth.removeToken(); window.location.href = "/"; }}
                    className="px-3 py-2 rounded-lg hover:bg-background-secondary text-left text-danger font-medium"
                  >
                    Déconnexion
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Link href="/connexion" onClick={() => setMobileMenuOpen(false)} className="px-5 py-3 rounded-full border border-border text-content text-sm font-medium text-center">Se connecter</Link>
                    <Link href="/inscription" onClick={() => setMobileMenuOpen(false)} className="px-5 py-3 rounded-full bg-accent text-white text-sm font-medium text-center">Créer un compte</Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}