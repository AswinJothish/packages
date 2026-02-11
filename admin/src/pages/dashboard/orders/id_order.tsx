import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { _axios } from "@/lib/_axios";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import dayjs from 'dayjs'
import { RiArrowDropDownLine } from "react-icons/ri";
import { RiArrowDropUpLine } from "react-icons/ri";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RxCross2 } from "react-icons/rx";
import { toast } from "sonner";
import { IoMdArrowBack } from "react-icons/io";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
// import { GrFormAdd } from "react-icons/gr";
// import { GrAddCircle, GrEdit, GrFormAdd } from "react-icons/gr";

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { MdDownload } from "react-icons/md";
import { Check, Upload } from 'lucide-react'
interface AddressData {
  tag?: string;
  flatNumber?: string;
  area?: string;
  nearbyLandmark?: string;
  receiverName?: string;
  receiverMobileNumber?: string;
}
interface Address {
  address: any;
  tag: string;
  flatNumber: string;
  area: string;
  nearbyLandmark: string;
  receiverName: string;
  receiverMobileNumber: string;
}

type Status = 'pending' | 'completed' | 'cancelled' | 'rejected' | 'assigned' | 'picked' | 'outfordelivery'|"delivered";

export function Id_Order() {
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  //@ts-ignore
  const [deliveryAddressDetails, setDeliveryAddressDetails] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrderDetails, setEditedOrderDetails] = useState<any>({});
  // @ts-ignore
  const [selectedStatus, setSelectedStatus] = useState('');
  // const [newProduct, setNewProduct] = useState({ brand: "", product: "" });
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [userId, setUserId] = useState('')
  const [userData, setUserData] = useState<any>()
  const [agentSearchTerm, setAgentSearchTerm] = useState<string>("");
  const [brandSearchTerm, setBrandSearchTerm] = useState<string>("");
  const [productSearchTerm, setProductSearchTerm] = useState<string>("");
  const [brands, setBrands] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProductsByBrand, setFilteredProductsByBrand] = useState<any[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<string[]>([]);
  const [isBrandScrollOpen, setIsBrandScrollOpen] = useState<boolean>(false);
  const [isProductScrollOpen, setIsProductScrollOpen] = useState<boolean>(false);
  const [isAgentScrollOpen, setIsAgentScrollOpen] = useState<boolean>(false);
  const [filteredAgents, setFilteredAgents] = useState<string[]>([]);

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [,setSelectedAgent] = useState<any>(null);

  const brandScrollRef = useRef<HTMLDivElement>(null);
  const AgentScrollRef = useRef<HTMLDivElement>(null);
  const productScrollRef = useRef<HTMLDivElement>(null);

  //@ts-ignore
  const [mobileNumberError, setMobileNumberError] = useState("");//for dialog reciever
  const [mobileError, setMobileError] = useState('');//for address select
const [paymentCompleted,setPaymentCompleted]=useState(false);
const statuses: Status[] = ["pending", "completed", "cancelled","delivered","outfordelivery","assigned","picked","rejected"];

  const [addresses, setAddresses] = useState<Address[]>([
    {
      address: "",
      tag: "",
      flatNumber: "",
      area: "",
      nearbyLandmark: "",
      receiverName: "",
      receiverMobileNumber: "",
    },
  ]);
  //@ts-ignore
  const [addressTag, setAddressTag] = useState("");
  //const [isAddressEditing, setIsAddressEditing] = useState(false)
  const [addAddressOpen, setAddAddressOpen] = useState(false)
  //@ts-ignore
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [addressData, setAddressData] = useState<AddressData>({});
  const [addressChanged, setAddressChanged] = useState(false);
  // const [cartItems, setCartItems] = useState<any[]>([]);
  const [quantity, setQuantity] = useState<any>();
  // const [newDeliveryCharges, setNewDeliveryCharges] = useState<number>(editedOrderDetails.deliveryCharges);
  //@ts-ignore
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);

  const [isDiscountGiven, setIsDiscountGiven] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [discount, setDiscount] = useState({ type: '', value: 0 });
  const [isCompleted, setIsCompleted] = useState(false)

  const handleDiscountTypeChange = (type: string) => {
    setDiscount({ type, value: 0 });
  };

  const handleInputChange = (e: { target: { value: any; }; }) => {
    const value = e.target.value;
    setDiscount((prevDiscount) => ({
      ...prevDiscount,
      value: value,
    }));
  };
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };


  const { data, isLoading, refetch } = useQuery({
    queryKey: ["currentOrder", id],
    queryFn: () => _axios.get(`/orders/order/${id}`).then(res => res.data),
    
  });
  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: () => _axios.get(`/products/all`).then(res => res.data.products),
  });
  const { data : agentData } = useQuery({
    queryKey: ["agents"],
    queryFn: () =>
      _axios.get(
        `/deliveryagent/select`
      ),
    select(data) {
      return {
        data: data.data,
        total: data.data.total,
      };
    },
  });
  useEffect(() => {
    if (productsData) {
      const uniqueBrands = Array.from(new Set(productsData.map((product: any) => product.brand)));
      //@ts-ignore
      setBrands(uniqueBrands);
      setProducts(productsData);
      setFilteredProductsByBrand(productsData);
    }
  }, [productsData]);
  useEffect(() => {
    if(orderDetails){
      setSelectedStatus(orderDetails?.status)
    }
    if (orderDetails && orderDetails.deliveryAgent) {
      setAgentSearchTerm(orderDetails.deliveryAgent.name);
    } else {
      setAgentSearchTerm('');
    }
    const checkPaymentStatus = () => {
      // Ensure paymentDetails exists and is an array
      const totalPaid = Array.isArray(orderDetails.paymentDetails)
        ? orderDetails.paymentDetails.reduce(
            (sum: any, payment: { paidAmount: any; }) => sum + (payment.paidAmount || 0),
            0
          )
        : 0;

      // Check if payment is completed based on the status and total paid
      if (
        orderDetails.status === "completed" ||
        orderDetails.status === "cancelled" ||
        totalPaid >= orderDetails.grandTotal
      ) {
        setPaymentCompleted(true);
      } else {
        setPaymentCompleted(false);
      }
    };

    if (orderDetails) {
      checkPaymentStatus();
    }
  }, [orderDetails]);

  useEffect(() => {
    if (data) {
      setUserId(data.order.customerId._id);
      setOrderDetails(data.order);
      setEditedOrderDetails(data.order); 
      if (data.order?.deliveryAddress) {
        setDeliveryAddressDetails(data.order.deliveryAddress);
      }
    }
  }, [data]);
  

  useEffect(() => {
    if (data) {
      setIsCompleted(data.order.status === 'completed');
      setIsDiscountGiven(data.order.discount?.value !== 0);
    }
  }, [data]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await _axios.get(`/users/get/${orderDetails.customerId._id}`);
        setUserData(response.data.data);
      } catch (err) {
        console.log("Failed to fetch user data")
      }
    };
    fetchUserData();
  }, [userId, addressChanged]);

  useEffect(() => {
    if (orderDetails && orderDetails.deliveryAddress) {


      // Assert the type of deliveryAddress as an object of objects
      const deliveryAddress = orderDetails.deliveryAddress as Record<string, {
        tag?: string;
        flatNumber?: string;
        area?: string;
        nearbyLandmark?: string;
        receiverName?: string;
        receiverMobileNumber?: string;
      }>;

      const tagName = Object.keys(deliveryAddress)[0];
      const firstAddress = Object.values(deliveryAddress)[0];


      // Set the state
      setAddressData({
        tag: tagName || '',
        flatNumber: firstAddress.flatNumber || '',
        area: firstAddress.area || '',
        nearbyLandmark: firstAddress.nearbyLandmark || '',
        receiverName: firstAddress.receiverName || '',
        receiverMobileNumber: firstAddress.receiverMobileNumber || ''
      });
    }
  }, [orderDetails]);

  useEffect(() => {
    setAddressTag(selectedAddress || "");
  }, [])


  useEffect(() => {
    const filteredProducts = products.filter(
      (product) =>
        product.productName.toLowerCase().includes(productSearchTerm.toLowerCase()) &&
        (!selectedBrand || product.brand.toLowerCase() === selectedBrand.toLowerCase())
    );

    setFilteredProductsByBrand(filteredProducts);
  }, [selectedBrand, productSearchTerm, products, brandSearchTerm]);

  useEffect(() => {
    setFilteredBrands(
      brands.filter((brand) =>
        (brand || "").toLowerCase().includes(brandSearchTerm.toLowerCase())
      )
    );
  }, [brandSearchTerm, brands]);

  const handleUpdate = async (updatedStatus: string) => {
    try {
      await _axios.patch(`/orders/order/${id}/status`, { status: updatedStatus });
      toast.success('Status updated Successfully')
      refetch();
      // onStatusChange(updatedStatus);
      // console.log(`Status updated to: ${updatedStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // setIsAddressEditing(false);
    setDiscount({ type: '', value: 0 });
    //setIsAddressEditing(false);
  };

  const handleAddProduct = (selectedProduct: any, quantity: any) => {
    if (!selectedProduct) return;

    // Get the stock for the selected product
    const stock = selectedProduct.stock || 0;
    const newQuantity = Math.max(1, parseInt(quantity, 10) || 1); // Ensure a minimum quantity of 1

    setEditedOrderDetails((prev: any) => {
      // Check if the product is already in the products list
      const existingProductIndex = prev.products.findIndex(
        (product: any) => product.productId._id === selectedProduct._id
      );

      if (existingProductIndex >= 0) {
        // Product already exists, so we add the quantity to the existing one
        const existingProduct = prev.products[existingProductIndex];
        let updatedQuantity = existingProduct.quantity + newQuantity;

        // Check if the updated quantity exceeds stock
        if (updatedQuantity > stock) {
          updatedQuantity = stock;
          toast.error(`Only ${stock} items can be added to cart`);
        }

        // Update the existing product with the new quantity
        const updatedProducts = [...prev.products];
        updatedProducts[existingProductIndex] = {
          ...existingProduct,
          quantity: updatedQuantity,
        };

        return {
          ...prev,
          products: updatedProducts,
        };
      } else {
        // Product doesn't exist, so add it as a new item
        const finalQuantity = newQuantity > stock ? stock : newQuantity;
        if (finalQuantity > stock) {
          toast.error(`Only ${stock} items can be added to cart`);
        }

        return {
          ...prev,
          products: [
            ...prev.products,
            { productId: selectedProduct, quantity: finalQuantity },
          ],
        };
      }
    });
    setQuantity(null);
    setProductSearchTerm("");
    setBrandSearchTerm("")
    setShowAddProductForm(false);
  };



  //Address Changes...............................

  // const handleAddressboxChange = (field: string, value: string) => {
  //   setAddressData((prevData) => ({
  //     ...prevData,
  //     [field]: value
  //   }));
  // };


  // const handleEditClick = (tag: any) => {
  //   setSelectedAddress(tag);
  //   setSelectedAddressData(userData.deliveryAddress[tag]);
  //   setIsAddressEditing(true);
  // };


  // const transformAddressData = (data: any) => {

  //   if (!data) {
  //     console.error("Invalid address data provided");
  //     return null;
  //   }
  //   console.log(editedOrderDetails)

  //   return {
  //     tag: data.tag || "",
  //     flatNumber: data.flatNumber || "",
  //     area: data.area || "",
  //     nearbyLandmark: data.nearbyLandmark || "",
  //     receiverName: data.receiverName || "",
  //     receiverMobileNumber: data.receiverMobileNumber || "",
  //   };
  // };

  // const handleSaveAddress = async (event: React.FormEvent) => {
  //   event.preventDefault();

  //   try {
  //     if (selectedAddressIndex === null) {
  //       toast.error("Please select an address to update.");
  //       return;
  //     }

  //     const addressItem = userData.deliveryAddress[selectedAddressIndex];
  //     if (!addressItem) {
  //       toast.error("Selected address not found.");
  //       return;
  //     }

  //     const addressId = addressItem._id;
  //     if (!addressId) {
  //       toast.error("Address ID not found.");
  //       return;
  //     }

  //     const transformedAddressData = transformAddressData(selectedAddressData);
  //     if (!transformedAddressData) {
  //       toast.error("Invalid address data. Please check the fields.");
  //       return;
  //     }

  //     const { flatNumber, area, nearbyLandmark, receiverName, receiverMobileNumber } = transformedAddressData;

  //     if (!addressTag || addressTag.trim() === "") {
  //       toast.error("Please provide a valid tag for the address.");
  //       return;
  //     }

  //     if (!flatNumber || !area || !nearbyLandmark || !receiverName || !receiverMobileNumber) {
  //       toast.error("Please fill all the fields of the address.");
  //       return;
  //     }

  //     const addressPayload = {
  //       userId: userData._id,
  //       address: {
  //         _id: addressId,
  //         tag: addressTag,
  //         flatNumber,
  //         area,
  //         nearbyLandmark,
  //         receiverName,
  //         receiverMobileNumber,
  //       },
  //     };

  //     const apiResponse = await _axios.put("/orders/editAddress", addressPayload, {
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     if (apiResponse.status !== 200) {
  //       throw new Error("Failed to update the address");
  //     }

  //     toast.success("Address updated successfully!");
  //     setAddressChanged(true);
  //     setIsEditing(false);
  //    // setIsAddressEditing(false);
  //   } catch (error) {
  //     console.error("Error updating address:", error);
  //     toast.error("Error updating address. Please try again.");
  //   }
  // };
  const handleAddressInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress: Address[] = [...addresses];
    const { name, value } = event.target;

    const key = name as keyof Address;

    newAddress[index][key] = value;
    setAddresses(newAddress);

    if (key === "receiverMobileNumber") {
      if (!/^\d*$/.test(value)) {
        setMobileNumberError("Please enter numbers only.");
        return;
      }
      if (value.length < 10) {
        setMobileError("Mobile number should have at least 10 digits.");
      } else if (value.length > 10) {
        setMobileError("Mobile number should not exceed 10 digits.");
      } else {
        setMobileError("");
      }
    }
  };

  const onNewAddressSubmit = async () => {
    if (!addresses || addresses.length === 0) {
      console.error("Addresses is undefined or empty");
      toast.error("Please provide at least one address.");
      return;
    }
    for (const addres of addresses) {
      // Check for required fields
      if (
        !addres.tag ||
        !addres.flatNumber ||
        !addres.area ||
        !addres.receiverName ||
        !addres.receiverMobileNumber
      ) {
        toast.error("Please fill in all fields of the address.");
        return;
      }
    }

    try {
      for (const address of addresses) {
        const payload = {
          customerId: userData._id,
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

  // useEffect(() => {
  //   if (deliveryAddressDetails && Object.keys(deliveryAddressDetails).length > 0) {
  //     const firstAddressTag = Object.keys(deliveryAddressDetails)[0];
  //     setSelectedAddress(firstAddressTag);
  //     setSelectedAddressData(deliveryAddressDetails[firstAddressTag]);
  //   }
  // }, [deliveryAddressDetails]);

  const handleSave = async () => {
    try {
      const tag = addressData.tag;

      if (!tag) {
        toast.error("Tag is required");
        return;
      }
      if (addressData.receiverMobileNumber?.length !== 10) {
        toast.error("Receiver Mobile Number must be 10 digits");
        return; // Stop further execution if validation fails
      }
      if (!addressData.area || !addressData.flatNumber || !addressData.receiverMobileNumber || !addressData.receiverName) {
        toast.error("Please fill all Mandatory fields")
        return
      }
      const deliveryAddress = {
        [tag]: {
          ...addressData,
          tag,
        },
      };

      const discountField = discount.value !== 0 ? {
        type: discount.type,
        value: discount.value,
      } : undefined;

      const orderDetails = {
        orderedBy: "Admin",
        customerId: userId,
        EditedDate: new Date(),
        products: editedOrderDetails.products.map((product: any) => ({
          productId: product?.productId?._id,
          quantity: parseInt(product?.quantity, 10),
        })),
        grandTotal: calculateGrandTotal(calculateSubtotal()),
        deliveryCharges: 0,
        discount: discountField,
        deliveryAddress,
        status: editedOrderDetails.status,
      };

      if (!discountField) {
        delete orderDetails.discount;
      }

      const response = await _axios.put(`/orders/editOrder/${id}`, orderDetails);
      if (response.status === 200) {
        toast.success("Order updated successfully");
        setIsEditing(false);
        refetch();
      } else {
        toast.error("Failed to update order");
        console.error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error: any) {
      console.error("Error updating order:", error.message);
      toast.error("Error updating order");
    }
  };




  useEffect(() => {
    setFilteredAgents(
      agentData?.data.agents.filter((agent: any) =>
        agent.name.toLowerCase().includes(agentSearchTerm.toLowerCase())
      )
    );
  }, [agentSearchTerm, agentData]);
  
  console.log(filteredAgents)

  const handleInputClick = (inputType: 'brand' | 'product' | 'agent') => {
    if (inputType === 'brand') {
      setIsBrandScrollOpen(true);
      setIsProductScrollOpen(false);
      setIsAgentScrollOpen(false);
    } else if (inputType === 'product') {
      setIsBrandScrollOpen(false);
      setIsProductScrollOpen(true);
      setIsAgentScrollOpen(false);
    } else if (inputType === 'agent') {
      setIsBrandScrollOpen(false);
      setIsProductScrollOpen(false);
      setIsAgentScrollOpen(true);
    }
  };
  const handleAgentSelect = async (agent: any) => {
    setAgentSearchTerm(agent.name); 
    setIsAgentScrollOpen(false); 
    setSelectedAgent(agent); 

    try {
      const response = await _axios.patch(`/orders/assign-agent/${id}`, {
        agentId: agent._id, 
      });

      if (response.data.status === 'success') {
        toast.success('Delivery Agent assigned successfully');
      } else {
        // Handle error case
      toast.error('Failed to assign agent');
      }
    } catch (error) {
      console.error('Error assigning agent:', error);
      toast.error('An error occurred while assigning the agent');
    }
  };
  
  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setBrandSearchTerm(brand);
    setProductSearchTerm("");
    setSelectedProduct(null);
    setIsBrandScrollOpen(false);
  };

  const handleProductSelect = (product: any) => {
    setProductSearchTerm(product.productName);
    setIsProductScrollOpen(false);
    if (product) {
      setSelectedProduct(product);
    }
  };
  

  const handleBrandInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrandSearchTerm(e.target.value);
  };


  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductSearchTerm(e.target.value);
  };

  const handleClickOutside = (event: MouseEvent) => {

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
    if(AgentScrollRef.current&&
    !AgentScrollRef.current.contains(event.target as Node)){
      setIsAgentScrollOpen(false)
    }
  };

  const calculateSubtotal = () => {
    let subtotal = 0;
    editedOrderDetails.products.forEach((item: any) => {
      const price = getPriceBasedOnQuantity(item.productId, item.quantity, orderDetails.customerId?.role);
      subtotal += price * item.quantity;
    });
    return subtotal;
  };
  const calculateGrandTotal = (subtotal: number) => {
    const tax = calculateTax(subtotal);
    const deliveryCharges = editedOrderDetails.deliveryCharges || 0;

    let discountedSubtotal = subtotal;


    if (discount.value != 0) {
      if (discount.type === 'amount') {
        discountedSubtotal -= discount.value;
      } else if (discount.type === 'percentage') {
        const discountAmount = (subtotal * discount.value) / 100;
        discountedSubtotal -= discountAmount;
      }
    }
    if (orderDetails.discount.value !== 0) {
      if (orderDetails.discount.type === 'amount') {
        discountedSubtotal -= orderDetails.discount.value;
      } else if (orderDetails.discount.type === 'percentage') {
        const discountAmount = (subtotal * orderDetails.discount.value) / 100;
        discountedSubtotal -= discountAmount;
      }
    }
    discountedSubtotal = Math.max(discountedSubtotal, 0);
    return discountedSubtotal + tax + deliveryCharges;
  };
  const calculateTax = (subtotal: any) => {
    const taxRate = 0;
    return subtotal * taxRate;
  };
  const handleProductQuantityChange = (index: number, value: string) => {
    // Parse the quantity, defaulting to a minimum of 1
    let quantity = value === '' ? 1 : Math.max(1, parseInt(value, 10));

    if (isNaN(quantity) || quantity <= 0) {
      return;
    }

    // Get the current product and its stock
    const product = editedOrderDetails.products[index];
    const stock = product.productId?.stock || 0;

    // Check if the entered quantity exceeds available stock
    if (quantity > stock) {
      quantity = stock; // Set quantity to stock limit if it exceeds stock
      toast.error(`Only ${stock} items can be added to cart`);
    }

    // Update the product quantity and price based on the adjusted quantity
    const updatedProducts = [...editedOrderDetails.products];
    updatedProducts[index].quantity = quantity;
    updatedProducts[index].price = getPriceBasedOnQuantity(
      updatedProducts[index].productId,
      quantity,
      orderDetails.customerId?.role
    );

    // Update the edited order details state
    setEditedOrderDetails((prevState: any) => ({
      ...prevState,
      products: updatedProducts,
    }));
  };


  const handleProductRemove = (index: number) => {
    setEditedOrderDetails((prevState: any) => {
      const updatedProducts = [...prevState.products];
      updatedProducts.splice(index, 1);
      return { ...prevState, products: updatedProducts };
    });
  };

  const getPriceBasedOnQuantity = (product: any, quantity: any, role: any) => {
    let price = role === 'dealer' ? product.dealerPrice : product.customerPrice;
    if (product.offers && product.offers.length > 0) {
      let applicableOffer = null;
      for (const offer of product.offers) {
        if (quantity >= offer.from && quantity <= offer.to) {
          applicableOffer = offer;
          break;
        }
      }
      if (!applicableOffer) {
        applicableOffer = product.offers[product.offers.length - 1];
      }
      price = role === 'dealer' ? applicableOffer.dealerPrice : applicableOffer.customerPrice;
    }
    return price;
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const calculateTotalPaidAmount = (orderDetails: { paymentDetails: { paidAmount: number }[] }) => {
    if (!Array.isArray(orderDetails.paymentDetails)) {
      return 0; 
    }
  
    return orderDetails.paymentDetails.reduce(
      (total, payment) => total + (payment.paidAmount || 0), 
      0 
    );
  };
  
  const handleStatusChange = (status:any) => {
    setSelectedStatus(status);
  };

  if (isLoading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (!orderDetails) {
    return <div className="text-center text-gray-600">Order Not Available</div>;
  }

  return <>
    <div className="flex  flex-col gap-10">
      <div className="w-full flex flex-col items-center h-full">
        <div className="w-full gap-5 text-white shadow h-16 flex items-center px-5">
          <div
            onClick={() => window.history.back()}
            className="flex gap-2 items-center justify-center hover:text-primary cursor-pointer text-gray-400"
          >
            <span className="text-xl"><IoMdArrowBack /></span>
          </div>
          <h1 className="text-xl font-semibold text-primary">Order Details</h1>
        </div>


        <div className="w-full flex justify-center items-center">
          <div className="w-[90%]   rounded-lg overflow-hidden">
          <div className="mt-5">
<CardHeader className=" p-2 px-4 flex flex-col md:flex-row items-start md:items-center justify-between">

<div className="grid gap-1 ">
  <CardTitle className="text-2xl text-gray-700">{orderDetails.orderId}</CardTitle>
  <hr />
  <p className='text-md font-ubuntu text-gray-500'>
    Placed On {format(new Date(orderDetails.orderDate), "do MMM, yyyy 'at' h:mm a")}
  </p>
</div>
<div className="flex items-center gap-5">
<div className="relative flex flex-col justify-start">
<div className="flex gap-2 flex-col">
  <Input
    type="text"
    onClick={() => {
      if (
        orderDetails.status !== 'picked' &&
        orderDetails.status !== 'rejected' &&
        orderDetails.status !== 'outfordelivery' &&
        orderDetails.status !== 'completed' &&
        orderDetails.status !== 'cancelled' &&
        orderDetails.status !== 'delivered'
      ) {
        handleInputClick('agent');
      }
    }}
    readOnly
    value={agentSearchTerm} // Displays the selected agent's name or the current search term
    className={`text-base cursor-default border-primary placeholder:text-sm focus-visible:ring-2 focus-visible:none rounded-xl focus-visible:ring-offset-0 focus-visible:none w-[200px] h-10 ${
      orderDetails.status === 'picked' ||
      orderDetails.status === 'rejected' ||
      orderDetails.status === 'outfordelivery' ||
      orderDetails.status === 'completed' ||
      orderDetails.status === 'cancelled' ||
      orderDetails.status === 'delivered'
        ? 'cursor-not-allowed '
        : ''
    }`}
    placeholder="Search Agent..."
    disabled={
      orderDetails.status === 'picked' ||
      orderDetails.status === 'rejected' ||
      orderDetails.status === 'outfordelivery' ||
      orderDetails.status === 'completed' ||
      orderDetails.status === 'cancelled' ||
      orderDetails.status === 'delivered'
    }
  />
  {isAgentScrollOpen && (
    <div
      ref={AgentScrollRef}
      className="absolute text-base z-10 mt-12 w-full bg-white border border-gray-300 shadow-md rounded-md"
      style={{ maxHeight: '20vh', overflowY: 'auto', maxWidth: '200px' }}
    >
      <ScrollArea className="h-full">
        <div className="p-4">
          {agentData?.data.agents.length > 0 ? (
            agentData?.data.agents.map((agent: any) => (
              <div
                key={agent.id} // Ensure unique key for each agent
                className="cursor-pointer"
                onClick={() => handleAgentSelect(agent)}
              >
                {agent.name}
                <Separator className="my-2" />
              </div>
            ))
          ) : (
            <div>No agents found</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )}
</div>

</div>

  <div>
  <div className="relative">
  <DropdownMenu>
    <DropdownMenuTrigger 
           disabled={selectedStatus === 'completed'||selectedStatus==='cancelled'}
           asChild>
      <button 
           className={`border ${selectedStatus==='completed'||'cancelled'?'cursor-not-allowed':''} w-48 h-10 text-sm rounded-xl capitalize text-left focus:ring-0 outline-none border-primary px-4 py-2 bg-white`}>
        {selectedStatus === '' 
          ? 'Select Status' 
          : selectedStatus === 'outfordelivery' 
          ? 'Out for Delivery' 
          : selectedStatus}
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {/* <DropdownMenuItem
        className={`${
          selectedStatus === '' ? '' : 'pl-8'
        } cursor-pointer capitalize w-48 py-2 text-sm flex items-center`}
        onClick={() => setSelectedStatus('')}
      >
        {selectedStatus === '' && <Check className="h-4  mr-2 w-4" />}
        Select Status
      </DropdownMenuItem> */}
      {statuses.map((status: Status) => (
        <DropdownMenuItem
          key={status}
          onClick={() => {
            handleStatusChange(status);
            handleUpdate(status); 
          }}
          className={`${
            selectedStatus === status ? '' : 'pl-8'
          } cursor-pointer capitalize w-48 py-2 text-sm flex items-center`}
        >
          {selectedStatus === status && <Check className="h-4 mr-2 w-4" />}
          {status === 'outfordelivery' ? 'Out for Delivery' : status}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
</div>


  </div>

                  {isCompleted ? <></> : <> {isEditing ? <button className="bg-red-500 hover:scale-105 transition-all duration-300 p-2 rounded  text-white text-base" onClick={handleEditToggle}>
  Disable Edit
</button> : <button  disabled={paymentCompleted} className={`bg-primary ${paymentCompleted?'cursor-not-allowed ':'cursor-pointer'} rounded hover:scale-105 transition-all duration-300 text-white text-base p-2 `} onClick={handleEditToggle}>
  Enable Edit
</button>
}</>

}
</div>

</CardHeader>
</div>
        

            <div className="">
              <CardContent className="mt-5  px-0 pb-0 flex justify-between w-full  gap-10">
                <div className="w-full border p-5 rounded-lg">
                  <div className="px-4">
                    <h1 className="font-bold text-lg text-black">Customer Information</h1>
                    <div className="grid text-base mt-8 text-black grid-cols-2 gap-8">
                      <div className="text-left font-medium">Customer Name</div>
                      <div>: <span className="pl-4">{orderDetails.customerId?.username || ' - '}</span></div>
                      <div className="text-left font-medium">Mobile</div>
                      <div>: <span className="pl-4">{orderDetails.customerId?.mobileNumber}</span></div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 w-full flex border rounded-lg gap-5 items-center ">
                  <div className="px-4 w-full">
                    <div className="flex flex-col w-full">
                      <div className="  flex w-full items-center justify-between">
                        <h1 className="text-lg font-bold">Delivery Address</h1> 
                      <h1 className="p-2 px-3  rounded-full w-fit bg-primary text-white">
                        {addressData.tag}
                      </h1>
                      </div>
                     
                      <div className="pl-5 ">
                        <p className="py-4 flex flex-col gap-2">
                          <p className="text-base font-bold">
                            {addressData.receiverName}
                          </p>
                          <p className="text-base text-slate-700">
                            {addressData.receiverMobileNumber}
                          </p>
                        </p>
                        <p className="text-base ">
                          <p>
                            {addressData.flatNumber},
                          </p>
                          <p>
                        {addressData.nearbyLandmark}.
                        </p>
                        </p>                      
                       
                      </div>
                    </div>

                  </div>
                </div>
                <div className="w-full border rounded-lg p-5">
                <div className="px-4">
    <h1 className="font-bold text-lg">Payment Status</h1>

    <div className="font-sans py-4">
  <div className="border border-gray-300 rounded-lg overflow-hidden">
    <table className="w-full">
      <thead>
        <tr className="border-b  border-gray-300">
          <th className=" text-center px-4 py-2">Paid</th>
          <th className=" text-center px-4 py-2 border-l border-gray-300">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="px-4 py-2 text-center">
            {calculateTotalPaidAmount(orderDetails) > 0
              ? `₹ ${calculateTotalPaidAmount(orderDetails)}`
              : `₹ 0`}
          </td>
          <td className="px-4 text-center py-2 border-l border-gray-300">
            ₹ {orderDetails?.grandTotal}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
<div className="flex w-full justify-center">
<p className={`p-2 px-5 w-fit font-semibold rounded-full text-center ${paymentCompleted ? 'bg-green-700 text-white' : 'bg-red-600 text-white'} font-lg`}>
      {paymentCompleted ? 'Payment Completed' : 'Payment Pending'}
    </p>
</div>
   
  </div>
                </div>
              </CardContent>
            </div>
            {showAddProductForm && (
              <div className="bg-gray-100  mb-4 mt-10 rounded-lg border shadow ">
                <div className="flex border justify-between rounded  items-center">
                  <h2 className="text-base font-semibold p-2 ">Add New Product</h2>
                  <button onClick={() => {
                    setShowAddProductForm(false), setQuantity(null);
                    setProductSearchTerm("");
                    setBrandSearchTerm("")
                  }} className="h-7 w-7 ">
                    <RxCross2 className="text-red-500 h-4 font-extrabold w-4" />
                  </button>
                </div>


                <div className="flex justify-around p-4 bg-white">
                  <div className="relative flex flex-col justify-start">
                    <h1 className="text-base text-gray-500">Select a Brand</h1>
                    <div className="flex gap-2 flex-col">
                      <Input
                        type="text"
                        onChange={handleBrandInputChange}
                        onClick={() => handleInputClick('brand')}
                        value={brandSearchTerm}
                        className="text-base border-blue-100 placeholder:text-sm focus-visible:ring-2 focus-visible:none focus-visible:ring-offset-0 focus-visible:none w-[200px] h-8"
                        placeholder="Search Brand..."
                      />
                      {isBrandScrollOpen && (
                        <div
                          ref={brandScrollRef}
                          className="absolute text-base z-10 mt-12 w-full bg-white border border-gray-300 shadow-md rounded-md"
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
                    <div className="flex gap-2 flex-col">
                      <Input
                        type="text"
                        onChange={handleProductInputChange}
                        onClick={() => handleInputClick('product')}
                        value={productSearchTerm}
                        className="text-base border-blue-100 placeholder:text-sm focus-visible:ring-2 focus-visible:none focus-visible:ring-offset-0 focus-visible:none w-[200px] h-8 placeholder:"
                        placeholder="Search Product..."
                      />
                      {isProductScrollOpen && (
                        <div
                          ref={productScrollRef}
                          className="absolute text-base z-10 mt-12 w-full bg-white border border-gray-300 shadow-md rounded-md"
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
                  <div className="flex justify-end items-end">
                    {selectedProduct && (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="Qty"
                          min={1}
                          className="text-base w-16 h-8 border-blue-100 placeholder:text-base"
                        />
                        <Button
                          onClick={() => { handleAddProduct(selectedProduct, quantity) }}
                          className="text-base h-7 p-2 bg-green-700"
                          disabled={!quantity || parseInt(quantity) <= 0}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    )}
                  </div>
                </div>



              </div>
            )}
            <Card className="overflow-hidden mt-10 w-full">
             



              <CardContent className="">
                <div className="text-xl font-ubuntu font-semibold my-6">Order Items</div>
                <div className="grid font-sans grid-cols-8 pb-3 gap-3 font-semibold text-lg mb-2 border-b border-gray-200">
                  <span>Product Code</span>
                  <span className="col-span-3">Product Name</span>
                  <span className="text-left">Price (₹)</span>
                  <span className="text-left">Quantity</span>
                  {isEditing ? <span className="text-right ">Total (₹)</span> : <span className="text-right">Total (₹)</span>}
                  {isEditing && <span className="text-right">Action</span>}
                </div>
                <ul className="grid gap-1 text-base">
                
                  {orderDetails?.products?.length > 0 ? (
                    editedOrderDetails.products.map((item: any, index: any) => {
                      // Calculate unit price based on quantity and role
                      const unitPrice = getPriceBasedOnQuantity(item.productId, item.quantity, orderDetails.customerId?.role);
                      // Calculate total price for the current item
                      const totalPrice = unitPrice * item.quantity;
                      return (
                        <li key={index} className="grid grid-cols-8 gap-3 items-center py-2">
                          <span className="text-slate-700">{item?.productId?.productCode}</span>
                          <span className="text-slate-700 col-span-3 ">{item?.productId?.productName}</span>
                          {/* Calculate the price based on quantity and role */}
                          <span className="">
                            {getPriceBasedOnQuantity(item.productId, item.quantity, orderDetails.customerId?.role).toLocaleString('en-IN')}
                          </span>
                          <span className="">
                            <input
                              type="number"
                              className="w-12 text-center border border-gray-300 rounded-md"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = e.target.value;
                                handleProductQuantityChange(index, value);
                              }}
                              disabled={!isEditing}
                            />
                          </span>
                          <span className="text-right col-span-1 ">
                            <span className="pr-1 font-sans">₹</span>
                            {totalPrice.toLocaleString('en-IN')}
                          </span>
                          {isEditing && (
                            <span className="text-right col-span-1">
                              <button className="text-red-500" onClick={() => handleProductRemove(index)}>
                                Remove
                              </button>
                            </span>
                          )}
                        </li>
                      )
                    })
                  ) : (
                    <li className="text-center py-2">No products available</li>
                  )}
                </ul>

                {isEditing && !showAddProductForm && (
                  <button
                    onClick={() => setShowAddProductForm(true)}
                    className="mt-4 text-sm p-1 rounded px-2 hover:bg-blue-800 bg-blue-500 text-white"
                  >
                    Add Product
                  </button>
                )}
                <Separator className="my-4" />
                {
                  isEditing && (<div className="p-5">
                    {isDiscountGiven ? <>

                    </>
                      :
                      <>
                        <div className="relative">
                          {
                            isDiscountGiven ? <></> : <>
                              <Button className="bg-orange-500 hover:bg-orange-600 text-sm p-2 h-7 text-white" onClick={toggleDropdown}>
                                Add Discount
                              </Button>
                            </>
                          }

                          {isDropdownOpen && (
                            <div className="absolute p-3 z-20 bg-white border rounded shadow-lg ">
                              <div className="flex flex-col gap-4">
                                <label className="flex gap-3">
                                  <input
                                    type="radio"
                                    value="amount"
                                    checked={discount.type === 'amount'}

                                    onChange={() => { handleDiscountTypeChange('amount'), setIsDropdownOpen(false) }}
                                  />
                                  Amount
                                </label>

                                <label className="flex gap-3">
                                  <input
                                    type="radio"
                                    value="percentage"

                                    checked={discount.type === 'percentage'}
                                    onChange={() => { handleDiscountTypeChange('percentage'), setIsDropdownOpen(false) }}
                                  />
                                  Percentage
                                </label>

                              </div>
                            </div>
                          )}
                        </div>
                      </>}
                  </div>)
                }

                {discount.type && isEditing && (
                  <div className="py-5">
                    <label className="mt-2 text-sm text-muted-foreground">
                      {discount.type === 'amount' ? 'Discount Amount' : 'Discount Percentage'}
                      <div className="relative inline-block">
                        <input
                          type="number"
                          value={discount.value}
                          onChange={handleInputChange}
                          className="border placeholder:text-neutral-400 text-sm rounded p-1 ml-8 pl-3"
                          placeholder={discount.type === 'amount' ? 'Enter amount' : 'Enter percentage'}
                        />
                        <span className="absolute right-5 top-1/2 transform -translate-y-1/2 text-neutral-500">
                          {discount.type === 'amount' ? '₹' : '%'}
                        </span>
                      </div>
                    </label>
                  </div>
                )}

                <ul className="grid gap-3 text-sm">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      <span className="pr-1">₹</span>
                      {isNaN(calculateSubtotal()) ? '0' : calculateSubtotal().toLocaleString('en-IN')}
                    </span>
                  </li>
                  {isDiscountGiven ? <>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span>
                        <span className="pr-2">(-)</span>
                        {
                          orderDetails.discount.type === 'amount' ? <span className="pr-1">₹</span> : <></>
                        }

                        {orderDetails.discount.value}
                        {
                          orderDetails.discount.type === 'percentage' ? <span className="pl-1">%</span> : <></>
                        }
                      </span>
                    </li>
                  </> : <>
                    {discount && isEditing &&
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span>
                          <span className="pr-2">(-)</span>
                          {
                            discount.type === 'amount' ? <span className="pr-1">₹</span> : <></>
                          }

                          {discount.value}
                          {
                            discount.type === 'percentage' ? <span className="pl-1">%</span> : <></>
                          }
                        </span>
                      </li>
                    }
                  </>}


                  <li className="flex items-center justify-between text-sm">
                    <span className="font-semibold">Total</span>

                    <span className="font-semibold text-lg">
                      <span className="pr-1">₹</span>
                      {isNaN(calculateGrandTotal(calculateSubtotal())) ? '0' : calculateGrandTotal(calculateSubtotal()).toLocaleString('en-IN')}
                    </span>
                  </li>
                </ul>
              </CardContent>

              <CardFooter className="flex items-center justify-center">

                {isEditing ? (
                  <div className="flex gap-2">
                    <Button className="bg-green-700 text-sm p-2 h-7 text-white" onClick={handleSave}>Save Changes</Button>
                    <Button className="bg-red-600 text-white  text-sm p-2 h-7" onClick={handleEditToggle}> Cancel</Button>
                  </div>

                ) : <> </>}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

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
                  onNewAddressSubmit();
                }}
                className="space-y-4 flex items-center justify-center flex-col w-full"
              >
                {addresses.map((address, index) => (
                  <div
                    key={index}
                    className="relative grid grid-cols-1 gap-4 px-10 py-3 border rounded-md border-gray-200 shadow"
                  >
                    <div className="absolute top-0 left-3 -translate-y-1/2 w-fit bg-white px-3 text-sm text-slate-400">
                      Address
                    </div>
                    <div className="mt-5 grid grid-cols-4 gap-5">
                      <div className="relative">
                        <label className="absolute text-base text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                          Address Label
                        </label>
                        <input
                          name="tag"
                          value={address.tag}
                          onChange={(event) => handleAddressInputChange(index, event)}
                          className="block w-full p-2 h-10 text-base placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                          placeholder="Eg: Home, Office..."
                        />
                      </div>
                      <div className="relative">
                        <label className="absolute text-base text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                          Flat Number
                        </label>
                        <input
                          name="flatNumber"
                          value={address.flatNumber}
                          onChange={(event) => handleAddressInputChange(index, event)}
                          className="block w-full p-2 h-10 text-base placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                          placeholder="No.76A"
                        />
                      </div>
                      <div className="relative">
                        <label className="absolute text-base text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                          Area
                        </label>
                        <input
                          name="area"
                          value={address.area}
                          onChange={(event) => handleAddressInputChange(index, event)}
                          className="block w-full p-2 h-10 text-base placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                          placeholder="Eg: Sector 15A..."
                        />
                      </div>
                      <div className="relative">
                        <label className="absolute text-base text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                          Landmark
                        </label>
                        <input
                          name="nearbyLandmark"
                          value={address.nearbyLandmark}
                          onChange={(event) => handleAddressInputChange(index, event)}
                          className="block w-full p-2 h-10 text-base placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                          placeholder="Eg: Near Central Park..."
                        />
                      </div>
                      <div className="relative">
                        <label className="absolute text-base text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                          Receiver's Name
                        </label>
                        <input
                          name="receiverName"
                          value={address.receiverName}
                          onChange={(event) => handleAddressInputChange(index, event)}
                          className="block w-full p-2 h-10 text-base placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                        />
                      </div>
                      <div className="relative">
                        <label className="absolute text-base text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                          Receiver's Mobile
                        </label>
                        <input
                          name="receiverMobileNumber"
                          value={address.receiverMobileNumber}
                          onChange={(event) => handleAddressInputChange(index, event)}
                          className="block w-full p-2 h-10 text-base placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                        />
                        {mobileError && <p className="absolute text-red-500 text-sm mt-1">{mobileError}</p>}
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


      <div className="py-10 pb-32">
        <PaymentDetails orderDetails={orderDetails} />
      </div>

    </div>

  </>

}

function PaymentDetails({ orderDetails }: any) {
  //@ts-ignore
  const [orderData, setOrderData] = useState<any>(null);
  const [id, setId] = useState<String>('');
  const [showDialog, setShowDialog] = useState(false);
  const [showPaymentTable, setShowPaymentTable] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State to store the selected image for the dialog
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [addedPayments, setAddedPayments] = useState<any[]>([]);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    const checkPaymentStatus = () => {
      // Sum up all paid amounts
      const totalPaid = orderDetails.paymentDetails.reduce(
        (sum: any, payment: { paidAmount: any; }) => sum + (payment.paidAmount || 0),
        0
      );

      // Check if payment is completed based on the conditions
      if (
        orderDetails.status === "completed" ||
        orderDetails.status === "cancelled" ||
        totalPaid >= orderDetails.grandTotal
      ) {
        setPaymentCompleted(true);
      } else {
        setPaymentCompleted(false);
      }
    };

    // Run the check on component mount and whenever order data changes
    checkPaymentStatus();
  }, [orderData]);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        setShowDialog(false);
      }
    };
    if (showDialog) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDialog]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowDialog(true);
  };

  useEffect(() => {
    if (orderDetails) {
      setOrderData(orderDetails);
      setId(orderDetails._id);

      setPayments(orderDetails.payment || []);
    }
  }, [orderDetails]);

  // const handleDownloadClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   console.log('Download icon clicked');
  // };

  const handleTogglePaymentTable = () => {
    setShowPaymentTable(!showPaymentTable);
  };

  const handleAddPayment = () => {
    // Initialize a new payment object with default values
    const newPayment = {
      date: '',
      paymentImage: 'upload', // Set to 'upload' to trigger image upload field initially
      transactionId: ' ',     // Placeholder indicating an editable transaction ID field
      paidAmount: '',
      balanceAmount: '',
      mode: '',
      verified: false,
    };

    setAddedPayments((prev) => [...prev, newPayment]);
  };


  const handleImageUpload = async (e: { target: { files: any[]; }; }) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setUploadedImage(previewUrl);
      setImageFile(file)
    }
  };



  const handleFieldChange = (index: number, field: string, value: string) => {
    const updatedPayments = [...paymentsToDisplay];
    updatedPayments[index][field] = value;
    setPayments(updatedPayments);
  };

  const handleSavePayment = async (index: number, paymentId: any) => {
    const paymentToSave = payments[index];

    if (!paymentToSave) {
      toast.error("Payment fields are empty");
      return;
    }
    if (!paymentToSave.date || !paymentToSave.paidAmount || !paymentToSave.balanceAmount) {
      toast.error('Please fill out all fields');
      return;
    }

    if (paymentToSave.transactionId === ' ') {
      // Trim the transactionId and set it to null if it's just whitespace
      paymentToSave.transactionId = paymentToSave.transactionId.trim() || null;
    }

    console.log('Payment Details:', paymentToSave);

    try {
      // Create a new FormData instance
      const formData = new FormData();
      formData.append("balanceAmount", paymentToSave.balanceAmount.toString());
      formData.append("paidAmount", paymentToSave.paidAmount.toString());
      formData.append("date", paymentToSave.date);
      formData.append("mode", paymentToSave.mode);
      formData.append("transactionId", paymentToSave.transactionId || ''); // Send empty string if null

      // Append image file if exists
      if (imageFile) {
        formData.append("paymentImage", imageFile);
      } else if (paymentToSave.paymentImage === 'upload') {
        //@ts-ignore
        formData.append("paymentImage", null);
      }
      else if (paymentToSave.paymentImage) {
        formData.append("paymentImage", paymentToSave.paymentImage);
      }

      const endpoint = paymentId
        ? `/orders/edit-payment?id=${id}&paymentId=${paymentId}`
        : `/orders/edit-payment?id=${id}`;

      // Send formData using Axios
      const response = await _axios.put(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle response
      if (response.data.ok) {
        toast.success('Payment details saved successfully!');
        setImageFile(null);
        if (!paymentId) {
          setPayments((prevPayments) => {
            const newPayment = { ...paymentToSave, _id: response.data.newPaymentId }; // Assuming the backend returns the new ID
            return [...prevPayments, newPayment];
          });
        }

        window.location.reload();
      } else {
        throw new Error(response.data.message || 'Failed to save payment details');
      }
    } catch (error: any) {
      console.error('Error saving payment:', error);
      toast.error(error.message || 'An error occurred while saving payment details');
    }
  };


  const paymentDetailsFirst = orderDetails.paymentDetails || [];
  const unverifiedPayments = orderDetails.payment.filter((payment: { verified: string; }) => payment.verified === "false");

  const paymentsToDisplay = [
    ...paymentDetailsFirst,
    ...unverifiedPayments,
    ...addedPayments
  ];
  return (
    <>
      <div className="flex items-start justify-center mb-30">
        <div className="w-[90%] rounded-lg border shadow">
          <div className="p-5 text-base font-bold bg-gray-100 flex justify-between items-center">
            <span>Payment Details</span>
            <div className="flex items-center gap-2">
              <button onClick={handleTogglePaymentTable} className="p-2">
                {showPaymentTable ? <RiArrowDropDownLine className="text-4xl text-neutral-500" /> : <RiArrowDropUpLine className="text-4xl text-neutral-500" />}
              </button>
              {!paymentCompleted && (
                <button onClick={handleAddPayment} className="bg-primary text-white px-2 py-1 rounded">
                  Add Payment
                </button>
              )}

            </div>
          </div>
          {showPaymentTable && (
            <div className="p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-44">Date</TableHead>
                    <TableHead className="text-left">Transaction</TableHead>
                    <TableHead className="text-left">Paid Amount</TableHead>
                    <TableHead className="text-left">Balance Amount</TableHead>
                    <TableHead className="text-left">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsToDisplay.length > 0 ? (
                    paymentsToDisplay.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              format="DD/MM/YYYY"
                              closeOnSelect
                              //@ts-ignore
                              onChange={(date) => handleFieldChange(index, 'date', date?.format('DD/MM/YYYY'))}
                              className="w-full"
                              disabled={!payment.verified && !addedPayments.includes(payment)}
                              value={payment.date ? dayjs(payment.date, "DD/MM/YYYY") : null}
                            />
                          </LocalizationProvider>
                        </TableCell>
                        <TableCell>
                          {payment.paymentImage ? (
                            <div className="flex gap-2">
                              <div className="flex items-center gap-4">
                                {payment.paymentImage != "upload" ? (
                                  <div>
                                    <img
                                      src={`http://65.0.108.35:4000/api/admin/files/view?key=${payment.paymentImage}`}
                                      alt="Payment Image"
                                      className="w-24 h-24 border"
                                      onClick={() => handleImageClick(payment.paymentImage)}
                                    />
                                  </div>
                                ) : (

                                  <div className="flex items-center gap-4">
                                    {uploadedImage ? (
                                      <div>
                                        <img
                                          src={uploadedImage}
                                          alt="Uploaded Preview"
                                          className="w-24 h-24 border"
                                          onClick={() => handleImageClick(uploadedImage)}
                                        />
                                      </div>
                                    ) : (
                                      <label className="flex aspect-square w-[60px] h-full items-center justify-center rounded-md border border-gray-300 border-dashed cursor-pointer">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                        <input
                                          type="file"
                                          className="hidden"
                                          //@ts-ignore
                                          onChange={handleImageUpload}
                                        />
                                        <span className="sr-only">Upload</span>
                                      </label>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex w-full justify-center flex-col gap-3">
                                {payment.transactionId && (
                                  paymentDetailsFirst.includes(payment) ? (
                                    <Input
                                      readOnly
                                      defaultValue={payment.transactionId || ''}
                                      type="text"
                                      className="block w-full p-2 text-sm h-10 border-neutral-800/35 rounded"
                                    />
                                  ) : (
                                    <Input
                                      defaultValue={payment.transactionId || ''}
                                      type="text"
                                      onChange={(e) => handleFieldChange(index, 'transactionId', e.target.value)}
                                      className="block w-full p-2 text-sm h-10 border-neutral-800/35 rounded"
                                    />
                                  )
                                )}
                                {paymentDetailsFirst.includes(payment) ? (
                                  <FormControl disabled fullWidth>
                                    <InputLabel id="demo-simple-select-label">Mode</InputLabel>
                                    <Select
                                      size="small"
                                      labelId="demo-simple-select-label"
                                      id="demo-simple-select"
                                      value={payment.mode || ''}
                                      label="mode"
                                      onChange={(e) => handleFieldChange(index, 'mode', e.target.value)}

                                    >
                                      <MenuItem value="cash">Cash</MenuItem>
                                      <MenuItem value="UPI">UPI</MenuItem>
                                    </Select>
                                  </FormControl>
                                ) : (
                                  <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Mode</InputLabel>
                                    <Select
                                      size="small"
                                      labelId="demo-simple-select-label"
                                      id="demo-simple-select"
                                      value={payment.mode || ''}
                                      label="mode"
                                      onChange={(e) => handleFieldChange(index, 'mode', e.target.value)}

                                    >
                                      <MenuItem value="cash">Cash</MenuItem>
                                      <MenuItem value="UPI">UPI</MenuItem>
                                    </Select>
                                  </FormControl>

                                )}
                              </div>
                            </div>
                          ) : payment.transactionId ? (
                            <div className="flex flex-col gap-2">
                              <div className="block w-full p-2 text-sm h-10 border border-neutral-800/35 rounded">
                                {payment.transactionId}
                              </div>
                              {paymentDetailsFirst.includes(payment) ? (
                                <FormControl disabled fullWidth>
                                  <InputLabel id="demo-simple-select-label">Mode</InputLabel>
                                  <Select
                                    size="small"
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={payment.mode || ''}
                                    label="mode"
                                    onChange={(e) => handleFieldChange(index, 'mode', e.target.value)}

                                  >
                                    <MenuItem value="cash">Cash</MenuItem>
                                    <MenuItem value="UPI">UPI</MenuItem>
                                  </Select>
                                </FormControl>
                              ) : (
                                <FormControl fullWidth>
                                  <InputLabel id="demo-simple-select-label">Mode</InputLabel>
                                  <Select
                                    size="small"
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={payment.mode || ''}
                                    label="mode"
                                    onChange={(e) => handleFieldChange(index, 'mode', e.target.value)}

                                  >
                                    <MenuItem value="cash">Cash</MenuItem>
                                    <MenuItem value="UPI">UPI</MenuItem>
                                  </Select>
                                </FormControl>
                              )}
                            </div>
                          ) :
                            <>
                              {paymentDetailsFirst.includes(payment) ? <>
                                <FormControl fullWidth disabled>
                                  <InputLabel id="demo-simple-select-label">Mode</InputLabel>
                                  <Select
                                    size="small"
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={payment.mode || ''}
                                    label="mode"
                                    onChange={(e) => handleFieldChange(index, 'mode', e.target.value)}

                                  >
                                    <MenuItem value="cash">Cash</MenuItem>
                                    <MenuItem value="UPI">UPI</MenuItem>
                                  </Select>
                                </FormControl>

                              </> : <>   <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Mode</InputLabel>
                                <Select
                                  size="small"
                                  labelId="demo-simple-select-label"
                                  id="demo-simple-select"
                                  value={payment.mode || ''}
                                  label="mode"
                                  onChange={(e) => handleFieldChange(index, 'mode', e.target.value)}

                                >
                                  <MenuItem value="cash">Cash</MenuItem>
                                  <MenuItem value="UPI">UPI</MenuItem>
                                </Select>
                              </FormControl> </>}

                            </>

                          }
                        </TableCell>
                        <TableCell>
                          {paymentDetailsFirst.includes(payment) ? (
                            <div className="relative">
                              <span className="absolute text-sm text-neutral-600 mt-2.5 ml-2">₹</span>
                              <Input
                                readOnly
                                value={payment.paidAmount !== undefined ? payment.paidAmount : '0'}
                                onChange={(e) => handleFieldChange(index, 'paidAmount', e.target.value)}
                                type="number"
                                className="block w-full px-5 text-sm h-10 border-neutral-800/35 rounded"
                              />
                            </div>
                          ) : (
                            <div className="relative">
                              <span className="absolute text-sm text-neutral-600 mt-2.5 ml-2">₹</span>
                              <Input
                                value={payment.paidAmount || ''}
                                onChange={(e) => handleFieldChange(index, 'paidAmount', e.target.value)}
                                type="number"
                                className="block w-full px-5 text-sm h-10 border-neutral-800/35 rounded"
                              />
                            </div>

                          )}

                        </TableCell>
                        <TableCell>
                          {paymentDetailsFirst.includes(payment) ? (
                            <div className="relative">
                              <span className="absolute text-sm text-neutral-600 mt-2.5 ml-2">₹</span>
                              <Input
                                readOnly
                                value={payment.balanceAmount !== undefined ? payment.balanceAmount : '0'}
                                onChange={(e) => handleFieldChange(index, 'balanceAmount', e.target.value)}
                                type="number"
                                className="block w-full px-5 text-sm h-10 border-neutral-800/35 rounded"
                              />
                            </div>
                          ) : (
                            <div className="relative">
                              <span className="absolute text-sm text-neutral-600 mt-2.5 ml-2">₹</span>
                              <Input
                                value={payment.balanceAmount || ''}
                                onChange={(e) => handleFieldChange(index, 'balanceAmount', e.target.value)}
                                type="number"
                                className="block w-full px-5 text-sm h-10 border-neutral-800/35 rounded"
                              />
                            </div>
                          )}

                        </TableCell>
                        <TableCell>
                          {paymentDetailsFirst.includes(payment) ? (
                            <Button
                              className=" bg-primary p-3 font-bold text-white"
                              disabled // Disable the button for paymentDetails
                            >
                              Save
                            </Button>
                          ) : (
                            <Button
                              className=" bg-primary p-3 font-bold text-white"// 
                              onClick={() => handleSavePayment(index, payment._id || null)}
                            >
                              Save
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No payment details available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>


              </Table>

            </div>
          )}
        </div>
      </div>

      {showDialog && selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex z-40">
          <div className="flex justify-center items-center w-full">
            <div ref={dialogRef} className="flex justify-center items-center relative">
              <img className="h-[80vh]" src={`http://65.0.108.35:4000/api/admin/files/view?key=${selectedImage}`} alt="" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
