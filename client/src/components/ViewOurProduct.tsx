import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoIosArrowDown } from 'react-icons/io';
import { LiaFilterSolid } from 'react-icons/lia';
import { baseUrl } from '@/lib/config';

const ITEMS_PER_PAGE = 8;
const IMG_BASE_URL = process.env.REACT_APP_IMG_BASE_URL;

interface Product {
  _id: string;
  productName: string;
  brand: string;
  customerPrice: number;
  strikePrice: number;
  productImages: string[];
  stock: number;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState<string>('customer');
  const [cartItems, setCartItems] = useState([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Filter states
  const [currentPriceFilter, setCurrentPriceFilter] = useState<'low' | 'high' | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());

  // Dropdowns state
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    setUserRole(userData.role || 'customer');
    fetchProducts();
    fetchCartItems();
  }, []);

  // Update useEffect to apply filters after products are fetched
  useEffect(() => {
    applyFilters();
  }, [products, currentPriceFilter, selectedBrands]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${baseUrl}/products/all`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const fetchCartItems = async () => {
    const userId = localStorage.getItem('_id');
    if (!userId) return;

    try {
      const response = await fetch(`${baseUrl}/order/getCartItems?Id=${userId}`);
      const data = await response.json();
      setCartItems(data.cart);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const handleAddToCart = async (productId: string) => {
    const userId = localStorage.getItem('_id');
    if (!userId) {
      window.location.href = '/Login';
      return;
    }

    const quantity = 1;
    const payload = { userId, productId, quantity };

    try {
      const existingProduct = cartItems.find(item => item.productId._id === productId);

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

      toast.success('Item added to cart successfully');
      fetchCartItems();
    } catch (error) {
      console.error(error);
      toast.error("Error adding to cart");
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Apply brand filter
    if (selectedBrands.size > 0) {
      filtered = filtered.filter(product => 
        selectedBrands.has(product.brand)
      );
    }

    // Apply price filter
    if (currentPriceFilter) {
      filtered.sort((a, b) => {
        if (currentPriceFilter === 'low') {
          return a.customerPrice - b.customerPrice;
        } else {
          return b.customerPrice - a.customerPrice;
        }
      });
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const getUniqueBrands = () => {
    return [...new Set(products.map(product => product.brand))];
  };

  const getDisplayPrice = (product: Product) => {
    return product.customerPrice.toFixed(2);
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const loadMoreProducts = () => {
    setCurrentPage(prev => prev + 1);
  };

  const clearFilters = () => {
    setCurrentPriceFilter(null);
    setSelectedBrands(new Set());
    setCurrentPage(1);
  };

  const toggleBrandFilter = (brand: string) => {
    setSelectedBrands(prev => {
      const newBrands = new Set(prev);
      if (newBrands.has(brand)) {
        newBrands.delete(brand);
      } else {
        newBrands.add(brand);
      }
      return newBrands;
    });
  };

  const visibleProducts = filteredProducts.slice(0, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="pt-12">
      <ToastContainer />
      
      {/* Existing UI remains the same */}
      {/* Brand Filters Updated */}
      {isBrandDropdownOpen && (
        <div className="mt-4 space-y-2">
          {getUniqueBrands().map(brand => (
            <label 
              key={brand} 
              className="flex items-center cursor-pointer hover:text-neutral-800 text-sm font-thin font-custom_thin"
            >
              <input 
                type="checkbox" 
                value={brand}
                checked={selectedBrands.has(brand)}
                onChange={() => toggleBrandFilter(brand)}
                className="mr-4"
              />
              {brand}
            </label>
          ))}
        </div>
      )}

      {/* Products rendering section remains the same */}
      <div className="flex flex-wrap justify-center lg:justify-start gap-5">
        {visibleProducts.map(product => (
          <div 
            key={product._id}
            className="h-80 w-56 rounded-xl transform transition-all duration-300 group hover:shadow-lg hover:border hover:border-neutral-100"
          >
            <div className="price-display">
              <p className="text-sm">
                {getDisplayPrice(product)}
              </p>
              <p className="text-sm line-through">
                {formatPrice(product.strikePrice)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;