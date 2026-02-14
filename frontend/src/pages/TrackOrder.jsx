import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import './TrackOrder.css';

const TrackOrder = () => {
    const { orderNumber: paramOrderNumber } = useParams();
    const [orderNumber, setOrderNumber] = useState(paramOrderNumber || '');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (paramOrderNumber) {
            trackOrder(paramOrderNumber);
        }
    }, [paramOrderNumber]);

    const trackOrder = async (id) => {
        setLoading(true);
        setError('');
        setOrderData(null);

        try {
            const response = await ordersAPI.track(id);
            setOrderData(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Order not found. Please check your Order ID.');
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!orderNumber.trim()) return;
        trackOrder(orderNumber);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="track-order-container">
            <div className="container">
                <div className="track-card">
                    <div className="track-header">
                        <h1>Track Your Order</h1>
                        <p>Enter your Order ID to see the current status of your shipment.</p>
                    </div>

                    <form onSubmit={handleTrack} className="track-form">
                        <input
                            type="text"
                            className="track-input"
                            placeholder="Enter Order ID (e.g., TL24121234)"
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                            required
                        />
                        <button type="submit" className="track-btn" disabled={loading}>
                            {loading ? 'Tracking...' : 'Track Order'}
                        </button>
                    </form>

                    {error && (
                        <div className="alert alert-danger text-center">
                            {error}
                        </div>
                    )}

                    {orderData && (
                        <div className="order-status-result fade-in">
                            <div className="status-header">
                                <span className="order-id">Order #{orderData.orderNumber}</span>
                                <span className={`current-status status-${orderData.orderStatus}`}>
                                    {orderData.orderStatus}
                                </span>
                            </div>

                            {orderData.awbCode && (
                                <div className="tracking-info" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                                    <p style={{ margin: 0, color: '#0369a1' }}>
                                        <strong>Shipment AWB:</strong> {orderData.awbCode}
                                    </p>
                                    <a
                                        href={`https://shiprocket.co/tracking/${orderData.awbCode}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'inline-block', marginTop: '0.5rem', color: '#0284c7', textDecoration: 'underline' }}
                                    >
                                        Track on Shiprocket &rarr;
                                    </a>
                                </div>
                            )}

                            <div className="status-timeline">
                                {orderData.statusHistory?.slice().reverse().map((history, index) => (
                                    <div key={index} className="timeline-item active">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                            <h4>{history.status}</h4>
                                            <p>{history.note}</p>
                                            <span className="timeline-date">{formatDate(history.timestamp)}</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="timeline-item">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <h4>Order Placed</h4>
                                        <span className="timeline-date">{formatDate(orderData.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default TrackOrder;
