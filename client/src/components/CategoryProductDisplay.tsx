import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ImgbaseUrl, baseUrl } from '../lib/config';
import CategoryProductDisplaySkeleton from '@/skeleton/CategoryProductDisplaySkeleton';
import { LiaFilterSolid } from "react-icons/lia";
import NavBar from './NavBar';
import { X } from 'lucide-react';

const CategoryProductDisplay = ({ categoryName }) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [userRole, setUserRole] = useState('customer');
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState({
    price: '',
    date: '',
  });
  const [currentMobileFilters, setCurrentMobileFilters] = useState({
    price: '',
    date: '',
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const formatPrice = (price) => (typeof price === 'number' ? price.toLocaleString('en-IN') : '0');

  const getUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      return userData.role || 'customer';
    } catch {
      return 'customer';
    }
  };

  const getCartItems = async () => {
    const userId = localStorage.getItem('_id');
    if (!userId) return;

    try {
      const response = await fetch(`${baseUrl}/order/getCartItems?Id=${userId}`);
      const data = await response.json();
      setCartItems(data.cart);
    } catch (error) {
      toast.error('Error fetching cart items:', error);
    }
  };

  const handleAddToCart = async (productId) => {
    const userId = localStorage.getItem('_id');
    const quantity = 1;

    if (!userId) {
      toast.error('User not found in localStorage');
      return;
    }

    try {
      const existingProduct = cartItems.find((item) => item.productId._id === productId);

      if (existingProduct) {
        const availableStock = existingProduct.productId.stock;
        const currentQuantity = existingProduct.quantity;

        if (currentQuantity + quantity > availableStock) {
          toast.error(`Only ${availableStock} items can be added to the cart.`);
          return;
        }
      }

      const response = await fetch(`${baseUrl}/order/addToCart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, productId, quantity }),
      });

      if (!response.ok) throw new Error('Failed to add item to cart');

      toast.success('Item added to cart successfully');
      await getCartItems();
    } catch (error) {
      console.error(error);
      toast.error('Error adding to cart');
    }
  };

  const sortProducts = (productsToSort) => {
    let sortedProducts = [...productsToSort];

    if (currentFilters.price === 'lowToHigh') {
      sortedProducts.sort((a, b) => a.customerPrice - b.customerPrice);
    } else if (currentFilters.price === 'highToLow') {
      sortedProducts.sort((a, b) => b.customerPrice - a.customerPrice);
    }

    if (currentFilters.date === 'oldestFirst') {
      sortedProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (currentFilters.date === 'newestFirst') {
      sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (currentMobileFilters.price === 'lowToHigh') {
      sortedProducts.sort((a, b) => a.customerPrice - b.customerPrice);
    } else if (currentMobileFilters.price === 'highToLow') {
      sortedProducts.sort((a, b) => b.customerPrice - a.customerPrice);
    }

    if (currentMobileFilters.date === 'oldestFirst') {
      sortedProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (currentMobileFilters.date === 'newestFirst') {
      sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sortedProducts;
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${baseUrl}/products/getProducts-category?categoryName=${categoryName}`);
      const data = await response.json();
      if (data.ok) {
        setProducts(sortProducts(data.data));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType:any, value:any) => {
    setCurrentFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }));
    setIsDropdownOpen(false)
  };
  const handleMobileFilterChange = (filterType:any, value:any) => {
    setCurrentMobileFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }));
    setIsDropdownOpen(false)
  };
  const clearFilters = () => {
    setCurrentFilters({ price:'', date:'' });
    window.location.reload()
  };
  const clearMobileFilters = () => {
    setCurrentMobileFilters({ price:'', date:'' });
    window.location.reload()
  };

  useEffect(() => {
    setUserRole(getUserData());
    getCartItems();
   
    const fetchTimeout = setTimeout(fetchProducts, 500);  
    return () => clearTimeout(fetchTimeout);
  }, []);
  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, [categoryName]);

  useEffect(() => {
    setProducts((prev) => sortProducts([...prev]));
  }, [currentFilters,currentMobileFilters]);

  return <>
    <div className='h-full w-full'>
      <NavBar />
      <div className="w-full z-50 flex justify-center pt-16">
      <div className="w-full flex py-2 justify-between bg-white fixed z-10 m-6 top-8">
    <h1 className="md:text-2xl text-xl flex  items-center capitalize md:px-10   py-2 px-5 font-bold text-left font-serif">
      {categoryName}
    </h1>
    <div   
    onClick={() => setIsDropdownOpen((prev) => !prev)} 
     className="mx-5 flex lg:hidden items-center md:block md:mt-5 bg-gray-100 hover:bg-gray-200 p-2 rounded-xl">
        <LiaFilterSolid className="text-2xl" />
       
    </div>
    {isDropdownOpen && (
         <>
          <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-50 
        ${isDropdownOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsDropdownOpen(false)}
      />

      {/* Drawer */}
      <div 
        className={`fixed right-0 top-14 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out 
         ${isDropdownOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
         
        {/* Filter Header */}
        <div className="py-5 px-5 border-b h-fit flex w-full justify-between">
         
          <h1 className="font-base font-bold text-sm">Filters:</h1>
          <div className='flex justify-center items-center'>
          <button 
            onClick={() => {
              clearMobileFilters();
              setIsDropdownOpen(false);
            }} 
            className="text-sm font-custom_thin text-neutral-500 hover:text-neutral-800"
          >
            Clear All
          </button>
          <div className='pl-3' onClick={()=>setIsDropdownOpen(false)}>
            <X className='text-white bg-red-500 p-1 rounded' />
          </div>
          </div>
         
          
        </div>

        {/* Price Filter */}
        <div className="justify-between px-10 flex flex-col border-b py-5">
          <h2 className="font-base font-bold text-sm mb-4">Price</h2>
          <div className="space-y-2">
  <label className="block cursor-pointer hover:text-neutral-800 text-sm font-thin font-custom_thin">
    <input
      type="radio"
      name="price-filter"
      checked={currentMobileFilters.price === 'lowToHigh'}
      onChange={() => handleMobileFilterChange('price', 'lowToHigh')}
      className="mr-4"
    />
    Low to High
  </label>
  <label className="block cursor-pointer hover:text-neutral-800 text-sm font-thin font-custom_thin">
    <input
      type="radio"
      name="price-filter"
      checked={currentMobileFilters.price === 'highToLow'}
      onChange={() => handleMobileFilterChange('price', 'highToLow')}
      className="mr-4"
    />
    High to Low
  </label>
</div>

        </div>

        {/* Date Filter */}
        <div className="justify-between px-10 flex flex-col border-b py-5">
          <h2 className="font-bold text-sm mb-4">Date</h2>
          <div className="space-y-2">
            <label className="block cursor-pointer hover:text-neutral-800 text-sm font-thin font-custom_thin">
              <input
                type="radio"
                name="date-filter"
                onChange={() => handleMobileFilterChange('date', 'oldestFirst')}
                checked={currentMobileFilters.date === 'oldestFirst'}
                className="mr-4"
              />
              Oldest First
            </label>
            <label className="block cursor-pointer hover:text-neutral-800 text-sm font-thin font-custom_thin">
              <input
                type="radio"
                name="date-filter"
                checked={currentMobileFilters.date === 'newestFirst'}
                onChange={() => handleMobileFilterChange('date', 'newestFirst')}
                className="mr-4"
              />
              Newest First
            </label>
          </div>
        </div>
      </div>
         </>
          )}
  </div>
      <div className="w-[98%] flex">
        {/* Filter Section */}
        <div className="w-1/4 hidden lg:block  border-r px-4   fixed top-32 bg-white z-10 h-[calc(100vh-8rem)]">
          <div className="py-5 px-1 border-b h-fit flex w-full justify-between">
            <h1 className="font-base font-bold text-sm">Filters:</h1>
            <button onClick={clearFilters} className="text-xs font-custom_thin text-neutral-500 hover:text-neutral-800">
              Clear All
            </button>
          </div>

          {/* Price Filter */}
          <div className="justify-between px-1 flex flex-col border-b py-5">
            <h2 className="font-base font-bold text-sm mb-4">Price</h2>
            <div className="space-y-2">
              <label className="block cursor-pointer hover:text-neutral-800 text-sm font-thin font-custom_thin">
                <input
                  type="radio"
                  name="price-filter"
                  checked={currentFilters.price === 'lowToHigh'}
                  onChange={() => handleFilterChange('price', 'lowToHigh')}
                  className="mr-4"
                />
                Low to High
              </label>
              <label className="block cursor-pointer hover:text-neutral-800 text-sm font-thin font-custom_thin">
                <input
                  type="radio"
                  name="price-filter"
                  checked={currentFilters.price === 'highToLow'}
                  onChange={() => handleFilterChange('price', 'highToLow')}
                  className="mr-4"
                />
                High to Low
              </label>
            </div>
          </div>

          {/* Date Filter */}
          <div className="justify-between px-1 flex flex-col border-b py-5">
            <h2 className="font-base font-bold text-sm mb-4">Date</h2>
            <div className="space-y-2">
              <label className="block cursor-pointer hover:text-neutral-800 text-sm font-thin font-custom_thin">
                <input
                  type="radio"
                  name="date-filter"
                  checked={currentFilters.date === 'oldestFirst'}
                  onChange={() => handleFilterChange('date', 'oldestFirst')}
                  className="mr-4"
                />
                Oldest First
              </label>
              <label className="block cursor-pointer hover:text-neutral-800 text-sm font-thin font-custom_thin">
                <input
                  type="radio"
                  name="date-filter"
                  checked={currentFilters.date === 'newestFirst'}
                  onChange={() => handleFilterChange('date', 'newestFirst')}
                  className="mr-4"
                />
                Newest First
              </label>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="w-full flex flex-col px-3 md:py-8  lg:ml-[25%]">
          {loading ? (
            <CategoryProductDisplaySkeleton  />
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-xl font-semibold text-gray-500">No products available in this category</p>
            </div>
          ) : (
            <div className="flex  flex-wrap md:justify-normal justify-center gap-5 md:mt-10">
              {products.map((product) => {
                const displayPrice = userRole === 'dealer' ? product.dealerPrice : product.customerPrice;
                return (
                  <div
                    key={product._id}
                    className="md:h-80   bg-white shadow  border md:border-none md:shadow-none  h-56 md:w-56  w-40 rounded-xl transform transition-all duration-300 group hover:shadow-lg hover:border hover:border-neutral-100"
                  >
                    <a href={`/products/${product._id}`} className="cursor-pointer">
                      <div className="relative md:h-56 md:w-56 w-40 h-32 rounded overflow-hidden transform transition-transform duration-300 group-hover:scale-95">
                        {product.productImages.length > 0 ? (
                          <img
                            src={`${ImgbaseUrl}${product.productImages[0]}`}
                            alt={product.productName}
                            className="h-full p-3 w-full"
                          />
                        ) : (
                          <p className="h-full flex items-center justify-center text-gray-500">No image available</p>
                        )}
                      </div>
                      <div className="pt-2 px-4 transform transition-transform duration-300 group-hover:bg-white group-hover:-translate-y-10">
                        <p className="overflow-hidden font-bold text-ellipsis capitalize whitespace-nowrap font-serif text-sm">
                          {product.productName}
                        </p>
                        <p className="text-sm flex items-center  pt-2 font-thin">
                          ₹ {formatPrice(displayPrice)}
                        </p>
                        <p className="md:text-sm text-xs whitespace-nowrap">
                        <span className="text-green-700 pr-1">Inclusive GST </span>
                        <span className="line-through font-thin text-gray-500">
                        ₹ {formatPrice(product.strikePrice)}
                        </span>
                      </p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product._id);
                          }}
                          className="w-full mt-2 hover:border-neutral-800 hover:text-neutral-800 text-neutral-400 py-2 border rounded-xl opacity-0 transform transition-opacity duration-500 group-hover:opacity-100"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      </div>
       
    </div>
  </>
};

export default CategoryProductDisplay;
