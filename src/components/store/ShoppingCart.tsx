import React from 'react';
import { useCart } from '../../contexts/CartContext';

const ShoppingCart: React.FC = () => {
    const { cart, removeFromCart, clearCart, updateQuantity } = useCart();

    const handleRemoveFromCart = (productId: string | undefined) => {
      if (productId) {
        removeFromCart(productId);
      } else {
        console.error("Attempted to remove from cart with an undefined product id");
      }
    };

    const handleClearCart = () => {
        clearCart();
    };

    const handleQuantityChange = (productId: string | undefined, quantity: number) => {
       if (productId) {
         if (quantity > 0) {
          updateQuantity(productId, quantity);
        }
       } else {
        console.error("Attempted to update product quantity with an undefined product id");
       }
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    };

    const total = calculateTotal();

    const handleCheckout = () => {
        const cashAppUrl = `https://cash.app/$BullocksSmokeShop/${total.toFixed(2)}`;
        window.open(cashAppUrl, '_blank');
        clearCart(); // Clear the cart after checkout
    };

    return (
        <div className="fixed top-0 right-0 h-full w-80 bg-slate-800 shadow-xl z-[100] p-4 overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Shopping Cart</h2>
            {cart.length === 0 ? (
                <p className="text-slate-400">Your cart is empty.</p>
            ) : (
                <ul className="space-y-4">
                    {cart.map(item => {
                      if (typeof item.product?.id !== 'string') {
                        console.error("Invalid product ID:", item.product);
                        return null;
                      }
                      return (
                        <li key={item.product.id} className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                                <img src={item.product.images?.[0] || '/placeholder-product.png'} alt={item.product.name} className="h-12 w-12 object-cover rounded-md" />
                                <div>
                                    <h3 className="text-white font-semibold">{item.product.name}</h3>
                                    <p className="text-slate-400 text-sm">${item.product.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value))}
                                    className="w-16 bg-slate-600 text-white rounded-md p-1 text-center"
                                />
                                <button
                                    onClick={() => handleRemoveFromCart(item.product.id)}
                                    className="text-red-500 hover:text-red-400"
                                >
                                    Remove
                                </button>
                            </div>
                        </li>
                    );
                    })}
                </ul>
            )}
            {cart.length > 0 && (
                <>
                    <div className="mt-4 text-right">
                        <h3 className="text-white text-xl font-semibold">Total: ${total.toFixed(2)}</h3>
                    </div>
                    <button
                        onClick={handleCheckout}
                        className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-elegant transition-elegant"
                    >
                        Checkout with CashApp
                    </button>
                    <button
                        onClick={handleClearCart}
                        className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-elegant transition-elegant"
                    >
                        Clear Cart
                    </button>
                </>
            )}
        </div>
    );
};

export default ShoppingCart;