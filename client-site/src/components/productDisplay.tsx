import ProductDisplaySkeleton from "@/skeleton/ProductDisplaySkeleton";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ImgbaseUrl, baseUrl } from "../lib/config";


// Types
interface Offer {
  dealerPrice: any;
  from: number;
  to: number;
  customerPrice: number;
}

interface Specification {
  [key: string]: {
    [key: string]: string;
  };
}
interface CartItem {
  productId: {
    _id: string;
    stock: number;
  };
  quantity: number;
}
interface Product {
  _id: any;
  dealerPrice: any;
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

interface ProductDisplayProps {
  productId: string;
  onError?: () => void;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({
  productId,
  onError,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showViewMore, setShowViewMore] = useState(false);
  const descriptionRef = useRef(null);
  const [showMoreSpecs, setShowMoreSpecs] = useState(false);
  const [showOfferDropdown, setShowOfferDropdown] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [role, setRole] = useState("customer");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [price, setPrice] = useState<number | null>(null);

  const getUserData = () => {
    //@ts-ignore
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      setRole(userData.role);
    } else {
      setRole("customer");
    }
  };
  const offerRef = useRef<HTMLDivElement>(null);
  const handleClickOutside = (event: MouseEvent) => {
    if (offerRef.current && !offerRef.current.contains(event.target as Node)) {
      setShowOfferDropdown(false);
    }
    // const target = event.target as HTMLElement | null;
    // if (target && !target.closest('.offer-dropdown')) {
    //   setShowOfferDropdown(false);
    // }
  };
  useEffect(() => {
    if (showOfferDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOfferDropdown]);
  useEffect(() => {
    const checkOverflow = () => {
      if (descriptionRef.current) {
        const { scrollHeight, offsetHeight } = descriptionRef.current;
        setShowViewMore(scrollHeight > offsetHeight); // Show the button only if overflow exists
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow); // Re-check on window resize
    return () => window.removeEventListener("resize", checkOverflow);
  }, [product]);

  useEffect(() => {
    if (!product) return;

    let applicablePrice =
      role === "dealer" ? product.dealerPrice : product.customerPrice;

    if (product.offers && product.offers.length > 0) {
      const applicableOffer = product.offers.find(
        (offer) => quantity >= offer.from && quantity <= offer.to
      );

      if (applicableOffer) {
        // Use the offer price if within range
        applicablePrice =
          role === "dealer"
            ? applicableOffer.dealerPrice
            : applicableOffer.customerPrice;
      } else if (quantity > product.offers[product.offers.length - 1].to) {
        // If quantity is greater than the highest 'to' value, use the last offer price
        const lastOffer = product.offers[product.offers.length - 1];
        applicablePrice =
          role === "dealer" ? lastOffer.dealerPrice : lastOffer.customerPrice;
      }
    }

    setPrice(applicablePrice);
  }, [quantity, role, product]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredQuantity = Number(e.target.value);
    //@ts-ignore
    const newQuantity = Math.min(Math.max(1, enteredQuantity), product.stock);
    //@ts-ignore
    if (enteredQuantity > product.stock) {
      //@ts-ignore
      toast.error(`Only ${product.stock} items can be added to the cart`);
    }
    setQuantity(newQuantity);
    console.log(quantity);
  };
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const response = await fetch(`${baseUrl}/products/get?id=${productId}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        setProduct(data.data);
      } catch (error) {
        onError?.();
      }
    };

    fetchProduct();
    getUserData();
  }, [productId, baseUrl, onError]);

  const getCartItems = () => {
    const userId = localStorage.getItem("_id");

    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }

    fetch(`${baseUrl}/order/getCartItems?Id=${userId}`)
      .then((response) => response.json())
      .then((data) => {
        setCartItems(data.cart);
      })
      .catch((error) => {
        console.error("Error fetching cart items:", error);
      });
  };
  // console.log(cartItems)
  const handleAddToCart = async (Id: any) => {
    const userId = localStorage.getItem("_id");
    const productId = Id;

    if (!userId) {
      window.location.href = `/Login`;
      return;
    }

    const payload = { userId, productId, quantity };

    try {
      const existingProduct = cartItems.find(
        (item: any) => item.productId._id === productId
      );

      if (existingProduct) {
        const availableStock = existingProduct.productId.stock;
        const currentQuantity = existingProduct.quantity;
        if (currentQuantity + quantity > availableStock) {
          toast.error(`Already ${availableStock} items are in the cart.`);
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
      setQuantity(1);
      toast.success("Item added to cart successfully");
      await response.json();
      getCartItems();
    } catch (error) {
      console.error(error);
      alert("Error adding to cart");
    }
  };
  useEffect(() => {
    getCartItems();
  }, [quantity]);

  if (!product) {
    return <ProductDisplaySkeleton />;
  }

  const discountPercentage = Math.round(
    ((product.strikePrice - product.customerPrice) / product.strikePrice) * 100
  );

  const renderSpecifications = () => {
    const generalEntries = Object.entries(product.general || {}).map(
      ([key, value]) => ({
        section: "General",
        key,
        value,
      })
    );

    const specificationsEntries = Object.entries(
      product.specifications || {}
    ).flatMap(([specKey, specValues]) =>
      Object.entries(specValues).map(([key, value]) => ({
        section: specKey,
        key,
        value,
      }))
    );

    const allEntries = [...generalEntries, ...specificationsEntries];
    const displayedEntries = showMoreSpecs
      ? allEntries
      : allEntries.slice(0, 2);

    if (!product) {
      return <ProductDisplaySkeleton />;
    }

    return (
      <div className="pt-5  md:pt-0">
        <div className="md:p-6 px-5 py-3  border">
          <h2 className="text-xl font-semibold">Specifications</h2>
        </div>
        <div className="md:p-6 px-5">
          <div className="md:space-y-4 ">
            {displayedEntries.map((entry, index) => (
              <div key={`${entry.section}-${entry.key}`}>
                {(index === 0 ||
                  displayedEntries[index - 1].section !== entry.section) && (
                  <h3 className="text-lg font-semibold bg-neutral-100 md:p-2 py-2 md:py-0 rounded mb-2">
                    {entry.section}
                  </h3>
                )}
                <div className="flex justify-between py-2 lg:gap-0 gap-5">
                  <span className="font-medium text-neutral-500 md:w-1/2 w-1/3">
                    {entry.key}
                  </span>
                  <span className="text-neutral-500 md:w-1/2 w-2/3">
                    {entry.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {allEntries.length > 2 && !showMoreSpecs && (
            <div className="relative opacity-40">
              <div className="flex justify-between py-2">
                <span className="font-medium w-1/2">{allEntries[2]?.key}</span>
                <span className="w-1/2">{allEntries[2]?.value}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50 to-gray-50" />
            </div>
          )}

          {allEntries.length > 2 && (
            <button
              onClick={() => setShowMoreSpecs(!showMoreSpecs)}
              className="md:mt-4 my-5 text-blue-600 hover:text-blue-800 font-medium"
            >
              {showMoreSpecs ? "Show Less" : "Show More"}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="container w-full  mx-auto  md:py-16 ">
      <div className="grid grid-cols-1 md:grid-cols-2  md:gap-10 ">
        {/* Image Gallery */}
        <div className="flex mt-2 w-full  md:flex-row flex-col space-x-4 p-2 md:sticky top-5 self-start  md:h-[80vh]  overflow-y-hidden">
          <div className="md:flex  hidden flex-col space-y-4 p-2 w-24 overflow-auto">
            {product.productImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square rounded-md overflow-hidden border-none hover:ring-1 hover:ring-blue-500 focus:outline-none ${
                  selectedImage === index ? "ring-1 ring-blue-500" : ""
                }`}
              >
                <img
                  src={`${ImgbaseUrl}${image}`}
                  alt={`${product.productName} ${index + 1}`}
                  loading="lazy"
                  className="object-cover p-1 w-full h-full rounded-md"
                />
              </button>
            ))}
          </div>
          <div className="flex-1">
            <div className="flex w-full md:justify-normal justify-center ">
              <div className="aspect-square w-3/4   md:w-full rounded-xl overflow-hidden border">
                <img
                  src={`${ImgbaseUrl}${product.productImages[selectedImage]}`}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="flex justify-center  md:hidden  space-x-4 p-2 h-20 overflow-auto">
              {product.productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-md overflow-hidden border-none hover:ring-1 hover:ring-blue-500 focus:outline-none ${
                    selectedImage === index
                      ? "ring-1 ring-blue-500 rounded-xl"
                      : ""
                  }`}
                >
                  <img
                    src={`${ImgbaseUrl}${image}`}
                    alt={`${product.productName} ${index + 1}`}
                    loading="lazy"
                    className="object-cover p-1 w-full h-full rounded-md"
                  />
                </button>
              ))}
            </div>
            <div className="mt-10 flex justify-center gap-5">
              <button
                onClick={() => handleAddToCart(product._id)}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
              >
                Add to cart
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
                className="w-20 text-center border border-orange-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="md:space-y-6 mt-10 md:mt-0 space-y-3 md:overflow-y-auto max-h-[80vh] md:pr-4 ">
          <div className="px-5 md:px-0">
            <h1 className="text-xl font-bold capitalize">
              {product.productName}
            </h1>
            <p className="mt-5  text-neutral-600">Brand: {product.brand}</p>
          </div>

          <div className="flex items-center md:space-x-4  space-x-2 px-5 md:px-0">
            <div className="flex gap-2">
              <span className="text-green-700">Inclusive GST</span>
              <span className="text-base text-gray-500 line-through">
              <span className="md:text-base text-xs  mt-0.5 font-sans font-medium">
                                                        &#8377;
                                                    </span>{product.strikePrice.toLocaleString()}
              </span>
            </div>
            {/* <span className="text-xl font-bold">₹{product.customerPrice.toLocaleString()}</span> */}
            <span className="text-xl font-bold">
            <span className="text-xl mr-0.5  mt-0.5 font-sans font-medium">
                                                        &#8377;
                                                    </span>{price ? price.toLocaleString() : "Loading..."}
            </span>
            <span className="text-green-600 pl-4 md:pl-0 font-semibold">
              {discountPercentage}% OFF
            </span>
          </div>

          {/* Bulk Order Pricing */}
          <div className="bg-green-50 py-1 md:px-3 px-4  rounded-md relative">
            <div className="flex w-full justify-center items-center gap-3">
              <div className="w-full flex md:gap-3 gap-1  items-center">
                <div className="rounded-full flex justify-center items-center  text-white bg-green-600 w-7 h-7">
                  %
                </div>
                <p className="text-green-600 text-sm md:text-base">Offer</p>

                {role === "dealer" ? (
                  <span className="text-sm lg:text-base">
                    price starts from Rs.{product.offers[0].dealerPrice}
                  </span>
                ) : (
                  <span className="text-sm md:text-base">
                    price starts from Rs.{product.offers[0].customerPrice}
                  </span>
                )}
              </div>
              <div ref={offerRef} className="w-1/3 flex justify-end items-end">
                <button
                  onClick={() => setShowOfferDropdown(!showOfferDropdown)}
                  className="rounded-full text-sm md:text-base border border-green-600 px-4 py-2 whitespace-nowrap md:whitespace-normal lg:whitespace-nowrap flex items-center gap-2 hover:bg-green-50"
                >
                  View Offer
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {showOfferDropdown && (
              <div className="absolute top-full md:right-0 right-3  mt-2 z-20 rounded shadow border w-1/2 p-3 space-y-2 bg-white">
                {product.offers.map((offer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between md:p-2 p-1 md:text-base text-sm  bg-gray-50 rounded"
                  >
                    <span>
                      {offer.from} - {offer.to} Quantity
                    </span>
                    {role === "dealer" ? (
                      <span className="font-semibold">
                        ₹{offer.dealerPrice.toLocaleString()} / 1
                      </span>
                    ) : (
                      <span className="font-semibold">
                        ₹{offer.customerPrice.toLocaleString()} / 1
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg px-5 md:px-0   text-black font-bold md:pb-4 pb-2">
              Description
            </h2>
            <div className="relative px-10  md:px-2">
              <p
                ref={descriptionRef}
                className={`text-neutral-500  overflow-hidden transition-all duration-300 ${
                  !isDescriptionExpanded ? "line-clamp-2" : ""
                }`}
              >
                {product?.description}
              </p>
              {showViewMore && (
                <button
                  onClick={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                  className="mt-1 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <span className="text-sm">
                    {isDescriptionExpanded ? "View Less" : "View More"}
                  </span>
                  <svg
                    className={`w-4 h-4 transform transition-transform duration-300 ${
                      isDescriptionExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Specifications */}
          {renderSpecifications()}
        </div>
      </div>
    </main>
  );
};

export default ProductDisplay;
