import { useEffect, useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { baseUrl } from "../lib/config";
import { ImgbaseUrl } from "../lib/config";
import {toast} from "react-toastify"
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

const OurProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const[cartItems,setCartItems]=useState<CartItem[]>([]);
    const[role,setRole]=useState('customer')
    const scrollRef = useRef<HTMLDivElement>(null);
    const cardWidth = 300;

    const getUserData = () => {
        //@ts-ignore
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && userData.role) {
            setRole(userData.role);
        } else {
            setRole('customer'); 
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${baseUrl}/products/all`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleNext = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                top: 0,
                left: cardWidth,
                behavior: "smooth"
            });
        }
    };

    const handlePrev = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                top: 0,
                left: -cardWidth,
                behavior: "smooth"
            });
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

    const handleProductClick = (productId: any) => {
        window.location.href = `/products/${productId}`;
    };
    const handleAddToCart = async (Id: any) => {
        const userId = localStorage.getItem('_id');
        const productId = Id;
        const quantity = 1;
    
        if (!userId) {
         window.location.href=`/Login`
         return
        }
    
        const payload = { userId, productId, quantity };
    
        try {
           
            const existingProduct = cartItems.find((item: any) => item.productId._id === productId);
    
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
        fetchProducts();
        getUserData();
        getCartItems();
    }, []);

    return (
        <div className="w-full flex flex-col  px-1">
            <div className="flex flex-col rounded">
                <div className="flex w-full justify-between items-center">
                    <div className="w-full -mr-10 flex px-1 md:items-center items-start flex-col " >
<h1 className="font-semibold  md:text-3xl text-xl md:py-5 tracking-wider">
              OUR PRODUCTS
            </h1>
<hr className="md:w-1/6 h-0.5 w-1/3  bg-blue-200" />
                    </div>

                    {/* Arrows for larger screens */}
                    <p className="cursor-pointer  relative justify-between items-center gap-2 md:flex hidden">
                        <span
                            className={`md:text-2xl text-lg hover:text-indigo-600 text-neutral-400 ${products.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            onClick={handlePrev}
                        >
                            ←
                        </span>
                        <span
                            className={`md:text-2xl text-lg hover:text-indigo-600 text-neutral-400 ${products.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            onClick={handleNext}
                        >
                            →
                        </span>
                    </p>

                    {/* View All button for small screens */}
                    <div className="flex md:hidden w-1/3 justify-end items-center">
                        <a
                            href="/OurProducts"
                            className="rounded-xl border-none  hover:border-blue-200 p-2 text-sm text-neutral-500 hover:text-indigo-500 transition-transform duration-300"
                        >
                            View All
                        </a>
                    </div>
                </div>

                <div
  ref={scrollRef}
  className="md:pt-10 md:px-10 px-2 py-10 grid grid-flow-col overflow-x-auto overflow-y-hidden md:gap-6 gap-3 scrollbar-hide"
>
  {products.length > 0 ? (
    <>
      {products.slice(0, 12).map((product) => (
        <div
          key={product._id}
          className="md:w-[300px] md:h-[400px] w-[230px] h-[300px] border flex justify-center items-center rounded-[40px] overflow-hidden relative group hover:shadow-lg hover:border-blue-200 transition-transform duration-300"
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
                  className="w-full p-5  h-full object-fill rounded-t-[40px]"
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
                  {role === "dealer" ? (
                    <>Rs. {product?.dealerPrice}</>
                  ) : (
                    <>Rs. {product?.customerPrice}</>
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


     {/* <div
                                    key={product._id}
                                    className="md:h-72  bg-white  shadow md:shadow-none h-52 md:min-w-60 2xl:w-72  min-w-36 rounded-xl transform transition-all duration-300 group hover:shadow-lg md:hover:border hover:border-neutral-100 border border-gray-100 md:border-none"
                                >
                                    <div
                                        className="relative flex items-center justify-center rounded overflow-hidden transform transition-transform duration-300 group-hover:scale-95 cursor-pointer"
                                        onClick={() => handleProductClick(product._id)}
                                    >
                                        <div className="md:h-48 md:w-60 h-32 w-24">
                                            {product.productImages.length > 0 ? (
                                                <img
                                                    src={`${ImgbaseUrl}${product.productImages[0]}`}
                                                    alt="product"
                                                    className="h-full w-full md:object-cover object-contain rounded-t transform transition-transform duration-300 group-hover:scale-90"
                                                />
                                            ) : (
                                                <p>No image available</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="md:pt-5 md:px-5 pl-2 md:transform md:transition-transform md:duration-300 group-hover:bg-white md:group-hover:-translate-y-10">
                                        <div
                                            className="cursor-pointer"
                                            onClick={() => handleProductClick(product?._id)}
                                        >
                                            <p className="overflow-hidden text-ellipsis capitalize whitespace-nowrap  md:text-lg text-sm">
                                                {product?.productName}
                                            </p>
                                            <p className="mt-2 md:text-base  text-sm  font-medium">
                                                {role === "dealer" ? (
                                                    <>
                                                        <span className="md:text-base pr-0.5 text-xs  mt-0.5 font-sans font-medium">
                                                            &#8377;
                                                        </span>
                                                        {product?.dealerPrice}
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="md:text-base text-xs pr-0.5 mt-0.5  font-medium">
                                                            &#8377;
                                                        </span>
                                                        {product?.customerPrice}
                                                    </>
                                                )}
                                            </p>
                                            <p className="text-sm ">
                                                <span className="text-green-700 md:text-sm text-[10px] md:pr-2">
                                                    Inclusive GST{" "}
                                                </span>
                                                <span className="line-through  md:text-sm text-xs text-gray-500">
                                                    <span className=" mt-0.5  font-medium">
                                                        &#8377;
                                                    </span>
                                                    {product.strikePrice}
                                                </span>
                                            </p>
                                        </div>
                                        <button
                                            className="w-full mt-2 hover:border-neutral-800 hover:text-neutral-800 text-neutral-400 py-2 border rounded-xl opacity-0 text-sm md:text-base transform transition-opacity duration-500 group-hover:opacity-100"
                                            onClick={(_e) => handleAddToCart(product._id)}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div> */}
                {/* View All button for larger screens */}
         
            </div>
    
            {/* View All button for larger screens */}
            <div className="md:flex justify-center  hidden">
                <a
                    href="/OurProducts"
                    className="flex flex-row w-32 rounded-xl md:border md:border-neutral-500 md:hover:border-indigo-500 justify-center hover:scale-110 transition-transform duration-300 hover:rounded-lg p-2 hover:shadow hover:border items-center gap-2 text-neutral-500 hover:text-indigo-500"
                >
                    View All <span className="text-sm">
                        <FaArrowRight />
                    </span>
                </a>
            </div>
        </div>

    
    );
};

export default OurProducts;