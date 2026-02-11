
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home"; 
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OurProductDisplay from "./pages/OurProductDisplay";
import NewProductsDisplay from "./pages/NewProductsDisplay";
import Id from "@/pages/Category/Id"
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProductPage from "./pages/products/ProductPage";
import Checkout from "./pages/Checkout";
const queryClient = new QueryClient();
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken} from "firebase/messaging";
import PrivacyPolicy from "./pages/privacyPolicy";
import TermsandCondition from "./pages/TermsandCondition";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxkpAyYjGS_jC3abTHDfdAVozeUR_MKiU",
  authDomain: "ecommerce-76923.firebaseapp.com",
  projectId: "ecommerce-76923",
  storageBucket: "ecommerce-76923.firebasestorage.app",
  messagingSenderId: "1075564064831",
  appId: "1:1075564064831:web:0e28c69c564ba6e9d4888a",
  measurementId: "G-ZSPBRZFZ6N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
getToken(messaging, {vapidKey: "BKagOny0KF_2pCJQ3m....moL0ewzQ8rZu"});

function requestPermission() {
  console.log('Requesting permission...');
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');}})}

function App() {
  return (
    <Router>
       <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Base Route */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/OurProducts" element={<OurProductDisplay />} />
        <Route path="/NewProducts" element={<NewProductsDisplay/>} />
        <Route path="/Category/:category" element={<Id />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Checkout" element={<Checkout />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/termsandconditions" element={<TermsandCondition />} />

        {/* Catch-All Route: Redirect to / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
       </QueryClientProvider>
    </Router>
  );
}

export default App;
