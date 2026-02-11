import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ImgbaseUrl, baseUrl } from '../lib/config';
import CategoryProductDisplaySkeleton from '@/skeleton/CategoryProductDisplaySkeleton';
import { LiaFilterSolid } from "react-icons/lia";
import NavBar from './NavBar';
import { ArrowLeft, ArrowLeftIcon, X } from 'lucide-react';
import { BsCartPlusFill } from 'react-icons/bs';
import adjustment from "../../public/svg/adjustment 2.svg"
import { useNavigate } from 'react-router-dom';
interface Product {
  _id: string;
  productName: string;
  productImages: string[];
  customerPrice: number;
  dealerPrice: number;
  strikePrice: number;
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



interface CategoryProductDisplayProps {
  categoryName: string;
}
const CategoryProductDisplay: React.FC<CategoryProductDisplayProps> = ({ categoryName }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userRole, setUserRole] = useState('customer');
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState({
    price: '',
    date: '',
  });
  const navigate=useNavigate();
  const [currentMobileFilters, setCurrentMobileFilters] = useState({
    price: '',
    date: '',
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const formatPrice = (price: number) => (typeof price === 'number' ? price.toLocaleString('en-IN') : '0');

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
    } catch (error:any) {
      toast.error('Error fetching cart items:', error);
    }
  };

  const handleAddToCart = async (productId: string) => {
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

  const sortProducts = (productsToSort: Product[]) => {
    let sortedProducts = [...productsToSort];

    if (currentFilters.price === 'lowToHigh') {
      sortedProducts.sort((a, b) => a.customerPrice - b.customerPrice);
    } else if (currentFilters.price === 'highToLow') {
      sortedProducts.sort((a, b) => b.customerPrice - a.customerPrice);
    }

    if (currentFilters.date === 'oldestFirst') {
      //@ts-ignore
      sortedProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (currentFilters.date === 'newestFirst') {
      //@ts-ignore
      sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (currentMobileFilters.price === 'lowToHigh') {
      sortedProducts.sort((a, b) => a.customerPrice - b.customerPrice);
    } else if (currentMobileFilters.price === 'highToLow') {
      sortedProducts.sort((a, b) => b.customerPrice - a.customerPrice);
    }

    if (currentMobileFilters.date === 'oldestFirst') {
      //@ts-ignore
      sortedProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (currentMobileFilters.date === 'newestFirst') {
      //@ts-ignore
      sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sortedProducts;
  };
  const handleProductClick = (productId: any) => {
    window.location.href = `/products/${productId}`;
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
    <div className='h-full w-full '>
      <NavBar />
      <div className="w-full md:pt-16 z-50  justify-center ">
      <div className="w-full  lg:bg-blue-900/90 top-16  md:h-20  flex items-center  md:p-4 p-2">
        <button className="lg:text-white  text-black h-fit  md:pr-2 py-2 pr-1 rounded-xl md:gap-2 gap-1 items-center justify-center text-lg flex" onClick={() => navigate('/')}>
          <span onClick={()=>{window.history.back();}}>
         <ArrowLeftIcon className='md:h-4 h-8' />
          </span>
      <span className='hidden md:block'>Back</span>
           </button>
           
           <div className='flex justify-start md:justify-center  items-center w-full'>
           <h1 className="lg:text-white text-black  lg:text-5xl text-2xl lg:font-bold lg:drop-shadow-[0_2px_1px_rgba(0,0,0,1)] p-2 rounded lg:-tracking-tighter ">{categoryName}</h1>
           </div>
           <div  id="filter-button" onClick={()=>{setIsDropdownOpen(true)}} className=" lg:flex hidden bg-white rounded p-1 items-center md:block  ">
         <img src={adjustment} className='h-8 ' alt="" />
        </div>
           <div  id="filter-button" onClick={()=>{setIsDropdownOpen(true)}} className=" flex lg:hidden items-center md:block md:mt-5 ">
         <img src={adjustment} className='h-10 ' alt="" />
        </div>
      </div>
      <div className="w-full flex   justify-between bg-white  z-10 ">
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
        className={`fixed  right-0 md:top-0 top-[50%] h-full md:w-1/4 w-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out 
         ${isDropdownOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
         
        {/* Filter Header */}
        <div className="py-5 px-5 border-b h-fit flex w-full justify-between">
         
          <h1 className="font-base  md:text-lg font-bold text-sm">Filters:</h1>
          <div className='flex justify-center items-center'>
          <button 
            onClick={() => {
              clearMobileFilters();
              setIsDropdownOpen(false);
            }} 
            className="text-sm  md:text-lg font-custom_thin text-neutral-500 hover:text-neutral-800"
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
          <h2 className="font-base md:text-lg  font-bold text-sm mb-4">Price</h2>
          <div className="space-y-2">
  <label className="block cursor-pointer hover:text-neutral-800 md:text-lg text-sm font-thin font-custom_thin">
    <input
      type="radio"
      name="price-filter"
      checked={currentMobileFilters.price === 'lowToHigh'}
      onChange={() => handleMobileFilterChange('price', 'lowToHigh')}
      className="mr-4"
    />
    Low to High
  </label>
  <label className="block cursor-pointer hover:text-neutral-800 md:text-lg text-sm font-thin font-custom_thin">
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
          <h2 className="font-bold md:text-lg  text-sm mb-4">Date</h2>
          <div className="space-y-2">
            <label className="block cursor-pointer hover:text-neutral-800 md:text-lg text-sm font-thin font-custom_thin">
              <input
                type="radio"
                name="date-filter"
                onChange={() => handleMobileFilterChange('date', 'oldestFirst')}
                checked={currentMobileFilters.date === 'oldestFirst'}
                className="mr-4"
              />
              Oldest First
            </label>
            <label className="block cursor-pointer hover:text-neutral-800 md:text-lg text-sm font-thin font-custom_thin">
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

  <div className="flex flex-col w-full justify-center  ">
  <div className="w-full flex ">

        {/* Products Grid */}
        <div className="w-full  flex flex-col md:py-10 md:px-3 px-1  ">
          {loading ? (
            <CategoryProductDisplaySkeleton  />
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="md:text-xl  text-gray-500">No products available in this category</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center  md:gap-10 gap-2">
              {/* {products.map((product) => {
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
                        <p className="text-base flex items-center  pt-2 font-thin">
                        <span className="md:text-base mr-0.5 text-xs  mt-0.5 font-sans font-medium">
                                                        &#8377;
                                                    </span> {formatPrice(displayPrice)}
                        </p>
                        <p className="md:text-sm text-xs whitespace-nowrap">
                        <span className="text-green-700 pr-1">Inclusive GST </span>
                        <span className="line-through font-thin text-gray-500">
                        <span className=" mt-0.5 font-sans font-medium">
                                                        &#8377;
                                                    </span> {formatPrice(product.strikePrice)}
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
              })} */}
                {products.map((product) => {
                   const displayPrice = userRole === 'dealer' ? product.dealerPrice : product.customerPrice;
                  return(                          
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
                {formatPrice(displayPrice)}
                          </span>
                </p>
                <p className="text-green-700 md:text-sm text-xs">
                  Inclusive GST{" "}
                  <span className="line-through text-gray-400">
                    <span className="mt-0.5 font-medium">&#8377;</span>  {formatPrice(product.strikePrice)}
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
                )})}
            </div>
          )}
        </div>
      </div>
  </div>
     
      </div>
       
    </div>
  </>
};

export default CategoryProductDisplay;
