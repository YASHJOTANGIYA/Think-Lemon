import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import './SampleKit.css';

const SampleKit = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await productsAPI.getBySlug('sample-kit');
                setProduct(response.data.data);
            } catch (error) {
                console.error('Error fetching sample kit:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, []);

    const handleOrderNow = async () => {
        if (product) {
            const result = await addToCart(product._id, 1, {}, []);
            if (result.success) {
                navigate('/cart');
            } else {
                alert('Failed to add to cart');
            }
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
    if (!product) return <div className="container text-center py-5"><h2>Sample Kit Currently Unavailable</h2></div>;

    return (
        <div className="sample-kit-page">
            <div className="sample-hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>Experience Quality Before You Buy</h1>
                        <p>Get our comprehensive sample kit containing premium business cards, stickers, flyers, and more. See and feel the difference.</p>
                        <div className="hero-price">
                            <span className="price">₹{product.price}</span>
                            <span className="original">₹{product.comparePrice}</span>
                            <span className="tag">Fully Refundable*</span>
                        </div>
                        <button className="cta-btn" onClick={handleOrderNow}>Order Sample Kit</button>
                    </div>
                    <div className="hero-image">
                        <img src={product.images[0]} alt="Sample Kit" />
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="whats-inside">
                    <h2>What's Inside?</h2>
                    <div className="items-grid">
                        <div className="item-card">
                            <div className="icon">📇</div>
                            <h3>Business Cards</h3>
                            <p>Matte, Glossy, and Textured finishes to compare.</p>
                        </div>
                        <div className="item-card">
                            <div className="icon">🏷️</div>
                            <h3>Stickers & Labels</h3>
                            <p>Vinyl and paper stickers in various shapes.</p>
                        </div>
                        <div className="item-card">
                            <div className="icon">📄</div>
                            <h3>Flyers & Brochures</h3>
                            <p>Different paper weights and folding styles.</p>
                        </div>
                        <div className="item-card">
                            <div className="icon">🎁</div>
                            <h3>Packaging Samples</h3>
                            <p>Small box samples to check material quality.</p>
                        </div>
                    </div>
                </div>

                <div className="guarantee-section">
                    <div className="guarantee-card">
                        <h3>*100% Money Back Guarantee</h3>
                        <p>We are so confident in our quality that we'll refund the entire cost of this sample kit as a coupon code for your next order of ₹1000 or more.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SampleKit;
