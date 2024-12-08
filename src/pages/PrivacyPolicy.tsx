import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
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
          Privacy Policy
        </h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-green-300">1. Information We Collect</h2>
          <p className="text-gray-300 leading-relaxed">
            We collect information you provide directly to us, including when you create an account, 
            make a purchase, or interact with our services. This may include your name, email, 
            shipping address, and payment information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-green-300">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>To process and fulfill your orders</li>
            <li>To communicate with you about products, services, and promotions</li>
            <li>To improve our website and customer experience</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-green-300">3. Data Protection</h2>
          <p className="text-gray-300 leading-relaxed">
            We implement industry-standard security measures to protect your personal information 
            from unauthorized access, disclosure, alteration, and destruction.
          </p>
        </section>

        <div className="text-sm text-gray-500 mt-16">
          Last Updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
