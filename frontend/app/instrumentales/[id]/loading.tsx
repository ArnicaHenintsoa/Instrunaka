export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded mb-8" />
      
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12">
        <div className="w-full md:w-[380px] shrink-0">
          <div className="w-full aspect-square rounded-2xl bg-gray-200" />
        </div>
        
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
          <div className="h-12 w-3/4 bg-gray-200 rounded mb-6" />
          <div className="h-6 w-1/3 bg-gray-200 rounded mb-8" />
          
          <div className="flex gap-4 mb-8">
            <div className="h-8 w-20 bg-gray-200 rounded-full" />
            <div className="h-8 w-20 bg-gray-200 rounded-full" />
            <div className="h-8 w-20 bg-gray-200 rounded-full" />
          </div>

          <div className="h-24 w-full bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}