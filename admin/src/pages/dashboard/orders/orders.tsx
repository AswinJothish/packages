import { _axios } from "@/lib/_axios";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSignals } from "@preact/signals-react/runtime";
import Pagination from "../../utils/pagination";
import { CiSearch } from "react-icons/ci";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { RadioGroup } from "@/components/ui/radio-group";
import { useEffect,  useState } from "react";
import { format } from "date-fns";
import { signal } from "@preact/signals-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
// import { FaEdit } from 'react-icons/fa';
import { IoMdAdd } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { IoFilter } from "react-icons/io5";
import Topbar from "@/pages/utils/topbar";
import { Check } from "lucide-react";
// import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";
type Status = 'pending' | 'completed' | 'cancelled' | 'rejected' | 'accepted' | 'dispatched' | 'assigned' | 'picked' | 'outfordelivery'|"delivered";


export function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const statuses: Status[] = ["pending", "completed", "cancelled","delivered","dispatched","outfordelivery","assigned","picked","rejected"];
  //const [statusDown, setStatusdown] = useState(false);
const[unverifiedPayments,setUnverifiedPayments]=useState(false)
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
    refetch();
  };
   const handleStatusChange = (status:any) => {
    setSelectedStatus(status);
  };
  const searchQuery = signal<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
      useEffect(() => {
        if (selectedStatus === '') {
            setUnverifiedPayments(false);
        }
    }, [selectedStatus]);
  const { data, isLoading,  refetch } = useQuery({
    queryKey: ['orders', pagination.page, pagination.limit, selectedStatus, unverifiedPayments],
    queryFn: () =>
        _axios.get(`/orders/all`, {
            params: {
                limit: pagination.limit,
                page: pagination.page,
                q: searchQuery.value,
                status: selectedStatus,
                ...(unverifiedPayments && !searchQuery.value && !selectedStatus && { unverifiedPayments: true }), // Include only if no other filters are set
            },
        }),
    select(data) {
        const orders = data.data.orders;
        return {
            orders,
            total: data.data.total,
        };
    },
});
 const handleFilterClick = () => {
        // Toggle unverifiedPayments state
        setUnverifiedPayments((prev) => !prev);
        // Refetch data when the state changes
        refetch();
    };
  const { data: statusData } = useQuery({
    queryKey: ['orderStatusCount'],
    queryFn: () => _axios.get('/orders/all'),
    select(data) {
      const statusCount: Record<Status, number> = {
        pending: 0,
        completed: 0,
        cancelled: 0,
        rejected:0,
        accepted:0,
        dispatched:0,
        delivered:0,
        assigned:0,
        picked:0,
        outfordelivery:0
      };

      // Extract total from the response
      const total = data.data.total;

      // Count the orders by status
      data.data.orders.forEach((order: any) => {
        if (order.status === 'pending') {
          statusCount.pending++;
        }
       else if (order.status === 'completed') {
          statusCount.completed++;
        } else if (order.status === 'cancelled') {
          statusCount.cancelled++;
        }
        else if (order.status === 'rejected') {
          statusCount.cancelled++;
        }
        else if (order.status === 'accepted') {
          statusCount.cancelled++;
        }
        else if (order.status === 'dispatched') {
          statusCount.cancelled++;
        }
        else if (order.status === 'assigned') {
          statusCount.cancelled++;
        }
        else if (order.status === 'picked') {
          statusCount.cancelled++;
        }
        else if (order.status === 'outfordelivery') {
          statusCount.cancelled++;
        }
      });

      // Return both statusCount and total
      return { statusCount, total };
    },
  });





  //pagination
  useEffect(() => {
    if (data) {
      setPagination((prev) => ({
        ...prev,
        total: data.total,
      }));
    }
  }, [data]);

  useEffect(() => {
    searchQuery.value = searchTerm;
    refetch();
  }, [pagination.page, searchTerm]);

  // const openDialog = (orderId: any, currentStatus: any) => {
  //   setSelectedOrderId(orderId);
  //   setSelectedStatus(currentStatus);
  //   setDialogOpen(true);
  // };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedOrderId('');
    setSelectedStatus('');
  };

  // const handleStatusChange = () => {
  //   refetch();
  // };
  //@ts-ignore
  const { statusCount, total } = statusData || { statusCount: {}, total: 0 };


  const calculateTotalPaidAmount = (orderItem: { paymentDetails: any[]; }) => {
    return orderItem.paymentDetails?.reduce(
      (total, payment) => total + (payment.paidAmount || 0),
      0
    );
  };
  

  useSignals();
  if (isLoading) {
    return <div>Loading...</div>;
  } 
  return (
    <>
      <>
        <div className="w-full h-full">
          <div className="flex flex-col gap-5">
          <Topbar title="Orders"  />
            <div className="rounded-md mx-2  ">
              <div className="">
                {/* <div className="flex justify-between px-4 py-5">
                  <div className="">
                    <h1 className="font-bold text-lg">Order History</h1>
                    <hr className="pb-1" />
                    <p className="text-base text-slate-400">
                      Total Orders of sunstar
                    </p>
                  </div>
                 
                </div> */}
                <div className="w-full justify-end  px-2  flex">
                <div className="flex  gap-5">
                    <div className="relative">
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
  <button className="border w-48 h-10  text-sm rounded-lg capitalize text-left focus:ring-0 outline-none border-primary px-4 py-2 bg-white">
    {selectedStatus === '' 
      ? 'Select Status' 
      : selectedStatus === 'outfordelivery' 
        ? 'Out for Delivery' 
        : selectedStatus
    }
  </button>
</DropdownMenuTrigger>
            <DropdownMenuContent>
  <DropdownMenuItem  className={`${
        selectedStatus === status ? '' : 'pl-8'
      } cursor-pointer capitalize w-48 py-2 text-sm flex items-center`} onClick={() => setSelectedStatus('')}>
    {selectedStatus === '' && <Check className="h-4 mr-2 w-4" />}
    Select Status
  </DropdownMenuItem>
  {statuses.map((status: Status) => (
    <DropdownMenuItem
      key={status}
      onClick={() => handleStatusChange(status)}
      className={`${
        selectedStatus === status ? '' : 'pl-8'
      } cursor-pointer capitalize w-48 py-2 text-sm flex items-center`}
    >
      {selectedStatus === status && <Check className="h-4 mr-2 w-4" />}
      {status === 'outfordelivery' ? 'Out for Delivery' : status} ({statusCount[status] || 0})
    </DropdownMenuItem>
  ))}
</DropdownMenuContent>

          </DropdownMenu>
      </div>
      <div className="relative w-[350px]">
  <Input
    type="text"
    onChange={(e) => setSearchTerm(e.target.value)}
    className="!border-primary border rounded-lg text-sm focus-visible:ring-2 focus-visible w-full h-10 pl-4 pr-10 placeholder:text-gray-400"
    placeholder="Search Orders..."
    value={searchTerm}
  />
  <div className="absolute inset-y-0 right-3 flex items-center text-gray-500">
    <CiSearch size={24} />
  </div>
</div>

                  <Button onClick={() => {
                    navigate('/admin/orders/createOrder')
                  }} className="h-10 gap-1 rounded-lg text-base text-white hover:scale-105 duration-500 transition-transform bg-button-gradient"
                  >  <IoMdAdd className="" />
                    Create Order
                  </Button>
                </div>

              </div>
                <div className="flex flex-col h-[80vh] my-5  rounded-lg   mx-2">
                  <Table className="flex-grow ">
                    <TableHeader className="bg-primary/10 w-full">
                      <TableRow className="text-base font-ubuntu">
                        <TableHead className="w-[100px] text-primaryDark text-center">
                          SL.No
                        </TableHead>
                        <TableHead className="text-left text-primaryDark">
                          {" "}
                          Date
                        </TableHead>
                        <TableHead className="text-left text-primaryDark">
                          OrderID
                        </TableHead>
                        <TableHead className="text-left text-primaryDark">
                          Customer Name
                        </TableHead>
                        <TableHead className="text-left text-primaryDark">
                          Customer Type
                        </TableHead>
                        <TableHead className="text-left text-primaryDark">
                          Mobile Number
                        </TableHead>
                        <TableHead className="text-center text-primaryDark">
                          Payment
                        </TableHead>

                        <TableHead className="flex justify-center text-primaryDark items-center">
                          status
                          {/* <DropdownMenu
                            onOpenChange={(open) => setStatusdown(open)}
                          >
                            <DropdownMenuTrigger asChild>
                              <button className="">
                                {statusDown ? (
                                  <MdArrowDropUp className="text-xl" />
                                ) : (
                                  <MdArrowDropDown className="text-xl" />
                                )}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                              <RadioGroup
                                value={selectedStatus}
                                onValueChange={(value) => {
                                  setSelectedStatus(value);
                                  setStatusdown(false);
                                }}
                              >
                                <DropdownMenuCheckboxItem
                                  checked={selectedStatus === "all"}
                                  onClick={() => {
                                    setSelectedStatus("");
                                    setStatusdown(false);
                                  }}
                                >
                                  All
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                  checked={selectedStatus === "pending"}
                                  onClick={() => {
                                    setSelectedStatus("pending");
                                    setStatusdown(false);
                                  }}
                                >
                                  Pending
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                  checked={selectedStatus === "completed"}
                                  onClick={() => {
                                    setSelectedStatus("completed");
                                    setStatusdown(false);
                                  }}
                                >
                                  Completed
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                  checked={selectedStatus === "cancelled"}
                                  onClick={() => {
                                    setSelectedStatus("cancelled");
                                    setStatusdown(false);
                                  }}
                                >
                                  Cancelled
                                </DropdownMenuCheckboxItem>
                              </RadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu> */}
                        </TableHead>
                        <TableHead>
                        <IoFilter onClick={handleFilterClick} />
                        </TableHead>
                        {/* <TableHead className="text-center ">
                          Action
                        </TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody className="">
                    {data?.orders?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center text-gray-500">
                              No Orders available
                            </TableCell>
                          </TableRow>
                        ): data?.orders?.map((item: any, index: any) => (
                            <TableRow
                              key={item._id}
                              onClick={() => {
                                navigate(`/admin/orders/order/${item._id}`)
                              }}
                              // className={`${index % 2 === 0 ? "bg-white" : "bg-slate-100"
                              //   } hover:bg-gray-200 `}
                              className="hover:bg-gray-50 -z-20 text-base cursor-pointer"
                            >
                              <TableCell className="text-center">
                                {(pagination.page - 1) * pagination.limit +
                                  (index + 1)}
                              </TableCell>
                              <TableCell className="text-left text-base">
                                {format(
                                  new Date(item.createdAt),
                                  "do MMM , yyyy , h:mm a"
                                )}
                              </TableCell>
                              <TableCell onClick={() => {
                                // console.log(item._id)
                                navigate(`/admin/orders/order/${item._id}`)
                              }} className="text-left hover:text-blue-500 hover:underline cursor-pointer">
                                {item.orderId}
                              </TableCell>
                              <TableCell className="text-left"
                              >
                                {item?.customerId?.username}
                              </TableCell>
                              <TableCell className="text-left">
                                {item?.customerId?.role}
                              </TableCell>
                              <TableCell className="text-left">
                                {item?.customerId?.mobileNumber}
                              </TableCell>
                              <TableCell className="text-center">
      {calculateTotalPaidAmount(item) > 0 
        ? `₹ ${calculateTotalPaidAmount(item)} / ₹ ${item?.grandTotal}`
        : `-`}
    </TableCell>
    
    
                              <TableCell>
                                  <div className={`flex z-50 rounded-full text-sm capitalize justify-center items-center ${
    item.status === 'completed'
      ? 'bg-green-700 text-white px-2 py-1'
      : item.status === 'pending'
      ? 'bg-yellow-500 text-black px-2 py-1'
      : item.status === 'cancelled'
      ? 'bg-red-600 text-white px-2 py-1'
      : item.status === 'rejected'
      ? 'bg-gray-500 text-white px-2 py-1'
      : item.status === 'accepted'
      ? 'bg-blue-500 text-white px-2 py-1'
      : item.status === 'assigned'
      ? 'bg-teal-500 text-white px-2 py-1' 
      : item.status === 'picked'
      ? 'bg-pink-700 text-white px-2 py-1' 
      : item.status === 'outfordelivery'
      ? 'bg-orange-500 text-white px-2 py-1' 
      : item.status === 'delivered'
      ? 'bg-green-500 text-white px-2 py-1' 
      : 'bg-gray-400 text-black px-2 py-1'
  }`}>
                                  <div className="flex justify-center items-center">
                                  {item.status}
                                  {item.status === "completed" ? <>
    
                                  </> : <>
                                    {/* <button
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevents the row click event
                                        openDialog(item._id, item.status);
                                      }}
                                      className='ml-2  text-xl  text-blue-500  hover:text-blue-700 '
                                    >
                                      <FaEdit />
                                    </button> */}
                                  </>
    
                                  }
                                </div>
                                  </div>
                              </TableCell>
                              {/* <TableCell className="text-center max-w-[100px]   overflow-x-auto ">
                                <button
                                  onClick={() => { navigate(`/admin/orders/order/${item._id}`) }}
                                  className="hover:scale-110 duration-100 transition hover:underline text-blue-500" >view</button>
                              </TableCell> */}
                           <TableCell>
      {item.status === "pending" ? (
        <div className="flex justify-center items-center">
          {item.payment && item.payment.some((paymentObj: { verified: string; }) => paymentObj.verified === "false") && (
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          )}
        </div>
      ) : null}
    </TableCell>
                            </TableRow>
                          ))}
                        
                 
                    </TableBody>
                  </Table>
                  <TableCaption className="mt-auto">
        <Pagination
        total={data?.total}   
        limit={pagination.limit}   
        page={pagination.page}       
        callback={handlePageChange}  
      />
                  </TableCaption>
                  
                  <StatusDialog
                    isOpen={dialogOpen}
                    onClose={closeDialog}
                    orderId={selectedOrderId}
                    currentStatus={selectedStatus}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </>
  );
}
interface StatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}


function StatusDialog({ isOpen, onClose, orderId, currentStatus, onStatusChange }: StatusDialogProps) {
  const [status, setStatus] = useState(currentStatus)

  const handleUpdate = async () => {
    try {
      await _axios.patch(`orders/order/${orderId}/status`, { status });
      onStatusChange(status);
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };
  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-20">
      <div className="bg-white p-8 px-14 rounded shadow-lg">
        <h3 className="text-lg font-bold mb-4">Order Status</h3>
        <div className="flex flex-col gap-2">
          <label className="text-yellow-500">
            <input
              type="radio"
              name="status"
              value="pending"
              checked={status === "pending"}
              className="mr-3"
              onChange={() => setStatus("pending")}
            />
            Pending
          </label>
          <label className="text-green-500">
            <input
              type="radio"
              name="status"
              value="completed"
              className="mr-3"
              checked={status === "completed"}
              onChange={() => setStatus("completed")}
            />
            Completed
          </label>
          <label className="text-red-500">
            <input
              type="radio"
              name="status"
              value="cancelled"
              className="mr-3"
              checked={status === "cancelled"}
              onChange={() => setStatus("cancelled")}
            />
            Cancelled
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={handleUpdate} className="bg-blue-500 text-white px-4 py-2 rounded">
            Update
          </button>
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}