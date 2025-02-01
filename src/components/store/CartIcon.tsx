import { memo, forwardRef } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

interface CartIconProps {
  onClick: () => void;
}

export const CartIcon = memo(forwardRef<HTMLButtonElement, CartIconProps>(({ onClick }, ref) => {
  const { cart } = useCart();
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <button
      ref={ref}
      onClick={() => onClick()}
      className="group relative flex items-center justify-center text-secondary-400 hover:text-primary-400 transition-all duration-200 px-3 py-2 -m-2 hover:bg-dark-600/20 rounded-lg cursor-pointer 
                  before:absolute before:inset-0 before:bg-primary-500/10 before:opacity-0 before:transition-opacity before:rounded-lg
                  hover:before:opacity-100 
                  active:before:opacity-20"
    >
      <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
       {itemCount > 0 && (
        <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
          {itemCount}
        </span>
      )}
    </button>
  );
}));

CartIcon.displayName = 'CartIcon';

export default CartIcon;
