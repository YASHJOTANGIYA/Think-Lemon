import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';
import { calculateItemTotal } from '../utils/priceUtils';
import { FaTrash, FaMinus, FaPlus, FaArrowRight, FaShoppingBag, FaArrowLeft } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
    const { cart, loading, updateCartItem, removeFromCart, clearCart, getCartTotal } = useCart();
    const navigate = useNavigate();

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        await updateCartItem(itemId, newQuantity);
    };

    const handleRemove = async (itemId) => {
        if (window.confirm('Are you sure you want to remove this item?')) {
            await removeFromCart(itemId);
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            await clearCart();
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
        </div>
    );

    if (!cart.items || cart.items.length === 0) {
        return (
            <div className="cart-page-container">
                <div className="container">
                    <div className="empty-cart-state">
                        <div className="empty-cart-icon">
                            <FaShoppingBag />
                        </div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything yet.</p>
                        <Link to="/products" className="btn btn-primary start-shopping-btn">
                            Start Shopping <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const subtotal = getCartTotal();
    const shipping = 50;
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + shipping + tax;

    return (
        <div className="cart-page-container">
            <div className="container">
                <div className="cart-header-actions">
                    <h1 className="cart-title">Shopping Cart <span>({cart.items.length} items)</span></h1>
                    <button className="clear-cart-btn" onClick={handleClearCart}>
                        <FaTrash /> Clear Cart
                    </button>
                </div>

                <div className="cart-layout">
                    <div className="cart-items-section">
                        {cart.items.map((item) => (
                            <div key={item._id} className="modern-cart-item">
                                <div className="item-image-wrapper">
                                    {item.product.images && item.product.images.length > 0 ? (
                                        <img src={getImageUrl(item.product.images[0])} alt={item.product.name} />
                                    ) : (
                                        <div className="placeholder-image">🖼️</div>
                                    )}
                                </div>

                                <div className="item-details">
                                    <div className="item-info">
                                        <Link to={`/products/${item.product.slug}`} className="item-name">
                                            {item.product.name}
                                        </Link>

                                        {item.customization && Object.keys(item.customization).length > 0 && (
                                            <div className="item-customizations">
                                                {Object.entries(item.customization).map(([key, value]) => (
                                                    <div key={key} className="customization-pill">
                                                        <span className="pill-label">{key}:</span>
                                                        <span className="pill-value">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="item-controls">
                                        <div className="item-price">
                                            ₹{calculateItemTotal(item).toLocaleString()}
                                        </div>

                                        <div className="quantity-wrapper">
                                            <button
                                                className="qty-btn"
                                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <FaMinus />
                                            </button>
                                            <span className="qty-display">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>

                                        <button
                                            className="item-remove-btn"
                                            onClick={() => handleRemove(item._id)}
                                            title="Remove item"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="continue-shopping">
                            <Link to="/products" className="continue-link">
                                <FaArrowLeft /> Continue Shopping
                            </Link>
                        </div>
                    </div>

                    <div className="cart-summary-section">
                        <div className="summary-card">
                            <h3 className="summary-title">Order Summary</h3>

                            <div className="summary-details">
                                <div className="summary-line">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="summary-line">
                                    <span>Shipping</span>
                                    <span>₹{shipping}</span>
                                </div>
                                <div className="summary-line">
                                    <span>Tax (18% GST)</span>
                                    <span>₹{tax.toLocaleString()}</span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-line total">
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button className="checkout-btn-modern" onClick={handleCheckout}>
                                Proceed to Checkout <FaArrowRight />
                            </button>

                            <div className="secure-checkout-note">
                                <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 0C3.13 0 0 3.13 0 7V16H14V7C14 3.13 10.87 0 7 0ZM7 2C9.76 2 12 4.24 12 7V14H2V7C2 4.24 4.24 2 7 2ZM7 8C6.17 8 5.5 8.67 5.5 9.5C5.5 10.33 6.17 11 7 11C7.83 11 8.5 10.33 8.5 9.5C8.5 8.67 7.83 8 7 8Z" fill="#6B7280" />
                                </svg>
                                Secure Checkout
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
