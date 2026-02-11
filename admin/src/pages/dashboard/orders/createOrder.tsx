import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { _axios } from "@/lib/_axios";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { FaCartPlus } from "react-icons/fa";

import { toast } from 'sonner';
// import { useForm} from 'react-hook-form';
import { useNavigate } from 'react-router-dom';


interface AddressData {
  tag?: string;
  flatNumber?: string;
  area?: string;
  nearbyLandmark?: string;
  receiverName?: string;
  receiverMobileNumber?: string;
}

interface Product {
  id: string;
  brand: string;
}


export default function CreateOrder() {
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>("");
  const [brandSearchTerm, setBrandSearchTerm] = useState<string>("");
  const [productSearchTerm, setProductSearchTerm] = useState<string>("");
  const [brands, setBrands] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProductsByBrand, setFilteredProductsByBrand] = useState<any[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<string[]>([]);

  const [isCustomerScrollOpen, setIsCustomerScrollOpen] = useState<boolean>(false);
  const [isBrandScrollOpen, setIsBrandScrollOpen] = useState<boolean>(false);
  const [isProductScrollOpen, setIsProductScrollOpen] = useState<boolean>(false);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCustomerRole, setSelectedCustomerRole] = useState<String>('');
  //console.log(selectedCustomerRole)
  const customerScrollRef = useRef<HTMLDivElement>(null);
  const brandScrollRef = useRef<HTMLDivElement>(null);
  const productScrollRef = useRef<HTMLDivElement>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  //console.log(cartItems)
  const [quantity, setQuantity] = useState<number>();
  const navigate = useNavigate();
  const [checkedItems, setCheckedItems] = useState(new Array(cartItems.length).fill(true));
  //@ts-ignore
  const [showPopup, setShowPopup] = useState(false);
  //@ts-ignore
  const [itemToRemove, setItemToRemove] = useState(null);
  //@ts-ignore
  const [itemIndexToRemove, setItemIndexToRemove] = useState(null);
  //@ts-ignore
  const [address, setAddress] = useState([]);
  const [addressChanged, setAddressChanged] = useState(false)
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
 // console.log(selectedAddress)
 const [mobileNumberError, setMobileNumberError] = useState("");//for dialog reciever
  const [mobileError, setMobileError] = useState('');//for address select

  const [addAddressOpen, setAddAddressOpen] = useState(false)
  const [selectedAddressData, setSelectedAddressData] = useState<AddressData>({});
  const [isEditing, setIsEditing] = useState(false)
  const [addressTag, setAddressTag] = useState("");
  //@ts-ignore
  const [editedAddress, setEditedAddress] = useState({
    flatNumber: "",
    area: "",
    nearbyLandmark: "",
    receiverName: "",
    receiverMobileNumber: "",
  });
  const [addresses, setAddresses] = useState([
    {
      tag: '',
      flatNumber: '',
      area: '',
      nearbyLandmark: '',
      receiverName: '',
      receiverMobileNumber: ''
    }
  ]);

 

  const handleAddressInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
  
    if (name === "receiverMobileNumber") {
    
      if (!/^\d*$/.test(value)) {
        return;
      }
  
      if (value.length < 10) {
        setMobileNumberError("Mobile number should have at least 10 digits.");
      }
      else if (value.length > 10) {
        setMobileNumberError("Mobile number should not exceed 10 digits.");
        return;
      }
      else if (value.length === 10) {
        setMobileNumberError("");
      }
    }
  
    const updatedAddresses = [...addresses];
    updatedAddresses[index] = { ...updatedAddresses[index], [name]: value };
    setAddresses(updatedAddresses);
  };
  

  // const form = useForm({
  //   defaultValues: {
  //     addresses: [
  //       { tag: "", flatNumber: "", area: "", nearbyLandmark: "", receiverName: "", receiverMobileNumber: "" },
  //     ],
  //   },
  // });


  // const handleInputChange = (field: string, value: string) => {
  //   setEditedAddress((prevAddress) => ({
  //     ...prevAddress,
  //     [field]: value,
  //   }));
  //};
  // useEffect(() => setEditedAddress(selectedAddressData), [selectedAddressData]);

  useEffect(() => {
    if (isEditing || isEditing) {
      setAddressTag(selectedAddress || "");
    }
  }, [isEditing, selectedAddress, isEditing]);



  const [deliveryCharges, setDeliveryCharges] = useState<number>(0);
  useEffect(() => {
    setCheckedItems(new Array(cartItems.length).fill(true));
  }, [cartItems]);

  const { data: customersData, isLoading: customersLoading, refetch: refetchCustomerData } = useQuery({
    queryKey: ["users", customerSearchTerm],
    queryFn: () => _axios.get(`/users/all?q=${customerSearchTerm}`).then(res => res.data.users),
    enabled: isCustomerScrollOpen,
  });

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: () => _axios.get(`/products/all`).then(res => res.data.products),
  });

  useEffect(() => {
    if (customersData && selectedCustomer) {
      const updatedCustomer = customersData.find((customer: { username: any; mobileNumber: any; }) =>
        customer.username === selectedCustomer.username ||
        customer.mobileNumber === selectedCustomer.mobileNumber
      );

      if (updatedCustomer) {
        setAddress(updatedCustomer.deliveryAddress);
      }
    }
  }, [customersData, selectedCustomer]);

  useEffect(() => {
    if (addressChanged) {
      console.log("Address changed, refetching customer data...");
      refetchCustomerData();
      setAddressChanged(false);
    }
  }, [addressChanged]);

  useEffect(() => {
    if (productsData) {
      const brandsSet = new Set<string>(productsData.map((product: Product) => product.brand));
      setBrands(Array.from(brandsSet));
      setProducts(productsData);
      setFilteredProductsByBrand(productsData);
    }
  }, [productsData]);

 
  useEffect(() => {
    let updatedFilteredProducts = products;
    updatedFilteredProducts = updatedFilteredProducts.filter(
      (product) =>
        product.productName.toLowerCase().includes(productSearchTerm.toLowerCase())
    );
    if (selectedBrand) {
      updatedFilteredProducts = updatedFilteredProducts.filter(
        (product) => product.brand.toLowerCase() === selectedBrand.toLowerCase()
      );
    }
    if (!brandSearchTerm.trim()) {
      updatedFilteredProducts = products.filter(
        (product) =>
          product.productName.toLowerCase().includes(productSearchTerm.toLowerCase())
      );
    }

    setFilteredProductsByBrand(updatedFilteredProducts);
  }, [selectedBrand, productSearchTerm, products, brandSearchTerm]);

  useEffect(() => {

    const updatedFilteredBrands = brands.filter((brand) =>
      (brand || "").toLowerCase().includes(brandSearchTerm.toLowerCase())
    );
    setFilteredBrands(updatedFilteredBrands);
  }, [brandSearchTerm, brands]);

  const handleCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerSearchTerm(e.target.value);
  };

  const handleBrandInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrandSearchTerm(e.target.value);
  };

  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductSearchTerm(e.target.value);
  };

  const handleInputClick = (inputType: 'customer' | 'brand' | 'product') => {
    if (inputType === 'customer') {
      setIsCustomerScrollOpen(true);
      setIsBrandScrollOpen(false);
      setIsProductScrollOpen(false);
    } else if (inputType === 'brand') {
      setIsCustomerScrollOpen(false);
      setIsBrandScrollOpen(true);
      setIsProductScrollOpen(false);
    } else if (inputType === 'product') {
      setIsCustomerScrollOpen(false);
      setIsBrandScrollOpen(false);
      setIsProductScrollOpen(true);
    }
  };

  const handleCustomerSelect = (user: any) => {
    setSelectedCustomer(user);
    setSelectedCustomerRole(selectedCustomer.role)
    setAddress(user.deliveryAddress);
    setCustomerSearchTerm(user.username || user.mobileNumber);
    setIsCustomerScrollOpen(false);
  };
  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setBrandSearchTerm(brand);
    setProductSearchTerm("");
    setSelectedProduct(null);
    setIsBrandScrollOpen(false);
  };
  // const refreshCustomerData = () => {
  //   refetchCustomerData(); 
  // };
  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setProductSearchTerm(product.productName);
    setIsProductScrollOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      customerScrollRef.current &&
      !customerScrollRef.current.contains(event.target as Node)
    ) {
      setIsCustomerScrollOpen(false);
    }
    if (
      brandScrollRef.current &&
      !brandScrollRef.current.contains(event.target as Node)
    ) {
      setIsBrandScrollOpen(false);
    }
    if (
      productScrollRef.current &&
      !productScrollRef.current.contains(event.target as Node)
    ) {
      setIsProductScrollOpen(false);
    }
  };
  const handleAddToCart = (selectedProduct: any) => {
    const quantityToAdd = quantity || 1;
    if (selectedProduct) {
      setCartItems([...cartItems, { ...selectedProduct, quantity: quantityToAdd }]);
      setSelectedProduct(null);
      setQuantity(1);
      setProductSearchTerm("");
      setBrandSearchTerm("")
    }
  };

  // const calculateSubtotal = () => {
  //   return cartItems.reduce((acc, item) => acc + item.customerPrice * item.quantity, 0);
  // };
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = getPriceBasedOnQuantity(item.quantity, item.offers, selectedCustomerRole);
      return total + price * item.quantity;
    }, 0);
  };
  

  // const calculateTax = (subtotal: number) => {
  //   return subtotal * 0.1;
  // };


  const calculateGrandTotal = (subtotal: number, deliveryCharges: number) => {
    return subtotal + deliveryCharges;
  };
  // const removeCartItem = (index: number) => {
  //   const updatedCart = cartItems.filter((_, i) => i !== index);
  //   setCartItems(updatedCart);
  // };

  const updateCartQuantity = (index: number, newQuantity: number) => {
    const updatedCart = cartItems.map((item, i) =>
      i === index ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
  };
  const handleCartQuantityChange = (index:number, newQuantity:number) => {
    const stock = cartItems[index].stock; // Assuming each cart item has a 'stock' field
  
    if (newQuantity > stock) {
      toast.error(`Only ${stock} quantity is available in stock`);
      updateCartQuantity(index, stock); // Limit the quantity to the available stock
    } else {
      updateCartQuantity(index, Math.max(newQuantity, 1));
    }
  };

  const handleCheckboxChange = (index: any, item: any) => {
    const newCheckedItems = [...checkedItems];
    
    // Toggle the checkbox state
    newCheckedItems[index] = !newCheckedItems[index];
    
    console.log("Item clicked:", item);
    
    if (!newCheckedItems[index]) {
      // If the checkbox is unchecked after toggling, remove the item from the cart
      const updatedCartItems = cartItems.filter((_, i) => i !== index);
      setCartItems(updatedCartItems);
  
      // Update the checkedItems state to remove the checkbox state for the removed item
      const updatedCheckedItems = newCheckedItems.filter((_, i) => i !== index);
      setCheckedItems(updatedCheckedItems);
  
      // Set selectedBrand and selectedProduct to null when the item is unchecked
      setBrandSearchTerm("")
      setProductSearchTerm("")
      setSelectedBrand(null);
      setSelectedProduct(null);
    } else {
      // Update the checkedItems state
      setCheckedItems(newCheckedItems);
    }
  };
  
  

  // const handleCancel = () => {
  //   setItemToRemove(null);
  //   setItemIndexToRemove(null);
  //   setShowPopup(false);
  // };
  // const handleEditAddress = () => {
  //   setIsEditing(true);
  // };

  // const handleRemove = () => {
  //   if (itemIndexToRemove !== null) {
  //     const updatedCart = cartItems.filter((_, i) => i !== itemIndexToRemove);
  //     setCartItems(updatedCart);
  //     setCheckedItems(checkedItems.filter((_, i) => i !== itemIndexToRemove));
  //   }
  //   handleCancel();
  // };

  const handleAddressboxChange = (field: keyof AddressData, value: string) => {
    if (field === 'tag') {
      setAddressTag(value);
    } else {
      if (field === 'receiverMobileNumber') {
        if (value && !/^\d*$/.test(value)) { 
          return; // Return if the value is not a valid number
        } else if (value.length < 10) { // Change < 9 to < 10
          setMobileError("Minimum 10 digits required.");
          setSelectedAddressData((prevData) => ({
            ...prevData,
            [field]: value, 
          }));
          return;
        } else if (value.length > 10) { 
          setMobileError("Only 10 digits are allowed.");
          setSelectedAddressData((prevData) => ({
            ...prevData,
            [field]: value.slice(0, 10), 
          }));
          return;
        } else if (value.length === 10) {
          setMobileError(""); // Clear error message if length is exactly 10
        }
      }
  
      // Update the selected address data for other fields
      setSelectedAddressData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
    }
  };
  
  const transformAddressData = (data: any) => {

    if (!data) {
      console.error("Invalid address data provided");
      return null;
    }

    return {
      tag: data.tag || "",
      flatNumber: data.flatNumber || "",
      area: data.area || "",
      nearbyLandmark: data.nearbyLandmark || "",
      receiverName: data.receiverName || "",
      receiverMobileNumber: data.receiverMobileNumber || "",
    };
  };
  const handleSaveAddress = async (event: React.FormEvent) => {
    event.preventDefault();
  
    try {
      if (selectedAddressIndex === null) {
        toast.error("Please select an address to update.");
        return;
      }
  
      const addressItem = selectedCustomer.deliveryAddress[selectedAddressIndex];
      if (!addressItem) {
        toast.error("Selected address not found.");
        return;
      }
  
      const addressId = addressItem._id;
      if (!addressId) {
        toast.error("Address ID not found.");
        return;
      }
  
      const transformedAddressData = transformAddressData(selectedAddressData);
  
      if (
        !addressTag ||
        !transformedAddressData?.flatNumber ||
        !transformedAddressData?.area ||
        !transformedAddressData?.nearbyLandmark ||
        !transformedAddressData?.receiverName ||
        !transformedAddressData?.receiverMobileNumber
      ) {
        toast.error("Please fill all fields in the address.");
        return; 
      }
  
      const addressPayload = {
        userId: selectedCustomer._id,
        address: {
          _id: addressId,
          tag: addressTag,
          flatNumber: transformedAddressData.flatNumber,
          area: transformedAddressData.area,
          nearbyLandmark: transformedAddressData.nearbyLandmark,
          receiverName: transformedAddressData.receiverName,
          receiverMobileNumber: transformedAddressData.receiverMobileNumber,
        },
      };
  
      console.log("Payload to send:", addressPayload);
  
      const apiResponse = await _axios.put("/orders/editAddress", addressPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (apiResponse.status !== 200) {
        throw new Error("Failed to update the address");
      }
  
      console.log("Address updated successfully:", apiResponse.data);
      toast.success("Address updated successfully!");
      setAddressChanged(true);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Error updating address. Please try again.");
    }
  };
  


  useEffect(() => {
    if (customersData && selectedCustomer) {
      const updatedCustomer = customersData.find((customer: { username: any; mobileNumber: any; }) =>
        customer.username === selectedCustomer.username ||
        customer.mobileNumber === selectedCustomer.mobileNumber
      );

      if (updatedCustomer) {
        setSelectedCustomer(updatedCustomer);
        setSelectedCustomerRole(updatedCustomer.role);
        setAddress(updatedCustomer.deliveryAddress);
      }
    }
  }, [customersData, selectedCustomer]);



  useEffect(() => {
    if (addressChanged) {
      console.log("Address changed, refetching customer data...");
      refetchCustomerData();
      setAddressChanged(false);
    }
  }, [addressChanged]);


  const handlePlaceOrder = async () => {
    try {
      let finalAddressData = { ...selectedAddressData };
  
      if (selectedCustomer && selectedAddress) {
         finalAddressData = {
          ...finalAddressData,
          tag: selectedAddress, 
          ...Object.fromEntries(
            Object.entries(editedAddress).filter(
              ([_, value]) => value !== "" && value !== undefined
            )
          ),
        };
  
        console.log("Final Address Data after merge:", finalAddressData);
  
        const requiredFields: string[] = [
          "tag",
          "flatNumber",
          "area",
          "nearbyLandmark",
          "receiverName",
          "receiverMobileNumber",
        ];
  
        const isEmptyFieldPresent = requiredFields.some(
          (field) =>
            !finalAddressData[field as keyof typeof finalAddressData] ||
            finalAddressData[field as keyof typeof finalAddressData]?.toString().trim() === ""
        );
  
        if (isEmptyFieldPresent) {
          toast.error("Please fill all fields in the address.");
          return;
        }
  
        const deliveryAddress = {
          [selectedAddress]: finalAddressData,
        };
  
        const updatedAddress = {
          ...selectedCustomer.deliveryAddress,
          ...deliveryAddress,
        };
  
        const updatedCustomer = {
          ...selectedCustomer,
          deliveryAddress: updatedAddress,
        };
  
        setSelectedCustomer(updatedCustomer);
        console.log("Updated Address:", updatedAddress);
      } else {  toast.error("Please select an address.");
        return;
      }
      const orderDetails = {
        orderedBy: "Admin",
        customerId: selectedCustomer?._id,
        orderDate: new Date().toLocaleDateString(),
        products: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        grandTotal: calculateGrandTotal(calculateSubtotal(), deliveryCharges),
        deliveryCharges,
        deliveryAddress: {
          [selectedAddress]: finalAddressData,      },
      };
  
      console.log("Order Details:", orderDetails);
  
      const response = await _axios.post("/orders/createOrder", orderDetails);
  
      if (response.status === 201) {
        toast.success("Order placed successfully");
        navigate("/admin/orders");
      } else {
        toast.error("Failed to place order");
      }
    } catch (error: any) {
      console.error("Error creating order:", error.message);
      toast.error("Failed to create order");
    }
  };
  
  
  
  const onSubmit = async () => {
    if (!addresses || addresses.length === 0) {
      console.error("Addresses is undefined or empty");
      toast.error("Please provide at least one address.");
      return;
    }
  
    try {
      for (const address of addresses) {
      
        if (
          !address.tag ||
          !address.flatNumber ||
          !address.area ||
          !address.nearbyLandmark ||
          !address.receiverName ||
          !address.receiverMobileNumber
        ) {
          toast.error("Please fill all the fields of the address.");
          return; 
        }
  
        const payload = {
          customerId: selectedCustomer._id,
          tag: address.tag,
          address: {
            flatNumber: address.flatNumber,
            area: address.area,
            nearbyLandmark: address.nearbyLandmark,
            receiverName: address.receiverName,
            receiverMobileNumber: address.receiverMobileNumber,
          },
        };
  
        const response = await _axios.post("/users/AddAddress", payload);
  
        toast.success(`Address for tag '${address.tag}' added successfully!`);
        console.log("Response:", response.data);
      }
  
      setAddressChanged(true);
      setAddAddressOpen(false);
    } catch (error: any) {
      console.error("Error adding address:", error);
      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
      toast.error(errorMessage);
    }
  };
  
  const getPriceBasedOnQuantity = (quantity:any, offers:any, role:any) => {
    // Find the applicable offer based on the quantity
    const applicableOffer = offers.find((offer:any) => quantity >= offer.from && quantity <= offer.to);
    
    // If an applicable offer is found, return the price based on the role
    if (applicableOffer) {
      return role === 'dealer' ? applicableOffer.dealerPrice : applicableOffer.customerPrice;
    }
    
    // If no specific offer is found, use the last available offer if the quantity exceeds the range
    const lastOffer = offers[offers.length - 1];
    if (lastOffer && quantity > lastOffer.to) {
      return role === 'dealer' ? lastOffer.dealerPrice : lastOffer.customerPrice;
    }
    
    // If no offer is applicable, return the default price
    // return role === 'dealer' ? defaultDealerPrice : defaultCustomerPrice;
  };
  const handleQuantityChange = (e:any) => {
    const enteredQuantity = Number(e.target.value);
    const stock = selectedProduct.stock; // Assuming selectedProduct has a stock field
  
    if (enteredQuantity > stock) {
      toast.error(`Only ${stock} quantity can be added to the cart`);
      setQuantity(stock); // Limit the quantity to the available stock
    } else {
      setQuantity(enteredQuantity);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-5">
        <div className="bg-white shadow flex flex-row justify-between px-5 py-5 h-16 items-center">
          <div className="text-lg font-bold w-full">
            
            <h1 className="w-full text-blue-500">Create Order</h1>
          </div>
          <div>
            <Button className="bg-blue-500 p-1 text-sm rounded text-white hover:bg-blue-800">
              Create New Customer
            </Button>
          </div>
        </div>

        <div className="mx-5">
          <div className="px-2 my-5 rounded-md mx-2 shadow-xl border">
            <div className="flex justify-between px-4 py-5">


            <div className="relative flex flex-col justify-start">
  <h1 className="text-base text-gray-500">Select a Customer</h1>
  <div className="flex gap-2 mt-5 flex-col">
    {selectedCustomer ? (
      // Display the selected customer's name when a customer is selected
      <div className="text-sm border-blue-100 w-[200px] h-8 flex items-center px-2 bg-gray-100 rounded">
        <span>{selectedCustomer.username || selectedCustomer.userid}</span>
      </div>
    ) : (
      // Show the input field for searching customers if no customer is selected
      <Input
        type="text"
        onClick={() => handleInputClick('customer')}
        onChange={handleCustomerInputChange}
        value={customerSearchTerm}
        className="text-sm border-blue-100 focus-visible:ring-2 focus-visible:none focus-visible:ring-offset-0 focus-visible:none w-[200px] h-8"
        placeholder="Search Customer..."
      />
    )}
    {isCustomerScrollOpen && !selectedCustomer && (
      <div
        ref={customerScrollRef}
        className="absolute text-sm z-10 mt-12 w-full bg-white border border-gray-300 shadow-md rounded-md"
        style={{ maxHeight: "20vh", overflowY: "auto", maxWidth: "200px" }}
      >
        <ScrollArea className="h-full">
          <div className="p-4">
            {customersLoading ? (
              <div>Loading...</div>
            ) : customersData.length > 0 ? (
              customersData.map((user: any) => (
                <div
                  key={user._id}
                  className="cursor-pointer"
                  onClick={() => handleCustomerSelect(user)}
                >
                  <div className="flex justify-between">
                    <span>{user?.username || user?.userid}</span>
                    <span>-</span>
                    <span>{user.mobileNumber}</span>
                  </div>
                  <Separator className="my-2" />
                </div>
              ))
            ) : (
              <div>No customers found</div>
            )}
          </div>
        </ScrollArea>
      </div>
    )}
  </div>
</div>


              <div className="relative flex flex-col justify-start">
                <h1 className="text-base text-gray-500">Select a Brand</h1>
                <div className="flex gap-2 mt-5 flex-col">
                  <Input
                    type="text"
                    onChange={handleBrandInputChange}
                    onClick={() => handleInputClick('brand')}
                    value={brandSearchTerm}
                    className="text-sm border-blue-100 focus-visible:ring-2 focus-visible:none focus-visible:ring-offset-0 focus-visible:none w-[200px] h-8"
                    placeholder="Search Brand..."
                  />
                  {isBrandScrollOpen && (
                    <div
                      ref={brandScrollRef}
                      className="absolute text-sm z-10 mt-12 w-full bg-white border border-gray-300 shadow-md rounded-md"
                      style={{ maxHeight: "20vh", overflowY: "auto", maxWidth: "200px" }}
                    >
                      <ScrollArea className="h-full">
                        <div className="p-4">
                          {filteredBrands.length > 0 ? (
                            filteredBrands.map((brand) => (
                              <div
                                key={brand}
                                className="cursor-pointer"
                                onClick={() => handleBrandSelect(brand)}
                              >
                                {brand}
                                <Separator className="my-2" />
                              </div>
                            ))
                          ) : (
                            <div>No brands found</div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </div>


              <div className="relative flex flex-col justify-start">
                <h1 className="text-base text-gray-500">Select a Product</h1>
                <div className="flex gap-2 mt-5 flex-col">
                  <Input
                    type="text"
                    onChange={handleProductInputChange}
                    onClick={() => handleInputClick('product')}
                    value={productSearchTerm}
                    className="text-sm border-blue-100 focus-visible:ring-2 focus-visible:none focus-visible:ring-offset-0 focus-visible:none w-[200px] h-8 placeholder:"
                    placeholder="Search Product..."
                  />
                  {isProductScrollOpen && (
                    <div
                      ref={productScrollRef}
                      className="absolute text-sm z-10 mt-12 w-full bg-white border border-gray-300 shadow-md rounded-md"
                      style={{ maxHeight: "20vh", overflowY: "auto", maxWidth: "200px" }}
                    >
                      <ScrollArea className="h-full">
                        <div className="p-4">
                          {filteredProductsByBrand.length > 0 ? (
                            filteredProductsByBrand.map((product) => (
                              <div
                                key={product._id}
                                className="cursor-pointer"
                                onClick={() => handleProductSelect(product)}
                              >
                                <div className='flex justify-between'>
                                  <span>{product.productName}</span>

                                </div>
                                <Separator className="my-2" />
                              </div>
                            ))
                          ) : (
                            <div>No products found</div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                 
                </div>
              </div>
              {selectedProduct && (

<div className="flex items-end space-x-4">
  <Input
    type="number"
    value={quantity}
    onChange={handleQuantityChange}
    className="text-sm w-16 h-8 border-blue-100 placeholder:text-sm"
    placeholder='Qty'
  />
  <Button
    onClick={() => handleAddToCart(selectedProduct)}
    className="bg-indigo-500 flex items-center gap-1 text-white text-sm px-1 py-1 h-8 rounded"
    disabled={!quantity || quantity <= 0}
  >
    <FaCartPlus className='text-sm' />
    Add To Cart
  </Button>
</div>

)}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-full">
        {cartItems.length > 0 && (
          <div className="w-full flex flex-col items-center">
            <div className="w-5/6 mb-2">
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-muted/80 mb-5">
                  <div className="grid gap-0.5 mr-5">
                    <CardTitle className="text-md">Order Summary</CardTitle>
                    <hr />
                    <CardDescription className='text-sm'>Date: {new Date().toLocaleDateString()}</CardDescription>
                  </div>

                  <div >
                    <CardTitle className="text-base font-semibold">Customer Info</CardTitle>
                    <div className='flex flex-col gap-0'>
                      <div>

                        <CardDescription className='flex'>
                          <div className="grid grid-cols-2 gap-x-3">
                            <div className="font-medium text-sm text-gray-700">Customer Name</div>
                            <div className="col-span-1 text-sm text-gray-600">: {selectedCustomer?.username || selectedCustomer?.userid}</div>

                            <div className="font-medium text-sm text-gray-700">Mobile</div>
                            <div className="col-span-1 text-sm text-gray-600">: {selectedCustomer?.mobileNumber}</div>
                          </div>
                        </CardDescription>
                      </div>
                      <div>

                      </div>


                    </div>
                    {/* <div className='flex gap-5'>
                    <div className="relative mt-4">
                      <Label className="absolute text-[11px] text-neutral-600 -top-2 left-1 px-1  z-10 bg-white rounded">
                        Reciever's Name
                      </Label>
                      <Input
                       value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                        className="block w-full p-2 h-7   text-sm text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                      />
                    </div>
                    <div className="relative mt-4">
                      <Label className="absolute text-[11px] text-neutral-600 -top-2 left-1 px-1 bg-white rounded z-10">
                        Reciever's Mobile
                      </Label>
                      <Input
                      value={receiverMobile}
                      onChange={(e) => setReceiverMobile(e.target.value)}
                        className="block w-full p-2 h-7   text-sm text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                      />
                    </div>
                    </div> */}

                  </div>


                </CardHeader>
                <div className='px-5 pb-5'>
                  <CardTitle className="flex w-full items-center gap-2"><span className='text-sm w-1/5 text-gray-700 mr-10'> Delivery Address:</span>
                    <span className='flex  w-full justify-between items-center '>
                      <span className='grid grid-cols-5 gap-4'>
                        {Array.isArray(selectedCustomer?.deliveryAddress) &&
                          selectedCustomer.deliveryAddress.map((addressItem: any, index: any) => {
                            return (
                              <div key={index} className="flex flex-row items-center justify-between">
                                <div className="flex items-center ">
                                  <input
                                    type="checkbox"
                                    id={`address-${index}`}
                                    checked={selectedAddressIndex === index}
                                    onChange={() => {
                                      setSelectedAddress(addressItem.tag);
                                      setSelectedAddressIndex(index);
                                      setSelectedAddressData(addressItem.address);
                                      setIsEditing(true);
                                    }}
                                    className="mr-2"
                                  />
                                  <label htmlFor={`address-${index}`} className="text-sm capitalize">{addressItem.tag}</label>
                                </div>
                              </div>
                            );
                          })
                        }
                      </span>

                      <span>

                        {selectedAddress && (
                          isEditing ? <button onClick={() => { setIsEditing(false) }} className='text-white bg-orange-500 p-1 rounded text-sm'>Cancel</button> : <button onClick={() => { setIsEditing(true) }} className='text-white bg-orange-500 p-1 rounded text-sm'>Edit</button>
                        )}
                        <button
                          className="text-sm p-1 ml-2 bg-green-600 text-white rounded"
                          onClick={() => {
                            //const deliveryAddressCount = Object.keys(selectedCustomer.deliveryAddress).length;
                            setAddAddressOpen(true)
                          }}
                        >
                          Add new
                        </button>

                        <Dialog open={addAddressOpen} onOpenChange={setAddAddressOpen}>
                          <DialogContent className="bg-white p-4 rounded-md shadow-lg max-w-5xl max-h-[600px] overflow-scroll">
                            <DialogHeader>
                              <DialogTitle className="text-center font-bold text-blue-500 mb-5">
                                Add New Address
                              </DialogTitle>
                              <DialogDescription>
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    onSubmit();
                                  }}
                                  className="space-y-4 flex items-center justify-center flex-col w-full"
                                >
                                  {addresses.map((address, index) => (
                                    <div
                                      key={index}
                                      className="relative grid grid-cols-1 gap-4 px-10 py-3 border rounded-md border-gray-200 shadow"
                                    >
                                      <div className="absolute top-0 left-3 -translate-y-1/2 w-fit bg-white px-3 text-sm text-slate-400">
                                        Address {index + 1}
                                      </div>
                                      <div className="mt-5 grid grid-cols-4 gap-5">
                                        <div className="relative">
                                          <label className="absolute text-sm text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                                            Address Label
                                          </label>
                                          <input
                                            name="tag"
                                            value={address.tag}
                                            onChange={(event) => handleAddressInputChange(index, event)}
                                            className="block w-full p-2 h-10 text-sm placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                                            placeholder="Eg: Home, Office..."
                                          />
                                        </div>
                                        <div className="relative">
                                          <label className="absolute text-sm text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                                            Flat Number
                                          </label>
                                          <input
                                            name="flatNumber"
                                            value={address.flatNumber}
                                            onChange={(event) => handleAddressInputChange(index, event)}
                                            className="block w-full p-2 h-10 text-sm placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                                            placeholder="No.76A"
                                          />
                                        </div>
                                        <div className="relative">
                                          <label className="absolute text-sm text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                                            Area
                                          </label>
                                          <input
                                            name="area"
                                            value={address.area}
                                            onChange={(event) => handleAddressInputChange(index, event)}
                                            className="block w-full p-2 h-10 text-sm placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                                            placeholder="Eg: Sector 15A..."
                                          />
                                        </div>
                                        <div className="relative">
                                          <label className="absolute text-sm text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                                            Landmark
                                          </label>
                                          <input
                                            name="nearbyLandmark"
                                            value={address.nearbyLandmark}
                                            onChange={(event) => handleAddressInputChange(index, event)}
                                            className="block w-full p-2 h-10 text-sm placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                                            placeholder="Eg: Near Central Park..."
                                          />
                                        </div>
                                        <div className="relative">
                                          <label className="absolute text-sm text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                                            Receiver's Name
                                          </label>
                                          <input
                                            name="receiverName"
                                            value={address.receiverName}
                                            onChange={(event) => handleAddressInputChange(index, event)}
                                            className="block w-full p-2 h-10 text-sm placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                                          />
                                        </div>
                                        <div className="relative">
                                          <label className="absolute text-sm text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                                            Receiver's Mobile
                                          </label>
                                          <input
                                            name="receiverMobileNumber"
                                            value={address.receiverMobileNumber}
                                            onChange={(event) => handleAddressInputChange(index, event)}
                                            className="block w-full p-2 h-10 text-sm placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                                          />
                                           {mobileNumberError && (
    <p className="text-red-500 text-sm mt-1">{mobileNumberError}</p>
  )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="flex justify-center mt-6">
                                    <button
                                      type="submit"
                                      className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </form>
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </span>
                    </span></CardTitle>

                  <CardDescription className='flex flex-col text-right '>
                    {isEditing && selectedAddress && (
                      <form onSubmit={handleSaveAddress} className="text-left text-sm mt-4 gap-3 grid grid-cols-3 items-center justify-center rounded-md">
                        <div className="relative col-span-3">
                          <label className="absolute text-sm text-gray-500 -top-[10px] left-3 px-1 bg-white z-10">Address Tag</label>
                          <input
                            type="text"
                            value={addressTag || ""}
                            onChange={(e) => handleAddressboxChange('tag', e.target.value)}
                            className="block w-full p-2 text-sm h-9 text-gray-900 bg-white border border-gray-200 rounded-md"
                          />
                        </div>

                        <div className="relative">
                          <label className="absolute text-sm text-gray-500 -top-[10px] left-3 px-1 bg-white z-10">Flat Number</label>
                          <input
                            type="text"
                            value={selectedAddressData?.flatNumber || ""}
                            onChange={(e) => handleAddressboxChange('flatNumber', e.target.value)}
                            className="block w-full p-2 text-sm h-9 text-gray-900 bg-white border border-gray-200 rounded-md"
                          />
                        </div>

                        <div className="relative">
                          <label className="absolute text-sm text-gray-500 -top-[10px] left-3 px-1 bg-white z-10">Area</label>
                          <input
                            type="text"
                            value={selectedAddressData?.area || ""}
                            onChange={(e) => handleAddressboxChange('area', e.target.value)}
                            className="block w-full p-2 h-9 text-sm text-gray-900 bg-white border border-gray-200 rounded-md"
                          />
                        </div>

                        <div className="relative">
                          <label className="absolute text-sm text-gray-500 -top-[10px] left-3 px-1 bg-white z-10">Nearby Landmark</label>
                          <input
                            type="text"
                            value={selectedAddressData?.nearbyLandmark || ""}
                            onChange={(e) => handleAddressboxChange('nearbyLandmark', e.target.value)}
                            className="block w-full p-2 h-9 text-sm text-gray-900 bg-white border border-gray-200 rounded-md"
                          />
                        </div>

                        <div className="relative">
                          <label className="absolute text-sm text-gray-500 -top-[10px] left-3 px-1 bg-white z-10">Receiver's Name</label>
                          <input
                            type="text"
                            value={selectedAddressData?.receiverName || ""}
                            onChange={(e) => handleAddressboxChange('receiverName', e.target.value)}
                            className="block w-full p-2 h-9 text-sm text-gray-900 bg-white border border-gray-200 rounded-md"
                          />
                        </div>

                        <div className="relative">
                          <label className="absolute text-[11px] text-gray-500 -top-[10px] left-3 px-1 bg-white z-10">Receiver's Mobile</label>
                          <input
                            type="text"
                            value={selectedAddressData?.receiverMobileNumber || ""}
                            onChange={(e) => handleAddressboxChange('receiverMobileNumber', e.target.value)}
                            className="block w-full p-2 h-9 text-sm text-gray-900 bg-white border border-gray-200 rounded-md"
                          />
                            {mobileError && <p className="text-red-500 text-xs mt-1">{mobileError}</p>} 
                        </div>

                        <div className='flex justify-end gap-10 col-span-3'>
                          <button type="submit" className='bg-green-600 text-white px-2 py-1 rounded'>
                            Save Address
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setSelectedAddress('');
                              setSelectedAddressData({});
                            }}
                            className='bg-red-500 text-white px-2 py-1 rounded'>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                  </CardDescription>
                </div>

                <CardContent className="text-sm">
                  <div className="grid gap-1">
                    <div className="font-semibold">Order Details</div>
                    <div className="grid grid-cols-7 py-1 text-gray-400 text-sm">
                      <span className='text-center'>Action</span>
                      <span>Product Code</span>
                      <span>Product Name</span>
                      <span className="text-center">Price (₹)</span>
                      <span className="text-center">Qty</span>
                      <span className="text-right col-span-2">Total (₹)</span>
                    </div>

                    <ul className="grid gap-1 text-sm">
                     
                      {cartItems.map((item, index) => (
                        <li key={index} className="grid grid-cols-7 items-center py-2">
                          <input
                            type="checkbox"
                            checked={checkedItems[index]}
                            onChange={() => handleCheckboxChange(index, item)}
                            className='text-center'
                          />
                          <span className="text-slate-700">{item.productCode}</span>
                          <span className="text-slate-700">{item.productName}</span>
                          {/* <span className="text-slate-700 text-center">
                            ₹{(item.customerPrice).toLocaleString('en-IN')}
                          </span> */}
                           <span className="text-slate-700 text-center">
        ₹{(getPriceBasedOnQuantity(item.quantity, item.offers, selectedCustomerRole)).toLocaleString('en-IN')}
      </span>
      <div className="flex items-center justify-center gap-2">
  <button
    className="px-2 bg-gray-200 rounded"
    onClick={() => handleCartQuantityChange(index, item.quantity - 1)}
  >
    -
  </button>
  <input
    type="number"
    min="1"
    value={item.quantity}
    onChange={(e) => handleCartQuantityChange(index, Number(e.target.value))}
    className="w-12 text-center border border-gray-300 rounded"
  />
  <button
    className="px-2 bg-gray-200 rounded"
    onClick={() => handleCartQuantityChange(index, item.quantity + 1)}
  >
    +
  </button>
</div>
                          {/* <span className="text-slate-700 text-right col-span-2">
                            ₹{(item.customerPrice * item.quantity).toLocaleString('en-IN')}
                          </span> */}
                              <span className="text-slate-700 text-right col-span-2">
        ₹{(
          getPriceBasedOnQuantity(item.quantity, item.offers, selectedCustomerRole) * item.quantity
        ).toLocaleString('en-IN')}
      </span>
                        </li>
                      ))}
                    </ul>

                    <Separator className="my-2" />

                    <ul className="grid gap-3 text-sm">
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                      </li>
                      {/* <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Tax (10%)</span>
                        <span>₹{calculateTax(calculateSubtotal()).toLocaleString('en-IN')}</span>
                      </li> */}
                      <Separator />
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Delivery Charges:</span>
                        <input
                          type="number"
                          min="0"
                          value={deliveryCharges}
                          onChange={(e) => setDeliveryCharges(Number(e.target.value))}
                          className="w-14 text-right"
                          placeholder="₹"
                        />

                      </div>
                      <Separator />
                      <li className="flex items-center justify-between font-semibold">
                        <span className="text-sm">Grand Total</span>
                        <span className='text-sm'>
                          ₹{calculateGrandTotal(calculateSubtotal(), deliveryCharges).toLocaleString('en-IN')}
                        </span>
                      </li>
                    </ul>

                  </div>
                </CardContent>

                <CardFooter className="flex justify-center">
                  <Button className="bg-green-800 text-white" onClick={handlePlaceOrder}>
                    Place Order
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}