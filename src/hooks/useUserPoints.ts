import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export function useUserPoints() {
  const [points, setPoints] = useState<number | undefined>(undefined);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [tier, setTier] = useState<'basic' | 'silver' | 'gold' | 'platinum'>('basic');
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserPoints = async () => {
      console.log("useUserPoints: fetchUserPoints called"); // Debug log
      if (user) {
        try {
          console.log("useUserPoints: user exists, fetching points for uid:", user.uid); // Debug log
          const userPointsDocRef = doc(db, 'userPoints', user.uid); // Note: Fetches from 'userPoints' collection
          console.log("useUserPoints: userPointsDocRef created:", userPointsDocRef.path); // Debug log
          const userPointsDoc = await getDoc(userPointsDocRef);
          console.log("useUserPoints: userPointsDoc fetched:", userPointsDoc.exists()); // Debug log

          if (userPointsDoc.exists()) {
            const userData = userPointsDoc.data();
            console.log("useUserPoints: userData:", userData); // Debug log
            setPoints(userData.points || 0); // Default to 0 if points is undefined
            setExpiresAt(userData.pointsExpiresAt?.toDate());
            setTier(getTierBasedOnPoints(userData.points || 0)); // Default to 0 if points is undefined
          } else {
            console.log("useUserPoints: userPointsDoc does not exist"); // Debug log
            setPoints(0); // Default to 0 if document doesn't exist
            setExpiresAt(null);
            setTier('basic');
          }
        } catch (error) {
          console.error('useUserPoints: Error fetching user points:', error);
          console.error(error); // Log detailed error
          setPoints(undefined); // Set to undefined in case of error
          setExpiresAt(null);
          setTier('basic');
        }
      } else {
        console.log("useUserPoints: user is null"); // Debug log
        setPoints(undefined); // Not logged in
        setExpiresAt(null);
        setTier('basic');
      }
    };

    fetchUserPoints();
  }, [user]);

  const updateUserPoints = async (newPoints: number) => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const updateData = {
          points: newPoints,
          pointsExpiresAt: newPoints > 0 ? serverTimestamp() : null
        };
        await updateDoc(userDocRef, updateData);
        setPoints(newPoints);
        setExpiresAt(newPoints > 0 ? new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) : null);
        setTier(getTierBasedOnPoints(newPoints));
      } catch (error) {
        console.error('Error updating user points:', error);
        throw error; // Re-throw to handle in calling component
      }
    }
  };

  const getTierBasedOnPoints = (points: number) => {
    if (points >= 1000) return 'platinum';
    if (points >= 500) return 'gold';
    if (points >= 250) return 'silver';
    return 'basic';
  };

  return { points, expiresAt, tier, updateUserPoints };
}
