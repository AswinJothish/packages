import { useEffect } from "react";


const Footer=()=>{
    const styles = `
    /* Footer wave */
    .footer-wave {
      position: absolute;
      top: -100px;
      left: 0;
      width: 100%;
      overflow: hidden;
      line-height: 0;
      transform: rotate(180deg);
    }
  
    .footer-wave svg {
      position: relative;
      display: block;
      width: calc(100% + 1px);
      height: 70px;
    }
  
  
    .font-display {
      font-family: 'Poppins', sans-serif;
    }
  
    .bg-gradient-to-r {
      background-size: 200% auto;
      animation: gradientText 4s ease infinite;
    }

    .wave {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 200%;
      height: 100%;
     background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z' fill='%23ffffff'/%3E%3C/svg%3E");
      background-size: 50% 100%;
      animation: wave 10s  infinite;
      transform-origin: center bottom;
    }
  `;
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);
return(
    <footer className="bg-gradient-to-b from-blue-50 via-blue-300 to-blue-500 text-blue-900 relative mt-20">
        <div className="absolute bottom-full left-0 right-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full block" preserveAspectRatio="none">
            <path 
              fill="rgb(239 246 255)"
              d="M0,0 C480,100 960,100 1440,0 L1440,120 L0,120 Z">
            </path>
          </svg>
        </div>
        <div className="container mx-auto px-4 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-6 text-blue-800 relative inline-block after:content-[''] after:absolute after:w-12 after:h-1 after:bg-blue-300 after:-bottom-2 after:left-0">About Us</h3>
              <p className="text-blue-700 leading-relaxed">Delivering pure, refreshing water to your doorstep. Our commitment to quality and customer satisfaction makes us your trusted water supplier.</p>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-6 text-blue-800 relative inline-block after:content-[''] after:absolute after:w-12 after:h-1 after:bg-blue-300 after:-bottom-2 after:left-0">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/" className="text-blue-700 hover:text-blue-900 transition-all duration-300 flex items-center gap-2 group">
                  <span className="text-blue-600 group-hover:text-blue-800">→</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">Home</span>
                  </a>
                </li>
                <li>
                  <a href="/OurProducts" className="text-blue-700 hover:text-blue-900 transition-all duration-300 flex items-center gap-2 group">
                  <span className="text-blue-600 group-hover:text-blue-800">→</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">Products</span>
                  </a>
                </li>
                <li>
                  <a href="/privacypolicy" className="text-blue-700 hover:text-blue-900 transition-all duration-300 flex items-center gap-2 group">
                    <span className="text-blue-600 group-hover:text-blue-800">→</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      Privacy Policy
                    </span>
                  </a>
                </li>
                <li>
                  <a href="/termsandconditions" className="text-blue-700 hover:text-blue-900 transition-all duration-300 flex items-center gap-2 group">
                  <span className="text-blue-600 group-hover:text-blue-800">→</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                    Terms and Conditions
                    </span>
                  </a>
                </li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-6 text-blue-800 relative inline-block after:content-[''] after:absolute after:w-12 after:h-1 after:bg-blue-300 after:-bottom-2 after:left-0">Contact Info</h3>
              <ul className="space-y-4 text-blue-700">
                <li className="flex items-center gap-3 group">
                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </span>
                  <span>info@example.com</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </span>
                  <span>(123) 456-7890</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>123 Street, City</span>
                </li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-6 text-blue-800 relative inline-block after:content-[''] after:absolute after:w-12 after:h-1 after:bg-blue-300 after:-bottom-2 after:left-0">Follow Us</h3>
              <div className="flex justify-center md:justify-start space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors duration-300 group">
                  <svg className="w-5 h-5 text-blue-600 group-hover:text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors duration-300 group">
                  <svg className="w-5 h-5 text-blue-600 group-hover:text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors duration-300 group">
                  <svg className="w-5 h-5 text-blue-600 group-hover:text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 py-4 border-t border-blue-200 text-center">
            <p className="text-blue-50">&copy; {new Date().getFullYear()} Pure Water. All rights reserved.</p>
          </div>
        </div>
      </footer>
)
}

export default Footer;