import { useState, useEffect, useRef } from 'react';
import { Search } from "lucide-react";
import user from "../../public/images/user.png";
import shopingCart from '../../public/images/shopping-cart.png';
import { baseUrl, ImgbaseUrl } from "../lib/config";
import CartDrawer from "./CartDrawer"
import logo from "../../public/images/logo.jpeg"

const NavBar = () => {
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

const[isHome,setIsHome]=useState(false);
  
  const profileDropdownRef = useRef(null);
  const navBarRef = useRef(null);

  const handleClickOutside = (event) => {
    if (
      profileDropdownRef.current &&
      !profileDropdownRef.current.contains(event.target) &&
      navBarRef.current &&
      !navBarRef.current.contains(event.target)
    ) {
      setShowProfileDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  useEffect(() => {
    const checkAuth = () => {
      try {
        // Get values from localStorage
        const storedToken = localStorage.getItem('userToken');
        const storedId = localStorage.getItem('_id'); // Changed to '_id' to match the key

       // console.log('Stored Token:', storedToken);
        //console.log('Stored ID:', storedId);

        if (window.location.pathname === '/') {
          setIsHome(true);
        }
    
        // Only set as logged in and fetch user data if both token and _id exist
        if (storedToken && storedId) {
          setIsLoggedIn(true);
          fetchUserData(storedId);
        } else {
          setIsLoggedIn(false);
          setUserData(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    checkAuth();
  }, []);

  // Fetch user data
  const fetchUserData = async (userId:any) => {
    try {
     // console.log('Fetching user data for ID:', userId);
      const response = await fetch(`${baseUrl}/users/get?id=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();

      setUserData(data);
     // console.log('User data received:', userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/products/all`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      const simplifiedProducts = (data.products || []).map(product => ({
        _id: product._id,
        title: product.productName,
        image: product.productImages[0]
      }));
      setProductsList(simplifiedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchValue) {
      const timer = setTimeout(() => {
        const filtered = productsList.filter(product =>
          product.title.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredProducts(filtered);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setFilteredProducts([]);
    }
  }, [searchValue, productsList]);

  const lastFiveProducts = productsList.slice(-5);

  const handleProductSelect = (product) => {
    setSearchValue(product.title);
    setIsSearchFocused(false);
    window.location.href = `/products/${product._id}`;
  };

  const handleLoginRedirect = () => {
    window.location.href = "/Login";
  };

  const handleLogout = () => {
    try {
      // Clear all auth-related items from localStorage
      localStorage.removeItem('userToken');
      localStorage.removeItem('_id'); // Changed to '_id' to match the key
      localStorage.removeItem('userData')
      localStorage.removeItem('userId')
      // Reset state
      setIsLoggedIn(false);
      setUserData(null);
      setShowProfileDropdown(false);
      
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Get display name with proper fallback chain
  const displayName = userData?.data?.username || userData?.data?.userid  ;

  return (
    <div   className="z-40 ">
      <div ref={navBarRef} className='z-40 shadow-lg h-14 nav-bar fixed w-full bg-white  flex items-center justify-between px-4'>
      <div className="w-1/4">
        <a href="/" className='flex items-center'>
          <img src={logo.src} alt="logo" className="h-10" />
          <h1 className='font-merr font-bold text-blue-800 px-2  text-2xl'>Sunstar</h1>
        </a>
      </div>
      
    
      <div className="flex gap-10 w-2/3 justify-end items-center">

        <div className={`w-2/4 hidden md:block relative`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full h-10 px-4 pl-10 rounded-lg border focus:outline-none focus:border-neutral-400"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsSearchFocused(false), 200);
              }}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
          </div>

          {isSearchFocused && (
            <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg max-h-[80vh] overflow-y-auto z-50">
              {loading ? (
                <div className="px-4 py-2 text-neutral-500">Loading...</div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div className='flex border-b p-2 items-center' key={product._id}>
                    <div className='border flex justify-center items-center'>
                      <img src={`${ImgbaseUrl}${product.image}`} alt="product image" className='w-12 h-12 p-1' />
                    </div>
                    <div
                      className="w-full text-sm hover:bg-neutral-50 cursor-pointer"
                      onClick={() => handleProductSelect(product)}
                    >
                      {product.title}
                    </div>
                  </div>
                ))
              ) : searchValue ? (
                <div className="px-4 py-2 text-neutral-500">No Products Found</div>
              ) : (
                <div className="px-4 py-2 text-neutral-500">
                  <h1 className='text-neutral-800 font-bold'>Featured Products</h1>
                  {lastFiveProducts.map((product) => (
                    <div className='flex border-b p-2 items-center' key={product._id}>
                      <div className='border flex justify-center items-center'>
                        <img src={`${ImgbaseUrl}${product.image}`} alt="product image" className='w-12 h-12 p-1' />
                      </div>
                      <div
                        className="px-4 text-sm py-2 w-full hover:bg-neutral-50 cursor-pointer"
                        onClick={() => handleProductSelect(product)}
                      >
                        {product.title}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className='flex items-center gap-5'>
          <button  onClick={() => setIsCartOpen((prev) => !prev)} className=""><img src={shopingCart.src} alt="" className='w-6 h-6' /></button>
          <CartDrawer 
    isOpen={isCartOpen} 
    onClose={() => setIsCartOpen(false)}
  >
  </CartDrawer>
          <div ref={profileDropdownRef} className="relative inline-block">
            <img
              src={user.src}
              alt="profile"
              className="h-6 w-6 cursor-pointer"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            />
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                <div className=" p-1 pt-5  border-b-[3px] font-bold text-center text-neutral-700">
                  Welcome, <span>{isLoggedIn ? displayName : 'Guest'}</span>
                </div>
                <p className="block  py-2 text-center">
                  {isLoggedIn ? 
                  <>
                  <div className='flex justify-center items-center flex-col gap-1'>
                  <a href="/Profile?section=profile" data-astro-prefetch className='py-2 text-left px-3  w-full hover:bg-neutral-200'>Profile</a>
                  <a href="/Profile?section=orders" data-astro-prefetch className='py-2 text-left px-3  w-full hover:bg-neutral-200'>Orders</a>
                  </div>
                  </>
                 
                  :
                   'Manage Cart and Order'}
                </p>
                <div className='flex justify-center items-center mb-2'>
                  <button
                    onClick={isLoggedIn ? handleLogout : handleLoginRedirect}
                    className="text-left px-3 block  py-2 w-full hover:bg-gray-200"
                  >
                    {isLoggedIn ? 'Logout' : 'Login'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>


      <div className='pt-16 md:pt-0 w-full'>
      <div className={`w-full px-1  ${isHome?'md:hidden block':'hidden'} relative`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full h-10 px-4 pl-10 rounded-xl border focus:outline-none focus:border-neutral-400"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsSearchFocused(false), 200);
              }}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
          </div>

          {isSearchFocused && (
            <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg max-h-[80vh] overflow-y-auto z-50">
              {loading ? (
                <div className="px-4 py-2 text-neutral-500">Loading...</div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div className='flex border-b p-2 items-center' key={product._id}>
                    <div className='border flex justify-center items-center'>
                      <img src={`${ImgbaseUrl}${product.image}`} alt="product image" className='w-12 h-12 p-1' />
                    </div>
                    <div
                      className="w-full text-sm hover:bg-neutral-50 cursor-pointer"
                      onClick={() => handleProductSelect(product)}
                    >
                      {product.title}
                    </div>
                  </div>
                ))
              ) : searchValue ? (
                <div className="px-4 py-2 text-neutral-500">No Products Found</div>
              ) : (
                <div className="px-2 py-1 text-neutral-500">
                  <h1 className='text-neutral-800 font-bold text-base'>Featured Products</h1>
                  {lastFiveProducts.map((product) => (
                    <div className='flex border-b p-1 items-center' key={product._id}>
                      <div className='border flex justify-center items-center'>
                        <img src={`${ImgbaseUrl}${product.image}`} alt="product image" className='w-12 h-12 p-1' />
                      </div>
                      <div
                        className="px-2 text-xs py-1 w-full hover:bg-neutral-50 cursor-pointer"
                        onClick={() => handleProductSelect(product)}
                      >
                        {product.title}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default NavBar;





