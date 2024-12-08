import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AnalyticsData {
  productViews: Record<string, number>;
  categoryViews: Record<string, number>;
  totalVisitors: number;
  topProducts: Array<{
    id: string;
    name: string;
    views: number;
  }>;
  recentActivity: Array<{
    type: string;
    productId?: string;
    productName?: string;
    timestamp: string;
  }>;
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    productViews: {},
    categoryViews: {},
    totalVisitors: 0,
    topProducts: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const eventsRef = collection(db, 'analytics');
        const eventsQuery = query(
          eventsRef,
          orderBy('timestamp', 'desc'),
          limit(1000)
        );
        
        const snapshot = await getDocs(eventsQuery);
        const productViews: Record<string, number> = {};
        const categoryViews: Record<string, number> = {};
        
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.type === 'product_view') {
            productViews[data.productId] = (productViews[data.productId] || 0) + 1;
            if (data.category) {
              categoryViews[data.category] = (categoryViews[data.category] || 0) + 1;
            }
          }
        });

        // Get top products
        const topProducts = Object.entries(productViews)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([id, views]) => ({
            id,
            name: 'Product ' + id,
            views
          }));

        // Get recent activity
        const recentActivity = snapshot.docs
          .slice(0, 10)
          .map(doc => {
            const data = doc.data();
            return {
              type: data.type,
              productId: data.productId,
              productName: data.productName,
              timestamp: data.timestamp
            };
          });

        setData({
          productViews,
          categoryViews,
          totalVisitors: snapshot.size,
          topProducts,
          recentActivity
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const trackEvent = async (type: string, data: Record<string, any>) => {
    try {
      await addDoc(collection(db, 'analytics'), {
        type,
        ...data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  return { data, loading, trackEvent };
}