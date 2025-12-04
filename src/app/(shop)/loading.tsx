export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero Banner skeleton */}
      <div className="w-full h-[300px] pc:h-[500px] bg-gray-200" />

      {/* Categories skeleton */}
      <div className="mx-auto max-w-[1280px] px-4 py-8">
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-shrink-0 w-20 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full" />
              <div className="h-3 w-14 mx-auto mt-2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Products section skeleton */}
      <div className="mx-auto max-w-[1280px] px-4 py-8">
        <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-2 pc:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-gray-200 rounded-lg" />
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
