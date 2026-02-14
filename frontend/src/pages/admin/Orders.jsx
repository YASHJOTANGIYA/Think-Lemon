import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import './Admin.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [statusNote, setStatusNote] = useState('');
    const [shipmentWeight, setShipmentWeight] = useState(0.5);
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
    const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchOrders();
    }, [filter, page]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (filter !== 'all') params.status = filter;

            const response = await ordersAPI.getAllAdmin(params);
            setOrders(response.data.data);
            setTotalPages(response.data.pagination.pages);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOrderSelect = (order) => {
        setSelectedOrder(order);

        setSelectedStatus(order.orderStatus);
        setStatusNote('');
        setShipmentWeight(0.5);
    };

    const handleStatusUpdate = async (orderId) => {
        try {
            await ordersAPI.updateStatus(orderId, {
                status: selectedStatus,
                note: statusNote || `Status updated to ${selectedStatus}`
            });
            setStatusNote('');
            setSelectedOrder(null);
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleShipToShiprocket = async (orderId) => {
        setConfirmModal({
            show: true,
            message: 'Are you sure you want to create a Shiprocket order?',
            onConfirm: () => performShiprocketOrder(orderId)
        });
    };

    const performShiprocketOrder = async (orderId) => {
        try {
            const result = await ordersAPI.ship(orderId, { weight: parseFloat(shipmentWeight) });
            setAlertModal({
                show: true,
                message: `Order shipped successfully! Handed to Courier.\nSR Order ID: ${result.data.data.order_id}`,
                type: 'success'
            });
            setSelectedOrder(null);
            fetchOrders();
        } catch (error) {
            console.error('Error shipping order:', error);
            const msg = error.response?.data?.message || 'Failed to ship order';
            setAlertModal({ show: true, message: msg, type: 'error' });
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'status-pending',
            processing: 'status-processing',
            printing: 'status-processing', // reuse processing style or add new
            ready: 'status-shipped', // reuse shipped style (blue/indigo) as it means ready to ship
            shipped: 'status-shipped',
            delivered: 'status-delivered',
            cancelled: 'status-cancelled'
        };
        return <span className={`status-badge ${styles[status] || ''}`}>{status === 'shipped' ? 'Handed to Courier' : status}</span>;
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>Order Management</h1>
                <div className="status-tabs">
                    {['all', 'pending', 'processing', 'printing', 'ready', 'shipped', 'delivered', 'cancelled'].map(status => (
                        <button
                            key={status}
                            className={`status-tab ${filter === status ? 'active' : ''}`}
                            onClick={() => { setFilter(status); setPage(1); }}
                        >
                            {status === 'shipped' ? 'Handed to Courier' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center p-4">Loading...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan="6" className="text-center p-4">No orders found</td></tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order._id}>
                                    <td>#{order.orderNumber}</td>
                                    <td>
                                        <div>{order.user?.name || 'Guest'}</div>
                                        <div className="text-sm text-gray">{order.user?.email}</div>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>₹{order.total}</td>
                                    <td>{getStatusBadge(order.orderStatus)}</td>
                                    <td>
                                        <button
                                            className="action-btn btn-edit"
                                            onClick={() => handleOrderSelect(order)}
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="page-btn"
                >
                    Previous
                </button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="page-btn"
                >
                    Next
                </button>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Order #{selectedOrder.orderNumber}</h2>
                            <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <div className="section-title">
                                    <span>📦</span> Order Items
                                </div>
                                <div className="order-items-list">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="order-item-row">
                                            <div className="item-info">
                                                <span className="item-name">{item.product?.name || 'Unknown Product'}</span>
                                                <span className="item-meta">Quantity: {item.quantity}</span>
                                                {item.uploadedFiles && item.uploadedFiles.length > 0 && (
                                                    <div className="item-files" style={{ marginTop: '0.5rem' }}>
                                                        <strong style={{ fontSize: '0.8rem', color: '#666' }}>Uploaded Files:</strong>
                                                        <ul style={{ margin: '0.2rem 0 0 1rem', padding: 0 }}>
                                                            {item.uploadedFiles.map((file, fIdx) => (
                                                                <li key={fIdx} style={{ fontSize: '0.8rem' }}>
                                                                    <a
                                                                        href={getImageUrl(file)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        style={{ color: '#007bff', textDecoration: 'underline' }}
                                                                    >
                                                                        Download File {fIdx + 1}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="item-price">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                    <div className="total-row">
                                        <span>Total Amount</span>
                                        <span>₹{selectedOrder.total}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <div className="section-title">
                                    <span>📍</span> Shipping Details
                                </div>
                                <div className="address-card">
                                    <div className="address-line">
                                        <span className="address-icon">👤</span>
                                        <strong>{selectedOrder.user?.name || 'Guest User'}</strong>
                                    </div>
                                    <div className="address-line">
                                        <span className="address-icon">🏠</span>
                                        <span>
                                            {selectedOrder.shippingAddress?.street},<br />
                                            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.zipCode}
                                        </span>
                                    </div>
                                    <div className="address-line">
                                        <span className="address-icon">📞</span>
                                        <span>{selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="status-section">
                                <div className="section-title">
                                    <span>🔄</span> Update Status
                                </div>
                                <div className="status-control-group">
                                    <div className="status-select-wrapper">
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="status-select"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="printing">Printing</option>
                                            <option value="ready">Ready</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                                <textarea
                                    className="status-note"
                                    placeholder="Add a note for this status update (optional)..."
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    rows="3"
                                />
                                <button
                                    className="update-status-btn"
                                    onClick={() => handleStatusUpdate(selectedOrder._id)}
                                    disabled={selectedStatus === selectedOrder.orderStatus && !statusNote}
                                >
                                    Update Status
                                </button>
                            </div>

                            <div className="detail-section" style={{ borderTop: '1px solid #eee', marginTop: '2rem', paddingTop: '1rem' }}>
                                <div className="section-title">
                                    <span>🚀</span> Shiprocket
                                </div>
                                {selectedOrder.shiprocketOrderId ? (
                                    <div className="shiprocket-details" style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                                        <p style={{ margin: '0 0 0.5rem 0', color: '#0369a1' }}><strong>Shipped with Shiprocket</strong></p>
                                        <p style={{ margin: '0 0 0.25rem 0' }}>Order ID: <span style={{ fontFamily: 'monospace' }}>{selectedOrder.shiprocketOrderId}</span></p>
                                        <p style={{ margin: '0 0 0.25rem 0' }}>Shipment ID: <span style={{ fontFamily: 'monospace' }}>{selectedOrder.shipmentId}</span></p>
                                        <p style={{ margin: '0' }}>AWB Code: <span style={{ fontFamily: 'monospace' }}>{selectedOrder.awbCode}</span></p>
                                    </div>
                                ) : (
                                    <div className="shiprocket-actions">
                                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                                            Push this order to Shiprocket to generate a label and schedule a pickup.
                                        </p>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Package Weight (kg)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={shipmentWeight}
                                                onChange={(e) => setShipmentWeight(e.target.value)}
                                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '100px' }}
                                            />
                                        </div>
                                        <button
                                            className="action-btn"
                                            style={{
                                                backgroundColor: '#7c3aed',
                                                color: 'white',
                                                padding: '0.75rem 1.5rem',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontWeight: '600'
                                            }}
                                            onClick={() => handleShipToShiprocket(selectedOrder._id)}
                                        >
                                            <span>Ship via Shiprocket</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Custom Confirm Modal */}
            {
                confirmModal.show && (
                    <div className="modal-overlay" style={{ zIndex: 1001 }}>
                        <div className="modal-content small-modal" style={{ maxWidth: '400px', width: '90%' }}>
                            <div className="modal-header">
                                <h2>Confirm Action</h2>
                                <button className="close-btn" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>×</button>
                            </div>
                            <div className="modal-body">
                                <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#4b5563' }}>{confirmModal.message}</p>
                                <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button
                                        className="action-btn"
                                        style={{ backgroundColor: '#e5e7eb', color: '#374151' }}
                                        onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="action-btn"
                                        style={{ backgroundColor: '#7c3aed', color: 'white' }}
                                        onClick={() => {
                                            confirmModal.onConfirm();
                                            setConfirmModal({ ...confirmModal, show: false });
                                        }}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Custom Alert Modal */}
            {
                alertModal.show && (
                    <div className="modal-overlay" style={{ zIndex: 1002 }}>
                        <div className="modal-content small-modal" style={{ maxWidth: '400px', width: '90%' }}>
                            <div className="modal-header">
                                <h2 style={{ color: alertModal.type === 'error' ? '#dc2626' : '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {alertModal.type === 'error' ? '⚠️ Error' : '✅ Success'}
                                </h2>
                                <button className="close-btn" onClick={() => setAlertModal({ ...alertModal, show: false })}>×</button>
                            </div>
                            <div className="modal-body">
                                <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', whiteSpace: 'pre-line', color: '#4b5563' }}>{alertModal.message}</p>
                                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        className="action-btn"
                                        style={{ backgroundColor: '#3b82f6', color: 'white' }}
                                        onClick={() => setAlertModal({ ...alertModal, show: false })}
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default AdminOrders;
