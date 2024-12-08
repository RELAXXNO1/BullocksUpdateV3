import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

const TermsOfService: React.FC = () => {
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
          Terms of Service
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <FileText className="text-blue-400 w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-blue-300">Agreement</h3>
            <p className="text-gray-300">
              By accessing our platform, you agree to these terms and conditions.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <CheckCircle className="text-green-400 w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-green-300">User Responsibilities</h3>
            <p className="text-gray-300">
              Maintain account confidentiality and comply with platform guidelines.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <AlertCircle className="text-yellow-400 w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-yellow-300">Liability Limits</h3>
            <p className="text-gray-300">
              Our liability is limited to the extent permitted by applicable law.
            </p>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-green-300">1. User Account</h2>
          <p className="text-gray-300 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account and password. 
            You agree to accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-green-300">2. Product Usage</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>All products are for legal, responsible use by adults 21 and over</li>
            <li>Compliance with local, state, and federal regulations is mandatory</li>
            <li>No resale or redistribution of purchased products</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-green-300">3. Privacy</h2>
          <p className="text-gray-300 leading-relaxed">
            Your use of our platform is also governed by our Privacy Policy. 
            Please review it to understand our practices.
          </p>
        </section>

        <div className="text-sm text-gray-500 mt-16">
          Last Updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
};

export default TermsOfService;
