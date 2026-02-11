import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { baseUrl } from "../lib/config";
import location from "../../public/images/location.png";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
interface Address {
    _id: string;
    tag: string;
    address: {
        receiverName: string;
        nearbyLandmark: string;
        flatNumber: string;
        area: string;
        receiverMobileNumber: string;
    };
}

interface UserData {
    _id: string;
    deliveryAddress: Address[];
}

const AddressSection: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [editAddressId, setEditAddressId] = useState<string | null>(null);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [tag, setTag] = useState<string>("Home");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

const [editDialogOpen,setEditDialogOpen]=useState(false)
    const fetchUserData = async () => {
        const userId = localStorage.getItem('_id');
        if (!userId) return;

        try {
            const response = await fetch(`${baseUrl}/users/get?id=${userId}`);
            const result = await response.json();
            if (result.data) setUserData(result.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

   

    useEffect(() => {
        fetchUserData();
    }, []);

    const validationSchema = z.object({
        flatNumber: z.string().min(1, "Flat Number is required"),
        area: z.string().min(1, "Area is required"),
        nearbyLandmark: z.string().optional(),
        receiverName: z.string().min(2, "Receiver Name is required"),
        receiverMobileNumber: z.string().regex(/^\d+$/, "Receiver Mobile Number must be numeric").min(10, "Must be at least 10 digits")
    });

    type FormData = z.infer<typeof validationSchema>;

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(validationSchema),
    });
    const openEditDialog = (address: Address) => {
        setEditAddressId(address._id);
        setEditDialogOpen(true);
        setTag(address.tag);
        reset({
            flatNumber: address.address.flatNumber,
            area: address.address.area,
            nearbyLandmark: address.address.nearbyLandmark,  
            receiverName: address.address.receiverName, 
            receiverMobileNumber: address.address.receiverMobileNumber,
        });
    };

    const handleEditAddress: SubmitHandler<FormData> = async (data) => {
        const customerId = localStorage.getItem('_id');
        if (!customerId || !editAddressId) return;
    
        const updatedAddress = {
            userId:customerId,
            address: {
                ...data,               
                _id: editAddressId,    
                tag:tag                  
            }
        };
    
        try {
            const response = await fetch(`${baseUrl}/order/editAddress`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedAddress),
            });
    
            if (response.ok) {
                fetchUserData();
                setEditDialogOpen(false);
                toast.success("Address updated successfully");
                reset();
            } else {
                const errorData = await response.json();
                console.error("Failed to update address", errorData);
            }
        } catch (error) {
            toast.error('Error updating address');
            console.error('Error updating address:', error);
        }
    };
    
    const handleDelete = async () => {
        const customerId = localStorage.getItem('_id');
        if (!customerId || !selectedAddressId) return;

        try {
            const response = await fetch(`${baseUrl}/users/deleteAddress?customerId=${customerId}&addressId=${selectedAddressId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchUserData();
                setDeleteDialogOpen(false);
                toast.success('Delivery Address deleted successfully');
            } else {
                console.error("Failed to delete address");
            }
        } catch (error) {
            toast.error('Error Deleting Address');
            console.error('Error deleting address:', error);
        }
    };

    const openDeleteDialog = (addressId: string) => {
        setSelectedAddressId(addressId);
        setDeleteDialogOpen(true);
    };


    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedAddressId(null);
    };
    const cancelEditForm=()=>{
        setEditDialogOpen(false);
    setTag("Home")
        reset({
            
            flatNumber: "",
            area: "",
            nearbyLandmark: "",  
            receiverName: "", 
            receiverMobileNumber: "",
        });
    }

    const handleAddAddress: SubmitHandler<FormData> = async (data) => {
        const customerId = localStorage.getItem('_id');
        if (!customerId) return;

        const newAddress = {
            customerId: customerId,
            tag: tag,
            address: data,
        };
        console.log(newAddress)

        try {
            const response = await fetch(`${baseUrl}/order/updateAddress`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newAddress),
            });

            if (response.ok) {
                fetchUserData();
                setAddDialogOpen(false);
                toast.success("Address added successfully");
                reset();
            } else {
                console.error("Failed to add address");
            }
        } catch (error) {
            toast.error('Error adding address');
            console.error('Error adding address:', error);
        }
    };

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold ">Address</h1>
                <button onClick={() => {reset(),setAddDialogOpen(true)}} className="md:px-5 md:py-2  px-2 font-medium border rounded-lg shadow font-serif text-gray-600 bg-neutral-50 hover:bg-gray-600 hover:text-white">
                    Add address
                </button>
            </div>
<div className="h-[700px]  items-start overflow-y-auto flex justify-start">
{userData?.deliveryAddress.length ? (
    <div className="grid md:grid-cols-2 grid-cols-1  w-full gap-x-10  md:gap-y-8 gap-y-4 md:p-5 p-1">
        {userData.deliveryAddress.map((address) => (
            <div key={address._id} className="md:py-4 py-3 px-3 md:px-10 h-fit w-full flex flex-row gap-10 border items-center rounded shadow">
                <img src={location.src} alt="location" className="h-10 w-10" />
                <div className="flex w-full flex-col gap-2">
                    <div className="flex w-full justify-between items-center">
                        <h1 className="font-bold text-xl font-serif">{address.tag}</h1>
                        <div className="flex gap-5">
                            <FaPencilAlt onClick={()=>openEditDialog(address)} className="cursor-pointer" />
                            <FaTrashAlt
                                className="cursor-pointer"
                                onClick={() => openDeleteDialog(address._id)}
                            />
                        </div>
                    </div>
                    <p>{address.address.flatNumber}, {address.address.area}</p>
                    <p>{address.address.receiverMobileNumber}</p>
                </div>
            </div>
        ))}
    </div>
) : (
    <p>No addresses available.</p>
)}
</div>


            {deleteDialogOpen && (
                <div className="fixed inset-0  flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg md:w-1/3 w-5/6">
                        <h2 className="text-lg font-bold mb-4">Do you want to delete this address?</h2>
                        <div className="flex justify-end gap-4">
                            <button onClick={closeDeleteDialog} className="px-4 py-2 bg-gray-300 rounded text-gray-700 hover:bg-gray-400">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {addDialogOpen && (
                <div className="fixed inset-0 flex mt-14 items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg md:w-1/3 w-5/6">
                        <h1 className="text-xl font-serif font-bold text-center mb-2">Add New Address</h1>

                        {/* Scrollable content wrapper */}
                        <div className="overflow-y-auto max-h-[90vh]">
                            <form onSubmit={handleSubmit(handleAddAddress)} className="flex flex-col gap-2">
                                <input {...register("flatNumber")} placeholder="Flat Number*" className="border placeholder:text-gray-300 p-2 rounded" />
                                {errors.flatNumber && <p className="text-red-500">{errors.flatNumber.message}</p>}

                                <input {...register("area")} placeholder="Area*" className="border placeholder:text-gray-300 p-2 rounded" />
                                {errors.area && <p className="text-red-500">{errors.area.message}</p>}

                                <input {...register("nearbyLandmark")} placeholder="Nearby Landmark" className="border placeholder:text-gray-300 p-2 rounded" />

                                <p>Save as <span>&#42;</span></p>
                                <div className="grid grid-cols-3 gap-5">
                                    {["Home", "Office", "Others"].map((option) => (
                                        <div
                                            key={option}
                                            className={`cursor-pointer text-center px-3 py-1 rounded border ${tag === option ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                                            onClick={() => setTag(option)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>

                                <input {...register("receiverName")} placeholder="Receiver Name*" className="border p-2 rounded placeholder:text-gray-300" />
                                {errors.receiverName && <p className="text-red-500">{errors.receiverName.message}</p>}
                                <input
                                    {...register("receiverMobileNumber")}
                                    placeholder="Receiver Mobile Number*"
                                    className="border placeholder:text-gray-300 p-2 rounded"
                                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => e.target.value = e.target.value.replace(/\D/g, '')} // Only numbers
                                    maxLength={10}
                                />
                                {errors.receiverMobileNumber && <p className="text-red-500">{errors.receiverMobileNumber.message}</p>}

                                <div className="flex justify-center gap-4 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAddDialogOpen(false);
                                            reset(); // Reset the form
                                        }}
                                        className="px-4 py-2 bg-gray-300 rounded text-gray-700 hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        Add Address
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
          
          
          {editDialogOpen && (
    <div className="fixed inset-0 flex mt-14 items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded shadow-lg md:w-1/3 w-5/6">
            <h1 className="text-xl font-serif font-bold text-center mb-2">Edit Address</h1>

            <div className="overflow-y-auto max-h-[90vh]">
                <form onSubmit={handleSubmit(handleEditAddress)} className="flex flex-col gap-2">
                    {/* Existing form fields with `register` */}
                    <input   {...register("flatNumber")} placeholder="Flat Number*" className="border placeholder:text-gray-300 p-2 rounded" />
                    {errors.flatNumber && <p className="text-red-500">{errors.flatNumber.message}</p>}
                    
                    <input {...register("area")} placeholder="Area*" className="border placeholder:text-gray-300 p-2 rounded" />
                    {errors.area && <p className="text-red-500">{errors.area.message}</p>}
                    
                    <input {...register("nearbyLandmark")} placeholder="Nearby Landmark" className="border placeholder:text-gray-300 p-2 rounded" />
                    
                    <p>Save as <span>&#42;</span></p>
                    <div className="grid grid-cols-3 gap-5">
                        {["Home", "Office", "Others"].map((option) => (
                            <div
                                key={option}
                                className={`cursor-pointer text-center px-3 py-1 rounded border ${tag === option ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                                onClick={() => setTag(option)}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                    
                    <input {...register("receiverName")} placeholder="Receiver Name*" className="border p-2 rounded placeholder:text-gray-300" />
                    {errors.receiverName && <p className="text-red-500">{errors.receiverName.message}</p>}
                    
                    <input
                        {...register("receiverMobileNumber")}
                        placeholder="Receiver Mobile Number*"
                        className="border placeholder:text-gray-300 p-2 rounded"
                        onInput={(e: React.ChangeEvent<HTMLInputElement>) => e.target.value = e.target.value.replace(/\D/g, '')} // Only numbers
                        maxLength={10}
                    />
                    {errors.receiverMobileNumber && <p className="text-red-500">{errors.receiverMobileNumber.message}</p>}
                    
                    <div className="flex justify-center gap-4 mt-4">
                        <button
                            type="button"
                            onClick={() => {
                               cancelEditForm()
                            }}
                            className="px-4 py-2 bg-gray-300 rounded text-gray-700 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Update Address
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
)}


        </div>
    );
};

export default AddressSection;