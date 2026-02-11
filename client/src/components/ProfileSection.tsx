import  { useEffect, useState } from 'react';
import profile from "../../public/images/profile.png";
import { baseUrl, ImgbaseUrl } from "../lib/config";
import { FaPencilAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { DiscAlbum } from 'lucide-react';

interface UserData {
    _id: string;
    username: string;
    role: string;
    profileImage: string;
    mobileNumber: string;
    userid: string;
    active: boolean;
    orders: any[];
    deliveryAddress: any[];
    cart: any[];
    __v: number;
}

const ProfileSection: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [updatedUsername, setUpdatedUsername] = useState("");
    const [updatedProfileImage, setUpdatedProfileImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
const [isDeletedDialogOpen,setIsDeleteDialogOpen]=useState(false);
    const fetchUserData = async () => {
        const userId = localStorage.getItem('_id');
        if (!userId) return;

        try {
            const response = await fetch(`${baseUrl}/users/get?id=${userId}`);
            const result = await response.json();

            if (result.data) {
                setUserData(result.data);
                setUpdatedUsername(result.data.username);
                setPreviewImage(`${ImgbaseUrl}${result.data.profileImage}`);
                
                const event = new CustomEvent('userDataLoaded', {
                    detail: result.data
                });
                window.dispatchEvent(event);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };
    const handleDelete = async () => {
        const customerId = localStorage.getItem('_id');
        if (!customerId ) return;

        try {
            const response = await fetch(`${baseUrl}/users/delete?id=${customerId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchUserData();
                setIsDeleteDialogOpen(false);
                toast.success('User Account Deleted Successfully');
                localStorage.removeItem('userToken');
                localStorage.removeItem('_id'); 
                localStorage.removeItem('userData')
                localStorage.removeItem('userId')
                window.location.href = '/';
            } else {
                console.error("Failed to delete address");
            }
        } catch (error) {
            toast.error('Error Deleting Address');
            console.error('Error deleting address:', error);
        }
    };
    useEffect(() => {
        fetchUserData();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setUpdatedProfileImage(file);

        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPreviewImage(previewUrl);
        }
    };

    const handleSave = async () => {
        if (!userData) return;

        if (updatedUsername === '') {
            toast.error('Invalid UserName');
            return;
        }

        const formData = new FormData();
        formData.append("username", updatedUsername);
        if (updatedProfileImage) {
            formData.append("profileImage", updatedProfileImage);
        }

        try {
            const userId = localStorage.getItem('_id');
            const response = await fetch(`${baseUrl}/users/update?id=${userId}`, {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                await fetchUserData();  // Refetch user data after updating
                setEditMode(false);
                setUpdatedProfileImage(null);
                toast.success("Profile updated successfully");
            } else {
                console.error("Failed to update user data");
            }
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setUpdatedUsername(userData?.username || "");
        setUpdatedProfileImage(null);
    };

    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
      
        <div className="profile-container w-full ">
            <div className='mb-10 grid grid-cols-2 w-full'>
                <h1 className="text-3xl font-bold text-left font-serif bg-white">Profile</h1>
                <div className='md:flex-none flex justify-end'>
                    {editMode ? (
                        <>
                            <button
                                onClick={handleSave}
                                className='font-custom_thin font-thin px-4 py-2 rounded-lg shadow bg-blue-500 text-white border mr-2'>
                                Save
                            </button>
                            <button
                                onClick={handleCancel}
                                className='font-custom_thin font-thin px-4 py-2 rounded-lg shadow bg-neutral-200 hover:bg-gray-700 hover:text-white border'>
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditMode(true)}
                            className='font-custom_thin font-thin px-4 py-2 rounded-lg shadow bg-neutral-200 hover:bg-gray-700 hover:text-white border'>
                            Edit
                        </button>
                    )}
                </div>
            </div>

            <div className="user-info space-y-6">
                <div className="space-y-4 md:w-2/3 w-full ">
                    <div className='flex md:justify-start justify-center items-center relative'>
                        <div className="rounded-full border shadow">
                            <img
                                src={previewImage || profile.src}
                                alt="profile"
                                className="w-32 h-32 p-1 object-cover rounded-full"
                            />
                        </div>
                        {editMode && (
                            <label className="absolute bottom-0 md:left-24 right-32 shadow bg-blue-900 p-2 rounded-full cursor-pointer">
                                <FaPencilAlt className="text-white" />
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>
                    <div className='grid grid-cols-2 px-2 py-5 border-b'>
                        <label className="block font-thin font-custom_thin">Username</label>
                        {editMode ? (
                            <input
                                type="text"
                                value={updatedUsername}
                                onChange={(e) => setUpdatedUsername(e.target.value)}
                                className='text-gray-500 font-merr border px-2 py-1 rounded'
                            />
                        ) : (
                            <p className='text-gray-500 font-merr'>{userData?.username}</p>
                        )}
                    </div>
                    <div className='grid grid-cols-2 px-2 py-5 border-b'>
                        <label className="font-thin font-custom_thin block">User ID</label>
                        <p className='text-gray-500 font-merr'>{userData?.userid}</p>
                    </div>
                    <div className='grid grid-cols-2 px-2 py-5 border-b font-serif'>
                        <label className="font-thin font-custom_thin block">Mobile Number</label>
                        <p className='text-gray-500 font-merr'>{userData?.mobileNumber}</p>
                    </div>
                    <div className='py-20 w-full flex justify-center items-center'>
                        <button onClick={(()=>{
                            setIsDeleteDialogOpen(true)
                        })} className='bg-red-600 px-7 py-3 text-white font-lora text-xl rounded-full'>
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
            {
                isDeletedDialogOpen&&<>
             <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg w-1/3">
                        <h2 className="text-lg font-bold mb-4">Do you want to delete your account Permanently?</h2>
                        <div className="flex justify-end gap-4">
                            <button onClick={(()=>{setIsDeleteDialogOpen(false)})} className="px-4 py-2 bg-gray-300 rounded text-gray-700 hover:bg-gray-400">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
                </>
            }
        </div>
   
    );
};

export default ProfileSection;
