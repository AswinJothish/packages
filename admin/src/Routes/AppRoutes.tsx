// import { baseUrl } from "@/lib/config";
import { LoginPage } from "@/pages/Loginpage";
import { Dashboard } from "@/pages/dashboard/dashboard";
import { DeliveryAgents } from "@/pages/dashboard/deliveryAgent/deliveryAgents";
import { Master } from "@/pages/dashboard/master/master";
import CreateOrder from "@/pages/dashboard/orders/createOrder";
import { Id_Order } from "@/pages/dashboard/orders/id_order";
import { Orders } from "@/pages/dashboard/orders/orders";
import { Addproducts } from "@/pages/dashboard/products/addProduct";
import { Id_product } from "@/pages/dashboard/products/id_product";
import { Products } from "@/pages/dashboard/products/products";
import { Id } from "@/pages/dashboard/users/id";
import { Users } from "@/pages/dashboard/users/users";
import { Sidebar } from "@/pages/utils/sidebar";
import { useEffect, useState, ReactNode } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Testimonials } from "@/pages/dashboard/testimonials/testimonials";
import { Sections } from "@/pages/dashboard/sections/sections";
import Settings from "@/pages/dashboard/settings";
import PrivacyPolicy from "@/pages/dashboard/utils/privacyPolicy";
import TermsandCondition from "@/pages/dashboard/utils/termsandcondition";

function AppRoutes() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get("admin");
  
      if (!token && window.location.pathname !== "/admin") {
        navigate("/admin");
      }
      setIsAuthenticated(!!token);
    };
  
    checkAuth();
  }, [navigate]);
  
  // useEffect(() => {
  //   function checkAuth() {
  //     const token = Cookies.get("admin");

  //     if (window.location.pathname === "/admin") {
  //       Cookies.remove("admin");
  //       sessionStorage.clear();
  //     }

  //     if (token) {
  //       setIsAuthenticated(true);
  //     } else {
  //       setIsAuthenticated(false);
  //       if (window.location.pathname !== "/admin") {
  //         Cookies.remove("admin");
  //         sessionStorage.clear();
  //         navigate("/admin");
  //       }
  //     }
  //   }

  //   setTimeout(checkAuth, 1000);
  // }, [navigate]);

  // Define props type for Layout
  function Layout({ children }: { children: ReactNode }) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-72 w-full">{children}</div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/admin" element={<LoginPage />} />
      {isAuthenticated && (
        <>
          <Route path="/admin/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/admin/products" element={<Layout><Products /></Layout>} />
          <Route path="/admin/products/product/:id" element={<Layout><Id_product /></Layout>} />
          <Route path="/admin/products/add" element={<Layout><Addproducts /></Layout>} />
          <Route path="/admin/users" element={<Layout><Users /></Layout>} />
          <Route path="/admin/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/admin/user/:id" element={<Layout><Id /></Layout>} />
          <Route path="/admin/orders" element={<Layout><Orders /></Layout>} />
          <Route path="/admin/orders/createOrder" element={<Layout><CreateOrder /></Layout>} />
          <Route path="/admin/orders/Order/:id" element={<Layout><Id_Order /></Layout>} />
          <Route path="/admin/deliveryAgents" element={<Layout><DeliveryAgents /></Layout>} />
          <Route path="/admin/testimonials" element={<Layout><Testimonials /></Layout>} />
          <Route path="/admin/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
          <Route path="/admin/termsandcondition" element={<Layout><TermsandCondition /></Layout>} />
          <Route path="/admin/sections" element={<Layout><Sections /></Layout>} />
          <Route path="/admin/master" element={<Layout><Master /></Layout>} />
        </>
      )}
    </Routes>
  );
}

export default AppRoutes;
