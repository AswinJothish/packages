import { useEffect, useState } from 'react';
import { IoIosArrowUp } from "react-icons/io";
import { baseUrl } from '../lib/config';
import { toast } from 'react-toastify';
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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

const CheckoutAddress = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [userId, setUserId] = useState('');
  const [tag, setTag] = useState<string>("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
const [selectedAddressId,setSelectedAddressId]=useState("")
  const validationSchema = z.object({
    // tag: z.string().min(1, "Tag is required"),
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

  useEffect(() => {
    const id = localStorage.getItem("_id");
    if (id) {
      setUserId(id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);
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

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${baseUrl}/users/get?id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.data.deliveryAddress || []);
      } else {
        toast.error('Failed to fetch addresses');
      }
    } catch (error) {
      toast.error('Error fetching user data');
    }
  };

  const handleEditClick = (address: Address) => {
    setEditingAddress(address);
    setTag(address.tag);
    setIsEditDialogOpen(true);
   
  };
 
  const handleAddressSelect = (address: Address) => {
    localStorage.setItem('SelectedAddress', JSON.stringify(address));
  };
  useEffect(()=>{
   const selectedAddress=JSON.parse(localStorage.getItem('selectedAddress'));
   if(selectedAddress){
    setSelectedAddressId(selectedAddress._id)
   }
  }
)

  const handleEditSubmit: SubmitHandler<FormData> = async (data) => {
  const customerId = localStorage.getItem('_id');
  if (!customerId || !editingAddress?._id) return;

  const updatedAddress = {
    userId: customerId,
    address: {
      ...data,
      _id: editingAddress._id,
      tag: tag
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
      setIsEditDialogOpen(false); 
      toast.success("Address updated successfully");
      reset(); // Reset form values
    } else {
      const errorData = await response.json();
      console.error("Failed to update address", errorData);
    }
  } catch (error) {
    toast.error('Error updating address');
    console.error('Error updating address:', error);
  }
};

  return (
    <div className="w-full ">
      <div className="px-5 bg-white rounded-xl shadow-sm">
        <div className="flex justify-between items-center py-4">
          <h2 className="text-lg font-bold font-serif">Delivery Address</h2>

          <div className='flex gap-2'>
            <button onClick={()=>{setAddDialogOpen(true)}} className='bg-blue-800/90 rounded px-5 py-2 text-white font-base hover:bg-blue-900/90'>
              Add 
            </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <IoIosArrowUp className={`transform transition-transform duration-300 ${!isExpanded ? 'rotate-180' : ''}`} />
          </button>
          </div>
          
        </div>
        
        {isExpanded && (
          <div className="grid h-[70vh] overflow-y-auto grid-cols-1 md:grid-cols-2 gap-4 pb-4">
            {addresses.map((address) => (
              <div key={address._id} className="border h-fit rounded-xl p-4">
                <div className="relative">
                  <div className="absolute top-0 right-0 flex gap-4">
                    <input 
                      type="radio" 
                      name="deliveryAddress" 
                      value={address._id} 
                      className="mt-1"
                    //  checked={selectedAddressId === address._id}
                      onChange={() => handleAddressSelect(address)}
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

      {/* Edit Address Dialog */}
      {isEditDialogOpen && editingAddress && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-xl mx-4">
      <h2 className="font-bold text-lg mb-4">Edit Delivery Address</h2>
      <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
        <input type="hidden" name="edit-address-id" defaultValue={editingAddress._id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-receiverName" className="block text-sm font-medium text-gray-700">Receiver Name*</label>
            <input
              type="text"
              id="edit-receiverName"
              name="edit-receiverName"
              className="w-full px-4 py-2 border rounded mt-1"
              defaultValue={editingAddress.address.receiverName}
              {...register("receiverName")}
            />
            {errors.receiverName && <p className="text-red-500">{errors.receiverName.message}</p>}
          </div>

          <div>
            <label htmlFor="edit-receiverMobileNumber" className="block text-sm font-medium text-gray-700">Reciever Mobile Number*</label>
            <input
              type="text"
              id="edit-receiverMobileNumber"
              name="edit-receiverMobileNumber"
              className="w-full px-4 py-2 border rounded mt-1"
              defaultValue={editingAddress.address.receiverMobileNumber}
              {...register("receiverMobileNumber")}
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => e.target.value = e.target.value.replace(/\D/g, '')} // Only numbers
              maxLength={10}
            />
            {errors.receiverMobileNumber && <p className="text-red-500">{errors.receiverMobileNumber.message}</p>}
          </div>
        </div>
        <div>
                  <label htmlFor="edit-tag" className="block text-sm font-medium text-gray-700">Tag*</label>
                  <div className="grid grid-cols-3 gap-5">
                    {["Home", "Office", "Others"].map((option) => (
                      <div
                        key={option}
                        className={`cursor-pointer text-center px-3 py-1 rounded border ${tag === option ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                        onClick={() => {setTag(option)}}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  {/* {errors.tag && <p className="text-red-500">{errors.tag.message}</p>} */}
                </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="edit-flatNumber" className="block text-sm font-medium text-gray-700">Flat Number*</label>
            <input
              type="text"
              id="edit-flatNumber"
              name="edit-flatNumber"
              className="w-full px-4 py-2 border rounded mt-1"
              defaultValue={editingAddress.address.flatNumber}
              {...register("flatNumber")}
            />
            {errors.flatNumber && <p className="text-red-500">{errors.flatNumber.message}</p>}
          </div>

          <div>
            <label htmlFor="edit-area" className="block text-sm font-medium text-gray-700">Area*</label>
            <input
              type="text"
              id="edit-area"
              name="edit-area"
              className="w-full px-4 py-2 border rounded mt-1"
              defaultValue={editingAddress.address.area}
              {...register("area")}
            />
            {errors.area && <p className="text-red-500">{errors.area.message}</p>}
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
            {...register("nearbyLandmark")}
          />
        </div>

        

        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            onClick={() => {
              setIsEditDialogOpen(false);
              setEditingAddress(null);

              reset();
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

{addDialogOpen && (
                <div className="fixed inset-0 flex mt-14 items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg w-1/3">
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
    </div>
  );
};

export default CheckoutAddress;