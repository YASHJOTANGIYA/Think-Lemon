import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

import OrderHistory from './OrderHistory';

const Profile = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('addresses');
    const [addresses, setAddresses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        } else if (user) {
            fetchProfile();
        }
    }, [user, authLoading, navigate]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const response = await axios.get('http://localhost:5000/api/users/profile', config);
            setAddresses(response.data.data.address || []);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            let newAddresses = [...addresses];

            if (formData.isDefault) {
                // Set all others to false
                newAddresses = newAddresses.map(addr => ({ ...addr, isDefault: false }));
            }

            if (editingIndex !== null) {
                // Update existing
                newAddresses[editingIndex] = formData;
            } else {
                // Add new
                newAddresses.push(formData);
            }

            await axios.put('http://localhost:5000/api/users/profile', {
                address: newAddresses
            }, config);

            setAddresses(newAddresses);
            setShowModal(false);
            setEditingIndex(null);
            setFormData({
                street: '',
                city: '',
                state: '',
                pincode: '',
                country: 'India',
                isDefault: false
            });
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (index) => {
        setEditingIndex(index);
        setFormData(addresses[index]);
        setShowModal(true);
    };

    const handleDelete = async (index) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const newAddresses = addresses.filter((_, i) => i !== index);

            await axios.put('http://localhost:5000/api/users/profile', {
                address: newAddresses
            }, config);

            setAddresses(newAddresses);
        } catch (error) {
            console.error('Error deleting address:', error);
            alert('Failed to delete address');
        }
    };

    if (authLoading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="profile-container">
            <div className="container">
                <div className="profile-header">
                    <h1>My Account</h1>
                </div>

                <div className="profile-grid">
                    <div className="profile-sidebar">
                        <div className="user-info">
                            <div className="user-avatar">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <h3>{user?.name}</h3>
                            <p>{user?.email}</p>
                        </div>
                        <div className="profile-menu">
                            <div
                                className={`menu-item ${activeTab === 'addresses' ? 'active' : ''}`}
                                onClick={() => setActiveTab('addresses')}
                            >
                                📍 Saved Addresses
                            </div>
                            <div
                                className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                📦 My Orders
                            </div>
                            <div
                                className={`menu-item ${activeTab === 'designs' ? 'active' : ''}`}
                                onClick={() => setActiveTab('designs')}
                            >
                                🎨 Saved Designs
                            </div>
                        </div>
                    </div>

                    <div className="profile-content">
                        {activeTab === 'addresses' && (
                            <div>
                                <div className="flex justify-between items-center">
                                    <h2>Saved Addresses</h2>
                                </div>
                                <div className="address-grid">
                                    <div className="add-address-card" onClick={() => {
                                        setEditingIndex(null);
                                        setFormData({
                                            street: '',
                                            city: '',
                                            state: '',
                                            pincode: '',
                                            country: 'India',
                                            isDefault: false
                                        });
                                        setShowModal(true);
                                    }}>
                                        <div className="add-icon">+</div>
                                        <span>Add New Address</span>
                                    </div>
                                    {addresses.map((addr, index) => (
                                        <div key={index} className="address-card">
                                            <span className="address-type">{addr.isDefault ? 'Default' : 'Home'}</span>
                                            <p>{addr.street}</p>
                                            <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                            <p>{addr.country}</p>
                                            <div className="address-actions">
                                                <button className="btn-edit" onClick={() => handleEdit(index)}>Edit</button>
                                                <button className="btn-delete" onClick={() => handleDelete(index)}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <h2>My Orders</h2>
                                <OrderHistory embedded={true} />
                            </div>
                        )}

                        {activeTab === 'designs' && (
                            <div>
                                <h2>Saved Designs</h2>
                                <div className="empty-state">
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
                                    <p>You haven't saved any designs yet.</p>
                                    <button className="btn btn-primary mt-3" onClick={() => navigate('/design-tool')}>
                                        Start Designing
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="mb-4">{editingIndex !== null ? 'Edit Address' : 'Add New Address'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Street Address</label>
                                <input
                                    type="text"
                                    name="street"
                                    className="form-control"
                                    required
                                    value={formData.street}
                                    onChange={handleInputChange}
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
                                        onChange={handleInputChange}
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
                                        onChange={handleInputChange}
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
                                        onChange={handleInputChange}
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
                            <div className="form-group">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isDefault"
                                        checked={formData.isDefault}
                                        onChange={handleInputChange}
                                    />
                                    Set as default address
                                </label>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button type="button" className="btn btn-outline flex-1" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                                    {loading ? 'Saving...' : (editingIndex !== null ? 'Update Address' : 'Save Address')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
