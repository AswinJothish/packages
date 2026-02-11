import React, { useState } from 'react';

const ProductSpecifications = ({ product }) => {
  const [showMore, setShowMore] = useState(false);

  // Combine entries from General and Specifications sections
  const generalEntries = Object.entries(product.general).map(([key, value]) => ({ 
    section: 'General', 
    key, 
    value 
  }));

  const specificationsEntries = Object.entries(product.specifications).flatMap(([specKey, specValues]) =>
    Object.entries(specValues).map(([key, value]) => ({ 
      section: specKey, 
      key, 
      value 
    }))
  );

  const allEntries = [...generalEntries, ...specificationsEntries];
  const displayedEntries = showMore ? allEntries : allEntries.slice(0, 2);

  return (
    <div className="w-full max-w-2xl">
      <div className="relative">
        {/* Container for all entries */}
        <div className="space-y-2">
          {/* Visible entries */}
          {displayedEntries.map((entry, index) => (
            <div key={`${entry.section}-${entry.key}-${index}`} className="mb-2">
              {/* Section heading */}
              {(index === 0 || displayedEntries[index - 1].section !== entry.section) && (
                <h3 className="text-lg font-semibold mb-2">{entry.section}</h3>
              )}
              {/* Specification item */}
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">{entry.key}:</span>
                <span>{entry.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Fade effect and preview of next item when collapsed */}
        {!showMore && allEntries.length > 2 && (
          <div className="relative">
            {/* Preview of the third item with fade overlay */}
            <div className="relative">
              <div className="opacity-40">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">{allEntries[2].key}:</span>
                  <span>{allEntries[2].value}</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-white" />
            </div>
          </div>
        )}
      </div>

      {/* Show More/Less button */}
      {allEntries.length > 2 && (
        <button
          onClick={() => setShowMore(!showMore)}
          className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
        >
          {showMore ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};

export default ProductSpecifications;