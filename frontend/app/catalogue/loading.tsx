export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-4" />
        <div className="h-4 w-96 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-[28px] p-3 border border-border animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-[20px] mb-4" />
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-1/2 bg-gray-200 rounded mb-4" />
            <div className="flex justify-between">
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
              <div className="h-8 w-20 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}