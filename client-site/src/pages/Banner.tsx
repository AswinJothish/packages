
import backdrop from "../../public/images/banner_img.png";
import { useState, useEffect } from 'react';

const Banner = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  return (
    <div className="md:py-28 py-12">
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          
          .bg-shimmer {
            background: linear-gradient(45deg, rgb(177, 177, 178, 0.1) 25%, white 50%, rgb(177, 177, 178, 0.1) 75%);
            background-size: 400% 400%;
            animation: shimmer 7s infinite linear;
          }
        `}
      </style>

      <div
        className="relative  md:h-96 h-72 w-full md:bg-shimmer overflow-hidden"
        style={{ backgroundColor: "rgb(177, 177, 178, 0.1)" }}
      >
        {/* Text Section */}
        <div className="absolute top-0 z-10 right-0 w-full md:w-3/4 h-full flex flex-col justify-center px-5 md:pl-32">
          <p className="text-gray-700 flex flex-col gap-8">
            <span className="text-3xl font-medium md:text-5xl xl:text-6xl text-center bg-gradient-to-tr from-blue-300 via-blue-600 to-blue-900 text-transparent bg-clip-text md:text-left">
              Health in Every Drop
            </span>
            
            <p className="text-xl text-black md:font-normal !leading-loose font-medium md:text-2xl text-center md:text-left">
              High-quality water filtration systems for homes and businesses.
              Enjoy clean and safe water with our trusted solutions.
            </p>
          </p>
        </div>

        {/* Image Container */}
        <div className="absolute inset-0 flex items-center justify-center md:justify-start md:left-32">
          <img
            src={backdrop}
            alt="Water Filter"
            className={`opacity-20 lg:opacity-100 h-full w-auto ${
              isMobile 
                ? 'object-contain max-w-[80%]' 
                : 'object-contain md:object-cover'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default Banner;
