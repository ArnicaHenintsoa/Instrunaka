"use client";

import { useEffect, useState } from "react";
import { api, auth } from "@/lib/api";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotifications() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setSupported(true);

      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setSubscribed(!!sub);
        });
      });
    }
  }, []);

  const handleSubscribe = async () => {
    if (!auth.isAuthenticated()) {
      alert("Connecte-toi d'abord pour activer les notifications.");
      return;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Tu dois autoriser les notifications dans ton navigateur.");
        setLoading(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        alert("Clé VAPID manquante dans .env.local");
        setLoading(false);
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      await api.post("/push/subscribe", subscription.toJSON());

      setSubscribed(true);
      alert("✅ Notifications activées !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'activation.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        await api.post("/push/unsubscribe", { endpoint: sub.endpoint });
        await sub.unsubscribe();
      }

      setSubscribed(false);
      alert("Notifications désactivées.");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la désactivation.");
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-2xl p-6">
        <p className="text-yellow-800 dark:text-yellow-300 text-sm">
          ⚠️ Ton navigateur ne supporte pas les notifications push.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-soft">
      <h3 className="font-bold text-lg mb-2 text-content">🔔 Notifications</h3>
      <p className="text-sm text-content-secondary mb-4">
        {subscribed
          ? "Tu recevras une notification quand un producteur que tu suis publie une nouvelle instrumentale."
          : "Active les notifications pour être alerté quand un producteur que tu suis publie."}
      </p>

      <button
        onClick={subscribed ? handleUnsubscribe : handleSubscribe}
        disabled={loading}
        className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
          subscribed
            ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
            : "bg-accent text-white hover:bg-accent-hover"
        } disabled:opacity-50`}
      >
        {loading
          ? "Chargement..."
          : subscribed
          ? "Désactiver les notifications"
          : "Activer les notifications"}
      </button>
    </div>
  );
}