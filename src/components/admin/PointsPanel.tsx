import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, Award, ShoppingBag, AlertCircle } from 'lucide-react'; // Import icons
import LoadingSpinner from '../../components/LoadingSpinner';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/Alert';


interface UserData {
  email: string;
  points: number;
  tier: string;
  expiresAt?: Date;
}

const PointsPanel: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [averagePoints, setAveragePoints] = useState(0);
  const [tierCounts, setTierCounts] = useState({
    basic: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            email: data.email,
            points: data.points || 0,
            tier: data.tier || 'basic',
            expiresAt: data.pointsExpiresAt?.toDate(),
          } as UserData;
        });
        setUsers(usersData);

        // Calculate analytics
        let pointsSum = 0;
        const newTierCounts = { basic: 0, silver: 0, gold: 0, platinum: 0 };
        usersData.forEach(user => {
          pointsSum += user.points;
          newTierCounts[user.tier as keyof typeof newTierCounts]++;
        });
        setTotalPoints(pointsSum);
        setAveragePoints(usersData.length > 0 ? pointsSum / usersData.length : 0);
        setTierCounts(newTierCounts);

      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

 if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-white mb-4">Points for Joints - Admin Panel</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Points Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center">
          <div className="p-3 bg-blue-500 rounded-full mr-4">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Points Issued</p>
            <p className="text-xl font-semibold text-white">{totalPoints}</p>
          </div>
        </div>

        {/* Average Points Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center">
          <div className="p-3 bg-green-500 rounded-full mr-4">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Average Points/User</p>
            <p className="text-xl font-semibold text-white">{averagePoints.toFixed(2)}</p>
          </div>
        </div>

        {/* Tier Counts Cards */}
        {Object.entries(tierCounts).map(([tier, count]) => (
          <div key={tier} className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center">
            <div className="p-3 bg-yellow-500 rounded-full mr-4">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{tier.charAt(0).toUpperCase() + tier.slice(1)} Users</p>
              <p className="text-xl font-semibold text-white">{count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-white mb-4">User Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Points</th>
                <th className="px-4 py-2 text-left">Tier</th>
                <th className="px-4 py-2 text-left">Expiration Date</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {users.map((user, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}>
                  <td className="border border-gray-700 px-4 py-2">{user.email}</td>
                  <td className="border border-gray-700 px-4 py-2">{user.points}</td>
                  <td className="border border-gray-700 px-4 py-2">{user.tier}</td>
                  <td className="border border-gray-700 px-4 py-2">
                    {user.expiresAt ? user.expiresAt.toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PointsPanel;
