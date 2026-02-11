import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ImgbaseUrl, baseUrl } from '../lib/config';
import { FaRegCircleXmark } from "react-icons/fa6";
import {toast} from "react-toastify"


const CartDrawer = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemsRemoved, setItemsRemoved] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const openDialog = (itemId:any) => {
    setSelectedItemId(itemId);
    setIsDialogOpen(true);
  }; 

  const handleCheckout = () => {
    localStorage.setItem('checkoutItems', JSON.stringify(cartItems));
    window.location.href = '/Checkout';
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedItemId(null);
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      setError(null);
      
      const _id = localStorage.getItem('_id');
      
      if (!_id) {
        setLoading(false);
        setError('not_authenticated');
        return;
      }

      try {
        const response = await fetch(`${baseUrl}/order/getCartItems?Id=${_id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }

        const data = await response.json();
        setCartItems(data.cart || []); 
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError('fetch_error');
      } finally {
        setLoading(false);
        setItemsRemoved(false);
      }
    };

    if (isOpen || itemsRemoved) {
      fetchCartItems();
    }
  }, [isOpen, itemsRemoved]); // Trigger refetch when itemsRemoved changes

  const handleQuantityChange = (e:any, itemId:any, maxStock:any) => {
    const quantity = parseInt(e.target.value, 10) || 1;

    if(quantity===0||null){
      e.target.value=1
    }
    // Set quantity limit based on stock
    if (quantity > maxStock) {
      toast.error(`Only ${maxStock} can be added to cart`)
     
      e.target.value = maxStock; 
    } 

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId ? { ...item, quantity } : item
      )
    );
  };
  const handleRemoveCartItem = async (Id:any) => {
    try {
      const _id = Id;
      const userId = localStorage.getItem('_id');
      const response = await fetch(`${baseUrl}/order/deleteCartItem?userId=${userId}&cartItemId=${_id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove cart item');
      } else {
        setItemsRemoved(true);
        setIsDialogOpen(false) 
      }

      toast.success('Item removed from cart successfully')
    } catch (err) {
      toast.error('Error removing cart item:', err);
      setError('fetch_error');
    }
  };

  const getPriceByRoleAndQuantity = (item:any) => {
    const { customerPrice, dealerPrice, offers } = item.productId;
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userRole = userData?.role;
  
    // Set the default price based on the role if no offers are available
    let applicablePrice = userRole === "dealer" ? dealerPrice : customerPrice;
  
    if (offers && offers.length > 0) {
      const sortedOffers = [...offers].sort((a, b) => a.from - b.from); // Ensure offers are sorted by 'from'
  
      // Find the applicable offer within the quantity range
      let matchedOffer = null;
      for (let offer of sortedOffers) {
        if (item.quantity >= offer.from && item.quantity <= offer.to) {
          matchedOffer = offer;
        }
      }
  
      // If an offer within range was found, use its price
      if (matchedOffer) {
        applicablePrice = userRole === "dealer" ? matchedOffer.dealerPrice : matchedOffer.customerPrice;
      } else {
        // If quantity is higher than all ranges, use the price of the last (highest) offer
        const lastOffer = sortedOffers[sortedOffers.length - 1];
        if (item.quantity >= lastOffer.from) {
          applicablePrice = userRole === "dealer" ? lastOffer.dealerPrice : lastOffer.customerPrice;
        }
      }
    }
  
    return applicablePrice;
  };
  
  
  const handleLoginRedirect = () => {
    window.location.href = '/Login';
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading your cart...</div>
        </div>
      );
    }

    if (error === 'not_authenticated') {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-gray-600 text-center">
            Please login to view your cart items
          </p>
          <button
            onClick={handleLoginRedirect}
            className="px-6 py-2 bg-blue-900/90 rounded-xl text-white  hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </div>
      );
    }

    if (error === 'fetch_error') {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500 text-center">
            Something went wrong. Please try again later.
          </p>
        </div>
      );
    }

    if (cartItems.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item._id} className="flex justify-center items-center gap-4 border-b pb-2 overflow-x-hidden">
            <div className="w-24 border flex p-1 h-20 rounded-lg overflow-hidden">
              <img
                src={`${ImgbaseUrl}${item.productId.productImages[0]}`} 
                alt={item.productId.productName}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex w-full justify-between">
              <div>
              <h3 className="overflow-hidden  text-base text-ellipsis capitalize whitespace-nowrap">
  {item.productId.productName.length > 20 
    ? item.productId.productName.slice(0, 20) + "..." 
    : item.productId.productName}
</h3>
                <p className="text-gray-500 text-base">Brand : {item.productId.brand}</p>
                <p className="text-sm">
                  <span className="text-green-700 pr-2">Inclusive GST </span>
                  <span className="line-through font-thin text-gray-500">&#8377; {item.productId.strikePrice}</span>
                </p>
                <p className="text-gray-800">Rs. {getPriceByRoleAndQuantity(item)}</p>
              </div>
              <div className="flex justify-between flex-col items-center">
                <div onClick={() => openDialog(item._id)} className="text-neutral-400">
                  <FaRegCircleXmark />
                </div>
                <div>
                    
  <input 
  type='number'
  min={1}
  
    className="w-16 rounded-full border border-gray-300 shadow text-center h-7" 
    defaultValue={item.quantity} 
    onChange={(e) => handleQuantityChange(e, item._id, item.productId.stock)}
  />
</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const calculateTotal = () => {
    if (!cartItems.length) return 0;
    return cartItems.reduce((total, item) => total + (item.productId.customerPrice * item.quantity), 0);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 top-14 transition-opacity z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-14 h-full md:w-96 w-5/6 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center  justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-scroll">
          {renderContent()}
        </div>

        {cartItems.length > 0 && !error && !loading && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
              <h2 className="md:text-xl text-lg py-3 font-bold font-serif">Payment Summary</h2>
        
          <div className="flex justify-between py-1">
            <span className="text-gray-500 font-sans">Order Total</span>
            <span className="text-gray-500 font-sans">₹ {calculateTotal()}</span>
          </div>
              <div className="flex justify-between py-1">
            <span className="text-gray-500 font-sans">Delivery Charges</span>
            <span className="whitespace-nowrap"><span className='text-green-600 text-sm md:text-base font-sans'>Free Delivery</span> <span className='line-through font-sans text-gray-500 text-sm md:text-base whitespace-nowrap'>₹ 50</span> </span>
          </div>
            <div className="flex justify-between items-center py-4 mt-2 border-t ">
              <span className="font-semibold font-serif">Total</span>
              <span className="font-semibold font-sans">₹ {calculateTotal()}</span>
            </div>
            <button  onClick={handleCheckout}  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Checkout
            </button>
          </div>
        )}
      </div>
      {isDialogOpen && (
        <div className="absolute w-full h-[100vh] inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
           
            <p className="text-neutral-700 mb-6">Do you want to remove this item from the cart?</p>
            <div className="flex justify-around">
              <button
                onClick={()=>{handleRemoveCartItem(selectedItemId)}}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Remove
              </button>
              <button
                onClick={closeDialog}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartDrawer;
