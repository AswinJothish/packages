import { MdDashboard, MdGroups} from "react-icons/md";
import { BsShieldFillExclamation } from "react-icons/bs";
import { BsStack } from "react-icons/bs";
import { IoMdLogOut, IoMdCart } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { GrDeliver } from "react-icons/gr";
import { IoAnalyticsOutline } from "react-icons/io5";
import { MdReviews } from "react-icons/md";
import { PiIntersectThree } from "react-icons/pi";
import { GiWhiteBook } from "react-icons/gi";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleSectionClick = (section: string) => {
    navigate(`/admin/${section}`);
  };

  const isActive = (section: string) => location.pathname.includes(section);

  // Sections with headings and links
  const sections = [
    {
      heading: "Analytics",
      links: [
        { icon: <IoAnalyticsOutline />, label: "Order Statistics", section: "dashboard" },
      ],
    },
    {
      heading: "Dashboard",
      links: [
        { icon: <MdDashboard />, label: "Master", section: "master" },
        { icon: <MdGroups />, label: "Users", section: "users" },
        { icon: <IoMdCart />, label: "Orders", section: "orders" },
        { icon: <BsStack />, label: "Products", section: "products" },
        { icon: <PiIntersectThree />, label: "Section", section: "sections" },

      ],
    },
    {
      heading: "Management",
      links: [
        { icon: <GrDeliver />, label: "Delivery Agents", section: "deliveryAgents" },
      ],
    },
    {
      heading: "Utils",
      links: [
        { icon: <MdReviews />, label: "Testimonials", section: "testimonials" },
        { icon: <BsShieldFillExclamation />, label: "Privacy Policy", section: "privacy-policy" },
        { icon: <GiWhiteBook />, label: "Terms and Conditions", section: "termsandcondition" },

      ],
    },
  ];

  return (
    <div className=" bg-indigo-950 text-white w-72 h-screen fixed shadow-lg">
      {/* Sidebar Header */}
      <div
        className="border-b border-gray-200 text-center flex justify-center items-center text-xl font-bold h-16 cursor-pointer"
        onClick={() => handleSectionClick("dashboard")}
      >
        E-COMMERCE
      </div>

      {/* Navigation */}
      <nav className="flex flex-col font-grotesk  h-[calc(100vh-4rem)] overflow-y-auto">
        {/* Navigation Links with Headings */}
        <ul className="flex flex-col px-4 py-4 gap-4">
          {sections.map(({ heading, links }) => (
            <div key={heading}>
              <h2 className="text-lg font-grotesk font-semibold mb-2">{heading}</h2>
              {links.map(({ icon, label, section }) => (
                <li key={section}>
                  <button
                    onClick={() => handleSectionClick(section)}
                    className={`flex items-center w-full p-2 pl-4 rounded-md ${
                      isActive(section)
                        ? "bg-button-gradient text-white font-medium"
                        : "hover:bg-button-gradient  text-white"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center text-lg rounded-full ${
                        isActive(section) ? "" : ""
                      }`}
                    >
                      {icon}
                    </span>
                    <span className="ml-4 text-base">{label}</span>
                  </button>
                </li>
              ))}
            </div>
          ))}
        </ul>

        {/* Logout Section */}
        <div className="mt-auto mb-6 px-4">
          <button
            onClick={() => setLogoutDialogOpen(true)}
            className="flex items-center w-full p-2 px-3 rounded-md bg-button-gradient text-white hover:scale-105 transition-transform"
          >
            <div className="flex items-center justify-center  text-white">
              <IoMdLogOut className="text-2xl" />
            </div>
            <span className="ml-4 text-lg font-bold">Logout</span>
          </button>

          {/* Logout Dialog */}
          {logoutDialogOpen && (
            <div className="absolute w-full bg-black bg-opacity-50 inset-0 flex items-center justify-center">
              <div className="bg-white p-5 rounded-lg shadow-lg text-center">
                <p className="font-bold">Do you want to logout?</p>
                <div className="mt-4 flex justify-around">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded text-black"
                    onClick={() => setLogoutDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 rounded text-white"
                    onClick={() => {
                      navigate('/admin')
                      setLogoutDialogOpen(false);
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
