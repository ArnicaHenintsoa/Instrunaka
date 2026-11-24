"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Toast from "@/components/ui/Toast";

export default function LogoutToast() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("logout") === "1") {
      setShow(true);
      // Nettoie l'URL pour retirer ?logout=1
      const url = new URL(window.location.href);
      url.searchParams.delete("logout");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <Toast
      message="Déconnexion réussie. À bientôt !"
      variant="info"
      onClose={() => setShow(false)}
    />
  );
}