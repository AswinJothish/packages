import { _axios } from "@/lib/_axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import profile from '@/assets/profile.png';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoMdArrowBack } from "react-icons/io";
import { useState } from "react";

export function Id() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data, isLoading } = useQuery({
    queryKey: ["currentUser", id],
    queryFn: () => _axios.get(`/users/get/${id}`),
    select(data) {
      return {
        user: data?.data,
      };
    },
  });

  const [showAll, setShowAll] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const user = data?.user?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-lg font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-4">
      <div className="flex">
        <div
          onClick={() => window.history.back()}
          className="flex gap-2 items-center justify-center hover:text-primary cursor-pointer text-gray-400"
        >
          <span className="text-xl"><IoMdArrowBack /></span>
        </div>
      </div>

      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="container mx-auto  flex flex-col justify-center items-center">
          <div className="relative w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-10 py-10 flex items-center">
              <div className="w-1/3">
                <div className="rounded-full border-4 border-white w-40 h-40 bg-white shadow-xl flex justify-center items-center">
                  {user.profileImage ? (
                    <img
                      src={`http://65.0.108.35:4000/api/admin/files/view?key=${user?.profileImage}`} 
                      alt="Profile"
                      className="rounded-full object-cover h-40 w-40"
                    />
                  ) : (
                    <img
                      src={profile} 
                      alt="Profile"
                      className="rounded-full h-40 w-40 bg-white p-10"
                    />
                  )}
                </div>
              </div>

              <div className="w-full">
                <h1 className="text-xl text-left font-bold text-primary pb-4">Customer Details</h1>
                <div className="grid grid-cols-4 justify-center items-center gap-12 mt-4">
                  {[
                    { label: "User Name", value: user?.username || "-", className: "relative" },
                    { label: "Mobile Number", value: user?.mobileNumber || "Mobile Number", className: "relative" },
                    { label: "UserId", value: user?.userid || "User Id", className: "relative" },
                    { label: "Role", value: user?.role || "User Role", className: "relative" },
                  ].map(({ label, value, className }, index) => (
                    <div key={index} className={className}>
                      <div className="absolute text-xs text-gray-500 -top-2 left-3 px-1 bg-white z-10 transition-all duration-200 ease-in-out">
                        {label}
                      </div>
                      <input
                        type="text"
                        value={value}
                        readOnly
                        className="block w-full p-2 h-10 text-sm text-gray-900 bg-white border border-blue-100 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                        onFocus={(e) => e.target.classList.add('filled')}
                        onBlur={(e) => {
                          if (!e.target.value) {
                            e.target.classList.remove('filled');
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>

                {user?.deliveryAddress && (
                  <div className="mt-4 w-full">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-medium text-gray-500 py-2">Delivery Address</h2>
                      {user.deliveryAddress.length > 1 && (
                        <button
                          onClick={() => {
                            setShowAll(!showAll);
                            toggleDrawer();
                          }}
                          className="text-primary text-sm"
                        >
                          {showAll ? 'View More' : 'View More'}
                        </button>
                      )}
                    </div>

                    <div className="mt-2">
                      {(user.deliveryAddress.slice(0, 1)).map((address:any, index:any) => (
                        <div key={index} className="mb-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                            {/* Address Tag */}
                            <div className="relative w-full">
                              <div className="absolute text-xs text-gray-500 -top-2 left-3 px-1 bg-white z-10 transition-all duration-200 ease-in-out">
                                Address Tag
                              </div>
                              <input
                                type="text"
                                value={address?.tag || ""}
                                className="block w-full p-2 h-auto text-sm text-gray-900 bg-white border border-blue-100 rounded-md resize-none overflow-hidden"
                                readOnly
                                style={{ overflowWrap: "break-word" }}
                              />
                            </div>

                            {/* Flat Number */}
                            <div className="relative w-full">
                              <div className="absolute text-xs text-gray-500 -top-2 left-3 px-1 bg-white z-10 transition-all duration-200 ease-in-out">
                                Flat Number
                              </div>
                              <input
                                type="text"
                                value={address.address.flatNumber || ""}
                                className="block w-full p-2 h-auto text-sm text-gray-900 bg-white border border-blue-100 rounded-md resize-none overflow-hidden"
                                readOnly
                                style={{ overflowWrap: "break-word" }}
                              />
                            </div>

                            {/* Area */}
                            <div className="relative w-full">
                              <div className="absolute text-xs text-gray-500 -top-2 left-3 px-1 bg-white z-10 transition-all duration-200 ease-in-out">
                                Area
                              </div>
                              <input
                                type="text"
                                value={address.address.area || ""}
                                className="block w-full p-2 h-auto text-sm text-gray-900 bg-white border border-blue-100 rounded-md resize-none overflow-hidden"
                                readOnly
                                style={{ overflowWrap: "break-word" }}
                              />
                            </div>

                            {/* Nearby Landmark */}
                            {address.address.nearbyLandmark && (
                              <div className="relative w-full">
                                <div className="absolute text-xs text-gray-500 -top-2 left-3 px-1 bg-white z-10 transition-all duration-200 ease-in-out">
                                  Nearby Landmark
                                </div>
                                <input
                                  type="text"
                                  value={address.address.nearbyLandmark || ""}
                                  className="block w-full p-2 h-auto text-sm text-gray-900 bg-white border border-blue-100 rounded-md resize-none overflow-hidden"
                                  readOnly
                                  style={{ overflowWrap: "break-word" }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg w-full rounded-lg mt-10 p-6 ">
  <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Order History</h2>
  {user?.orders?.length > 0 ? (
    <table className="min-w-full text-left border-collapse">
      <thead>
        <tr className="border-b bg-gray-100 rounded">
          <th className="py-2 px-3 text-sm text-gray-600 font-semibold">Order ID</th>
          <th className="py-2 px-3 text-sm text-gray-600 font-semibold  text-center">Products</th>
          <th className="py-2 px-3 text-sm text-gray-600 font-semibold text-center">Grand Total</th>
          <th className="py-2 px-3 text-sm text-gray-600 font-semibold  text-center">Status</th>
          <th className="py-2 px-3 text-sm text-gray-600 font-semibold  text-center">Action</th> 
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {user.orders.map((order: any) => (
          <tr key={order._id} className="border-b">
            <td className="py-2 px-3  text-sm text-gray-700">{order.orderId}</td>
            <td className="py-2 px-3 text-sm">
  {order.products.map((product: any) => (
    <div  key={product.productId._id} className="text-sm flex justify-between text-gray-600">
     
      <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
        <span className="text-left cursor-default"> {product.productId.productCode}  </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-[10px]">{product.productId.productName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
      <span>Qty: {product.quantity} pcs</span>
    </div>
  ))}
</td>

            <td className="py-2 px-3 text-sm text-center text-gray-700 "> ₹ {order.grandTotal}</td>
            <td className="py-2 px-3 text-sm capitalize text-gray-700  text-center">{order.status}</td>
            <td className="py-2 px-3 text-sm text-gray-700  text-center">
              <button className="text-primary hover:underline  text-center" onClick={()=>{navigate(`/admin/orders/order/${order._id}`)}}>View</button> 
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <div className="text-center text-gray-500">No order history available.</div>
  )}
</div>
        </div>
      </div>

      {isDrawerOpen && (
  <div>
    <div className="w-full h-full inset-0 fixed z-50 bg-black/80" onClick={toggleDrawer}>
      <div
        className={`fixed right-0 z-50 top-0 h-full w-[350px] bg-white shadow-2xl transition-transform transform-gpu duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 h-full flex flex-col">
          <h2 className="text-xl font-semibold text-center text-primary mb-6">All Delivery Addresses</h2>
          <div className="overflow-auto flex-grow">
            <div className="space-y-4">
              {user.deliveryAddress.map((address:any, index:any) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200"
                >
                  <div className="space-y-2">
                    <div className="flex text-sm">
                      <span className="font-medium text-gray-400 w-32">Address Tag</span>
                      <span className="pr-3 pl-1">:</span>
                      <span className="text-gray-800">{address?.tag || "N/A"}</span>
                    </div>
                    <div className="flex text-sm">
                      <span className="font-medium text-gray-400 w-32">Flat Number</span>
                      <span className="pr-3 pl-1">:</span>
                      <span className="text-gray-800">{address.address.flatNumber || "N/A"}</span>
                    </div>
                    <div className="flex text-sm">
                      <span className="font-medium text-gray-400 w-32">Area</span>
                      <span className="pr-3 pl-1">:</span>
                      <span className="text-gray-800">{address.address.area || "N/A"}</span>
                    </div>
                    {address.address.nearbyLandmark && (
                      <div className="flex text-sm">
                        <span className="font-medium text-gray-400 w-32">Nearby Landmark</span>
                        <span className="pr-3 pl-1">:</span>
                        <span className="text-gray-800">{address.address.nearbyLandmark || "N/A"}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={toggleDrawer}
            className="mt-8 w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
