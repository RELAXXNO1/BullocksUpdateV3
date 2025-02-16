import { useAnalytics } from '../../hooks/useAnalytics';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Package, Eye, ShoppingBag, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function Dashboard() {
  const { data: analyticsData, loading: analyticsLoading } = useAnalytics();

  if (analyticsLoading) {
    return <LoadingSpinner />;
  }

  const stats = [
    {
      label: 'Total Visitors',
      value: analyticsData.totalVisitors,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      label: 'Total Product Views',
      value: Object.values(analyticsData.productViews).reduce((a, b) => a + b, 0),
      icon: ShoppingBag,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      label: 'Total Category Views',
        value: Object.values(analyticsData.categoryViews).reduce((a, b) => a + b, 0),
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      label: 'Top Product',
      value: analyticsData.topProducts[0]?.name || 'N/A',
      icon: Package,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      label: 'Total Orders',
      value: analyticsData.totalOrders,
      icon: ShoppingBag,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      label: 'Total Revenue',
      value: `$${analyticsData.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: ShoppingBag,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20'
    }
  ];

  return (
    <div className="flex">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-dark-600/50 backdrop-blur-sm rounded-xl border border-dark-400/30 p-4 sm:p-6 hover:shadow-super-elegant transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.borderColor} border`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-secondary-400">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-dark-600/50 backdrop-blur-sm rounded-xl border border-dark-400/30 p-6 mt-8 shadow-md">
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary-300 mb-3">Latest Actions</h3>
            {analyticsData.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-dark-500/50 rounded-lg border border-dark-400/20 hover:border-primary-500/30 transition-colors shadow-sm"
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
          <div className="mt-6 text-right">
                        <Button variant="secondary" size="sm">View All Activity</Button>
                    </div>
        </div>
         <div className="bg-dark-600/50 backdrop-blur-sm rounded-xl border border-dark-400/30 p-6 mt-8 shadow-md">
            <h2 className="text-xl font-semibold mb-6">Traffic Sources</h2>
            {/* Placeholder for Traffic Sources Chart */}
            <div className="h-40 bg-dark-700 rounded-lg border border-dark-400">
                <div className="flex items-center justify-center h-full text-secondary-400">
                    {/* Add Chart here */}
                    <span>Traffic Sources Chart</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
