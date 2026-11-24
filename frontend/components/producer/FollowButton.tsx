"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";

type Props = {
  producerId: number;
  size?: "sm" | "md";
};

export default function FollowButton({ producerId, size = "md" }: Props) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function check() {
      if (!auth.isAuthenticated()) {
        setChecked(true);
        return;
      }
      try {
        const res = await api.get(`/producers/${producerId}/is-following`);
        setIsFollowing(res?.is_following ?? false);
      } catch (e) {
        console.error(e);
      } finally {
        setChecked(true);
      }
    }
    void check();
  }, [producerId]);

  const handleToggle = async () => {
    if (!auth.isAuthenticated()) {
      router.push(`/connexion?redirect=/instrumentales/${producerId}`);
      return;
    }
    setLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/producers/${producerId}/follow`);
        setIsFollowing(false);
      } else {
        await api.post(`/producers/${producerId}/follow`);
        setIsFollowing(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!checked) return null;

  const padding = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`shrink-0 rounded-xl font-medium transition-colors disabled:opacity-50 ${padding} ${
        isFollowing
          ? "bg-background-secondary text-content hover:bg-accent-light"
          : "bg-accent text-white hover:bg-accent-hover"
      }`}
    >
      {loading ? "..." : isFollowing ? "✓ Suivi" : "+ Suivre"}
    </button>
  );
}