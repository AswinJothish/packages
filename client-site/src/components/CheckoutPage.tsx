import  { useEffect, useState } from 'react';
import { IoIosArrowUp } from "react-icons/io";
import { baseUrl, ImgbaseUrl } from '../lib/config';
import { toast } from 'react-toastify';

interface Address {
  _id: string;
  tag: string;
  address: {
    flatNumber: string;
    area: string;
    nearbyLandmark: string;
    receiverName: string;
    receiverMobileNumber: string;
  };
}

interface Product {
  _id: string;
  productName: string;
  brand: string;
  productImages: string[];
  strikePrice: number;
  customerPrice: number;
}

interface CartItem {
  _id: string;
  productId: Product;
  quantity: number;
}

const CheckoutPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAddressExpanded, setIsAddressExpanded] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const id = localStorage.getItem("_id");
    setUserId(id || '');
    const checkoutItems = JSON.parse(localStorage.getItem('checkoutItems') || '[]');
    setCartItems(checkoutItems);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${baseUrl}/users/get?id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.deliveryaddresse || []);
      } else {
        toast.error('Failed to fetch addresses');
      }
    } catch (error) {
      toast.error('Error fetching user data');
    }
  };

  const handleEditClick = (address: Address) => {
    setEditingAddress(address);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const updatedAddress = {
      _id: formData.get('edit-address-id') as string,
      tag: formData.get('edit-tag') as string,
      address: {
        flatNumber: formData.get('edit-flatNumber') as string,
        area: formData.get('edit-area') as string,
        nearbyLandmark: formData.get('edit-landmark') as string,
        receiverName: formData.get('edit-receiverName') as string,
        receiverMobileNumber: formData.get('edit-receiverMobileNumber') as string
      }
    };

    try {
      setIsEditDialogOpen(false);
      setEditingAddress(null);
      toast.success('Address updated successfully');
    } catch (error) {
      toast.error('Error updating address');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.productId.customerPrice * item.quantity), 0);
  };

  return (
    <div className="pt-10 px-5 max-w-7xl mx-auto">
      <h1 className="font-bold text-xl font-serif py-10">Checkout</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Addresses */}
        <div className="w-full md:w-2/3">
          <div className="px-5 bg-white rounded-xl shadow-sm">
            <div className="flex justify-between items-center py-4">
              <h2 className="text-xl font-bold font-serif">Delivery Address</h2>
              <button 
                onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <IoIosArrowUp className={`transform transition-transform duration-300 ${!isAddressExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {isAddressExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                {addresses.map((address) => (
                  <div key={address._id} className="border  rounded-xl p-4">
                    <div className="relative">
                      <div className="absolute top-0 right-0 flex gap-4">
                        <input 
                          type="radio" 
                          name="deliveryAddress" 
                          value={address._id} 
                          className="mt-1"
                        />
                        <button onClick={() => handleEditClick(address)}>
                          <img
                            src="/images/edit.png"
                            alt="edit"
                            className="w-5 h-5"
                          />
                        </button>
                      </div>
                      
                      <div className="flex gap-3">
                        <img
                          src="/images/location.png"
                          alt="location"
                          className="w-6 h-6 mt-1"
                        />
                        <div className="flex-1 pr-16">
                          <p className="font-bold text-lg font-serif">{address.tag}</p>
                          <p className="text-gray-600 py-1">
                            {address.address.flatNumber}, {address.address.area},
                            {address.address.nearbyLandmark}
                          </p>
                          <p className="text-gray-800">
                            {address.address.receiverName} - {address.address.receiverMobileNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Cart Summary */}
        <div className="w-full md:w-1/3 space-y-4">
          {/* Cart Items */}
          <div className="border rounded-xl p-4 bg-white shadow-sm">
            <h2 className="text-xl font-bold font-serif mb-4">Cart Items</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="w-24 h-24 border rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={`${ImgbaseUrl}${item.productId.productImages[0]}`}
                      alt={item.productId.productName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg capitalize">{item.productId.productName}</h3>
                    <p className="text-gray-600 text-sm">Brand: {item.productId.brand}</p>
                    <p className="text-sm mt-1">Quantity: {item.quantity}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-green-700">Inclusive GST</span>
                      <span className="text-gray-500 text-sm line-through">₹{item.productId.strikePrice}</span>
                      <span className="text-base font-semibold">₹{item.productId.customerPrice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border rounded-xl p-4 bg-white shadow-sm sticky top-24">
            <h2 className="text-xl font-bold font-serif mb-4">Payment Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{calculateTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Charges</span>
                <span className="font-medium">
                  <span className="text-green-600">Free Delivery</span>
                  <span className="line-through ml-2">₹50</span>
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">₹{calculateTotal()}</span>
                </div>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors mt-6">
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>

      {/* Edit Address Dialog */}
      {isEditDialogOpen && editingAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl mx-4">
            <h2 className="font-bold text-lg mb-4">Edit Delivery Address</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input type="hidden" name="edit-address-id" defaultValue={editingAddress._id} />
              
              <div>
                <label htmlFor="edit-tag" className="block text-sm font-medium text-gray-700">Tag</label>
                <input
                  type="text"
                  id="edit-tag"
                  name="edit-tag"
                  className="w-full px-4 py-2 border rounded mt-1"
                  defaultValue={editingAddress.tag}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-flatNumber" className="block text-sm font-medium text-gray-700">Flat Number</label>
                  <input
                    type="text"
                    id="edit-flatNumber"
                    name="edit-flatNumber"
                    className="w-full px-4 py-2 border rounded mt-1"
                    defaultValue={editingAddress.address.flatNumber}
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-area" className="block text-sm font-medium text-gray-700">Area</label>
                  <input
                    type="text"
                    id="edit-area"
                    name="edit-area"
                    className="w-full px-4 py-2 border rounded mt-1"
                    defaultValue={editingAddress.address.area}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="edit-landmark" className="block text-sm font-medium text-gray-700">Nearby Landmark</label>
                <input
                  type="text"
                  id="edit-landmark"
                  name="edit-landmark"
                  className="w-full px-4 py-2 border rounded mt-1"
                  defaultValue={editingAddress.address.nearbyLandmark}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-receiverName" className="block text-sm font-medium text-gray-700">Receiver Name</label>
                  <input
                    type="text"
                    id="edit-receiverName"
                    name="edit-receiverName"
                    className="w-full px-4 py-2 border rounded mt-1"
                    defaultValue={editingAddress.address.receiverName}
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-receiverMobileNumber" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                  <input
                    type="text"
                    id="edit-receiverMobileNumber"
                    name="edit-receiverMobileNumber"
                    className="w-full px-4 py-2 border rounded mt-1"
                    defaultValue={editingAddress.address.receiverMobileNumber}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingAddress(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;