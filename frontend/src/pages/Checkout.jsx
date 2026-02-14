import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI, paymentAPI, usersAPI } from '../services/api';
import { calculateItemTotal } from '../utils/priceUtils';
import './Checkout.css';

const Checkout = () => {
    const { cart, getCartTotal, getCartWeight, clearCart } = useCart();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
    });

    const [paymentMethod, setPaymentMethod] = useState('online');
    const [loading, setLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await usersAPI.getProfile();
                    const data = response.data;
                    if (data.success && data.data.address) {
                        setSavedAddresses(data.data.address);
                        // Pre-fill default address if exists
                        const defaultIndex = data.data.address.findIndex(a => a.isDefault);
                        if (defaultIndex !== -1) {
                            handleAddressSelect(defaultIndex, data.data.address[defaultIndex]);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching addresses:', error);
            }
        };
        fetchProfile();
    }, []);

    const handleAddressSelect = (index, addressData = null) => {
        setSelectedAddressIndex(index);
        const addr = addressData || savedAddresses[index];
        setFormData(prev => ({
            ...prev,
            street: addr.street,
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            country: addr.country
        }));
    };

    const subtotal = getCartTotal();

    // Inline Weight Calculation for Safety
    // Inline Weight Calculation for Safety
    const totalWeight = cart && cart.items ? cart.items.reduce((total, item) => {
        let itemWeight = 0;
        const qty = item.quantity || 1;

        const isOneKg = (item.product?.name && item.product.name.toLowerCase().includes('1kg')) ||
            (item.customization && (item.customization['Capacity'] === '1 Kg' || item.customization['Capacity'] === '1kg'));

        if (isOneKg) {
            itemWeight = 25 * qty; // 1kg pouch weighs ~25g empty
        } else {
            itemWeight = 10 * qty; // Default fallback to 10g per pouch
        }
        return total + itemWeight;
    }, 0) : 0;

    // Calculate shipping: Shiprocket "Free Plan" ~₹29 per 500g
    // 30kg = 60 units of 500g.
    const shipping = Math.max(50, Math.ceil(totalWeight / 500) * 29);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;

    // Partial Payment Logic
    const advancePercentage = 0.75; // 75%
    const paidAmount = Math.round(total * advancePercentage);
    const remainingAmount = total - paidAmount;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (paymentMethod === 'online') {
                const res = await loadRazorpay();
                if (!res) {
                    alert('Razorpay SDK failed to load. Are you online?');
                    setLoading(false);
                    return;
                }

                // Create Order on Backend with Partial Amount
                const result = await paymentAPI.createOrder({ amount: paidAmount });
                if (!result.data.success) {
                    alert('Server error. Are you online?');
                    setLoading(false);
                    return;
                }

                const { amount, id: order_id, currency } = result.data.order;

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                    amount: amount.toString(),
                    currency: currency,
                    name: "Think Lemon",
                    description: `75% Advance Payment for Order`,
                    order_id: order_id,
                    handler: async function (response) {
                        const data = {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        };

                        try {
                            const verifyRes = await paymentAPI.verify(data);

                            if (verifyRes.data.success) {
                                // Place the actual order now
                                const orderData = {
                                    items: cart.items.map(item => ({
                                        product: item.product._id,
                                        quantity: item.quantity,
                                        customization: item.customization,
                                        uploadedFiles: item.uploadedFiles
                                    })),
                                    shippingAddress: formData,
                                    paymentMethod: 'online',
                                    paymentStatus: 'partial', // Set status to partial
                                    paymentInfo: data,
                                    subtotal,
                                    shippingCost: shipping,
                                    tax,
                                    total,
                                    paidAmount, // Track paid amount
                                    remainingAmount // Track remaining amount
                                };

                                const orderRes = await ordersAPI.create(orderData);
                                if (orderRes.data.success) {
                                    setOrderId(orderRes.data.data.orderNumber);
                                    setOrderComplete(true);
                                    clearCart();
                                }
                            } else {
                                alert(verifyRes.data.message);
                            }
                        } catch (error) {
                            console.error('Payment verification failed:', error);
                            alert('Payment verification failed');
                        }
                    },
                    prefill: {
                        name: formData.name,
                        email: "user@example.com", // TODO: Get from auth context
                        contact: formData.phone
                    },
                    theme: {
                        color: "#FF6B35"
                    }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
                setLoading(false);
            }
        } catch (error) {
            console.error('Order creation failed:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to place order. Please try again.';
            alert(errorMessage);
            setLoading(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="checkout-container">
                <div className="container">
                    <div className="order-success fade-in">
                        <div className="success-icon">🎉</div>
                        <h1>Order Placed Successfully!</h1>
                        <p>Thank you for shopping with Think Lemon.</p>
                        <div className="order-number">
                            Order ID: <strong>{orderId}</strong>
                        </div>
                        <p>We have received your partial payment.</p>
                        <p className="mt-2 text-muted">A confirmation email has been sent to you.</p>
                        <div className="mt-4">
                            <Link to="/" className="btn btn-primary">Continue Shopping</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!cart.items || cart.items.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="checkout-container">
            <div className="container">
                <h1 className="mb-4">Checkout</h1>

                <form onSubmit={handleSubmit} className="checkout-grid">
                    <div className="checkout-form-card">
                        <div className="checkout-section">
                            <h2>Shipping Address</h2>

                            {savedAddresses.length > 0 && (
                                <div className="saved-addresses mb-4">
                                    <h3>Saved Addresses</h3>
                                    <div className="address-grid-small">
                                        {savedAddresses.map((addr, index) => (
                                            <div
                                                key={index}
                                                className={`address-card-small ${selectedAddressIndex === index ? 'selected' : ''}`}
                                                onClick={() => handleAddressSelect(index)}
                                            >
                                                <p className="font-bold">{addr.isDefault ? 'Default' : 'Address ' + (index + 1)}</p>
                                                <p>{addr.street}, {addr.city}</p>
                                                <p>{addr.state} - {addr.pincode}</p>
                                            </div>
                                        ))}
                                        <div
                                            className={`address-card-small ${selectedAddressIndex === -1 ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedAddressIndex(-1);
                                                setFormData({
                                                    name: '',
                                                    phone: '',
                                                    street: '',
                                                    city: '',
                                                    state: '',
                                                    pincode: '',
                                                    country: 'India'
                                                });
                                            }}
                                        >
                                            <p className="font-bold">New Address</p>
                                            <p>Enter a new address below</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-control"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Street Address</label>
                                <input
                                    type="text"
                                    name="street"
                                    className="form-control"
                                    required
                                    value={formData.street}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className="form-control"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        className="form-control"
                                        required
                                        value={formData.state}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        className="form-control"
                                        required
                                        value={formData.pincode}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        className="form-control"
                                        disabled
                                        value={formData.country}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="checkout-section">
                            <h2>Payment Method</h2>
                            <div className="payment-methods">
                                <label className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="online"
                                        checked={paymentMethod === 'online'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="payment-label">Pay 75% Advance with Razorpay (Card/UPI)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="cart-summary">
                        <h3 className="summary-header">Order Summary</h3>

                        {cart && cart.items && cart.items.length > 0 ? (
                            cart.items.map(item => (
                                <div key={item._id} className="summary-row" style={{ fontSize: '0.9rem' }}>
                                    <span>{item.product?.name || 'Item'} x {item.quantity}</span>
                                    <span>₹{calculateItemTotal(item)}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-3">Your cart is empty</div>
                        )}

                        <div className="summary-row mt-3 pt-3 border-top">
                            <span>Subtotal</span>
                            <span>₹{subtotal}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping (Weight: {totalWeight >= 1000 ? (totalWeight / 1000).toFixed(1) + 'kg' : totalWeight + 'g'})</span>
                            <span>₹{shipping}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax (18%)</span>
                            <span>₹{tax}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total Order Value</span>
                            <span>₹{total}</span>
                        </div>

                        {/* Partial Payment Summary */}
                        <div className="partial-payment-info mt-3 p-3 bg-yellow-50 rounded border border-yellow-200" style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px' }}>
                            <div className="summary-row text-orange-600 font-bold" style={{ color: '#d97706', fontWeight: 'bold' }}>
                                <span>Advance to Pay (75%)</span>
                                <span>₹{paidAmount}</span>
                            </div>
                            <div className="summary-row text-gray-500 text-sm mt-1" style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                <span>Balance Amount (Due later)</span>
                                <span>₹{remainingAmount}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg checkout-btn mt-3"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : `Pay ₹${paymentMethod === 'online' ? paidAmount : total}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
