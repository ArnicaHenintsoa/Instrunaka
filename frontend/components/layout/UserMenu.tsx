"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { auth, api } from "@/lib/api";
import { User, ShoppingBag, Heart, Settings, LogOut } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await api.get("/auth/me");
        setIsAdmin(res?.user?.is_admin ?? false);
        setUserName(res?.user?.name ?? "");
        setUserEmail(res?.user?.email ?? "");
      } catch {
        setIsAdmin(false);
      }
    }
    if (auth.isAuthenticated()) {
      void checkAdmin();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Erreur logout:", e);
    } finally {
      auth.removeToken();
      window.location.href = "/";
    }
  };

  const initial = userName.charAt(0).toUpperCase() || "?";

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors font-semibold text-sm"
          aria-label="Menu utilisateur"
        >
          {initial}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-60 glass-card border border-border rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header du menu */}
            <div className="px-4 pb-3 mb-2 border-b border-border">
              <p className="font-semibold text-content text-sm truncate">{userName}</p>
              <p className="text-xs text-content-secondary truncate">{userEmail}</p>
            </div>

            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-content hover:bg-accent-light/50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-accent" /> Administration
                </Link>
                <Link
                  href="/admin/commandes"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-content hover:bg-accent-light/50 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-accent" /> Commandes
                </Link>
                <div className="border-t border-border my-1" />
              </>
            )}

            <Link href="/profil" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-content hover:bg-accent-light/50 transition-colors">
              <User className="w-4 h-4 text-accent" /> Mon profil
            </Link>
            <Link href="/mes-achats" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-content hover:bg-accent-light/50 transition-colors">
              <ShoppingBag className="w-4 h-4 text-accent" /> Mes achats
            </Link>
            <Link href="/favoris" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-content hover:bg-accent-light/50 transition-colors">
              <Heart className="w-4 h-4 text-accent" /> Mes favoris
            </Link>

            <div className="border-t border-border my-1" />

            <button
              onClick={() => {
                setOpen(false);
                setConfirmLogout(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Se déconnecter ?"
        message="Tu devras te reconnecter pour accéder à tes achats et à ton profil."
        confirmLabel="Se déconnecter"
        cancelLabel="Annuler"
        variant="danger"
      />
    </>
  );
}