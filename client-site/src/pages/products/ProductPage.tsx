import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
//import { IoIosArrowForward } from "react-icons/io";
import { ToastContainer } from "react-toastify";
import ProductDisplay from "../../components/productDisplay";
import { ImgbaseUrl, baseUrl } from "../../lib/config";
import Layout from "../layouts/Layout";
import Footer from "../Footer";

// Types
interface Offer {
  from: number;
  to: number;
  customerPrice: number;
}

interface Specification {
  [key: string]: {
    [key: string]: string;
  };
}

interface Product {
  productName: string;
  productCode: string;
  productImages: string[];
  customerPrice: number;
  description: string;
  strikePrice: number;
  brand: string;
  category: string;
  stock: number;
  offers: Offer[];
  specifications: Specification;
  general: {
    [key: string]: string;
  };
}

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setIsExpanded] = useState(false);
  // const [showMore, setShowMore] = useState(false);
  const [, setSelectedImage] = useState<string>("");
  const [, setShowOfferDropdown] = useState(false);

  const descriptionRef = useRef<HTMLDivElement>(null);
  const offerDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${baseUrl}/products/get?id=${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data.data);
        if (data.data.productImages?.length > 0) {
          setSelectedImage(`${ImgbaseUrl}${data.data.productImages[0]}`);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch product"
        );
        // Handle error navigation
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Description toggle logic
  useEffect(() => {
    const description = descriptionRef.current;
    if (description) {
      const lineHeight = parseInt(
        window.getComputedStyle(description).lineHeight
      );
      const twoLinesHeight = lineHeight * 2;
      const needsToggle = description.scrollHeight > twoLinesHeight;
      if (!needsToggle) {
        setIsExpanded(true);
      }
    }
  }, [product]);

  // Handle click outside offer dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        offerDropdownRef.current &&
        !offerDropdownRef.current.contains(event.target as Node)
      ) {
        setShowOfferDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const renderSpecifications = () => {
  //   if (!product) return null;

  //   const generalEntries = Object.entries(product.general || {}).map(([key, value]) => ({
  //     section: 'General',
  //     key,
  //     value
  //   }));

  //   const specificationsEntries = Object.entries(product.specifications || {}).flatMap(([specKey, specValues]) =>
  //     Object.entries(specValues).map(([key, value]) => ({
  //       section: specKey,
  //       key,
  //       value
  //     }))
  //   );

  //   const allEntries = [...generalEntries, ...specificationsEntries];
  //   const displayedEntries = showMore ? allEntries : allEntries.slice(0, 2);

  //   return (
  //     <div>
  //       <div id="entriesContainer">
  //         {displayedEntries.map((entry, index) => (
  //           <div key={`${entry.section}-${entry.key}`} className="mb-2">
  //             {(index === 0 || displayedEntries[index - 1].section !== entry.section) && (
  //               <h3 className="text-lg font-semibold bg-neutral-100 p-1 mb-2">
  //                 {entry.section}
  //               </h3>
  //             )}
  //             <div className="flex justify-between py-2">
  //               <div className="w-1/2">
  //                 <span className="font-medium text-neutral-500">{entry.key}</span>
  //               </div>
  //               <div className="w-1/2">
  //                 <span className="text-neutral-500">{entry.value}</span>
  //               </div>
  //             </div>
  //           </div>
  //         ))}
  //       </div>

  //       {allEntries.length > 2 && (
  //         <>
  //           {!showMore && (
  //             <div id="fadePreview" className="relative">
  //               <div id="previewItem">
  //                 {allEntries[2] && (
  //                   <div className="flex justify-between py-2">
  //                     <div className="w-1/2">
  //                       <span className="font-medium">{allEntries[2].key}</span>
  //                     </div>
  //                     <div className="w-1/2">
  //                       <span>{allEntries[2].value}</span>
  //                     </div>
  //                   </div>
  //                 )}
  //               </div>
  //               <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
  //             </div>
  //           )}
  //           <button
  //             onClick={() => setShowMore(!showMore)}
  //             className="mt-4 text-blue-600 hover:text-blue-800"
  //           >
  //             {showMore ? 'Show Less' : 'Show More'}
  //           </button>
  //         </>
  //       )}
  //     </div>
  //   );
  // };

  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Loading...</div>;

  return (
    <div className="">
      <Layout  title={product.productName}>
        <ToastContainer />
        <div className="container w-full">
          <ProductDisplay
            productId={id || ""}
            onError={() => console.error("Failed to load product")}
            
          />

          {/* Product Description */}
          {/* <div className="mt-8">
          <div
            ref={descriptionRef}
            className={`text-neutral-600 ${!isExpanded ? 'line-clamp-2' : ''}`}
          >
            {product.description}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-blue-600 mt-2"
          >
            <span>{isExpanded ? 'View Less' : 'View More'}</span>
            <IoIosArrowForward
              className={`ml-1 transform transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </button>
        </div> */}

          {/* Specifications */}
          {/* <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Specifications</h2>
          {renderSpecifications()}
        </div> */}
        </div>
      </Layout>

      {/* <style>{`
        // .container {
        //   max-width: 1200px;
        // }
        
        .md\\:overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E0 #EDF2F7;
        }

        .md\\:overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .md\\:overflow-y-auto::-webkit-scrollbar-track {
          background: #EDF2F7;
        }

        .md\\:overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: #CBD5E0;
          border-radius: 4px;
        }
      `}</style> */}
{/* <div className="">
<Footer />
  
  </div>    */}
   </div>
  );
};

export default ProductPage;
