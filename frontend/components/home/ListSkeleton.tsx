export default function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="h-8 w-48 bg-surface rounded-lg animate-pulse mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="glass-card rounded-[24px] p-2.5 border-border animate-pulse">
            <div className="aspect-square bg-white/10 rounded-[18px] mb-3" />
            <div className="h-3 w-3/4 bg-white/10 rounded mb-2" />
            <div className="h-2 w-1/2 bg-white/10 rounded mb-4" />
          </div>
        ))}
      </div>
    </section>
  );
}
