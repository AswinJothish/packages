import React from 'react';

import NavBar from '../../components/NavBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft } from 'lucide-react';

interface LayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({children}) => {
  return (
    <>

      <div className="min-h-screen w-full   flex flex-col">
        <header className="">
          <NavBar />
          <ToastContainer />
        </header>
        <div className=' px-2 md:px-5 md:mt-20 '>
        <ArrowLeft  onClick={() => window.history.back()} />
        </div>
        {/* Main Content */}
        <main className=" flex justify-center items-center  w-full">
          {children}
        </main>

        {/* Footer - Commented out for now as in original */}
        {/* <footer className="bg-white mt-auto">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">About Us</h3>
                <p className="text-gray-600">
                  Your store description goes here. Add a brief overview of your company and its mission.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><a href="/about" className="text-gray-600 hover:text-gray-900">About Us</a></li>
                  <li><a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a></li>
                  <li><a href="/shipping" className="text-gray-600 hover:text-gray-900">Shipping Info</a></li>
                  <li><a href="/returns" className="text-gray-600 hover:text-gray-900">Returns</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Service</h3>
                <ul className="space-y-2">
                  <li><a href="/faq" className="text-gray-600 hover:text-gray-900">FAQ</a></li>
                  <li><a href="/terms" className="text-gray-600 hover:text-gray-900">Terms & Conditions</a></li>
                  <li><a href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Newsletter</h3>
                <form className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-gray-500">
                © {new Date().getFullYear()} Your Store Name. All rights reserved.
              </p>
            </div>
          </div>
        </footer> */}
      </div>

      <style>{`
        html {
          font-family: 'Inter', sans-serif;
        }

        body {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        main {
          flex: 1;
        }
      `}</style>
    </>
  );
};

export default Layout;