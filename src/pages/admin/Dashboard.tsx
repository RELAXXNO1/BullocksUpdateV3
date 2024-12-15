import { useProducts } from '../../hooks/useProducts';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Package, Eye, ShoppingBag, Users } from 'lucide-react';
import { BackButton } from '../../components/ui/BackButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useCartToggle } from '../../contexts/CartToggleContext';
import { useState } from 'react';
import { Checkbox } from '../../components/ui/Checkbox';

export default function Dashboard() {
  const { products, loading } = useProducts();
  const { data: analyticsData, loading: analyticsLoading } = useAnalytics();
  const { isCartEnabled, setCartEnabled } = useCartToggle();
  const [cartToggle, setCartToggle] = useState(isCartEnabled);

  if (loading || analyticsLoading) {
    return <LoadingSpinner />;
  }

  const handleCartToggleChange = (checked: boolean) => {
    setCartToggle(checked);
    setCartEnabled(checked);
  };

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      label: 'Active Products',
      value: products.filter(p => p.isVisible).length,
      icon: ShoppingBag,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      label: 'Total Views',
      value: analyticsData.totalVisitors,
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      label: 'Top Product',
      value: analyticsData.topProducts[0]?.name || 'N/A',
      icon: Users,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <BackButton to="/" label="Back to Store" />
          <h1 className="text-3xl font-display font-bold mt-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
        </div>
        <div className="flex items-center">
          <label className="text-white mr-2">Enable Cart:</label>
          <Checkbox
            checked={cartToggle}
            onChange={handleCartToggleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-dark-600/50 backdrop-blur-sm rounded-xl border border-dark-400/30 p-6 hover:shadow-super-elegant transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.borderColor} border`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-secondary-400">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-dark-600/50 backdrop-blur-sm rounded-xl border border-dark-400/30 p-6">
        <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {analyticsData.recentActivity.map((activity, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-4 bg-dark-500/50 rounded-lg border border-dark-400/20 hover:border-primary-500/30 transition-colors"
            >
              <div>
                <p className="font-medium text-secondary-200">{activity.type}</p>
                {activity.productName && (
                  <p className="text-sm text-secondary-400 mt-1">{activity.productName}</p>
                )}
              </div>
              <p className="text-sm text-secondary-400">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
