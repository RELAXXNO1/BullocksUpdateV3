import { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useUserPoints } from './useUserPoints';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

export function useEarnPoints() {
  const { cart, clearCart } = useCart();
  const { updateUserPoints, points } = useUserPoints();

    const calculateEarnedPoints = (cart: any[]) => {
    let totalPoints = 0;
        cart.forEach(item => {
            if (item.product.category !== 'Special') {
                totalPoints += Math.floor(item.product.price * item.quantity);
            }
        });
    return totalPoints;
  };

  const handlePurchase = async () => {
    const totalPoints = calculateEarnedPoints(cart);
    if (totalPoints > 0) {
      try {
        await updateUserPoints((points || 0) + totalPoints);
        clearCart();
      } catch (error) {
        console.error('Error updating points:', error);
      }
    }
  };

  return { handlePurchase };
}
