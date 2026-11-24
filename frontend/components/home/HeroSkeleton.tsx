export default function HeroSkeleton() {
  return (
    <section className="w-full px-2 md:px-4 pt-2 mb-16 max-w-[1600px] mx-auto">
      <div className="relative rounded-[32px] overflow-hidden h-[calc(100vh-16px)] min-h-[680px] bg-dark animate-pulse">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          <div className="w-40 h-10 bg-white/10 rounded-full" />
          <div className="w-3/4 max-w-3xl h-32 bg-white/10 rounded-3xl" />
          <div className="w-1/2 max-w-md h-8 bg-white/10 rounded-xl" />
          <div className="w-full max-w-2xl h-20 bg-white/10 rounded-3xl mt-8" />
        </div>
      </div>
    </section>
  );
}