import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
//import NavBar from "@/components/NavBar";
import CategoryProductDisplay from "../../components/CategoryProductDisplay";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CategoryPage = () => {
  const { category } = useParams();

  useEffect(() => {
    // Initialize page load check
    if (!sessionStorage.getItem('initialLoad')) {
      sessionStorage.setItem('initialLoad', 'true');
      window.location.reload();
    }

    const handleBeforeUnload = () => {
      sessionStorage.removeItem('initialLoad');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="min-h-screen ">

      <ToastContainer />
      {/* @ts-ignore */}
      <CategoryProductDisplay categoryName={category} />
    </div>
  );
};

export default CategoryPage;