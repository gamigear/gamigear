export default function ProductDetailLoading() {
  return (
    <div className="pb-20 pc:pb-0 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="mx-auto max-w-[1280px] px-5 pc:px-4 pb-[40px] pt-[24px] mo:hidden">
        <div className="flex items-center gap-2">
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1280px] px-5 pc:px-4">
        <div className="flex pc:flex-row flex-col pc:justify-between pc:gap-16">
          {/* Image skeleton */}
          <div className="pc:w-1/2">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="flex gap-2 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="pc:w-1/2 p-4 pc:p-0 space-y-4">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-6 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
            <div className="h-8 w-32 bg-gray-200 rounded mt-6" />
            <div className="space-y-3 pt-4">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
            </div>
            <div className="flex gap-2 pt-6">
              <div className="flex-1 h-12 bg-gray-200 rounded-lg" />
              <div className="flex-1 h-12 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
