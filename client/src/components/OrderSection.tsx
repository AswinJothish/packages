import { useEffect, useRef, useState } from 'react';
import { ImgbaseUrl, baseUrl } from "../lib/config";
import { FaChevronRight } from "react-icons/fa6";
import { X, XIcon } from 'lucide-react';
import cloud from '../../public/images/cloud.png'
import { toast } from 'react-toastify';
import { IoMdImage } from "react-icons/io";
import filter from "../../public/images/adjustment 2.png"

interface Product {
    productId: {
        dealerPrice: number;
        customerPrice: number;
        offers: Array<{ from: number; to: number; dealerPrice: number; customerPrice: number; }>;
        brand: string;
        strikePrice: string;
        productImages: string[];
        _id: string;
        productName: string;
        productCode: string;
    };
    quantity: number;
}

interface Order {
    paymentDetails: any;
    payment: any;
    discount: any;
    customerId: { role: string };
    _id: string;
    orderId: string;
    status: string;
    grandTotal: number;
    products: Product[];
    orderDate: string;
}

const OrderSection: React.FC = () => {
    const [orderData, setOrderData] = useState<Order[] | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
    const [fileName, setFileName] = useState(null);
    const [file, setFile] = useState<File | null>(null);
    const [transactionId, setTransactionId] = useState<string>("");
    const [dropdown, setDropdown] = useState(false)
    const dialogRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<string>('')
    const [timeFilter, setTimeFilter] = useState("");

    const handleTimeFilterChange = (event) => {
        setTimeFilter(event.target.value);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
    };
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
                closeDialog();
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdown(false)
            }
        };

        if (isDialogOpen || dropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDialogOpen, dropdown]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Generate a unique filename using date and time
            const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
            const uniqueFileName = `scaled_${timestamp}`;
            setFile(file);
            setFileName(uniqueFileName);
        }
    };

    const fetchOrderData = async () => {
        const userId = localStorage.getItem('_id');
        if (!userId) return;

        try {
            const response = await fetch(`${baseUrl}/order/get?id=${userId}&timeFilter=${timeFilter}&status=${status}`);
            const result = await response.json();
            setOrderData(result.orders || []);
        } catch (error) {
            console.error('Error fetching order data:', error);
        }
    };
    useEffect(() => {
        fetchOrderData();
    }, [status, timeFilter])
    const handleSubmit = async (id: any) => {
        if (!file && !transactionId) {
            toast.error('Please enter a valid transaction details.');
            return;
        }

        const formData = new FormData();
        if (file) formData.append('paymentImage', file);
        if (transactionId) formData.append('transactionId', transactionId);

        try {
            const response = await fetch(`${baseUrl}/order/edit-order?id=${id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload data');
            }


            const result = await response.json();
            console.log('Transaction Details uploaded successfully:', result);
            toast.success('Changes saved successfully');
            setFile(null)
            setTransactionId('')
        } catch (error) {
            console.error('Error uploading data:', error);
        }
    };



    const fetchOrderDetails = async (orderId: string) => {
        try {
            const response = await fetch(`${baseUrl}/order/getOrder?Id=${orderId}`);
            const result = await response.json();
            setSelectedOrderDetails(result.order);
        } catch (error) {
            console.error('Error fetching order details:', error);
        }
    };

    const openDialog = (orderId: string) => {
        fetchOrderDetails(orderId);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedOrderDetails(null);
        setFile(null)
        setFileName(null)
        setTransactionId('')
    };

    useEffect(() => {
        fetchOrderData();
    }, []);

    if (!orderData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="md:p-6">
            <div className='flex justify-between items-start mb-8'>
                <h1 className="md:text-3xl text-2xl font-bold text-left font-serif">Order History</h1>
                <img src={filter.src} alt="filter image" className='w-8 h-8' onClick={() => { setDropdown(true) }} />
            </div>
            {dropdown &&
                <div ref={dropdownRef} className='absolute right-2 md:w-1/4 w-5/6  top-20 flex flex-col  border rounded-xl bg-white shadow'>
                    <div className='flex items-center justify-between w-full bg-gray-100'>
                        <h1 className='font-bold text-lg font-serif px-5 py-3 '>Filter</h1>
                        <div className='pr-2  text-red-600 cursor-pointer' onClick={() => { setDropdown(false) }}>
                            <XIcon className='h-5' />
                        </div>

                    </div>
                    <div className=''>
                        <p className='py-2 font-merr text-lg rounded px-5 font-semibold '>Status Filter</p>
                        <div className="flex px-10 flex-col gap-3 py-4">
                            <div>
                                <input
                                    type="radio"
                                    id="pending"
                                    name="status"
                                    value="pending"
                                    checked={status === 'pending'}
                                    onChange={handleStatusChange}
                                />
                                <label className="pl-2" htmlFor="pending">
                                    InProgress
                                </label>
                            </div>
                            <div>
                                <input
                                    type="radio"
                                    id="completed"
                                    name="status"
                                    value="completed"
                                    checked={status === 'completed'}
                                    onChange={handleStatusChange}
                                />
                                <label className="pl-2" htmlFor="completed">
                                    Completed
                                </label>
                            </div>
                            <div>
                                <input
                                    type="radio"
                                    id="cancelled"
                                    name="status"
                                    value="cancelled"
                                    checked={status === 'cancelled'}
                                    onChange={handleStatusChange}
                                />
                                <label className="pl-2" htmlFor="cancelled">
                                    Cancelled
                                </label>
                            </div>

                        </div>

                    </div>
                    <div className="border-t">
                        <p className="py-2 font-merr text-lg rounded px-5 font-semibold">Time Filter</p>
                        <div className="flex px-10 flex-col gap-3 py-4">
                            <div>
                                <input
                                    type="radio"
                                    id="current"
                                    name="timeFilter"
                                    value="current"
                                    checked={timeFilter === 'current'}
                                    onChange={handleTimeFilterChange}
                                />
                                <label className="pl-2" htmlFor="current">
                                    Current
                                </label>
                            </div>
                            <div>
                                <input
                                    type="radio"
                                    id="previous"
                                    name="timeFilter"
                                    value="previous"
                                    checked={timeFilter === 'previous'}
                                    onChange={handleTimeFilterChange}
                                />
                                <label className="pl-2" htmlFor="previous">
                                    Previous
                                </label>
                            </div>
                        </div>

                    </div>
                    <div className='w-full flex justify-center items-center pb-5'>
                        <button onClick={()=>{setStatus(''),setTimeFilter('')}} className='w-3/4 rounded-full text-white py-2 font0-bold text-merr text-lg bg-blue-900/90' >
                            Clear Filters
                        </button>
                    </div>
                </div>
            }

            <div className="md:h-[800px] overflow-y-auto flex items-start justify-center">
                <div className="grid grid-cols-1 gap-6 w-full">
                    {orderData.length > 0 ? (
                        orderData.map((order) => (
                            <div key={order._id} className="border border-gray-300  h-fit rounded-lg shadow-md bg-white">
                                <div className="flex justify-between items-center border-b-2 py-3 px-3">
                                    <div className={`md:px-4 md:py-2 px-2 py-1 rounded-full w-fit ${order.status === 'pending' ? 'bg-yellow-600' : order.status === 'completed' ? 'bg-green-700 capitalize' : 'bg-red-600 capitalize'}`}>
                                        <span className="text-white md:text-base text-sm">{order.status === 'pending' ? 'InProgress' : order.status}</span>
                                    </div>
                                    <div className="text-center">
                                        <h2 className="md:text-lg text-sm text-gray-500">Order ID</h2>
                                        <p className='md:text-base text-xs'>{order.orderId}</p>
                                    </div>
                                    <div className="text-gray-500 text-center md:text-base text-xs">
                                        <p>{new Date(order.orderDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        <p>{new Date(order.orderDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center px-3 py-3">
                                    <div className="text-center">
                                        <p className="text-gray-500 md:text-lg text-sm">Total Products</p>
                                        <p className='md:text-lg text-sm'>{order.products.length} {order.products.length === 1 ? 'Product' : 'Products'}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-500 md:text-lg text-sm ">Total Payments</p>
                                        <p className='md:text-lg text-sm'>Rs. {order.grandTotal}</p>
                                    </div>
                                    <div className="flex md:gap-1 gap-0 text-blue-900 items-center cursor-pointer" onClick={() => openDialog(order._id)}>
                                        <p className="md:text-lg md:whitespace-normal whitespace-nowrap text-sm">See More</p>
                                        <FaChevronRight className='md:text-base text-xs' />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No orders found.</p>
                    )}

                    {isDialogOpen && selectedOrderDetails && (
                        <>
                            <div className="fixed inset-0 transition-opacity   bg-black/70 z-50"
                                onClick={() => { closeDialog }} />
                            <div ref={dialogRef} className={`fixed right-0 top-0 h-full md:w-1/3 w-full bg-white shadow-xl transform transition-all  duration-500  ease-in-out z-50 ${isDialogOpen
                                    ? 'translate-x-0 opacity-100'
                                    : 'translate-x-full opacity-0'
                                }`}>
                                <div className="flex items-center overflow-x-hidden justify-between rounded-t-xl py-4 border-b-2 bg-gray-100">
                                    <h2 className="text-lg font-semibold px-4">Order Details</h2>
                                    <button onClick={closeDialog} className="p-1 hover:bg-gray-200 rounded-full">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className=" h-[calc(100vh-8rem)] overflow-y-scroll overflow-x-hidden bg-gray-100 flex flex-col">
                                    {/* Header */}
                                    <div className='flex px-2 mx-1 mt-2 py-2 justify-between  items-center border bg-white rounded-xl  '>
                                        <h3 className=" text-base font-semibold ">{selectedOrderDetails.orderId}</h3>
                                        <p className='text-sm text-neutral-400 font-medium'>
                                            {" "}
                                            {new Date(selectedOrderDetails.orderDate).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}{" "}
                                            |{" "}
                                            {new Date(selectedOrderDetails.orderDate).toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            })}
                                        </p>
                                        <p
                                            className={`px-3 py-2 rounded-full font-semibold text-sm text-white capitalize ${selectedOrderDetails.status === 'completed'
                                                ? 'bg-green-700'
                                                : selectedOrderDetails.status === 'pending'
                                                    ? 'bg-yellow-600'
                                                    : selectedOrderDetails.status === 'cancelled'
                                                        ? 'bg-red-500'
                                                        : ''
                                                }`}
                                        >
                                            {selectedOrderDetails.status === 'pending' ? 'InProgress' : selectedOrderDetails.status}
                                        </p>
                                    </div>

                                    {
                                        selectedOrderDetails.status === 'completed' || selectedOrderDetails.status == 'cancelled' ? <></> : <><div className='mt-2 mx-1 bg-white px-2 py-2 rounded-xl border'>
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                                <div className='w-full  flex justify-center items-center'>
                                                    {
                                                        fileName ?
                                                            <span> {fileName}</span>
                                                            :
                                                            <div className='flex gap-3 items-center '>
                                                                <div>
                                                                    <img src={cloud.src} alt="" className='w-6 ' />
                                                                </div>
                                                                <span className='text-blue-900/90  text-center text-base font-medium font-sans '> Upload Payment Details</span>
                                                            </div>

                                                    }
                                                </div>
                                            </label>
                                        </div>
                                            <div className='mt-2 mx-1 flex flex-col bg-white px-2 py-2 rounded-xl border'>
                                                <p className='text-sm p-1 mb-1 text-gray-700'>Transaction ID</p>
                                                <input type="text" value={transactionId}
                                                    onChange={(e) => setTransactionId(e.target.value)}
                                                    placeholder='Enter a Valid Transaction ID' className='p-2 border rounded-lg placeholder:text-sm' />
                                            </div>
                                        </>
                                    }
                                    <div className='w-[100%] px-5 mt-5'>
                                        <div className='flex flex-row overflow-x-auto w-[100%] gap-5 '>
                                            {selectedOrderDetails.paymentDetails.map((detail, index) => (
                                                <div className='w-[100%]'>
                                                    <div key={detail._id} className="payment-item w-80   p-2 px-2 mb-4">
                                                        <div className='flex justify-between  w-full'>
                                                            <h3 className='text-sm'>Payment {index + 1}</h3>
                                                            <p className='text-sm'>
                                                                Rs. {detail.paidAmount} / Rs. {detail.balanceAmount}
                                                            </p>
                                                        </div>

                                                        <div className="payment-image my-2 border rounded-xl border-black/50 flex h-32  items-center justify-center">
                                                            {detail.paymentImage ? (
                                                                <img src={`${ImgbaseUrl}${detail.paymentImage}`} className='object-contain  h-full w-full' alt="Payment Image" />
                                                            ) : (
                                                                <IoMdImage className='w-10 h-10 text-gray-400' />
                                                            )}
                                                        </div>

                                                        <div className='text-left px-3 rounded-xl border-black/30 border py-2'>
                                                            {detail.transactionId
                                                                ? ` ${detail.transactionId}`
                                                                : detail.mode === 'cash'
                                                                    ? 'Cash'
                                                                    : 'No Transaction ID'}
                                                        </div>
                                                    </div>
                                                </div>

                                            ))}
                                        </div>
                                    </div>

                                    {/* Scrollable Product List */}
                                    <div className=" px-4 flex-1  space-y-4 pr-2">
                                        {selectedOrderDetails.products.map((product, index) => {
                                            const offer = product.productId.offers.find(
                                                (offer) => product.quantity >= offer.from && product.quantity <= offer.to
                                            );
                                            const price = selectedOrderDetails.customerId.role === "customer"
                                                ? offer?.customerPrice || product.productId.customerPrice
                                                : offer?.dealerPrice || product.productId.dealerPrice;

                                            return (
                                                <div key={index} className="border-b py-4">
                                                    <div className="flex gap-4 ">
                                                        <div className='w-1/3 h-32'>
                                                            <img src={`${ImgbaseUrl}${product.productId.productImages[0]}`} alt="Product" className="w-full h-full object-contain rounded-md" />
                                                        </div>

                                                        <div className="w-2/3">
                                                            <p className="text-lg font-semibold truncate capitalize">{product.productId.productName}</p>
                                                            <p className="text-gray-700 text-sm">BRAND: <span className='font-medium'>{product.productId.brand}</span></p>
                                                            <p className="text-green-700 text-sm">Inclusive GST: <span className="line-through text-gray-500">&#8377; {product.productId.strikePrice}</span></p>
                                                            <p className="font-medium text-base">Rs. {price}</p>
                                                            <p className="text-sm">Quantity: {product.quantity}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Fixed Payment Summary */}
                                    <div className=" px-4 mt-4 pt-4  ">
                                        <h1 className="text-base font-semibold">Payment Summary</h1>
                                        <div className="text-base mt-3 space-y-2">
                                            <div className="flex justify-between text-gray-600">
                                                <span>Order Total</span>
                                                <span>Rs. {selectedOrderDetails.products.reduce((total, product) => {
                                                    const offer = product.productId.offers.find(
                                                        (offer) => product.quantity >= offer.from && product.quantity <= offer.to
                                                    );
                                                    const price = selectedOrderDetails.customerId.role === "customer"
                                                        ? offer?.customerPrice || product.productId.customerPrice
                                                        : offer?.dealerPrice || product.productId.dealerPrice;
                                                    return total + price * product.quantity;
                                                }, 0)}</span>

                                            </div>
                                            {
                                                selectedOrderDetails.discount?.value > 0 && (
                                                    <div className="flex justify-between text-gray-600">
                                                        <span>Discount</span>
                                                        <span>(-) {selectedOrderDetails.discount.value}</span>
                                                    </div>
                                                )
                                            }


                                            <div className="flex justify-between text-gray-600">
                                                <span>Delivery Charges</span>
                                                <p>
                                                    <span className='text-sm text-green-700 font-medium font-sans'>Free Delivery </span>
                                                    <span className="line-through">Rs. 50</span>
                                                </p>

                                            </div>
                                        </div>

                                    </div>
                                    <div className='bg-white mt-2 border-t'>
                                        <p className='flex px-4 justify-between font-bold  py-4'><span className='font-serif'>Total</span><span>Rs. {selectedOrderDetails.grandTotal}</span></p>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white rounded-xl">
                                        {selectedOrderDetails.status === "completed" ? (
                                            <button
                                                disabled
                                                className="w-full bg-neutral-500 font-bold text-white py-2 rounded-lg hover:bg-gray-700"
                                            >
                                                Payment Completed
                                            </button>
                                        ) : selectedOrderDetails.status === "cancelled" ? (
                                            <button
                                                disabled
                                                className="w-full bg-red-600 font-bold text-white py-2 rounded-lg hover:bg-red-700"
                                            >
                                                Order Cancelled
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleSubmit(selectedOrderDetails._id)}
                                                className="w-full bg-blue-900/90 font-bold text-white py-2 rounded-lg hover:bg-blue-700"
                                            >
                                                Save Changes
                                            </button>
                                        )}
                                    </div>

                                </div>



                            </div>
                        </>
                    )}

                </div>
            </div>
        </div >
    );
};

export default OrderSection;
