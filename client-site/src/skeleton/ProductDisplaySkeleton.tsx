import React from 'react';

const ProductDisplaySkeleton: React.FC = () => {
  return (
    <main className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery Skeleton */}
        <div className="flex mt-2 flex-row space-x-4 p-2 sticky top-10 self-start h-[85vh] overflow-y-hidden">
          <div className="flex flex-col space-y-4 p-2 w-24 overflow-auto">
            {/* Skeleton for image thumbnails */}
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-md bg-gray-300 animate-pulse"
                style={{ width: '100%' }}
              ></div>
            ))}
          </div>

          <div className="flex-1">
            {/* Skeleton for main product image */}
            <div className="aspect-square w-full rounded-lg bg-gray-300 animate-pulse"></div>
            <div className="mt-10 flex justify-center gap-5">
              <div className="px-6 py-2 bg-gray-300 animate-pulse rounded-md w-32"></div>
              <div className="w-20 bg-gray-300 animate-pulse rounded-md"></div>
            </div>
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div className="space-y-6 md:overflow-y-auto max-h-[80vh] pr-4">
          <div>
            {/* Skeleton for product name */}
            <div className="w-1/2 h-6 bg-gray-300 animate-pulse"></div>
            {/* Skeleton for brand */}
            <div className="mt-5 w-1/4 h-5 bg-gray-300 animate-pulse"></div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Skeleton for price */}
            <div className="w-1/4 h-6 bg-gray-300 animate-pulse"></div>
            {/* Skeleton for strike price */}
            <div className="w-1/4 h-6 bg-gray-300 animate-pulse"></div>
            {/* Skeleton for discount */}
            <div className="w-1/4 h-6 bg-gray-300 animate-pulse"></div>
          </div>

          {/* Bulk Order Pricing Skeleton */}
          <div className="bg-gray-300 animate-pulse py-1 px-3 rounded-md relative">
            <div className="flex w-full items-center gap-3">
              <div className="w-full flex gap-3">
                <div className="rounded-full flex justify-center items-center text-white bg-gray-500 w-7 h-7"></div>
                <p className="w-1/3 h-5 bg-gray-300 animate-pulse"></p>
              </div>
              <div className="w-1/3 flex justify-end items-end">
                {/* Skeleton for dropdown button */}
                <div className="w-24 h-10 bg-gray-300 animate-pulse rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Specifications Skeleton */}
          <div className="border rounded-lg shadow-sm mt-4">
            <div className="p-6 border-b">
              {/* Skeleton for specifications heading */}
              <div className="w-1/4 h-6 bg-gray-300 animate-pulse"></div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Skeleton for specification items */}
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex justify-between py-2">
                    <div className="w-1/2 h-5 bg-gray-300 animate-pulse"></div>
                    <div className="w-1/2 h-5 bg-gray-300 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDisplaySkeleton;
