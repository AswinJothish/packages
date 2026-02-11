import { useState, useEffect } from 'react';
import { IoIosArrowDown } from "react-icons/io";
import { LiaFilterSolid } from "react-icons/lia";
import { ArrowLeft, X } from "lucide-react";
import { toast } from 'react-toastify';
import { baseUrl, ImgbaseUrl } from "../lib/config";
import NavBar from '@/components/NavBar';

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
const NewProductsDisplay = () => {
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
        const response = await fetch(`${baseUrl}/products/newProduct`);
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
    <div className="md:pt-12 pt-14">
      <div className="w-full fixed bg-white z-10 top-20 md:top-16 flex justify-between items-center">
      <div className='flex items-center px-2 md:px-5  '>
        <ArrowLeft  onClick={() => window.history.back()} />
        <h1 className="md:text-2xl text-xl flex  items-center capitalize pl-4  py-2  font-bold text-left font-serif">
       New Product
        </h1>
        </div>
        <div  id="filter-button" onClick={()=>{setIsDropdownOpen(true)}} className="mx-5 flex lg:hidden items-center md:block md:mt-5 bg-gray-100 hover:bg-gray-200 p-2 rounded-xl">
          <LiaFilterSolid className="text-2xl" />
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isDropdownOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-50"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="fixed right-0 top-14 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
            {/* Filter Header */}
            <div className="py-5 px-5 border-b h-fit flex w-full justify-between">
              <h1 className="font-base font-bold text-sm">Filters:</h1>
              <div className="flex justify-center items-center">
                <button 
                  onClick={clearMobileFilters}
                  className="text-sm font-custom_thin text-neutral-500 hover:text-neutral-800"
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
              <h2 className="font-base font-bold text-sm mb-4">Price</h2>
              <div className="space-y-2">
                <label className="block cursor-pointer hover:text-neutral-800 text-sm font-thin font-custom_thin">
                  <input
                    type="radio"
                    name="mobile-price-filter"
                    checked={currentMobileFilters.price === 'lowToHigh'}
                    onChange={() => handleMobileFilterChange('price', 'lowToHigh')}
                    className="mr-4"
                  />
                  Low to High
                </label>
                <label className="block cursor-pointer hover:text-neutral-800 text-sm font-thin font-custom_thin">
                  <input
                    type="radio"
                    name="mobile-price-filter"
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
                  <label key={brand} className="block cursor-pointer hover:text-neutral-800 text-sm font-thin font-custom_thin">
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

      <div className="flex w-full justify-center md:mt-16 mt-2">
        <div className="w-[98%] flex">
          {/* Desktop Filter */}
          <div className="lg:w-1/4 w-0 border-r px-4 flex-col lg:flex fixed top-32 z-10 h-[calc(100vh-8rem)] hidden">
            <div className="py-5 px-1 border-b h-fit flex w-full justify-between">
              <h1 className="font-base font-bold text-sm">Filters:</h1>
              <button
                onClick={clearFilters}
                className="text-xs font-custom_thin text-neutral-500 hover:text-neutral-800"
              >
                Clear All
              </button>
            </div>
            
            {/* Price Filter */}
            <div className="justify-between px-1 flex flex-col border-b py-5">
              <button className="font-base flex justify-between font-bold text-sm items-center">
                Price
                <span className="ml-2">
                  <IoIosArrowDown />
                </span>
              </button>
              <div className="pl-2 pr-4">
                <label className="block cursor-pointer hover:text-neutral-800 text-sm font-thin font-custom_thin">
                  <input
                    type="radio"
                    name="price-filter"
                    value="low"
                    checked={currentPriceFilter === "low"}
                    //@ts-ignore
                    onChange={(e) => setCurrentPriceFilter(e.target.value)}
                    className="mr-4 mt-5"
                  />
                  Low to High
                </label>
                <label className="block cursor-pointer hover:text-neutral-800 text-sm font-thin font-custom_thin">
                  <input
                    type="radio"
                    name="price-filter"
                    value="high"
                    checked={currentPriceFilter === "high"}
                     //@ts-ignore
                    onChange={(e) => setCurrentPriceFilter(e.target.value)}
                    className="mr-4 mt-5"
                  />
                  High to Low
                </label>
              </div>
            </div>

            {/* Brand Filter */}
            <div className="justify-between px-1 flex flex-col border-b py-5">
              <button className="font-base flex justify-between font-bold text-sm items-center">
                Brand
                <span className="ml-2">
                  <IoIosArrowDown />
                </span>
              </button>
              <div className="pl-2 pr-4">
                {uniqueBrands.map((brand) => (
                  <label key={brand} className="flex items-center cursor-pointer hover:text-neutral-800 text-sm font-thin font-custom_thin">
                    <input
                      type="checkbox"
                      value={brand}
                      checked={selectedBrands.has(brand)}
                      onChange={(e) => {
                        const newSelectedBrands = new Set(selectedBrands);
                        if (e.target.checked) {
                          newSelectedBrands.add(brand);
                        } else {
                          newSelectedBrands.delete(brand);
                        }
                        setSelectedBrands(newSelectedBrands);
                      }}
                      className="mr-4 brand-checkbox"
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Products Container */}
          <div className="w-full flex flex-col px-3 md:py-8 lg:ml-[25%]">
            <div className="w-full flex">
              <div className="flex flex-wrap justify-center lg:justify-start gap-5">
                {visibleProducts.map((product) => (
                  <div key={product._id} className="md:h-80 h-56 bg-white shadow border md:border-none md:shadow-none md:w-56 w-40 rounded-xl transform transition-all duration-300 group hover:shadow-lg hover:border hover:border-neutral-100">
                    <a href={`/products/${product._id}`} className="cursor-pointer">
                      <div className="relative md:h-56 md:w-56 w-40 h-36 rounded overflow-hidden transform transition-transform duration-300 group-hover:scale-95">
                        {product.productImages?.length > 0 ? (
                          <img
                            src={`${ImgbaseUrl}${product.productImages[0]}`}
                            alt={product.productName}
                            className="h-full p-3 w-full"
                          />
                        ) : (
                          <p className="h-full flex items-center justify-center text-gray-500">
                            No image available
                          </p>
                        )}
                      </div>
                      <div className="pt-2 px-4 transform transition-transform duration-300 group-hover:bg-white group-hover:-translate-y-8">
                        <p className="overflow-hidden text-ellipsis capitalize whitespace-nowrap font-serif text-lg">
                          {product.productName}
                        </p>
                        <p className="text-base flex items-center font-medium">
                        <span className="md:text-base text-xs mr-0.5  mt-0.5 font-sans font-medium">
                                                        &#8377;
                                                    </span>
                          <span>
                            {getDisplayPrice(product, userRole)}
                          </span>
                        </p>
                        <p className="md:text-sm text-xs whitespace-nowrap">
                          <span className="text-green-700 pr-1">Inclusive GST </span>
                          <span className="line-through font-thin text-gray-500">
                          <span className=" mt-0.5 font-sans font-medium">
                                                        &#8377;
                                                    </span> {formatPrice(product.strikePrice)}
                          </span>
                        </p>
                      </div>
                    </a>
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      className="w-full -mt-8 flex justify-center items-center"
                    >
                      <p className="text-sm font-custom_thin px-5 rounded-xl font-thin w-fit hover:border-neutral-800 hover:text-neutral-800 text-neutral-400 py-2 border opacity-0 transform transition-opacity duration-500 group-hover:opacity-100">
                        Add to Cart
                      </p>
                    </button>
                  </div>
                ))}
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

export default NewProductsDisplay;