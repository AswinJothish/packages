import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IoSettings } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"; // Importing Shadcn's dropdown components
import {useNavigate} from "react-router-dom"
import { ImgBaseUrl } from '@/lib/config';
interface TopbarProps {
  title: string;
}

const Topbar: React.FC<TopbarProps> = ({ title }) => {
  const [userData, setUserData] = useState<any>(null);
const navigate=useNavigate()
  useEffect(() => {
    const storedData = sessionStorage.getItem("userData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  const renderAvatarContent = () => {
    if (userData) {
      if (userData.profileImage) {
        return <AvatarImage src={`${ImgBaseUrl}${userData.profileImage}`} alt="User Avatar" />;
      }
      return <AvatarFallback className="font-medium font-ubuntu text-white bg-button-gradient">{userData.username.charAt(0).toUpperCase()}</AvatarFallback>;
    }
    return null;
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userData"); // Clear session storage
    // Implement your logout logic (e.g., redirect to login page)
  };

  const handleSettings = () => {
navigate('/admin/settings')
  };

  return (
    <div className="px-5 border-b h-16 flex justify-between items-center">
      <div className="text-2xl font-ubuntu font-bold w-full">
        <h1 className="w-full text-primary">
          {title === "Dashboard" ? "Dashboard" : title}
        </h1>
      </div>
      <div className="relative ">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="cursor-pointer border">
              {renderAvatarContent()}
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent className='mr-5 '>
            <p className='py-2 font-bold text-lg text-center border-b'>Accounts</p>
            <div className="space-y-2 ">
              <DropdownMenuItem onClick={handleSettings} className="flex px-8 gap-2 items-center p-2 text-base hover:bg-gray-100">
                <IoSettings /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="flex gap-2 items-center p-2 text-base hover:bg-gray-100">
                <FiLogOut /> Logout
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Topbar;
