import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export function useUserPoints() {
  const [points, setPoints] = useState<number | undefined>(undefined);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setPoints(userData.points);
          } else {
            setPoints(0); // Default to 0 if document doesn't exist
          }
        } catch (error) {
          console.error('Error fetching user points:', error);
          setPoints(undefined); // Set to undefined in case of error
        }
      } else {
        setPoints(undefined); // Not logged in
      }
    };

    fetchUserPoints();
  }, [user]);

    const updateUserPoints = async (newPoints: number) => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          points: newPoints
        });
        setPoints(newPoints);
      } catch (error) {
        console.error('Error updating user points:', error);
        throw error; // Re-throw to handle in calling component
      }
    }
  };

  return { points, updateUserPoints };
}
