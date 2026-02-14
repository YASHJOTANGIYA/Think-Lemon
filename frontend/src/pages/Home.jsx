import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productsAPI, categoriesAPI } from '../services/api';
import TrustedClients from '../components/TrustedClients';
import HeroCarousel from '../components/HeroCarousel';
import './Home.css';

// Import images for the designer grid
import pouchImage from '../assets/pouch_standup_design.png';
import digitalServicesImage from '../assets/business_printing_hero.png';
import businessCardImage from '../assets/standard_business_card.png';
import invitationImage from '../assets/corporate_gifting_hero.png'; // Using as proxy for invitations

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes] = await Promise.all([
                productsAPI.getAll({ featured: true, limit: 8 }),
                categoriesAPI.getAll(),
            ]);
            setFeaturedProducts(productsRes.data.data);
            setCategories(categoriesRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="home">
            <HeroCarousel />

            {/* Bento Grid Section */}
            <section className="bento-grid-section">
                <div className="container">
                    <div className="section-header-left">
                        <h2><strong>CURATED</strong> <span>COLLECTIONS</span></h2>
                        <p>Design that speaks for itself.</p>
                    </div>
                    <div className="bento-grid">
                        {/* Pouches - Large Wide Item */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="bento-card-wrapper bento-wide"
                        >
                            <Link to="/categories/pouches" className="bento-card" data-bg="blue">
                                <div className="bento-content">
                                    <div className="category-title">Pouches</div>
                                    <div className="category-subtitle">Premium Packaging Solutions</div>
                                </div>
                                <div className="category-image">
                                    <img src={pouchImage} alt="Pouches" />
                                </div>
                                <div className="category-arrow">
                                    <span className="arrow-icon">↘</span>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Digital Services - Tall Item */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bento-card-wrapper bento-tall"
                        >
                            <Link to="/services" className="bento-card" data-bg="purple">
                                <div className="bento-content">
                                    <div className="category-title">Digital Services</div>
                                    <div className="category-subtitle">Web & Brand</div>
                                </div>
                                <div className="category-image">
                                    <img src={digitalServicesImage} alt="Digital Services" />
                                </div>
                                <div className="category-arrow">
                                    <span className="arrow-icon">↘</span>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Business Cards - Standard Item */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bento-card-wrapper"
                        >
                            <Link to="/categories/business-cards" className="bento-card" data-bg="orange">
                                <div className="bento-content">
                                    <div className="category-title">Business Cards</div>
                                </div>
                                <div className="category-image">
                                    <img src={businessCardImage} alt="Business Cards" />
                                </div>
                                <div className="category-arrow">
                                    <span className="arrow-icon">↘</span>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Invitation Cards - Standard Item */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bento-card-wrapper"
                        >
                            <Link to="/categories/stationery" className="bento-card" data-bg="pink">
                                <div className="bento-content">
                                    <div className="category-title">Invitation Cards</div>
                                </div>
                                <div className="category-image">
                                    <img src={invitationImage} alt="Invitation Cards" />
                                </div>
                                <div className="category-arrow">
                                    <span className="arrow-icon">↘</span>
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Service Highlight Section */}
            <section className="service-highlight-wrapper">
                <div className="container">
                    <div className="service-highlight-card">
                        <div className="service-highlight-content">
                            <h2>DIGITAL<br />SERVICES</h2>
                            <p>Transforming your online presence</p>
                            <Link to="/services" className="btn-discover">
                                Discover More
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW IN Section (Replacing Featured Products) */}
            <section className="new-in-section">
                <div className="container">
                    <div className="new-in-header">
                        <h2>NEW IN</h2>
                        <Link to="/products" className="view-all-arrow">↘</Link>
                    </div>
                    <div className="new-in-grid">
                        <Link to="/services/website-making" className="new-in-card">
                            <div className="new-in-image-wrapper">
                                <span className="new-badge">NEW</span>
                                <img src={digitalServicesImage} alt="Website Making" />
                            </div>
                            <div className="new-in-info">
                                <h3>WEBSITE MAKING</h3>
                                <span className="price">From ₹15,000</span>
                            </div>
                        </Link>

                        <Link to="/services/whatsapp-marketing" className="new-in-card">
                            <div className="new-in-image-wrapper">
                                <span className="new-badge">NEW</span>
                                <img src={digitalServicesImage} alt="Whatsapp Marketing" />
                            </div>
                            <div className="new-in-info">
                                <h3>WHATSAPP MARKETING</h3>
                                <span className="price">From ₹2,000</span>
                            </div>
                        </Link>

                        <Link to="/services/brand-promotion" className="new-in-card">
                            <div className="new-in-image-wrapper">
                                <span className="new-badge">NEW</span>
                                <img src={digitalServicesImage} alt="Brand Promotion" />
                            </div>
                            <div className="new-in-info">
                                <h3>BRAND PROMOTION</h3>
                                <span className="price">From ₹5,000</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section >

            {/* THE LEMON STUDIO (Tera World Style) */}
            <section className="lemon-studio-section">
                <div className="container">
                    <div className="lemon-studio-layout">
                        <div className="lemon-studio-text">
                            <h2>THE LEMON<br />STUDIO</h2>
                            <p>
                                This is the space where creativity meets precision.
                                We bridge the gap between digital innovation and tactile craftsmanship.
                                From pixel-perfect websites to premium printed assets,
                                we define the visual language of modern brands.
                            </p>
                        </div>
                        <div className="lemon-studio-images">
                            <div className="studio-img-small">
                                <img src={pouchImage} alt="Design process" />
                            </div>
                            <div className="studio-img-large">
                                <img src={businessCardImage} alt="Finished product" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>





            <TrustedClients />
        </div >
    );
};

export default Home;
