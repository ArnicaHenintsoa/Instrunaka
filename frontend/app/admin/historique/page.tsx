"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

type AuditLog = {
  id: number;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  payload: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user?: { id: number; name: string; email: string } | null;
};

type UserSession = {
  id: number;
  ip_address: string | null;
  logged_in_at: string;
  logged_out_at: string | null;
  actions_count: number;
  user?: { id: number; name: string; email: string } | null;
};

const ACTION_LABELS: Record<string, string> = {
  login: "🔓 Connexion",
  logout: "🔒 Déconnexion",
  "order.validated": "✅ Commande validée",
  "order.rejected": "❌ Commande refusée",
  "user.suspended": "🚫 Utilisateur suspendu",
  "user.reactivated": "✔️ Utilisateur réactivé",
  "instrumental.validated": "✅ Instrumentale validée",
  "instrumental.rejected": "❌ Instrumentale refusée",
  "instrumental.unpublished": "📤 Instrumentale dépubliée",
  "instrumental.deleted": "🗑️ Instrumentale supprimée",
  "promotion.created": "🎁 Promotion créée",
  "promotion.deleted": "🗑️ Promotion supprimée",
  "promo_code.created": "🎟️ Code promo créé",
  "promo_code.deleted": "🗑️ Code promo supprimé",
  "review.hidden": "🙈 Avis masqué",
  "review.shown": "👁️ Avis affiché",
  "review.deleted": "🗑️ Avis supprimé",
  "pack.created": "📦 Pack créé",
  "pack.deleted": "🗑️ Pack supprimé",
  "audit.cleared": "🧹 Historique purgé",
};

export default function AdminHistoriquePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"logs" | "sessions">("logs");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "logs") {
        const url = filterAction
          ? `/admin/audit-logs?action=${encodeURIComponent(filterAction)}`
          : "/admin/audit-logs";
        const res = await api.get(url);
        setLogs(res?.data ?? []);
      } else {
        const res = await api.get("/admin/sessions");
        setSessions(res?.data ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filterAction]);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/admin/historique");
      return;
    }
    void loadData();
  }, [router, loadData]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Historique</h1>
        <p className="text-content-secondary">
          Traçabilité complète des actions administratives et des connexions.
        </p>
      </div>

      {/* Onglets + Bouton purge */}
      <div className="flex justify-between items-center mb-6 border-b border-border">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "logs"
                ? "border-accent text-accent"
                : "border-transparent text-content-secondary hover:text-content"
            }`}
          >
            📋 Actions
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "sessions"
                ? "border-accent text-accent"
                : "border-transparent text-content-secondary hover:text-content"
            }`}
          >
            🕵️ Sessions
          </button>
        </div>
      </div>

      {activeTab === "logs" && (
        <div className="mb-4">
          <input
            type="text"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadData()}
            placeholder="Filtrer par type d'action (ex: order, user, instrumental...)"
            className="w-full max-w-md p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none text-sm"
          />
        </div>
      )}

      {loading ? (
        <p className="text-content-secondary">Chargement...</p>
      ) : (
        <>
          {activeTab === "logs" && (
            <div className="space-y-2">
              {logs.length === 0 ? (
                <Card padding="lg" className="text-center py-16">
                  <p className="text-content-secondary">Aucune action enregistrée.</p>
                </Card>
              ) : (
                logs.map((log) => (
                  <Card key={log.id} padding="md">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">
                          {ACTION_LABELS[log.action] ?? log.action}
                        </p>
                        <p className="text-xs text-content-secondary">
                          par <strong>{log.user?.name ?? "—"}</strong> ({log.user?.email})
                          {log.ip_address && ` · ${log.ip_address}`}
                        </p>
                        {log.payload && Object.keys(log.payload).length > 0 && (
                          <p className="text-xs text-content-secondary mt-1 font-mono bg-background-secondary p-2 rounded">
                            {JSON.stringify(log.payload)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-content-secondary whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="space-y-2">
              {sessions.length === 0 ? (
                <Card padding="lg" className="text-center py-16">
                  <p className="text-content-secondary">Aucune session enregistrée.</p>
                </Card>
              ) : (
                sessions.map((session) => (
                  <Card key={session.id} padding="md">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">
                          {session.user?.name ?? "—"} ({session.user?.email})
                        </p>
                        <p className="text-xs text-content-secondary">
                          📍 {session.ip_address ?? "IP inconnue"}
                        </p>
                        <p className="text-xs text-content-secondary mt-1">
                          🔓 Connexion : {new Date(session.logged_in_at).toLocaleString("fr-FR")}
                        </p>
                        <p className="text-xs text-content-secondary">
                          🔒 Déconnexion :{" "}
                          {session.logged_out_at
                            ? new Date(session.logged_out_at).toLocaleString("fr-FR")
                            : "Session active"}
                        </p>
                        <p className="text-xs text-content-secondary mt-1">
                          📊 {session.actions_count} action
                          {session.actions_count > 1 ? "s" : ""} effectuée
                          {session.actions_count > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={session.logged_out_at ? "default" : "success"}>
                          {session.logged_out_at ? "Terminée" : "En cours"}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}