import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Check, ShieldCheck, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/format";

export default function LicencesPage() {
  return (
    <PageContainer>
      <PageHeader 
        label="LICENCES" 
        title="Choisis ta licence" 
        subtitle="Deux options simples pour utiliser les instrumentales en toute légalité."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
      
        <div className="glass-card border-border rounded-3xl p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-content">Non exclusive</h2>
            <span className="px-3 py-1 bg-accent-light text-accent text-xs font-semibold rounded-full">Le plus populaire</span>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-content">{formatPrice(7000)}</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {[
              "Utilisation dans tes mixtapes et albums",
              "YouTube, Spotify et réseaux sociaux",
              "Le beat reste disponible pour d'autres artistes"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-content-secondary">
                <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link href="/catalogue" className="w-full py-3.5 rounded-xl glass-card border-2 border-border text-content font-semibold text-center hover:border-accent hover:text-accent transition-colors">
            Explorer les beats
          </Link>
        </div>

       
        <div className="bg-dark rounded-3xl p-8 shadow-xl flex flex-col text-white border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Exclusive</h2>
            <ShieldCheck className="w-6 h-6 text-accent-light" />
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold">{formatPrice(20000)}</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {[
              "Tu deviens l'unique acquéreur du beat",
              "Le beat est retiré du catalogue",
              "Les licences non exclusives déjà vendues restent valides"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-white/80">
                <Check className="w-5 h-5 text-accent-light shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link href="/catalogue" className="w-full py-3.5 rounded-xl bg-accent text-white font-semibold text-center hover:bg-accent-hover transition-colors">
            Acheter une licence exclusive
          </Link>
        </div>
      </div>

      <div className="text-center pb-12">
        <Link href="/conditions" className="text-accent font-medium hover:underline inline-flex items-center gap-2">
          Voir les conditions complètes <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </PageContainer>
  );
}