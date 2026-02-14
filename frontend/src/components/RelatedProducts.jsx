import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import './RelatedProducts.css';

const RelatedProducts = ({ currentProduct }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentProduct) {
            fetchRelatedProducts();
        }
    }, [currentProduct]);

    const fetchRelatedProducts = async () => {
        try {
            // Fetch products. Ideally, filter by category if available.
            // Assuming currentProduct has a category field which is an ID or object with _id
            const categoryId = typeof currentProduct.category === 'object' ? currentProduct.category?._id : currentProduct.category;

            const params = {
                limit: 5, // Fetch 5 to ensure we have 4 after filtering current
                category: categoryId
            };

            const response = await productsAPI.getAll(params);

            // Filter out the current product and limit to 4
            const related = response.data.data
                .filter(p => p._id !== currentProduct._id)
                .slice(0, 4);

            setProducts(related);
        } catch (error) {
            console.error('Error fetching related products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || products.length === 0) return null;

    return (
        <div className="related-products-section">
            <div className="container">
                <h2 className="related-title">You May Also Like</h2>
                <div className="related-grid">
                    {products.map(product => (
                        <Link key={product._id} to={`/products/${product.slug}`} className="related-card">
                            <div className="related-image">
                                <img
                                    src={getImageUrl(product.images?.[0])}
                                    alt={product.name}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
                                />
                                {product.comparePrice && (
                                    <span className="related-badge">Sale</span>
                                )}
                            </div>
                            <div className="related-info">
                                <h3>{product.name}</h3>
                                <div className="related-price">
                                    <span className="current">₹{product.price}</span>
                                    {product.comparePrice && (
                                        <span className="original">₹{product.comparePrice}</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RelatedProducts;
