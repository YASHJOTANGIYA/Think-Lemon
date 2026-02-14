import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate, useParams } from 'react-router-dom';
import { productsAPI, categoriesAPI, wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Products.css';

const Products = () => {
    const [searchParams] = useSearchParams();
    const { slug: categorySlugParam } = useParams(); // Get slug from /categories/:slug

    // Prioritize param slug, then query slug
    const categorySlug = categorySlugParam || searchParams.get('category');
    const shapeQuery = searchParams.get('shape');
    const finishQuery = searchParams.get('finish');
    const industryQuery = searchParams.get('industry');
    const searchQuery = searchParams.get('search');
    const tagQuery = searchParams.get('tag');

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [pageTitle, setPageTitle] = useState('All Products');

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        updateTitle();
    }, [categorySlug, searchQuery, tagQuery, shapeQuery, finishQuery, industryQuery]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        }
    }, [isAuthenticated]);

    const updateTitle = () => {
        if (searchQuery) {
            setPageTitle(`Search Results for "${searchQuery}"`);
        } else if (tagQuery) {
            // Capitalize tag for display
            const formattedTag = tagQuery.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            setPageTitle(formattedTag);
        } else if (shapeQuery) {
            setPageTitle(`${shapeQuery.charAt(0).toUpperCase() + shapeQuery.slice(1)} Business Cards`);
        } else if (finishQuery) {
            setPageTitle(`${finishQuery.charAt(0).toUpperCase() + finishQuery.slice(1)} Business Cards`);
        } else if (industryQuery) {
            setPageTitle(`Business Cards for ${industryQuery.charAt(0).toUpperCase() + industryQuery.slice(1)}`);
        } else if (categorySlug) {
            // We'll update this with the actual category name after fetching categories if possible, 
            // or just format the slug for now
            const formattedCat = categorySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            setPageTitle(formattedCat);
        } else {
            setPageTitle('All Products');
        }
    };

    const fetchWishlist = async () => {
        try {
            const response = await wishlistAPI.get();
            if (response.data.success) {
                const ids = new Set(response.data.data.map(item => item._id));
                setWishlistIds(ids);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    const toggleWishlist = async (e, productId) => {
        e.preventDefault(); // Prevent navigation to product details
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            if (wishlistIds.has(productId)) {
                await wishlistAPI.remove(productId);
                setWishlistIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(productId);
                    return newSet;
                });
            } else {
                await wishlistAPI.add(productId);
                setWishlistIds(prev => new Set(prev).add(productId));
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
            alert('Failed to update wishlist');
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                search: searchQuery,
                tag: tagQuery,
                shape: shapeQuery,
                finish: finishQuery,
                industry: industryQuery
            };

            // If categorySlug is present, pass it. Backend handles ID or Slug.
            if (categorySlug) {
                params.category = categorySlug;
            }

            // Check if we are in "Category View" (no filters applied)
            const isCategoryView = !categorySlug && !searchQuery && !tagQuery && !shapeQuery && !finishQuery && !industryQuery;

            let productsData = [];
            let categoriesData = [];

            if (isCategoryView) {
                // Only fetch categories, save bandwidth
                const categoriesRes = await categoriesAPI.getAll();
                categoriesData = categoriesRes.data.data;
            } else {
                // Fetch both
                const [productsRes, categoriesRes] = await Promise.all([
                    productsAPI.getAll(params),
                    categoriesAPI.getAll()
                ]);
                productsData = productsRes.data.data;
                categoriesData = categoriesRes.data.data;
            }

            setProducts(productsData);
            setCategories(categoriesData);

            // If we have a category slug, try to find the name from the categories list for a better title
            if (categorySlug && !searchQuery && !tagQuery) {
                const currentCat = categoriesRes.data.data.find(c => c.slug === categorySlug || c._id === categorySlug);
                if (currentCat) {
                    setPageTitle(currentCat.name);
                }
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load products. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const isCategoryView = !categorySlug && !searchQuery && !tagQuery && !shapeQuery && !finishQuery && !industryQuery;
    const isBusinessCardCategory = categorySlug === 'business-cards' || categorySlug === 'business-card';

    return (
        <div className="products-page">
            <div className="container">
                <div className="products-header">
                    <h1>{pageTitle}</h1>

                    {/* Category Filter - Show only when NOT in main category view AND NOT in Business Card view */}
                    {!isCategoryView && !isBusinessCardCategory && (
                        <div className="category-filters">
                            <Link
                                to="/products"
                                className={`filter-chip ${!categorySlug && !tagQuery ? 'active' : ''}`}
                            >
                                All
                            </Link>
                            {categories.map(cat => (
                                <Link
                                    key={cat._id}
                                    to={`/categories/${cat.slug}`}
                                    className={`filter-chip ${categorySlug === cat.slug || categorySlug === cat._id ? 'active' : ''}`}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                {isCategoryView ? (
                    /* 1. Category Grid View (All Categories) */
                    <div className="all-categories-wrapper">
                        <div className="category-grid-large">
                            {categories.map((cat) => (
                                <Link key={cat._id} to={`/categories/${cat.slug}`} className="category-card-large">
                                    <h3>{cat.name}</h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : isBusinessCardCategory ? (
                    /* 2. Business Card "Sub-Category" Grid View */
                    <div className="all-categories-wrapper">
                        {loading ? (
                            <div className="loading-container"><div className="spinner"></div></div>
                        ) : (
                            <div className="category-grid-large">
                                {products.map((product) => (
                                    <Link key={product._id} to={`/products/${product.slug}`} className="category-card-large">
                                        <h3>{product.name}</h3>
                                        <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                                            {// Truncate description for clean card look
                                                product.description && product.description.length > 50
                                                    ? product.description.substring(0, 50) + '...'
                                                    : product.description}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* 3. Standard Products Grid View */
                    <>
                        {loading ? (
                            <div className="loading-container"><div className="spinner"></div></div>
                        ) : error ? (
                            <div className="error-container text-center py-5">
                                <h3>⚠️ Oops!</h3>
                                <p>{error}</p>
                                <button onClick={fetchData} className="btn btn-primary mt-3">Retry</button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="no-results">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                                <h3>No products found</h3>
                                <p>Try adjusting your search or filter to find what you're looking for.</p>
                                <Link to="/products" className="btn btn-primary mt-3">View All Products</Link>
                            </div>
                        ) : (
                            <div className="products-grid">
                                {products.map((product) => (
                                    <Link key={product._id} to={`/products/${product.slug}`} className="product-card">
                                        <div className="product-image">
                                            {product.images?.[0] ? (
                                                <img src={product.images[0]} alt={product.name} />
                                            ) : (
                                                <div className="product-placeholder"><span>📄</span></div>
                                            )}
                                            {product.comparePrice && <span className="product-badge">Sale</span>}
                                            <button
                                                className={`wishlist-btn ${wishlistIds.has(product._id) ? 'active' : ''}`}
                                                onClick={(e) => toggleWishlist(e, product._id)}
                                                title={wishlistIds.has(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                            >
                                                {wishlistIds.has(product._id) ? '❤️' : '🤍'}
                                            </button>
                                        </div>
                                        <div className="product-info">
                                            <h3>{product.name}</h3>
                                            <p className="product-description">{product.description}</p>
                                            <div className="product-footer">
                                                <div className="product-price">
                                                    <span className="price">₹{product.price}</span>
                                                    {product.comparePrice && <span className="compare-price">₹{product.comparePrice}</span>}
                                                </div>
                                                <span className="btn btn-sm btn-primary">Order Now</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Products;
