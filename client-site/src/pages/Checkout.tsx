import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { ToastContainer, toast } from "react-toastify";
import CheckoutAddress from "../components/CheckoutAddress";
import NavBar from "../components/NavBar";
import { ImgbaseUrl, baseUrl } from "../lib/config";
import { ArrowLeft } from "lucide-react";
import { Player } from '@lottiefiles/react-lottie-player';
import animationData from "../components/animation.json"
interface CartItem {
  productId: {
    _id: string;
    productName: string;
    brand: string;
    productImages: string[];
    strikePrice: number;
    dealerPrice: number;
    customerPrice: number;
    offers?: {
      from: number;
      to: number;
      dealerPrice: number;
      customerPrice: number;
    }[];
  };
  quantity: number;
}

const Checkout = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userRole, setUserRole] = useState("customer");
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const getUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      setUserRole(userData.role || "customer");
      return userData;
    } catch {
      return { username: "Guest", userId: null };
    }
  };

  const getSelectedAddress = () => {
    const storedAddress = localStorage.getItem("SelectedAddress");
    return storedAddress ? JSON.parse(storedAddress) : null;
  };

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("checkoutItems") || "[]");
    setCartItems(items);
    getUserData();
  }, []);

  const calculatePrice = (item: CartItem) => {
    const offers = item.productId.offers;
    let applicablePrice =
      userRole === "dealer"
        ? item.productId.dealerPrice
        : item.productId.customerPrice;

    if (offers && offers.length) {
      for (const offer of offers) {
        if (item.quantity >= offer.from && item.quantity <= offer.to) {
          applicablePrice =
            userRole === "dealer" ? offer.dealerPrice : offer.customerPrice;
          break;
        } else if (item.quantity > offers[offers.length - 1].to) {
          applicablePrice =
            userRole === "dealer"
              ? offers[offers.length - 1].dealerPrice
              : offers[offers.length - 1].customerPrice;
        }
      }
    }

    return applicablePrice;
  };

  const calculateTotalPrice = (item: CartItem) => {
    return calculatePrice(item) * item.quantity;
  };

  const createOrder = async () => {
    const userData = getUserData();
    const selectedAddress = getSelectedAddress();
    const products = cartItems.map((item) => ({
      productId: item.productId._id,
      quantity: item.quantity,
    }));
    if (
      !selectedAddress ||
      !selectedAddress.address ||
      !selectedAddress.address.flatNumber ||
      !selectedAddress.address.receiverName
    ) {
      toast.error("Please Select a delivery address");
      return;
    }
 

    const grandTotal = cartItems.reduce(
      (sum, item) => sum + calculateTotalPrice(item),
      0
    );
    const tag = selectedAddress.tag;

    const orderPayload = {
      orderedBy: userData.username || userData.userid,
      customerId: userData._id,
      products: products,
      deliveryAddress: {
        [tag]: {
          flatNumber: selectedAddress.address.flatNumber,
          area: selectedAddress.address.area,
          nearbyLandmark: selectedAddress.address.nearbyLandmark,
          receiverName: selectedAddress.address.receiverName,
          receiverMobileNumber: selectedAddress.address.receiverMobileNumber,
        },
      },
      deliveryCharges: 0,
      grandTotal: grandTotal,
    };

    try {
      const response = await fetch(`${baseUrl}/order/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        toast.success("Order created successfully");
        localStorage.removeItem("SelectedAddress");
        setShowSuccessOverlay(true);

        setTimeout(() => {
          setShowSuccessOverlay(false);
          window.location.href = "/";
        }, 2500);
      } else {
        toast.error("Failed to create order");
      }
    } catch (error) {
      toast.error("Error creating order");
      console.error(error);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + calculateTotalPrice(item),
    0
  );

  return (
    <>
      <Helmet>
        <script
          src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs"
          type="module"
        />
      </Helmet>
<ToastContainer />
      <NavBar />

      <div className="md:pt-10 px-4 md:pl-1 md:pr-5 max-w-7xl mx-auto">
      <div className='flex  pt-6 md:pt-10 items-center '>
        <ArrowLeft onClick={() => window.history.back()} />
        <h1 className=" md:text-2xl text-xl flex  items-center capitalize pl-4  py-2  font-bold text-left font-serif">
        Checkout
        </h1>
        </div>
      

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-4 md:mt-6">
          {/* Left Column - Address Section */}
          <div className="w-full md:w-2/3">
            <CheckoutAddress />
          </div>

          {/* Right Column */}
          <div className="w-full md:w-1/3">
            {/* Cart Items */}
            <div className="border rounded-xl bg-white shadow-sm">
              <div className="px-3 py-3 border-b">
                <h2 className="text-base md:text-lg font-bold font-serif">
                  Cart Items
                </h2>
              </div>
              <div className="max-h-[250px] overflow-y-auto px-3 md:px-5 py-4">
                {cartItems.map((item) => (
                  <div
                    key={item.productId._id}
                    className="flex items-start gap-3 md:gap-4 pb-4 mb-4 border-b last:border-b-0"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 border rounded-lg overflow-hidden flex-shrink-0 bg-white">
                      <img
                        src={`${ImgbaseUrl}${item.productId.productImages[0]}`}
                        alt={item.productId.productName}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base md:text-lg capitalize truncate">
                        {item.productId.productName}
                      </h3>
                      <p className="text-gray-600 text-xs md:text-sm mb-2">
                        Brand: {item.productId.brand}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs md:text-sm text-green-700">
                            Inclusive GST
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs md:text-sm line-through">
                              ₹{item.productId.strikePrice}
                            </span>
                            <span className="text-base md:text-lg font-semibold">
                              ₹{calculatePrice(item)}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs md:text-sm bg-gray-50 rounded-full px-3 md:px-5 py-1.5 border">
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="border mt-3 rounded-xl p-4 md:p-5 bg-white shadow-sm sticky bottom-0 md:relative">
              <h2 className="text-lg md:text-xl font-bold font-serif mb-4">
                Payment Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-medium">
                    <span className="text-green-600">Free Delivery</span>
                    <span className="line-through ml-2">₹50</span>
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold">₹{subtotal}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  className="w-full md:w-auto px-6 md:px-20 bg-blue-800/90 text-lg md:text-xl font-bold text-white py-2.5 md:py-3 rounded-full font-merr hover:bg-blue-900/90 transition-colors mt-4 md:mt-6"
                  onClick={createOrder}
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-neutral-900/90 flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-[300px] md:max-w-[500px]">
            {/* @ts-ignore */}
            <Player
      src={animationData} // Use the imported JSON data here
      background="transparent"
      style={{ width: '100%', height: 'auto', aspectRatio: '1/1' }}
      loop
      autoplay
    />
            <div className="flex justify-center items-center text-white">
              <p className="animate-success-text text-center font-merr">
                Order Placed Successfully
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
      @keyframes successText {
        0% {
          opacity: 0;
          transform: scale(0.8);
        }
        50% {
          opacity: 0.5;
          transform: scale(1.1);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      .animate-success-text {
        animation: successText 1s ease-out forwards;
        font-size: clamp(1rem, 4vw, 1.5rem);
      }

      @media (max-width: 768px) {
        dotlottie-player {
          max-height: 60vh;
        }
      }
    `}</style>
    </>
  );
};

export default Checkout;
