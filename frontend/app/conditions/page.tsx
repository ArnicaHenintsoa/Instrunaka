import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { PLATFORM } from "@/lib/config";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata = {
  title: `Conditions & Remboursement — ${PLATFORM.fullName}`,
  description: "Conditions d&apos;achat, de téléchargement et politique de remboursement.",
};

export default function ConditionsPage() {
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader 
        label="LÉGAL" 
        title="Conditions & Politique de remboursement" 
        subtitle={`Dernière mise à jour : ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}`}
      />

      <div className="space-y-6 pb-12">
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm">
          <h2 className="text-xl font-bold text-content mb-3">1. Objet</h2>
          <p className="text-content-secondary leading-relaxed">
            La plateforme <strong>{PLATFORM.fullName}</strong> permet aux utilisateurs de découvrir,
            écouter et acheter des instrumentales musicales. En effectuant un achat, tu acceptes sans réserve les présentes conditions.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm">
          <h2 className="text-xl font-bold text-content mb-3">2. Types de licences</h2>
          <p className="text-content-secondary leading-relaxed mb-3">Deux types de licences sont proposés :</p>
          <ul className="list-disc pl-6 text-content-secondary space-y-2">
            <li><strong>Licence non exclusive :</strong> tu reçois les fichiers MP3 et WAV. L&apos;instrumentale reste disponible à la vente pour d&apos;autres utilisateurs.</li>
            <li><strong>Licence exclusive :</strong> tu deviens l&apos;unique propriétaire de l&apos;instrumentale. Celle-ci est retirée du catalogue après validation du paiement. Les acheteurs non exclusifs antérieurs conservent leurs droits d&apos;utilisation.</li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm">
          <h2 className="text-xl font-bold text-content mb-3">3. Modalités de paiement</h2>
          <p className="text-content-secondary leading-relaxed">
            Le paiement s&apos;effectue par Mobile Banking. Un code de référence unique est généré
            pour chaque commande. La commande est validée manuellement par notre équipe après
            vérification du transfert. Les fichiers sont ensuite accessibles dans l&apos;espace <strong>Mes achats</strong>.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm">
          <h2 className="text-xl font-bold text-content mb-3">4. Politique de remboursement</h2>
          <p className="text-content-secondary leading-relaxed mb-3">En raison de la nature numérique des produits vendus :</p>
          <ul className="list-disc pl-6 text-content-secondary space-y-2">
            <li><strong>Aucun remboursement</strong> n&apos;est possible après le téléchargement des fichiers (MP3 et WAV).</li>
            <li>Si une commande est <strong>annulée après une vente exclusive</strong>, un remboursement est déclenché. Tu seras contacté à l&apos;adresse email fournie.</li>
            <li>En cas de problème technique majeur, une assistance est fournie par notre équipe à l&apos;adresse : <a href={`mailto:${PLATFORM.contact.email}`} className="text-accent hover:underline">{PLATFORM.contact.email}</a>.</li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm">
          <h2 className="text-xl font-bold text-content mb-3">5. Propriété intellectuelle</h2>
          <p className="text-content-secondary leading-relaxed">
            Les instrumentales mises en vente restent la propriété intellectuelle de leurs producteurs. L&apos;acheteur obtient une licence d&apos;utilisation selon les termes de la licence choisie. Toute revente, redistribution ou utilisation non autorisée est strictement interdite.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm">
          <h2 className="text-xl font-bold text-content mb-3">6. Données personnelles</h2>
          <p className="text-content-secondary leading-relaxed">
            Les données collectées (nom, email, historique d&apos;achats) sont utilisées uniquement dans le cadre du fonctionnement de la plateforme. Elles ne sont jamais partagées avec des tiers sans consentement.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm">
          <h2 className="text-xl font-bold text-content mb-3">7. Contact</h2>
          <p className="text-content-secondary leading-relaxed mb-4">Pour toute question relative aux conditions ou au remboursement :</p>
          <ul className="space-y-3 text-content-secondary text-sm">
            <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-accent" /> <a href={`mailto:${PLATFORM.contact.email}`} className="hover:text-accent transition-colors">{PLATFORM.contact.email}</a></li>
            <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-accent" /> {PLATFORM.contact.phone}</li>
            <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-accent" /> {PLATFORM.contact.address}</li>
          </ul>
        </div>
      </div>

      <div className="text-center pb-12">
        <Link href="/" className="text-accent hover:underline text-sm font-medium">
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </PageContainer>
  );
}