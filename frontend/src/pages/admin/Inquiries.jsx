import React, { useState, useEffect } from 'react';
import { inquiriesAPI } from '../../services/api';
import './Admin.css'; // Reuse existing admin styles

const AdminInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const response = await inquiriesAPI.getAll();
            setInquiries(response.data.data);
        } catch (err) {
            setError('Failed to fetch inquiries');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await inquiriesAPI.updateStatus(id, newStatus);
            // Optimistic update
            setInquiries(inquiries.map(inq =>
                inq._id === id ? { ...inq, status: newStatus } : inq
            ));
        } catch (err) {
            alert('Failed to update status');
            console.error(err);
        }
    };

    if (loading) return <div className="loading-spinner">Loading Inquiries...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2>Business Inquiries</h2>
                <button className="refresh-btn" onClick={fetchInquiries}>
                    Refresh
                </button>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Company / Contact</th>
                            <th>Contact Info</th>
                            <th>Requirement</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inquiries.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">No inquiries found.</td>
                            </tr>
                        ) : (
                            inquiries.map((inquiry) => (
                                <tr key={inquiry._id}>
                                    <td>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="font-bold">{inquiry.companyName}</div>
                                        <div className="text-sm text-gray">{inquiry.contactPerson}</div>
                                    </td>
                                    <td>
                                        <div>{inquiry.email}</div>
                                        <div>{inquiry.phone}</div>
                                    </td>
                                    <td>
                                        <div className="badge badge-blue">{inquiry.requirement}</div>
                                        <div className="text-sm mt-1 truncate-text" title={inquiry.quantity}>
                                            {inquiry.quantity}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${inquiry.status.toLowerCase()}`}>
                                            {inquiry.status}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            value={inquiry.status}
                                            onChange={(e) => handleStatusUpdate(inquiry._id, e.target.value)}
                                            className="status-select"
                                        >
                                            <option value="New">New</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Contacted">Contacted</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminInquiries;
