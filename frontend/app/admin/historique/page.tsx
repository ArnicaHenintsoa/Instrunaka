"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
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
  last_seen_at?: string | null;
  is_online?: boolean;
  actions_count: number;
  user?: { id: number; name: string; email: string } | null;
};

/* ------------------------------ Icônes ------------------------------ */
/* Icônes en traits fins (même style que le menu latéral), sans dépendance. */

const ICONS = {
  list: (
    <>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </>
  ),
  monitor: (
    <>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </>
  ),
  login: (
    <>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="m10 17 5-5-5-5" />
      <path d="M15 12H3" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  xCircle: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </>
  ),
  userX: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m17 8 5 5" />
      <path d="m22 8-5 5" />
    </>
  ),
  userCheck: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m16 11 2 2 4-4" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5" />
      <path d="M12 3v12" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </>
  ),
  ticket: (
    <>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 11v2" />
      <path d="M13 17v2" />
    </>
  ),
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  eye: (
    <>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <path d="m2 2 20 20" />
    </>
  ),
  package: (
    <>
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </>
  ),
  eraser: (
    <>
      <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
      <path d="M22 21H7" />
      <path d="m5 11 9 9" />
    </>
  ),
  mapPin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
} satisfies Record<string, ReactNode>;

type IconName = keyof typeof ICONS;

function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {ICONS[name]}
    </svg>
  );
}

/* ------------------------- Libellés et icônes ------------------------- */

const ACTION_LABELS: Record<string, string> = {
  login: "Connexion",
  logout: "Déconnexion",
  "order.validated": "Commande validée",
  "order.rejected": "Commande refusée",
  "user.suspended": "Utilisateur suspendu",
  "user.reactivated": "Utilisateur réactivé",
  "instrumental.validated": "Instrumentale validée",
  "instrumental.rejected": "Instrumentale refusée",
  "instrumental.unpublished": "Instrumentale dépubliée",
  "instrumental.deleted": "Instrumentale supprimée",
  "promotion.created": "Promotion créée",
  "promotion.deleted": "Promotion supprimée",
  "promo_code.created": "Code promo créé",
  "promo_code.deleted": "Code promo supprimé",
  "review.hidden": "Avis masqué",
  "review.shown": "Avis affiché",
  "review.deleted": "Avis supprimé",
  "pack.created": "Pack créé",
  "pack.deleted": "Pack supprimé",
  "audit.cleared": "Historique purgé",
};

const ACTION_ICONS: Record<string, IconName> = {
  login: "login",
  logout: "logout",
  "order.validated": "checkCircle",
  "order.rejected": "xCircle",
  "user.suspended": "userX",
  "user.reactivated": "userCheck",
  "instrumental.validated": "music",
  "instrumental.rejected": "music",
  "instrumental.unpublished": "upload",
  "instrumental.deleted": "trash",
  "promotion.created": "gift",
  "promotion.deleted": "gift",
  "promo_code.created": "ticket",
  "promo_code.deleted": "ticket",
  "review.hidden": "eyeOff",
  "review.shown": "eye",
  "review.deleted": "message",
  "pack.created": "package",
  "pack.deleted": "package",
  "audit.cleared": "eraser",
};

/* ---------- Helpers d'affichage (aucun impact sur les données) ---------- */

type Tone = "success" | "danger" | "neutral";

const TONE_BADGE: Record<Tone, string> = {
  success: "bg-emerald-500/10 text-emerald-500",
  danger: "bg-rose-500/10 text-rose-500",
  neutral: "bg-background-secondary text-content-secondary",
};

function getTone(action: string): Tone {
  if (/(validated|created|reactivated|shown)$/.test(action) || action === "login") {
    return "success";
  }
  if (/(rejected|deleted|suspended|hidden|cleared)$/.test(action)) {
    return "danger";
  }
  return "neutral";
}

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

// Une session est "en ligne" seulement si elle n'est pas fermée ET qu'une
// activité récente a été vue (fenêtre de 5 minutes), jamais sur la seule base
// de l'absence de déconnexion (un utilisateur qui ferme son navigateur ne
// se déconnecte pas).
const ONLINE_WINDOW_MS = 5 * 60 * 1000;

function isSessionOnline(session: UserSession) {
  if (session.logged_out_at) return false;
  if (typeof session.is_online === "boolean") return session.is_online;
  if (session.last_seen_at) {
    return Date.now() - new Date(session.last_seen_at).getTime() < ONLINE_WINDOW_MS;
  }
  return false;
}

function formatDayHeading(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupLogsByDay(logs: AuditLog[]) {
  const groups: { day: string; items: AuditLog[] }[] = [];
  for (const log of logs) {
    const day = formatDayHeading(log.created_at);
    const last = groups[groups.length - 1];
    if (last && last.day === day) {
      last.items.push(log);
    } else {
      groups.push({ day, items: [log] });
    }
  }
  return groups;
}

function Skeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-20 rounded-2xl bg-background-secondary motion-safe:animate-pulse"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
      <span className="sr-only">Chargement...</span>
    </div>
  );
}

/* ---------------------------- Page ---------------------------- */

export default function AdminHistoriquePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"logs" | "sessions">("logs");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
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

  // Rafraîchit les sessions toutes les 30 s pour que le point vert reste à jour
  useEffect(() => {
    if (activeTab !== "sessions") return;
    const timer = setInterval(() => {
      if (auth.isAuthenticated()) void loadData(true);
    }, 30000);
    return () => clearInterval(timer);
  }, [activeTab, loadData]);

  const groupedLogs = useMemo(() => groupLogsByDay(logs), [logs]);

  const count = activeTab === "logs" ? logs.length : sessions.length;
  const onlineCount = sessions.filter(isSessionOnline).length;
  const countLabel =
    activeTab === "logs"
      ? `${count} action${count > 1 ? "s" : ""}`
      : `${count} session${count > 1 ? "s" : ""} · ${onlineCount} en ligne`;

  const tabClass = (tab: "logs" | "sessions") =>
    `relative z-10 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
      activeTab === tab
        ? "text-content"
        : "text-content-secondary hover:text-content"
    }`;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* En-tête */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Historique
        </h1>
        <p className="text-content-secondary max-w-xl">
          Traçabilité complète des actions administratives et des connexions.
        </p>
      </header>

      {/* Barre d'outils : onglets + filtre */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div
          role="tablist"
          aria-label="Type d'historique"
          className="relative inline-grid grid-cols-2 p-1 rounded-xl bg-background-secondary w-full sm:w-auto sm:min-w-[300px]"
        >
          <span
            aria-hidden
            className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-background border border-border shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none ${
              activeTab === "sessions" ? "translate-x-full" : "translate-x-0"
            }`}
          />
          <button
            role="tab"
            aria-selected={activeTab === "logs"}
            onClick={() => setActiveTab("logs")}
            className={tabClass("logs")}
          >
            <Icon name="list" />
            Actions
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "sessions"}
            onClick={() => setActiveTab("sessions")}
            className={tabClass("sessions")}
          >
            <Icon name="monitor" />
            Sessions
          </button>
        </div>

        {activeTab === "logs" && (
          <div className="relative w-full sm:max-w-xs">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-secondary"
            />
            <input
              type="text"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadData()}
              placeholder="Filtrer : order, user, instrumental..."
              aria-label="Filtrer par type d'action"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-background text-sm outline-none transition-shadow focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
            {filterAction && (
              <button
                onClick={() => setFilterAction("")}
                aria-label="Effacer le filtre"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full text-content-secondary hover:bg-background-secondary hover:text-content transition-colors"
              >
                <Icon name="x" className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {!loading && count > 0 && (
        <p className="text-xs text-content-secondary mb-4">{countLabel}</p>
      )}

      {loading ? (
        <Skeleton />
      ) : (
        <>
          {/* ------------------------- Actions : timeline ------------------------- */}
          {activeTab === "logs" && (
            <div>
              {logs.length === 0 ? (
                <Card padding="lg" className="text-center py-16">
                  <p className="text-content-secondary">Aucune action enregistrée.</p>
                </Card>
              ) : (
                <div className="space-y-10">
                  {groupedLogs.map((group) => (
                    <section key={group.day}>
                      <h2 className="text-sm font-semibold capitalize mb-4">
                        {group.day}
                      </h2>

                      <ol className="relative ml-3 border-l border-border space-y-1">
                        {group.items.map((log) => {
                          const tone = getTone(log.action);
                          return (
                            <li key={log.id} className="relative pl-8 group">
                              <span
                                aria-hidden
                                className={`absolute -left-3 top-3 h-6 w-6 rounded-full ring-4 ring-background flex items-center justify-center ${TONE_BADGE[tone]}`}
                              >
                                <Icon
                                  name={ACTION_ICONS[log.action] ?? "activity"}
                                  className="h-3.5 w-3.5"
                                />
                              </span>
                              <div className="rounded-2xl px-4 py-3 transition-colors hover:bg-background-secondary">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm">
                                      {ACTION_LABELS[log.action] ?? log.action}
                                    </p>
                                    <p className="text-xs text-content-secondary mt-1">
                                      par <strong>{log.user?.name ?? "—"}</strong>
                                      {log.user?.email && ` (${log.user.email})`}
                                      {log.ip_address && ` · ${log.ip_address}`}
                                    </p>
                                    {log.payload &&
                                      Object.keys(log.payload).length > 0 && (
                                        <p className="mt-2 text-xs text-content-secondary font-mono bg-background-secondary group-hover:bg-background rounded-lg px-3 py-2 break-all transition-colors">
                                          {JSON.stringify(log.payload)}
                                        </p>
                                      )}
                                  </div>
                                  <time
                                    dateTime={log.created_at}
                                    title={new Date(log.created_at).toLocaleString("fr-FR")}
                                    className="text-xs text-content-secondary tabular-nums whitespace-nowrap pt-0.5"
                                  >
                                    {formatTime(log.created_at)}
                                  </time>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </section>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------ Sessions ------------------------------ */}
          {activeTab === "sessions" && (
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <Card padding="lg" className="text-center py-16">
                  <p className="text-content-secondary">Aucune session enregistrée.</p>
                </Card>
              ) : (
                sessions.map((session) => (
                  <Card
                    key={session.id}
                    padding="md"
                    className="transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="h-11 w-11 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-semibold">
                          {getInitials(session.user?.name)}
                        </div>
                        {isSessionOnline(session) && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping" />
                            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                          </span>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <p className="font-medium text-sm">
                            {session.user?.name ?? "—"}{" "}
                            <span className="text-content-secondary font-normal">
                              ({session.user?.email})
                            </span>
                          </p>
                          <Badge variant={isSessionOnline(session) ? "success" : "default"}>
                            {isSessionOnline(session)
                              ? "En ligne"
                              : session.logged_out_at
                                ? "Terminée"
                                : "Inactive"}
                          </Badge>
                        </div>

                        <p className="flex items-center gap-1.5 text-xs text-content-secondary mt-1">
                          <Icon name="mapPin" className="h-3.5 w-3.5" />
                          {session.ip_address ?? "IP inconnue"}
                        </p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-xl bg-background-secondary px-3 py-2">
                            <p className="flex items-center gap-1.5 text-xs text-content-secondary">
                              <Icon name="login" className="h-3.5 w-3.5" />
                              Connexion
                            </p>
                            <p className="text-xs font-medium mt-1">
                              {new Date(session.logged_in_at).toLocaleString("fr-FR")}
                            </p>
                          </div>
                          <div className="rounded-xl bg-background-secondary px-3 py-2">
                            <p className="flex items-center gap-1.5 text-xs text-content-secondary">
                              <Icon name="logout" className="h-3.5 w-3.5" />
                              Déconnexion
                            </p>
                            <p className="text-xs font-medium mt-1">
                              {session.logged_out_at
                                ? new Date(session.logged_out_at).toLocaleString("fr-FR")
                                : isSessionOnline(session)
                                  ? "Session active"
                                  : session.last_seen_at
                                    ? `Inactive depuis ${new Date(session.last_seen_at).toLocaleString("fr-FR")}`
                                    : "Non déconnecté"}
                            </p>
                          </div>
                        </div>

                        <p className="flex items-center gap-1.5 text-xs text-content-secondary mt-3">
                          <Icon name="activity" className="h-3.5 w-3.5" />
                          {session.actions_count} action
                          {session.actions_count > 1 ? "s" : ""} effectuée
                          {session.actions_count > 1 ? "s" : ""}
                        </p>
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
