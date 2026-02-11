import React, { useState, useEffect } from 'react';

// Tailwind CSS classes for shimmer effect
const shimmerClass = "animate-pulse bg-gray-200";

const ProductCardSkeleton = () => (
  <div className="h-72 w-56 rounded-xl border shadow-lg">
    <div className="relative h-56 w-56 rounded overflow-hidden">
      <div className={`${shimmerClass} h-full w-full`} />
    </div>
    <div className="pt-2 px-4">
      <div className={`${shimmerClass} h-5 w-40 rounded-full mb-2`} />
      <div className={`${shimmerClass} h-4 w-24 rounded-full mb-2`} />
      {/* Uncomment if you want additional shimmer elements */}
      {/* <div className={`${shimmerClass} h-4 w-32`} /> */}
    </div>
  </div>
);

const ProductGridSkeleton = () => (
  <div className="flex flex-wrap gap-5">
    {Array(8).fill(null).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

const CategoryProductDisplaySkeleton = () => {
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false); // Hide skeletons after 5 seconds
    }, 50000); 

    return () => {timer};
  }, []);

  if (!showSkeleton) {
    return null; // Optionally replace with actual content when skeletons are removed
  }

  return (
    <div className="w-full flex flex-col px-3 py-8">
      <ProductGridSkeleton />
      <div className="flex justify-start items-start mt-8">
        {/* Uncomment if you want a shimmer button */}
        {/* <div className={`${shimmerClass} h-10 w-32`} /> */}
      </div>
    </div>
  );
};

export default CategoryProductDisplaySkeleton;
