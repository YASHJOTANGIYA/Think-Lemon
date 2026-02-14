import React, { useState } from 'react';
import './Contact.css'; // Importing the attractive new styles
import printingHeroImage from '../assets/business_printing_hero.png'; // Importing image

const Contact = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Thank you, ${formData.firstName}! We'll be in touch shortly.`);
        // Reset form
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            message: ''
        });
    };

    return (
        <div className="contact-page-container">
            <div className="contact-content-wrapper">
                {/* Left Side: Image */}
                <div className="contact-image-container">
                    <img src={printingHeroImage} alt="Printing Services" />
                </div>

                {/* Right Side: Form */}
                <div className="contact-form-wrapper">
                    <div className="contact-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                        <h1>GET IN TOUCH</h1>
                        <p style={{ margin: 0 }}>Ready to start your project?</p>
                    </div>

                    <form onSubmit={handleSubmit} className="contact-form">
                        {/* Row 1: Names */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>FIRST NAME</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    required
                                    className="modern-input"
                                    placeholder="Jane"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>LAST NAME</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    required
                                    className="modern-input"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Row 2: Contact Info */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>EMAIL *</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="modern-input"
                                    placeholder="jane@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>PHONE</label>
                                <div className="phone-wrapper">
                                    <span className="phone-icon">📱</span>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="modern-input"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Message */}
                        <div className="form-group full-width">
                            <label>MESSAGE *</label>
                            <textarea
                                name="message"
                                required
                                className="modern-input modern-textarea"
                                rows="5"
                                placeholder="Tell us about your project..."
                                value={formData.message}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="btn-submit-lemon">
                            <span>Submit</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
