import React, { useState } from 'react';
import './BusinessSolutions.css';

import { inquiriesAPI } from '../services/api';

const BusinessSolutions = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        requirement: '',
        quantity: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await inquiriesAPI.create(formData);
            alert('Thank you for your inquiry! Our corporate team will contact you shortly.');
            setFormData({
                companyName: '',
                contactPerson: '',
                email: '',
                phone: '',
                requirement: '',
                quantity: ''
            });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit inquiry. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="business-solutions-container">
            {/* Hero Section */}
            <div className="business-hero">
                <div className="container">
                    <h1>Corporate Gifting & Printing Solutions</h1>
                    <p>Elevate your brand with premium custom merchandise. Bulk orders, exclusive pricing, and dedicated support for your business.</p>
                </div>
            </div>

            <div className="container">
                {/* Features Grid */}
                <div className="business-features">
                    <div className="feature-card">
                        <div className="feature-icon">🏢</div>
                        <h3>Corporate Gifting</h3>
                        <p>Impress clients and employees with high-quality personalized gifts that reflect your brand's value.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💰</div>
                        <h3>Bulk Pricing</h3>
                        <p>Get exclusive discounts on bulk orders. The more you print, the more you save.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Priority Delivery</h3>
                        <p>Fast-track production and delivery options to meet your tight business deadlines.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎨</div>
                        <h3>Design Support</h3>
                        <p>Access to professional design assistance to ensure your brand guidelines are met perfectly.</p>
                    </div>
                </div>
            </div>

            {/* Inquiry Form */}
            <div className="inquiry-form-section">
                <div className="container">
                    <div className="inquiry-form-container">
                        <h2>Request a Quote</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Company Name</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contact Person</label>
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Requirement Type</label>
                                    <select
                                        name="requirement"
                                        value={formData.requirement}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Requirement</option>
                                        <option value="Employee Welcome Kits">Employee Welcome Kits</option>
                                        <option value="Corporate Events">Corporate Events</option>
                                        <option value="Client Gifting">Client Gifting</option>
                                        <option value="Office Stationery">Office Stationery</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Estimated Quantity & Details</label>
                                    <textarea
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Tell us about your requirements..."
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <button type="submit" className="submit-btn" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Inquiry'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessSolutions;
