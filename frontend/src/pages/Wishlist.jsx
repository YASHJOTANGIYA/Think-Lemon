import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';
import './Wishlist.css';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const response = await wishlistAPI.get();
            if (response.data.success) {
                setWishlistItems(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            await wishlistAPI.remove(productId);
            setWishlistItems(prev => prev.filter(item => item._id !== productId));
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const handleMoveToCart = async (product) => {
        addToCart(product, 1);
        await handleRemove(product._id);
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="wishlist-container">
            <div className="container">
                <div className="wishlist-header">
                    <h1>My Wishlist</h1>
                    <p>{wishlistItems.length} items saved for later</p>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="empty-wishlist fade-in">
                        <div className="icon">❤️</div>
                        <h2>Your wishlist is empty</h2>
                        <p>Save items you love to buy later.</p>
                        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="wishlist-grid fade-in">
                        {wishlistItems.map(product => (
                            <div key={product._id} className="wishlist-card">
                                <div className="wishlist-image">
                                    <button
                                        className="btn-remove-wishlist"
                                        onClick={() => handleRemove(product._id)}
                                        title="Remove from wishlist"
                                    >
                                        ×
                                    </button>
                                    {product.images?.[0] ? (
                                        <img src={getImageUrl(product.images[0])} alt={product.name} />
                                    ) : (
                                        <div className="placeholder">📄</div>
                                    )}
                                </div>
                                <div className="wishlist-info">
                                    <Link to={`/products/${product.slug}`}>
                                        <h3>{product.name}</h3>
                                    </Link>
                                    <div className="wishlist-price">₹{product.price}</div>
                                    <div className="wishlist-actions">
                                        <button
                                            className="btn btn-primary btn-sm flex-1"
                                            onClick={() => handleMoveToCart(product)}
                                        >
                                            Move to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
