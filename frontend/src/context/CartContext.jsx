import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch cart when user logs in
    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCartItems([]);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const res = await api.get('/user/cart');
            setCartItems(res.data);
        } catch (err) {
            console.error('Failed to fetch cart', err);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            await api.post('/user/cart/add', { productId, quantity });
            // Refresh cart to get updated structure
            await fetchCart();
            return true;
        } catch (err) {
            console.error('Failed to add to cart', err);
            return false;
        }
    };

    const updateQuantity = async (productId, delta) => {
        try {
            // Find current quantity
            const item = cartItems.find(i => i.product.id === productId);
            if (!item) return;

            const newQty = item.quantity + delta;

            if (newQty <= 0) {
                await removeFromCart(productId);
            } else {
                await api.post('/user/cart/add', { productId, quantity: delta });
                // We typically use PUT for set quantity, but our backend add handles delta?
                // Wait, backend: existing.setQuantity(existing.getQuantity() + quantity);
                // So delta is correct. 
                await fetchCart();
            }
        } catch (err) {
            console.error('Failed to update quantity', err);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            await api.delete(`/user/cart/${productId}`);
            setCartItems(prev => prev.filter(item => item.product.id !== productId));
        } catch (err) {
            console.error('Failed to remove from cart', err);
        }
    };

    const clearCart = async () => {
        try {
            await api.delete('/user/cart');
            setCartItems([]);
        } catch (err) {
            console.error('Failed to clear cart', err);
        }
    };

    const checkout = async (deliveryAddress) => {
        try {
            await api.post('/user/cart/checkout', { deliveryAddress });
            setCartItems([]);
            return true;
        } catch (err) {
            console.error('Failed to checkout', err);
            throw err;
        }
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            loading,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            checkout,
            fetchCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
