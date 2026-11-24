"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PushNotifications from "@/components/PushNotifications";
import { Music, ShoppingBag, Heart, ListMusic, Users, FileText, Settings } from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  status: string;
  is_producer: boolean;
  is_admin: boolean;
  role: string;
  created_at: string;
};

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [activeTab, setActiveTab] = useState("apercu");

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/profil");
      return;
    }

    async function loadUser() {
      try {
        const res = await api.get("/auth/me");
        setUser(res?.user);
      } catch {
        auth.removeToken();
        router.push("/connexion");
      } finally {
        setLoading(false);
      }
    }
    void loadUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Erreur logout:", e);
    } finally {
      auth.removeToken();
      window.location.href = "/?logout=1";
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="h-64 bg-background-secondary rounded-3xl animate-pulse mt-8" />
      </PageContainer>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: "apercu", label: "Aperçu", icon: Settings, href: "/profil" },
    { id: "achats", label: "Mes achats", icon: ShoppingBag, href: "/mes-achats" },
    { id: "favoris", label: "Mes favoris", icon: Heart, href: "/favoris" },
    { id: "playlists", label: "Mes playlists", icon: ListMusic, href: "/profil/playlists" },
    { id: "suivis", label: "Producteurs suivis", icon: Users, href: "/profil/producteurs-suivis" },
  ];
  if (user.is_producer) {
    tabs.push({ id: "soumissions", label: "Mes soumissions", icon: FileText, href: "/profil/mes-soumissions" });
  }

  return (
    <PageContainer>
      <PageHeader
        label="MON COMPTE"
        title="Mon profil"
        subtitle="Gère tes informations et retrouve ton activité."
        action={
          user.is_producer && (
            <Link href="/profil/soumettre">
              <Button className="bg-accent text-white gap-2">
                <Music className="w-4 h-4" /> Soumettre une instrumentale
              </Button>
            </Link>
          )
        }
      />

      <div className="flex flex-col lg:flex-row gap-8 items-stretch pb-16">
        {/* Colonne Gauche : Carte de profil */}
        <div className="w-full lg:w-80 shrink-0 flex">
          <div className="bg-surface rounded-3xl border border-border shadow-sm p-6 text-center w-full flex flex-col h-full">
            <div className="flex-1">
              <div className="w-24 h-24 mx-auto bg-accent text-white rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-lg shadow-accent/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-content">{user.name}</h2>
              <p className="text-sm text-content-secondary mb-4">{user.email}</p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant={user.status === "active" ? "success" : "danger"}>
                  {user.status === "active" ? "Actif" : user.status}
                </Badge>
                <Badge variant="accent" className="capitalize">{user.role}</Badge>
                {user.is_producer && <Badge variant="default">Producteur</Badge>}
              </div>

              <p className="text-xs text-content-secondary">
                Membre depuis {new Date(user.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <button onClick={() => setConfirmLogout(true)} className="text-sm font-semibold text-danger hover:underline">
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Onglets et contenu */}
        <div className="flex-1 w-full min-w-0">
          {/* Nav Onglets */}
          <div className="flex overflow-x-auto border-b border-border mb-6 hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-accent text-accent"
                      : "border-transparent text-content-secondary hover:text-content"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Contenu de l'onglet Aperçu */}
          <div className="bg-surface rounded-3xl border border-border shadow-sm p-6 md:p-8 min-h-[400px]">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/mes-achats" className="bg-background-secondary p-4 rounded-2xl hover:bg-accent-light transition-colors group">
                  <ShoppingBag className="w-6 h-6 text-accent mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-semibold text-content">Mes achats</p>
                  <p className="text-xs text-content-secondary">Historique de tes commandes</p>
                </Link>
                <Link href="/favoris" className="bg-background-secondary p-4 rounded-2xl hover:bg-accent-light transition-colors group">
                  <Heart className="w-6 h-6 text-accent mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-semibold text-content">Mes favoris</p>
                  <p className="text-xs text-content-secondary">Les beats que tu aimes</p>
                </Link>
                <Link href="/profil/playlists" className="bg-background-secondary p-4 rounded-2xl hover:bg-accent-light transition-colors group">
                  <ListMusic className="w-6 h-6 text-accent mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-semibold text-content">Mes playlists</p>
                  <p className="text-xs text-content-secondary">Tes collections personnalisées</p>
                </Link>
              </div>

              <PushNotifications />
            </div>
          </div>
        </div>
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
    </PageContainer>
  );
}