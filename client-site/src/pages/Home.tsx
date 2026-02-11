import  { useEffect, useState } from "react";
import ToastProvider from "../components/ToastProvider.jsx";
import NavBar from "../components/NavBar";
import OurProducts from "../components/OurProducts";
// import NewProducts from "../components/NewProducts";
import { ImgbaseUrl, baseUrl } from "../lib/config";
import { FaArrowRight } from "react-icons/fa6";
import Footer from "./Footer";
import About from "./About";
import FeaturedProducts from "@/components/FeaturedProducts.js";
import Banner from "./Banner.js";
import Testimonial from "./Testimonial.js";
import DynamicSection from "@/components/dynamicSection.js";
import BannerComponent from "@/components/BannerComponent.js";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const styles = `
  /* Wave effect styles */
  .custom-shape-divider-top {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;
  }

  .custom-shape-divider-top svg {
    position: relative;
    display: block;
    width: calc(100% + 1.1px);
    height: 100px;
  }

  .custom-shape-divider-top .shape-fill {
    fill: #FFFFFF;
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateX(50px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-fadeIn {
    animation: fadeIn 1s ease-out;
  }

  .animate-slideUp {
    animation: slideUp 1s ease-out;
  }

  .animate-slideIn {
    animation: slideIn 1s ease-out;
  }

  /* Text gradient animation */
  // @keyframes gradientText {
  //   0% {
  //     background-position: 0% 50%;
  //   }
  //   50% {
  //     background-position: 100% 50%;
  //   }
  //   100% {
  //     background-position: 0% 50%;
  //   }
  // }

  .font-display {
    font-family: 'Poppins', sans-serif;
  }

  .bg-gradient-to-r {
    background-size: 200% auto;
    animation: gradientText 4s ease infinite;
  }

  /* Wave animations */
  .wave-container {
    height: 160px;
    overflow: hidden;
    margin-bottom: -60px;
  }

  .wave {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 200%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z' fill='%23ffffff'/%3E%3C/svg%3E");
    background-size: 50% 100%;
    animation: wave 15s linear infinite;
    transform-origin: center bottom;
  }

  .wave1 {
    z-index: 4;
  }

  .wave2 {
    opacity: 0.5;
    z-index: 3;
    animation-delay: -5s;
    animation-duration: 15s;
  }

  .wave3 {
    opacity: 0.2;
    z-index: 2;
    animation-delay: -2s;
    animation-duration: 15s;
  }

  .wave4 {
    opacity: 0.1;
    z-index: 1;
    animation-delay: -7s;
    animation-duration: 15s;
  }

  @keyframes wave {
    0% {
      transform: translateX(0) translateZ(0) scaleY(1);
    }
    50% {
      transform: translateX(-25%) translateZ(0) scaleY(0.8);
    }
    100% {
      transform: translateX(-50%) translateZ(0) scaleY(1);
    }
  }

  /* Button gradient animation */
  .gradient-button {
    background: linear-gradient(-45deg, #2563eb, #3b82f6, #1d4ed8, #60a5fa);
    background-size: 300% 300%;
    animation: gradient-shift 5s ease infinite;
  }

  @keyframes gradient-shift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${baseUrl}/products/category`);
        const data = await response.json();
        setCategories(data.data);
  
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCategories();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  console.log(categories);


  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const handleIntersection = (entries: any[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    const sections = ["banner-section", "categories-section", "products-section"];
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div id="app" className="min-h-screen bg-white">
      <NavBar />
      <ToastProvider />
      <main className="relative ">
      <header 
       //className="relative overflow-hidden  bg-gradient-to-tr from-blue-300 via-blue-100  to-blue-400  h-[80vh] flex items-center justify-center" id="banner-section">
        //  className="relative overflow-hidden bg-hero-bg  bg-center bg-cover from-blue-400 via-blue-100  to-blue-900  h-[80vh] flex items-center justify-center" id="banner-section"
         > 
         <section className="overflow-hidden">
         <BannerComponent />
        </section>
           
          {/* <div className="wave-container absolute bottom-0 left-0 w-full">
            <div className="wave wave1"></div>
            <div className="wave wave2"></div>
            <div className="wave wave3"></div>
            <div className="wave wave4"></div>
          </div> */}
         
          {/* <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center justify-between relative z-10">
      
            
            <div className="md:w-1/2 text-center md:text-left animate-slideInLeft mt-10 md:mb-0">
              <h1 className="text-4xl animate-none drop-shadow-lg md:text-7xl font-bold mb-6  bg-gradient-to-r from-blue-900 via-blue-400 to-blue-600 bg-clip-text text-transparent font-display leading-tight">
                Pure Water 
              </h1>
              <h1 className="text-4xl drop-shadow-lg md:text-7xl font-bold mb-6  bg-gradient-to-r from-blue-600 via-blue-400 to-blue-900 bg-clip-text text-transparent font-display leading-tight">
              Delivered Fresh 
              </h1>
              <p className="text-lg md:text-xl text-gray-100 mb-8 animate-slideUp font-light leading-relaxed max-w-lg">
              </p>
              <a href="#products-section" 
                className="gradient-button group inline-flex items-center px-6 py-2  rounded-full text-white font-medium animate-slideUp transition-all duration-300 hover:-translate-y-1 hover:scale-105"
              >
                <p className="flex items-center gap-3">
                  Explore Products
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                    <FaArrowRight className="text-lg" />
                  </span>
                </p>
              </a>
            </div>
            <div className="md:w-1/2 flex  lg:justify-end justify-center mt-50  animate-slideInRight">
              <img
                src="/images/wf.png"
                alt="Banner Image"
                className="w-5/6  transform hover:scale-105 transition-transform duration-300"
                loading="eager"
              />
            </div>
          </div> */}
        </header>
   
       

        <section className="bg-white py-5 relative " id="categories-section">
          <div className="container mx-auto">
          <div className="w-full -mr-10 flex px-1 items-center  flex-col">
            <h1 className="font-semibold md:text-3xl text-xl py-4 tracking-wider uppercase">Shop by Categories</h1>
              <hr className="md:w-1/6  w-1/3 mb-10 h-0.5 bg-blue-200" />
            </div>
            <div className="flex scrollbar-hide  overflow-x-auto md:overflow-visible whitespace-nowrap md:flex-wrap lg:gap-10  px-4 md:justify-center">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <a     href={`/Category/${category?.categoryName}`} key={index} className="flex cursor-pointer hover:scale-110 transition-all duration-300 flex-col justify-center items-center">
 <img src={`${ImgbaseUrl}${category?.image}`} className="lg:h-32 h-20 w-20 lg:w-32 rounded-full" alt="" />
                  <p
                    className="flex justify-center items-center mb-2 text-sm md:text-xl capitalize px-6 py-3 "
                  >
                    {category?.categoryName}
                  </p>
                  </a>
                 
                ))
              ) : null}
            </div>
          </div>
        </section>
        <About />
<section>
<DynamicSection />
</section>
        <section>
  <FeaturedProducts />
</section>
<section>
  <Banner />
</section>
        <section id="products-section" className="md:pb-5">
          <OurProducts />
        </section>
      </main>
      <Testimonial />
<Footer />
    </div>
  );
};

export default Home;

const styles = `
#banner-section,
#categories-section,
#products-section {
  opacity: 0;
  transition: opacity 0.1s ease-in-out;
}

#banner-section.visible,
#categories-section.visible,
#products-section.visible {
  opacity: 1;
}

html {
  scroll-behavior: smooth;
}

.nav-bar {
  background-color: white;
  transition: all 0.1s ease-in-out;
}

.nav-bar:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
`;

export const HomeStyles = () => <style>{styles}</style>;
