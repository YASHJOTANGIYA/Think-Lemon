import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { calculateItemTotal } from '../utils/priceUtils';
import { FaTimes, FaTrash, FaMinus, FaPlus, FaShoppingCart, FaArrowRight, FaTruck } from 'react-icons/fa';
import './CartDrawer.css';

const CartDrawer = () => {
    const { cart, isCartOpen, toggleCart, updateCartItem, removeFromCart, getCartTotal } = useCart();
    const navigate = useNavigate();
    const drawerRef = useRef(null);

    // Close drawer when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target) && isCartOpen) {
                toggleCart(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCartOpen, toggleCart]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.setProperty('overflow', 'hidden', 'important');
            document.documentElement.style.setProperty('overflow', 'hidden', 'important');
            document.body.style.paddingRight = '15px';
        } else {
            document.body.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('overflow');
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('overflow');
            document.body.style.paddingRight = '';
        };
    }, [isCartOpen]);

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        updateCartItem(itemId, newQuantity);
    };

    const handleCheckout = () => {
        toggleCart(false);
        navigate('/cart');
    };

    const currentTotal = getCartTotal();

    return (
        <>
            <div className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => toggleCart(false)}></div>
            <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`} ref={drawerRef}>
                <div className="cart-drawer-header">
                    <div className="header-title">
                        <FaShoppingCart className="header-icon" />
                        <h2>My Cart <span className="item-count">({cart.items?.length || 0})</span></h2>
                    </div>
                    <button className="close-drawer-btn" onClick={() => toggleCart(false)}>
                        <FaTimes />
                    </button>
                </div>

                <div className="cart-drawer-content">
                    {cart.items && cart.items.length > 0 ? (
                        <>


                            <div className="cart-items-list">
                                {cart.items.map((item) => (
                                    <div key={item._id} className="drawer-cart-item">
                                        <div className="item-image-container">
                                            {item.product.images?.[0] ? (
                                                <img src={item.product.images[0]} alt={item.product.name} />
                                            ) : (
                                                <div className="placeholder-img">🖼️</div>
                                            )}
                                        </div>
                                        <div className="item-details">
                                            <div className="item-top-row">
                                                <h3 className="item-name">{item.product.name}</h3>
                                                <button
                                                    className="delete-item-btn"
                                                    onClick={() => removeFromCart(item._id)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>

                                            {item.customization && (
                                                <div className="item-customizations">
                                                    {Object.entries(item.customization).map(([key, value]) => (
                                                        <span key={key} className="customization-pill">
                                                            {key}: {value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="item-bottom-row">
                                                <div className="qty-display-simple">
                                                    Qty: {item.quantity}
                                                </div>
                                                <div className="item-price">
                                                    ₹{calculateItemTotal(item).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-cart-drawer">
                            <div className="empty-state-icon">
                                <FaShoppingCart />
                            </div>
                            <h3>Your cart is empty</h3>
                            <p>Looks like you haven't added anything yet.</p>
                            <button className="btn-start-shopping" onClick={() => toggleCart(false)}>
                                Start Shopping
                            </button>
                        </div>
                    )}
                </div>

                {cart.items && cart.items.length > 0 && (
                    <div className="cart-drawer-footer">
                        <div className="cart-summary-lines">
                            <div className="summary-line">
                                <span>Subtotal</span>
                                <span>₹{currentTotal.toLocaleString()}</span>
                            </div>
                            <div className="summary-line highlight">
                                <span>Total</span>
                                <span>₹{currentTotal.toLocaleString()}</span>
                            </div>
                        </div>
                        <button className="drawer-checkout-btn" onClick={handleCheckout}>
                            Proceed to Checkout <FaArrowRight />
                        </button>
                        <p className="secure-checkout-text">
                            <svg width="12" height="14" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 0C3.13 0 0 3.13 0 7V16H14V7C14 3.13 10.87 0 7 0ZM7 2C9.76 2 12 4.24 12 7V14H2V7C2 4.24 4.24 2 7 2ZM7 8C6.17 8 5.5 8.67 5.5 9.5C5.5 10.33 6.17 11 7 11C7.83 11 8.5 10.33 8.5 9.5C8.5 8.67 7.83 8 7 8Z" fill="currentColor" />
                            </svg>
                            Secure Checkout
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
