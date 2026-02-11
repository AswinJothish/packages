import { useEffect, useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { baseUrl } from "../lib/config";
import { ImgbaseUrl } from "../lib/config";
import {toast} from "react-toastify";
import { BsCartPlusFill } from "react-icons/bs";

type Product = {
  _id: string;
  productName: string;
  dealerPrice: number;
  customerPrice: number;
  strikePrice: number;
  stock: number;
  productImages: string[];
};

type CartItem = {
  productId: {
    _id: string;
    stock: number;
  };
  quantity: number;
};

type Section = {
  _id: string;
  Title: string;
  Description: string;
  Products: Product[];
};

const DynamicSection = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [role, setRole] = useState('customer');
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardWidth = 300;
  
  const getUserData = () => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData && userData.role) {
      setRole(userData.role);
    } else {
      setRole('customer'); 
    }
  };

  const fetchSections = async () => {
    try {
      const response = await fetch(`${baseUrl}/section/all`);
      if (!response.ok) {
        throw new Error('Failed to fetch sections');
      }
      const data = await response.json();
      setSections(data.sections || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const getCartItems = () => {
    const userId = localStorage.getItem('_id');
    
    if (!userId) {
      console.error('User ID not found in localStorage');
      return;
    }
    
    fetch(`${baseUrl}/order/getCartItems?Id=${userId}`)
      .then(response => response.json())
      .then(data => {
        setCartItems(data.cart);  
      })
      .catch(error => {
        console.error('Error fetching cart items:', error);
      });
  };

  const handleAddToCart = async (Id: string) => {
    const userId = localStorage.getItem('_id');
    const productId = Id;
    const quantity = 1;
    
    if (!userId) {
      window.location.href = `/Login`;
      return;
    }

    const payload = { userId, productId, quantity };

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
      await response.json();
      getCartItems();    
    } catch (error) {
      console.error(error);
      alert("Error adding to cart");
    }
  };

  useEffect(() => {
    fetchSections();
    getUserData();
    getCartItems();
  }, []);

  return (
    <div className="w-full flex flex-col px-1">
      {sections.map((section) => (
        <div key={section._id} className="flex flex-col rounded my-8">
          <div className="flex w-full justify-between items-center">
            <div className="w-full -mr-10 flex px-1 items-center  flex-col">
            <h1 className="font-semibold md:text-3xl text-xl py-4 tracking-wider uppercase">{section.Title}</h1>
              <hr className="md:w-1/6 w-1/3 mb-4 h-0.5 bg-blue-200" />
              <p className="text-sm w-5/6 md:text-base text-center text-neutral-500">{section.Description}</p>
            </div>
            
            {/* Arrows for larger screens */}
            <p className="cursor-pointer relative justify-between items-center gap-2 md:flex hidden">
              <span
                className={`md:text-2xl text-lg hover:text-indigo-600 text-neutral-400 ${section.Products.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => scrollRef.current?.scrollBy({ top: 0, left: -cardWidth, behavior: "smooth" })}
              >
                ←
              </span>
              <span
                className={`md:text-2xl text-lg hover:text-indigo-600 text-neutral-400 ${section.Products.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => scrollRef.current?.scrollBy({ top: 0, left: cardWidth, behavior: "smooth" })}
              >
                →
              </span>
            </p>
          </div>

          <div
  ref={scrollRef}
  className={`md:pt-10 md:px-10 px-2 py-10 grid grid-flow-col overflow-x-auto overflow-y-hidden md:gap-6 gap-3 scrollbar-hide ${section.Products.length < 5 ? 'lg:justify-center lg:items-center' : ''}`}
  >
  {section.Products.length > 0 ? (
    section.Products.slice(0, 12).map((product) => (
      <div
        key={product._id}
        className="md:w-[300px] md:h-[400px] w-[230px] h-[300px] border flex justify-center items-center rounded-[40px] overflow-hidden relative group hover:shadow-lg hover:border-blue-200 transition-transform duration-300"
      >
        {/* Product Container */}
        <div
          onClick={() => window.location.href = `/products/${product._id}`}
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
          <div style={{ backgroundColor: "rgb(177, 177, 178, 0.1)" }} className="md:py-6 py-4 rounded-b-[40px] w-full transform group-hover:-translate-y-3 transition-transform duration-500">
            <div className="pl-4 -mt-3 pr-12">
              <p className="font-semibold font-sans overflow-hidden text-ellipsis capitalize whitespace-nowrap md:w-[200px] w-[150px] md:text-xl text-sm">
                {product.productName}
              </p>
              <p className="font-medium md:text-lg text-sm">
                {role === "dealer" ? (
                  <>Rs. {product.dealerPrice}</>
                ) : (
                  <>Rs. {product.customerPrice}</>
                )}
              </p>
              <p className="text-green-700 md:text-sm text-xs">
                Inclusive GST{" "}
                <span className="line-through text-gray-400">
                  <span className="mt-0.5 font-medium">&#8377;</span>300
                </span>
              </p>
            </div>

            {/* Cart Button */}
            <div className="absolute md:bottom-6 md:right-3 bottom-3 right-2">
              <div
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleAddToCart(product._id); 
                }}
                className="rounded-full flex text-black hover:bg-blue-500 bg-primary-foreground hover:text-white hover:scale-105 transition-all duration-500 cursor-pointer"
              >
                <div className="p-4 text-2xl ">
                  <BsCartPlusFill />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))
  ) : (
    <p>No products available</p>
  )}
</div>


          {/* View All button for small screens */}
          {/* <div className="md:hidden w-full flex justify-center items-center">
            <a
              href={`/section/${section._id}`}
              className="rounded-xl border-none hover:border-blue-200 p-2 text-sm text-neutral-500 hover:text-indigo-500 transition-transform duration-300"
            >
              View All
            </a>
          </div> */}
        </div>
      ))}
    </div>
  );
};

export default DynamicSection;
