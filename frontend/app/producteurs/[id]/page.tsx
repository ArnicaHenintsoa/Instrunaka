"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import PageContainer from "@/components/layout/PageContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import InstrumentalCard from "@/components/instrumental/InstrumentalCard";
import FollowButton from "@/components/producer/FollowButton";
import { ArrowLeft, ShieldCheck, Mic2 } from "lucide-react";

type Instrumental = {
  id: number;
  title: string;
  cover_path: string | null;
  bpm: number | null;
  non_exclusive_price: number;
  exclusive_price: number;
  mood?: { label: string } | null;
  genre?: { label: string } | null;
  rhythm?: { label: string } | null;
  musical_key?: string | null;
};

type Producer = {
  id: number;
  display_name: string;
  bio: string | null;
  verified: boolean;
  followers_count: number;
  instrumentals?: Instrumental[];
};

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

const getGradient = (producerId: number) => {
  const hue = (producerId * 137) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${(hue + 40) % 360}, 70%, 40%))`;
};

export default function ProducerPage({ params }: PageProps) {
  const { id } = use(params);
  const [producer, setProducer] = useState<Producer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/producers/${id}`);
        setProducer(res?.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-8">
          <div className="h-4 w-40 rounded bg-background-secondary" />
          <div className="h-40 rounded-3xl bg-background-secondary" />
          <div className="h-8 w-48 rounded bg-background-secondary" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-3xl bg-background-secondary" />
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!producer) {
    return (
      <PageContainer>
        <Card padding="lg" className="max-w-md mx-auto text-center">
          <p className="text-danger mb-4">Producteur introuvable.</p>
          <Link href="/producteurs">
            <Button variant="secondary">← Retour aux producteurs</Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  const instrumentals = producer.instrumentals ?? [];
  const followers = producer.followers_count ?? 0;

  return (
    <PageContainer>
      <div className="animate-slide-up">
        {/* Bouton retour */}
        <Link
          href="/producteurs"
          className="inline-flex items-center gap-1 text-sm text-content-secondary hover:text-accent mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux producteurs
        </Link>

        {/* En-tête */}
        <div className="glass-card rounded-3xl p-6 md:p-8 mb-12 flex flex-col md:flex-row items-center gap-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl shrink-0 animate-float"
            style={{ background: getGradient(producer.id) }}
          >
            {producer.display_name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-bold text-content">{producer.display_name}</h1>
              {producer.verified && <ShieldCheck className="w-5 h-5 text-accent" />}
            </div>
            <p className="text-sm text-content-secondary mb-1">
              {followers} follower{followers > 1 ? "s" : ""} · {instrumentals.length} instrumentale
              {instrumentals.length > 1 ? "s" : ""}
            </p>
            {producer.bio && (
              <p className="text-sm text-content-secondary max-w-2xl">{producer.bio}</p>
            )}
          </div>

          <div className="shrink-0">
            <FollowButton producerId={producer.id} size="md" />
          </div>
        </div>

       
        <h2 className="text-2xl font-bold text-content mb-6">Ses créations</h2>

        {instrumentals.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="w-16 h-16 bg-accent-light dark:bg-accent/15 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic2 className="w-8 h-8" />
            </div>
            <p className="text-content-secondary">Ce producteur n&apos;a pas encore publié de beat.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-16">
            {instrumentals.map((inst, index) => (
              <div
                key={inst.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <InstrumentalCard
                  id={inst.id}
                  title={inst.title}
                  producerName={producer.display_name}
                  coverPath={inst.cover_path}
                  mood={inst.mood?.label}
                  genre={inst.genre?.label}
                  bpm={inst.bpm}
                  musicalKey={inst.musical_key}
                  price={inst.non_exclusive_price}
                  exclusivePrice={inst.exclusive_price}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}