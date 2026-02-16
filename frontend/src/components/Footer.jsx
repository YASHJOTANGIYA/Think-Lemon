import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { FiMapPin, FiPhone, FiMail, FiClock, FiInstagram, FiFacebook, FiLinkedin, FiChrome } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="mega-footer">
            <div className="container">
                {/* Massive Brand Header */}
                <div className="footer-brand-header">
                    <h1 className="brand-name-large">PRINTLOK STUDIO</h1>
                </div>

                <div className="footer-main-grid">
                    {/* Left Column: Navigation */}
                    <div className="footer-nav-group">
                        <div className="nav-column">
                            <h3>Shop</h3>
                            <ul>
                                <li><Link to="/products">All Products</Link></li>
                                <li><Link to="/categories">Collections</Link></li>
                                <li><Link to="/products?category=corporate">Corporate</Link></li>
                                <li><Link to="/sample-kit">Sample Kit</Link></li>
                            </ul>
                        </div>
                        <div className="nav-column">
                            <h3>Studio</h3>
                            <ul>
                                <li><Link to="/services">Digital Services</Link></li>
                                <li><Link to="/about">Our Story</Link></li>
                                <li><Link to="/contact">Contact</Link></li>
                                <li><Link to="/design-tool">Design Tool</Link></li>
                            </ul>
                        </div>
                        <div className="nav-column">
                            <h3>Support</h3>
                            <ul>
                                <li><Link to="/track-order">Track Order</Link></li>
                                <li><Link to="/help">Help Center</Link></li>
                                <li><Link to="/shipping-policy">Shipping</Link></li>
                                <li><Link to="/returns">Returns</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Newsletter & Contact */}
                    <div className="footer-interactive">
                        <div className="newsletter-card">
                            <h3>Join the Studio</h3>
                            <p>Get exclusive access to new drops and design tips.</p>
                            <div className="newsletter-input-group">
                                <input type="email" placeholder="email@example.com" />
                                <button className="btn-arrow">→</button>
                            </div>
                        </div>
                        <div className="contact-mini">
                            <p><FiMail /> printlokstudio@gmail.com</p>
                            <p><FiPhone /> +91 73838 38785</p>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom-bar">
                    <div className="social-links-minimal">
                        <a href="https://instagram.com/thinklemonnn_" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
                        <a href="#">Facebook ↗</a>
                        <a href="https://www.linkedin.com/in/parth-jotangiya" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
                    </div>
                    <div className="copyright">
                        <p>&copy; {new Date().getFullYear()} PrintLok Studio. Crafted in India.</p>
                    </div>
                    <div className="legal-links">
                        <Link to="/privacy">Privacy</Link>
                        <Link to="/terms">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
