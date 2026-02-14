import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaCreditCard } from 'react-icons/fa';

import { ordersAPI, paymentAPI } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import './OrderHistory.css';

const OrderHistory = ({ embedded = false }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingPaymentId, setProcessingPaymentId] = useState(null);
    const [successModal, setSuccessModal] = useState(false);
    const [lastPaidOrderId, setLastPaidOrderId] = useState(null);


    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await ordersAPI.getMyOrders();
            setOrders(response.data.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };


    const handlePayBalance = async (order) => {
        setProcessingPaymentId(order._id);
        try {
            const res = await loadRazorpay();
            if (!res) {
                alert('Razorpay SDK failed to load. Are you online?');
                setProcessingPaymentId(null);
                return;
            }

            // Create Order on Backend for the REMAINING amount
            const result = await paymentAPI.createOrder({ amount: order.remainingAmount });

            if (!result.data.success) {
                alert('Server error creating payment order.');
                setProcessingPaymentId(null);
                return;
            }

            const { amount, id: order_id, currency } = result.data.order;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                amount: amount.toString(),
                currency: currency,
                name: "Think Lemon",
                description: `Balance Payment for Order #${order.orderNumber}`,
                order_id: order_id,
                handler: async function (response) {
                    const data = {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature
                    };

                    try {
                        // Verify payment signature
                        const verifyRes = await paymentAPI.verify(data);

                        if (verifyRes.data.success) {
                            // Update order status on backend
                            const updateRes = await ordersAPI.payBalance(order._id, data);
                            if (updateRes.data.success) {
                                setLastPaidOrderId(order.orderNumber);
                                setSuccessModal(true);
                                fetchOrders(); // Refresh list
                            }

                        } else {
                            alert(verifyRes.data.message);
                        }
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        alert('Payment verification failed');
                    } finally {
                        setProcessingPaymentId(null);
                    }
                },
                prefill: {
                    name: "User", // Ideally get from user context
                    email: "user@example.com",
                    contact: ""
                },
                theme: {
                    color: "#FF6B35"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Payment initiation failed:', error);
            alert('Could not initiate payment.');
            setProcessingPaymentId(null);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    if (orders.length === 0) {
        return (
            <div className={embedded ? "" : "container text-center py-5"}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                <h2>No orders yet</h2>
                <p className="text-muted mb-4">You haven't placed any orders yet.</p>
                <Link to="/products" className="btn btn-primary">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className={embedded ? "" : "orders-container"}>
            <div className={embedded ? "" : "container"}>
                {!embedded && <h1 className="mb-4">My Orders</h1>}

                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <div className="order-meta">
                                    <div className="meta-group">
                                        <span className="meta-label">Order Placed</span>
                                        <span className="meta-value">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="meta-group">
                                        <span className="meta-label">Total</span>
                                        <span className="meta-value">₹{order.total}</span>
                                    </div>
                                    <div className="meta-group">
                                        <span className="meta-label">Order #</span>
                                        <span className="meta-value">{order.orderNumber}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="order-content-body">
                                <div className="order-items">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="order-item">
                                            <div className="item-image">
                                                {item.product?.images?.[0] ? (
                                                    <img src={getImageUrl(item.product.images[0])} alt={item.product.name} />
                                                ) : (
                                                    <div className="image-placeholder">🖼️</div>
                                                )}
                                            </div>
                                            <div className="item-details">
                                                <Link to={`/products/${item.product?.slug}`} className="item-name">
                                                    {item.product?.name || 'Product Unavailable'}
                                                </Link>
                                                <div className="item-qty">Qty: {item.quantity}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-actions">
                                    {/* SHOW BALANCE PAYMENT STATUS */}
                                    {(() => {
                                        const remainingAmount = order.remainingAmount !== undefined
                                            ? order.remainingAmount
                                            : (order.paymentStatus === 'paid' ? 0 : order.total - (order.paidAmount || 0));

                                        if (remainingAmount > 0 && order.orderStatus !== 'cancelled') {
                                            return (
                                                <div className="balance-due-container">
                                                    <div className="balance-info">
                                                        <span className="balance-label">Balance Due</span>
                                                        <span className="balance-amount">₹{remainingAmount.toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <button
                                                        className="btn-pay-balance"
                                                        onClick={() => handlePayBalance({ ...order, remainingAmount })}
                                                        disabled={processingPaymentId === order._id}
                                                    >
                                                        <FaCreditCard size={14} />
                                                        {processingPaymentId === order._id ? 'Processing...' : 'Pay Balance'}
                                                    </button>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            </div>

                            <div className="order-footer">
                                <div className="status-container">
                                    <span className={`order-status-badge status-${order.orderStatus}`}>
                                        {order.orderStatus === 'shipped' ? 'Handed to Courier' : order.orderStatus}
                                    </span>
                                    {order.statusHistory?.length > 0 && order.statusHistory[order.statusHistory.length - 1].note && (
                                        <p className="status-note-text">
                                            Note: {order.statusHistory[order.statusHistory.length - 1].note}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Embedded Status Timeline (Horizontal) */}
                            <div className="order-card-timeline">
                                {(() => {
                                    const steps = [
                                        { label: 'Order Placed', key: 'pending' },
                                        { label: 'Processing', key: 'processing' },
                                        { label: 'Ready', key: 'ready' },
                                        { label: 'Handed to Courier', key: 'shipped' },
                                        { label: 'Delivered', key: 'delivered' }
                                    ];

                                    const currentStatus = order.orderStatus?.toLowerCase() || 'pending';
                                    let currentIndex = steps.findIndex(s => s.key === currentStatus);

                                    // Fallback mapping
                                    if (currentIndex === -1) {
                                        if (currentStatus === 'printing') currentIndex = 1;
                                        else currentIndex = 0;
                                    }

                                    return steps.map((step, idx) => {
                                        // Find history item for this step
                                        const historyItem = order.statusHistory?.find(h =>
                                            (h.status && h.status.toLowerCase() === step.key) ||
                                            (h.status && h.status.toLowerCase().includes(step.label.toLowerCase()))
                                        );

                                        // Determine date to show
                                        let date = historyItem?.timestamp;
                                        if (idx === 0 && !date) date = order.createdAt;

                                        // Status Classes
                                        let statusClass = '';
                                        if (idx < currentIndex) statusClass = 'completed';
                                        else if (idx === currentIndex) statusClass = 'current';

                                        return (
                                            <div key={idx} className={`timeline-item ${statusClass}`}>
                                                <div className="timeline-dot"></div>
                                                <div className="timeline-content">
                                                    <h4>{step.label}</h4>
                                                    {historyItem?.note && <p>{historyItem.note}</p>}
                                                    {date && <span className="timeline-date">{formatDate(date)}</span>}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Success Modal */}
            {
                successModal && (
                    <div className="payment-modal-overlay">
                        <div className="payment-modal">
                            <div className="modal-icon-wrapper">
                                <FaCheck />
                            </div>
                            <h2>Payment Successful!</h2>
                            <p>
                                Order <strong>#{lastPaidOrderId}</strong> is now fully paid.
                                <br />
                                We are preparing it for shipment. You will receive a tracking update shortly.
                            </p>
                            <button className="btn-finish" onClick={() => setSuccessModal(false)}>
                                Awesome!
                            </button>
                        </div>
                    </div>
                )
            }
        </div >

    );
};

export default OrderHistory;
