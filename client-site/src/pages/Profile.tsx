import { useEffect, useState } from "react";
import { MdArrowBack } from "react-icons/md";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AddressSection from "../components/AddressSection";
import NavBar from "../components/NavBar";
import OrderSection from "../components/OrderSection";
import ProfileSection from "../components/ProfileSection";
import { ImgbaseUrl } from "../lib/config";

// Import images
import order from "../../public/images/choices.png";
import location from "../../public/images/location.png";
import profile from "../../public/images/profile.png";

interface UserData {
  userid: string;
  username?: string;
  mobileNumber?: string;
  profileImage?: string;
}

const Profile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  const [userData, setUserData] = useState<UserData>({} as UserData);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobileView = window.innerWidth < 768;
      setIsMobileView(newIsMobileView);
      if (!newIsMobileView) {
        setShowMobileMenu(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const sectionParam = searchParams.get("section");
    if (
      sectionParam &&
      ["profile", "orders", "address"].includes(sectionParam)
    ) {
      setActiveSection(sectionParam);
      if (isMobileView) {
        setShowMobileMenu(false);
      }
    } else {
      setActiveSection("profile");
    }
  }, [searchParams, isMobileView]);

  const handleGoBack = () => {
    if (isMobileView) {
      setShowMobileMenu(true);
      setActiveSection(null);
    } else {
      navigate("/");
    }
  };

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
    if (isMobileView) {
      setShowMobileMenu(false);
    }
  };

  // const handleUserDataLoaded = (data: UserData) => {
  //   setUserData(data);
  // };

  const renderSection = (sectionName: string) => {
    if (!isMobileView || (isMobileView && !showMobileMenu)) {
      switch (sectionName) {
        case "profile":
          //@ts-ignore
          return (
            <ProfileSection
            //  onUserDataLoaded={handleUserDataLoaded}
            />
          );
        case "address":
          return <AddressSection />;
        case "orders":
          return <OrderSection />;
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <>
      <ToastContainer />
      <NavBar />

      <div className="flex md:pt-20">
        {/* Mobile View Container */}
        <div className="w-full md:hidden">
          {/* Left Section for Mobile */}
          <div className={`w-full ${!showMobileMenu ? "hidden" : "block"}`}>
            <div className="p-5">
              {/* Profile Card */}
              <div className="flex items-center px-4 py-6 border shadow rounded">
                <div className="border rounded-full">
                  <img
                    src={
                      userData.profileImage
                        ? `${ImgbaseUrl}${userData.profileImage}`
                        : profile
                    }
                    alt="profile"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                </div>
                <div className="flex flex-col pl-5 gap-3">
                  <p className="text-base font-serif font-bold">
                    Hello! {userData?.username || userData?.userid}
                  </p>
                  <p className="font-merr text-base">
                    {userData.mobileNumber || ""}
                  </p>
                </div>
              </div>

              {/* Menu Section */}
              <div>
                <h1 className="text-xl font-bold font-serif py-7">My Info</h1>
                <div>
                  <ul className="font-thin font-custom_thin">
                    {[
                      { id: "profile", icon: profile, label: "Profile" },
                      { id: "address", icon: location, label: "Address" },
                      { id: "orders", icon: order, label: "Orders" },
                    ].map((item) => (
                      <li
                        key={item.id}
                        className={`p-5 border gap-3 flex items-center cursor-pointer ${
                          activeSection === item.id ? "active-section" : ""
                        }`}
                        onClick={() => handleSectionClick(item.id)}
                      >
                        <img src={item.icon} alt="" className="w-6 h-6" />
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section for Mobile */}
          <div
            className={`fixed inset-0 bg-white z-50 overflow-auto transition-transform duration-300 ${
              showMobileMenu ? "translate-x-full" : "translate-x-0"
            }`}
          >
            <div className="pt-0 px-5">
              <button
                className="flex items-center text-gray-400 hover:text-blue-600/90 gap-2 my-4"
                onClick={handleGoBack}
              >
                <MdArrowBack />
                <span>Back</span>
              </button>
            </div>
            <div className="p-6">
              {renderSection(activeSection || "profile")}
            </div>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex w-full">
          {/* Left Section for Desktop */}
          <div className="w-1/3">
            <div className="p-5">
              {/* Profile Card */}
              <div className="flex items-center px-4 py-6 border shadow rounded">
                <div className="border rounded-full">
                  <img
                    src={
                      userData.profileImage
                        ? `${ImgbaseUrl}${userData.profileImage}`
                        : profile
                    }
                    alt="profile"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                </div>
                <div className="flex flex-col pl-5 gap-3">
                  <p className="text-base font-serif font-bold">
                    Hello! {userData?.username || userData?.userid}
                  </p>
                  <p className="font-merr text-base">
                    {userData.mobileNumber || ""}
                  </p>
                </div>
              </div>

              {/* Menu Section */}
              <div>
                <h1 className="text-xl font-bold font-serif py-7">My Info</h1>
                <div>
                  <ul className="font-thin font-custom_thin">
                    {[
                      { id: "profile", icon: profile, label: "Profile" },
                      { id: "address", icon: location, label: "Address" },
                      { id: "orders", icon: order, label: "Orders" },
                    ].map((item) => (
                      <li
                        key={item.id}
                        className={`p-5 border gap-3 flex items-center cursor-pointer ${
                          activeSection === item.id ? "active-section" : ""
                        }`}
                        onClick={() => handleSectionClick(item.id)}
                      >
                        <img src={item.icon} alt="" className="w-6 h-6" />
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section for Desktop */}
          <div className="w-2/3">
            <div className="p-6">
              {renderSection(activeSection || "profile")}
            </div>
          </div>
        </div>
      </div>

      <style>{`
      .active-section {
        background-color: rgb(247, 247, 247);
      }
    `}</style>
    </>
  );
};

export default Profile;
