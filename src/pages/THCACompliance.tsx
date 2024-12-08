import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, BookOpen } from 'lucide-react';

const THCACompliance: React.FC = () => {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 p-8 md:p-16"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          THC-A Compliance Guidelines
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <ShieldCheck className="text-green-400 w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-green-300">Legal Compliance</h3>
            <p className="text-gray-300">
              We strictly adhere to federal and state regulations regarding THC-A products.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <AlertTriangle className="text-yellow-400 w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-yellow-300">Age Verification</h3>
            <p className="text-gray-300">
              All customers must be 21+ and provide valid government-issued identification.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <BookOpen className="text-blue-400 w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-blue-300">Product Transparency</h3>
            <p className="text-gray-300">
              Comprehensive lab testing and detailed product information for every item.
            </p>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-green-300">Key Compliance Principles</h2>
          <ul className="space-y-4 text-gray-300">
            <li className="flex items-start">
              <ShieldCheck className="mr-3 mt-1 text-green-400" />
              Strict adherence to state and federal THC-A regulations
            </li>
            <li className="flex items-start">
              <ShieldCheck className="mr-3 mt-1 text-green-400" />
              Comprehensive age and identity verification processes
            </li>
            <li className="flex items-start">
              <ShieldCheck className="mr-3 mt-1 text-green-400" />
              Transparent product sourcing and testing
            </li>
          </ul>
        </section>

        <div className="text-sm text-gray-500 mt-16">
          Last Reviewed: {new Date().toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
};

export default THCACompliance;
