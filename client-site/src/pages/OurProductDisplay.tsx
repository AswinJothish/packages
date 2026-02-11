import { useState, useEffect } from 'react';
import { IoIosArrowDown } from "react-icons/io";
import { LiaFilterSolid } from "react-icons/lia";
import { ArrowLeft, ArrowLeftIcon, X } from "lucide-react";
import { toast } from 'react-toastify';
import { baseUrl, ImgbaseUrl } from "../lib/config";
import NavBar from '@/components/NavBar';
import { BsCartPlusFill } from 'react-icons/bs';
import { FaArrowRight } from 'react-icons/fa6';
import adjustment from '../../public/svg/adjustment 2.svg'
import { useNavigate } from 'react-router-dom';
const ITEMS_PER_PAGE = 8;
interface Product {
  _id: string;
  productName: string;
  productImages: string[];
  customerPrice: number;
  dealerPrice: number;
  strikePrice: number;
  brand: string;
  stock: number;
  createdAt: string;
}
interface CartItem {
  productId: {
    _id: string;
    stock: number;
  };
  quantity: number;
}
const OurProductsDisplay = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPriceFilter, setCurrentPriceFilter] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userRole, setUserRole] = useState('customer');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentMobileFilters, setCurrentMobileFilters] = useState({
    price: '',
    brands: new Set()
  });
  const navigate = useNavigate();

  // Format price utility function
  const formatPrice = (price: number) => {
    return typeof price === "number" ? price.toLocaleString("en-IN") : "0";
  };

  // Get display price based on user role
  const getDisplayPrice = (product: Product, userRole: string) => {
    if (userRole === "dealer" && product.dealerPrice) {
      return formatPrice(product.dealerPrice);
    }
    return formatPrice(product.customerPrice);
  };

  // Get user role from localStorage
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      setUserRole(userData.role || "customer");
    } catch {
      setUserRole("customer");
    }
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${baseUrl}/products/all`);
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Fetch cart items
  useEffect(() => {
    const getCartItems = async () => {
      const userId = localStorage.getItem("_id");
      if (!userId) return;

      try {
        const response = await fetch(`${baseUrl}/order/getCartItems?Id=${userId}`);
        const data = await response.json();
        setCartItems(data.cart);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };
    getCartItems();
  }, []);

  // Handle add to cart
  const handleAddToCart = async (productId: string) => {
    const userId = localStorage.getItem("_id");
    const quantity = 1;

    if (!userId) {
      window.location.href = `/Login`;
      return;
    }

    const payload = { userId, productId, quantity };

    try {
      const existingProduct = cartItems.find(
        (item) => item.productId._id === productId
      );

      if (existingProduct) {
        const availableStock = existingProduct.productId.stock;
        const currentQuantity = existingProduct.quantity;

        if (currentQuantity + quantity > availableStock) {
          toast.error(`Only ${availableStock} items can be added to the cart.`);
          return;
        }
      }

      const response = await fetch(`${baseUrl}/order/addToCart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      toast.success("Item added to cart successfully");
      const cartResponse = await fetch(`${baseUrl}/order/getCartItems?Id=${userId}`);
      const cartData = await cartResponse.json();
      setCartItems(cartData.cart);
    } catch (error) {
      console.error(error);
      toast.error("Error adding to cart");
    }
  };

  // Filter products with both mobile and desktop filters
  const filterProducts = () => {
    let filteredProducts = [...products];
    
    // Apply desktop brand filters
    if (selectedBrands.size > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        selectedBrands.has(product.brand)
      );
    }
    
    // Apply mobile brand filters
    if (currentMobileFilters.brands.size > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        currentMobileFilters.brands.has(product.brand)
      );
    }
    
    // Apply desktop price filter
    if (currentPriceFilter) {
      filteredProducts.sort((a, b) => {
        const priceA = userRole === "dealer" ? a.dealerPrice : a.customerPrice;
        const priceB = userRole === "dealer" ? b.dealerPrice : b.customerPrice;
        return currentPriceFilter === "low" ? priceA - priceB : priceB - priceA;
      });
    }

    // Apply mobile price filter
    if (currentMobileFilters.price) {
      filteredProducts.sort((a, b) => {
        const priceA = userRole === "dealer" ? a.dealerPrice : a.customerPrice;
        const priceB = userRole === "dealer" ? b.dealerPrice : b.customerPrice;
        return currentMobileFilters.price === 'lowToHigh' ? priceA - priceB : priceB - priceA;
      });
    }
    
    return filteredProducts;
  };

  const handleProductClick = (productId: any) => {
    window.location.href = `/products/${productId}`;
};

  // Handle mobile filter changes
  const handleMobileFilterChange = (filterType: string, value: string | Set<unknown>) => {
    setCurrentMobileFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setCurrentPriceFilter(null);
    setSelectedBrands(new Set());
  };

  const clearMobileFilters = () => {
    setCurrentMobileFilters({
      price: '',
      brands: new Set()
    });
    setIsDropdownOpen(false);
  };

  // Get unique brands
  const uniqueBrands = [...new Set(products.map((product) => product.brand))]
    .filter(Boolean)
    .sort();

  // Get visible products
  const visibleProducts = filterProducts().slice(0, currentPage * ITEMS_PER_PAGE);

  return (<>
    <NavBar />
    <div className="md:pt-16 ">
      <div className="w-full  lg:bg-blue-900/90 top-16  md:h-20  flex items-center  md:p-4 p-2">
        <button className="lg:text-white  text-black h-fit  md:pr-2 py-2 pr-1 rounded-xl md:gap-2 gap-1 items-center justify-center text-lg flex" onClick={() => navigate('/')}>
          <span onClick={()=>{window.history.back();}}>
         <ArrowLeftIcon className='md:h-4 h-8' />
          </span>
      <span className='hidden md:block'>Back</span>
           </button>
           
           <div className='flex justify-start md:justify-center  items-center w-full'>
           <h1 className="lg:text-white text-black  lg:text-5xl text-2xl lg:font-bold lg:drop-shadow-[0_2px_1px_rgba(0,0,0,1)] p-2 rounded lg:-tracking-tighter ">Our Products</h1>
           </div>
           <div  id="filter-button" onClick={()=>{setIsDropdownOpen(true)}} className=" lg:flex hidden bg-white rounded p-1 items-center md:block  ">
         <img src={adjustment} className='h-8 ' alt="" />
        </div>
           <div  id="filter-button" onClick={()=>{setIsDropdownOpen(true)}} className=" flex lg:hidden items-center md:block md:mt-5 ">
         <img src={adjustment} className='h-10 ' alt="" />
        </div>
      </div>
      <div className="w-full  pt-4 z-10  flex justify-end items-center">
      </div>

      {/* Mobile Filter Drawer */}
      {isDropdownOpen && (
        <>
          <div 
            className="fixed font-sans inset-0 bg-black bg-opacity-50 transition-opacity z-50"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="fixed right-0 md:top-0 top-[50%] h-full md:w-1/4 w-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
            {/* Filter Header */}
            <div className="py-5 px-5 border-b h-fit flex w-full justify-between">
              <h1 className="font-base font-bold md:text-lg text-sm">Filters:</h1>
              <div className="flex justify-center items-center">
                <button 
                  onClick={clearMobileFilters}
                  className="md:text-lg text-sm font-custom_thin text-neutral-500 hover:text-neutral-800"
                >
                  Clear All
                </button>
                <div className="pl-3" onClick={() => setIsDropdownOpen(false)}>
                  <X className="text-white bg-red-500 p-1 rounded" />
                </div>
              </div>
            </div>

            {/* Mobile Price Filter */}
            <div className="justify-between px-10 flex flex-col border-b py-5">
              <h2 className="font-base font-bold md:text-lg text-sm mb-4">Price</h2>
              <div className="space-y-2">
                <label className="block cursor-pointer hover:text-neutral-800 md:text-lg text-sm font-thin font-custom_thin">
                  <input
                    type="radio"
                    name="mobile-price-filter"
                    onClick={() => setIsDropdownOpen(false)}
                    checked={currentMobileFilters.price === 'lowToHigh'}
                    onChange={() => handleMobileFilterChange('price', 'lowToHigh')}
                    className="mr-4"
                  />
                  Low to High
                </label>
                <label className="block cursor-pointer hover:text-neutral-800 md:text-lg text-sm font-thin font-custom_thin">
                  <input
                    type="radio"
                    name="mobile-price-filter"
                    onClick={() => setIsDropdownOpen(false)}
                    checked={currentMobileFilters.price === 'highToLow'}
                    onChange={() => handleMobileFilterChange('price', 'highToLow')}
                    className="mr-4"
                  />
                  High to Low
                </label>
              </div>
            </div>

            {/* Mobile Brand Filter */}
            <div className="justify-between px-10 flex flex-col border-b py-5">
              <h2 className="font-base font-bold text-sm mb-4">Brands</h2>
              <div className="space-y-2">
                {uniqueBrands.map((brand) => (
                  <label key={brand} className="block cursor-pointer hover:text-neutral-800 md:text-lg text-sm font-thin font-custom_thin">
                    <input
                      type="checkbox"
                      checked={currentMobileFilters.brands.has(brand)}
                      onChange={() => {
                        const newBrands = new Set(currentMobileFilters.brands);
                        if (newBrands.has(brand)) {
                          newBrands.delete(brand);
                        } else {
                          newBrands.add(brand);
                        }
                        handleMobileFilterChange('brands', newBrands);
                      }}
                    onClick={() => setIsDropdownOpen(false)}

                      className="mr-4"
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex w-full justify-center">
        <div className="w-[98%] flex">

     
{/* product container */}
          <div className="w-full flex flex-col md:px-3 px-1 md:py-8 py-4">
            <div className="w-full flex">
              <div className="flex flex-wrap justify-center md:gap-10 gap-2">
                {visibleProducts.length > 0 ? (
    <>
      {visibleProducts.map((product) => (
        <div
          key={product._id}
          className="md:w-[300px] md:h-[400px] w-[200px] h-[280px] border flex justify-center items-center rounded-[30px] overflow-hidden relative group hover:shadow-lg hover:border-blue-200 transition-transform duration-300"
        >
          {/* Product Container */}
          <div
            onClick={() => handleProductClick(product._id)}
            className="relative w-full h-full"
          >
            {/* Product Image */}
            <div className="h-3/4 flex items-center justify-center bg-white rounded-t-[40px] transform group-hover:scale-90 transition-transform duration-500">
              {product.productImages.length > 0 ? (
                <img
                  src={`${ImgbaseUrl}${product.productImages[0]}`}
                  alt="prd"
                  className="w-full p-5 h-full object-fill rounded-t-[40px]"
                />
              ) : (
                <p>No image available</p>
              )}
            </div>

            {/* Text Container */}
            <div  style={{ backgroundColor: "rgb(177, 177, 178, 0.1)" }} className=" md:py-6 py-4 rounded-b-[40px] w-full transform group-hover:-translate-y-3 transition-transform duration-500">
              <div className="pl-4 -mt-3  pr-12">
                <p className="font-semibold font-sans overflow-hidden text-ellipsis capitalize whitespace-nowrap md:w-[200px] w-[150px] md:text-xl text-sm">
                  {product?.productName}
                </p>
                <p className="font-medium md:text-lg text-sm">
                &#8377;
                <span className='pl-0.5'>
                            {getDisplayPrice(product, userRole)}
                          </span>
                </p>
                <p className="text-green-700 md:text-sm text-xs">
                  Inclusive GST{" "}
                  <span className="line-through text-gray-400">
                    <span className="mt-0.5 font-medium">&#8377;</span> {formatPrice(product.strikePrice)}
                  </span>
                </p>
              </div>

              {/* Cart Button */}
              <div className="absolute md:bottom-6 md:right-3 bottom-3 right-1.5">
              <div
               onClick={(e) => {
                e.stopPropagation(); 
                handleAddToCart(product._id); 
              }}
  className="rounded-full flex text-black hover:bg-blue-500 bg-primary-foreground hover:text-white hover:scale-105 transition-all duration-500 cursor-pointer"
>
  <div className="md:p-4 p-3 md:text-2xl text-xl">
    <BsCartPlusFill />
  </div>
</div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {products.length > 12 && (
        <div className="md:flex items-center justify-center md:w-60 md:h-80 hidden">
          <a
            href="/OurProducts"
            className="flex flex-row w-32 justify-center hover:scale-110 transition-transform duration-300 hover:rounded-lg p-2 hover:shadow hover:border items-center gap-2 text-indigo-500"
          >
            View All{" "}
            <span className="text-sm">
              <FaArrowRight />
            </span>
          </a>
        </div>
      )}
    </>
  ) : (
    <p>No products available</p>
  )}
              </div>
            </div>
            {products.length > currentPage * ITEMS_PER_PAGE && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-6 py-2 text-neutral-500 border hover:text-white border-neutral-500 rounded-lg hover:bg-neutral-700 transition-colors flex items-center gap-2"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
       
        </div>
      </div>
    </div>
  </>
  );
};

export default OurProductsDisplay;