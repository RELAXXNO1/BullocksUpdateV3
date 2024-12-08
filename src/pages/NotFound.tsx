import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-500">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-red-500/20 p-6 rounded-full">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-white">
          404 - Page Not Found
        </h1>
        
        <p className="text-secondary-300 mb-6">
          Oops! The page you're looking for seems to have wandered off into the smoke.
          Let's get you back on track.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link 
            to="/" 
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Return to Store
          </Link>
          
          <Link 
            to="/admin" 
            className="px-6 py-3 bg-dark-600 text-secondary-300 rounded-lg hover:bg-dark-500 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
