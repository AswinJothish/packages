import { motion } from "framer-motion";

const About = () => {
  return (
    <section className="relative  from-white to-blue-50 lg:py-20 px-8" id="about">
      <div className="container mx-auto">
      <div className="w-full -mr-10 flex px-1 items-center  flex-col">
            <h1 className="font-semibold md:text-3xl text-xl py-4 tracking-wider uppercase">About Us</h1>
              <hr className="md:w-1/6  w-1/3 mb-10 h-0.5 bg-blue-200" />
            </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.5 }}
            className="relative"
          >
            <div className="relative  overflow-hidden ">
              <img
                src="/bg.png"
                alt="Water Filter"
                className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
              />
                </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true, amount: 0.8 }}
              className="absolute -bottom-6 -left-6 bg-white lg:p-4 p-2 rounded-lg shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Quick Install</h4>
                  <p className="text-sm text-gray-600">Ready in 30 minutes</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true, amount: 0.5 }}
              className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">99.9% Pure</h4>
                  <p className="text-sm text-gray-600">Certified Quality</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

         

          {/* Right Content: Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.5 }}
            className="space-y-6 "
          >
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl slide-in-from-left-7 transition-shadow duration-300">
              <h3 className="text-2xl font-semibold bg-gradient-to-tr from-blue-800 via-blue-400 to-blue-100 text-transparent bg-clip-text mb-4">Pure Innovation</h3>
              <p className="text-gray-700 leading-relaxed">
                At AquaPure, we believe clean and safe drinking water is a right, not a luxury. 
                Our advanced water filtration systems are designed with cutting-edge technology 
                to provide the purest water for your family.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl slide-in-from-left-7 transition-shadow duration-300">
              <h3 className="text-2xl font-semibold  bg-gradient-to-tr from-blue-800 via-blue-400 to-blue-100 text-transparent bg-clip-text mb-4">Sustainable Solutions</h3>
              <p className="text-gray-700 leading-relaxed">
                From under-sink systems to whole-house solutions, our products combine 
                performance with eco-friendliness. Every drop is filtered with care, 
                ensuring both your health and environmental sustainability.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block"
            >
              <button className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-lg">
                Learn More
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>


    </section>
  );
};

export default About;
