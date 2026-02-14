import { createContext, useState, useContext, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { calculateItemTotal, calculateItemWeight } from '../utils/priceUtils';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) fetchCart();
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await cartAPI.get();
            setCart(response.data.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1, customization, uploadedFiles) => {
        try {
            const response = await cartAPI.add({ productId, quantity, customization, uploadedFiles });
            setCart(response.data.data);
            return { success: true, message: 'Item added to cart' };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to add item to cart' };
        }
    };

    const updateCartItem = async (itemId, quantity) => {
        try {
            const response = await cartAPI.update(itemId, { quantity });
            setCart(response.data.data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to update cart' };
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            const response = await cartAPI.remove(itemId);
            setCart(response.data.data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to remove item' };
        }
    };

    const clearCart = async () => {
        try {
            await cartAPI.clear();
            setCart({ items: [] });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to clear cart' };
        }
    };

    const getCartTotal = () => {
        return cart.items?.reduce((total, item) => total + calculateItemTotal(item), 0) || 0;
    };

    const getCartCount = () => {
        return cart.items?.length || 0;
    };

    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleCart = (isOpen) => {
        setIsCartOpen(isOpen !== undefined ? isOpen : !isCartOpen);
    };

    const getCartWeight = () => {
        try {
            if (!cart.items || !Array.isArray(cart.items) || cart.items.length === 0) return 0;

            const weight = cart.items.reduce((total, item) => {
                let itemWeight = 0;
                try {
                    // Try to use imported calculator, but fallback safe
                    itemWeight = calculateItemWeight(item);
                } catch (e) {
                    // console.error('Weight calc error:', e);
                }

                // Fallback default
                if (!itemWeight || isNaN(itemWeight)) {
                    const qty = item.quantity || 1;
                    itemWeight = qty * 500;
                }
                return total + itemWeight;
            }, 0);
            return weight;
        } catch (err) {
            console.error("Critical error in getCartWeight:", err);
            return 0;
        }
    };

    const value = {
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
        getCartWeight,
        refreshCart: fetchCart,
        isCartOpen,
        toggleCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
