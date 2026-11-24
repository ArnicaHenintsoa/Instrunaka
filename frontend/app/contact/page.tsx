"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { PLATFORM } from "@/lib/config";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/contact", { name, email, subject, message });
      setToast({ message: res.message || "Message envoyé !", variant: "success" });
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Erreur d'envoi", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}
      
      <PageHeader 
        label="CONTACT" 
        title="On t'écoute" 
        subtitle="Une question, une suggestion ou un problème ? Écris-nous, on te répond vite."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-3xl p-6 border border-border text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-accent-light text-accent flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1">Email</p>
          <a href={`mailto:${PLATFORM.contact.email}`} className="text-content font-medium hover:text-accent transition-colors break-all text-sm">
            {PLATFORM.contact.email}
          </a>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-border text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-accent-light text-accent flex items-center justify-center mx-auto mb-4">
            <Phone className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1">Téléphone</p>
          <p className="text-content font-medium text-sm">{PLATFORM.contact.phone}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-border text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-accent-light text-accent flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1">Adresse</p>
          <p className="text-content font-medium text-sm">{PLATFORM.contact.address}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border p-6 md:p-10 shadow-sm max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-content mb-6">Envoie-nous un message</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-content mb-2">Nom *</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-content mb-2">Email *</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-content mb-2">Sujet</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-content mb-2">Message *</label>
            <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all resize-none" />
          </div>
          <Button type="submit" loading={loading} className="w-full py-3.5 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors">
            Envoyer le message
          </Button>
        </form>
      </div>
    </PageContainer>
  );
}