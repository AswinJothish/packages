import { Skeleton } from "@/components/ui/skeleton"

const ProductGridSkeleton = () => {
  return (
    <div className="w-full">
      {/* Header Skeleton */}
      <div className="fixed top-10 bg-white z-10">
        <Skeleton className="h-10 w-48 m-6" />
      </div>

      <div className="flex w-full justify-center mt-16">
        <div className="w-[98%] flex">
          {/* Filter Sidebar Skeleton */}
          <div className="w-1/4 border-r px-4 flex-col flex fixed top-32 bg-white z-10 h-[calc(100vh-8rem)]">
            <div className="py-5 px-1 border-b h-fit flex w-full justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            
            {/* Price Filter Skeleton */}
            <div className="px-1 flex flex-col border-b py-5">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-3 w-28 mt-2" />
              <Skeleton className="h-3 w-28 mt-2" />
            </div>
            
            {/* Brand Filter Skeleton */}
            <div className="px-1 flex flex-col border-b py-5">
              <Skeleton className="h-4 w-24 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="w-full flex flex-col px-3 py-8 ml-[25%]">
            <div className="flex flex-wrap gap-5">
              {Array(8).fill(null).map((_, index) => (
                <div key={index} className="h-80 w-56 rounded-xl">
                  <div className="relative h-56 w-56 rounded overflow-hidden">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="pt-2 px-4">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load More Button Skeleton */}
            <div className="flex justify-center mt-8">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductGridSkeleton