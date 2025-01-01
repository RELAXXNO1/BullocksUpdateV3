import { Link } from 'react-router-dom';
import { LOGO_PATH } from '../../config/constants';
import { ShieldCheck, FileText, Lock } from 'lucide-react';

export default function StoreFooter() {
  return (
    <footer className="bg-dark-600/80 mt-12 relative overflow-hidden backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/5 to-teal-500/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,theme(colors.teal.500/0.1),transparent_50%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center relative z-10">
          <img 
            src={LOGO_PATH}
            alt="High10 Wellness" 
            className="h-24 w-auto object-contain mb-4 opacity-90 drop-shadow-[0_0_8px_theme(colors.teal.500)]"
          />
          <p className="text-gray-400 text-center max-w-md">
            Your premier destination for quality smoking accessories and vaporizers.
          </p>
          
          <div className="mt-8 flex space-x-6 text-gray-400">
            <Link 
              to="/privacy" 
              className="hover:text-green-400 transition-colors flex items-center"
            >
              <ShieldCheck className="mr-2 w-5 h-5" /> Privacy Policy
            </Link>
            <Link 
              to="/thca-compliance" 
              className="hover:text-blue-400 transition-colors flex items-center"
            >
              <Lock className="mr-2 w-5 h-5" /> THC-A Compliance
            </Link>
            <Link 
              to="/terms" 
              className="hover:text-yellow-400 transition-colors flex items-center"
            >
              <FileText className="mr-2 w-5 h-5" /> Terms of Service
            </Link>
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            {new Date().getFullYear()} High10 Wellness. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
