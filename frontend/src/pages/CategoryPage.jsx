import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import { TEA_POUCH_SLUGS, teaPouchPricing, getPouchPricing } from '../utils/priceUtils';
import './CategoryPage.css';

// Import Hero Images
import businessCardsHeroBg from '../assets/business_cards_hero_bg.png';
import businessPrintingHero from '../assets/business_printing_hero.png';
import corporateGiftingHero from '../assets/corporate_gifting_hero.png';
import pouchesDiagram from '../assets/pouches_diagram.png';
import pouchStandupDesign from '../assets/pouch_standup_design.png';
import pouchFlatDesign from '../assets/pouch_flat_design.png';
import pouchKraftDesign from '../assets/pouch_kraft_design.png';
import pouchSpoutDesign from '../assets/pouch_spout_design.png';

// Import Business Card Images
import standardBusinessCard from '../assets/standard_business_card.png';
import raisedFoilBusinessCard from '../assets/raised_foil_business_card.png';
import squareBusinessCard from '../assets/square_business_card.png';
import nonTearableBusinessCard from '../assets/non_tearable_business_card.png';

const CategoryPage = () => {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configuration for specific categories
    const getCategoryConfig = (slug) => {
        switch (slug) {
            case 'business-cards':
                return {
                    heroImage: businessCardsHeroBg,
                    title: "Business Cards",
                    subtitle: "Professional business cards that make a lasting impression.",
                };
            case 'business-printing':
            case 'marketing-materials':
                return {
                    heroImage: businessPrintingHero,
                    title: "Marketing Materials",
                    subtitle: "Promote your business with high-quality flyers, brochures, and more.",
                    buttonText: "Explore Marketing",
                    buttonLink: "#products"
                };
            case 'corporate-gifting':
            case 'gifts':
                return {
                    heroImage: corporateGiftingHero,
                    title: "Corporate Gifting",
                    subtitle: "Personalized gifts for your clients and employees.",
                    buttonText: "View Gifts",
                    buttonLink: "#products"
                };
            case 'pouches':
                return {
                    heroImage: null,
                    title: "TYPES OF POUCHES",
                    subtitle: "Premium packaging solutions for your brand.",
                    buttonText: "Explore Pouches",
                    buttonLink: "#products"
                };
            case 'agarbatti-pouches':
                return {
                    heroImage: null,
                    title: "Agarbatti Pouches",
                    subtitle: "Select the perfect size for your incense sticks.",
                };
            default:
                if (TEA_POUCH_SLUGS.includes(slug)) {
                    return {
                        heroImage: null,
                        title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        subtitle: "Select the perfect size for your product.",
                    };
                }
                return {
                    heroImage: null, // Fallback to CSS gradient
                    title: category?.name || 'Category',
                    subtitle: category?.description || `Explore our wide range of ${category?.name || 'products'}.`,
                    buttonText: "View Products",
                    buttonLink: "#products"
                };
        }
    };

    const config = getCategoryConfig(slug);

    // Data for Business Cards specific sections
    const businessCardTypes = [
        { name: 'Standard Business Cards', price: '₹2.15 each for 100 pieces', image: standardBusinessCard, link: '/products/standard-business-cards' },
        { name: 'Square Business Cards', price: '₹2.36 each for 100 pieces', image: squareBusinessCard, link: '/products?category=business-cards&tag=square' },
        { name: 'Raised Foil Business Cards', price: '₹11.15 each for 100 pieces', image: raisedFoilBusinessCard, link: '/products?category=business-cards&tag=raised-foil' },
        { name: 'Eco-Friendly Business Cards', price: '₹5.07 each for 100 pieces', image: standardBusinessCard, link: '/products?category=business-cards&tag=eco-friendly' },
        { name: 'Non Tearable Business Cards', price: '₹5.64 each for 100 pieces', image: nonTearableBusinessCard, link: '/products?category=business-cards&tag=non-tearable' },
        { name: 'Rounded Corner Cards', price: '₹3.67 each for 100 pieces', image: standardBusinessCard, link: '/products?category=business-cards&tag=rounded' },
        { name: 'Translucent Business Cards', price: '₹4.99 each for 100 pieces', image: standardBusinessCard, link: '/products?category=business-cards&tag=translucent' },
        { name: 'Mini Business Cards', price: '₹1.97 each for 100 pieces', image: standardBusinessCard, link: '/products?category=business-cards&tag=mini' },
    ];

    const pouchTypes = [
        { name: 'Agarbatti Pouches', image: pouchStandupDesign, link: '/categories/agarbatti-pouches' },
        { name: 'Tea Pouches', image: pouchStandupDesign, link: '/categories/tea-pouches' },
        { name: 'Chocolate Pouches', image: pouchKraftDesign, link: '/categories/chocolate-pouches' },
        { name: 'Coffee Pouches', image: pouchStandupDesign, link: '/categories/coffee-pouches' },
        { name: 'Dates Pouches', image: pouchFlatDesign, link: '/categories/dates-pouches' },
        { name: 'Spices Pouches', image: pouchFlatDesign, link: '/categories/spices-pouches' },
        { name: 'Dry Fruits Pouches', image: pouchFlatDesign, link: '/categories/dry-fruits-pouches' },
        { name: 'Energy Bar', image: pouchSpoutDesign, link: '/categories/energy-bar' },
        { name: 'Cookie Pouches', image: pouchKraftDesign, link: '/categories/cookie-pouches' },
        { name: 'Bakery Pouches', image: pouchKraftDesign, link: '/categories/bakery-pouches' },
        { name: 'Grains Pouches', image: pouchKraftDesign, link: '/categories/grains-pouches' },
        { name: 'Namkeen Pouches', image: pouchKraftDesign, link: '/categories/namkeen-pouches' },
        { name: 'Chips Pouches', image: pouchStandupDesign, link: '/categories/chips-pouches' },
        { name: 'Flour Pouches', image: pouchStandupDesign, link: '/categories/flour-pouches' },
        { name: 'Pet Food Pouches', image: pouchStandupDesign, link: '/categories/pet-food-pouches' },
        { name: 'Seed Pouches', image: pouchStandupDesign, link: '/categories/seed-pouches' },
        { name: 'Skincare Pouches', image: pouchStandupDesign, link: '/categories/skincare-cosmetics-pouches' },
    ];

    const agarbattiSizes = [
        { size: '25gm', dimensions: '2.5" x 11"', image: pouchStandupDesign, link: '/products/agarbatti-pouch-25g' },
        { size: '75gm', dimensions: '3.5" x 11"', image: pouchStandupDesign, link: '/products/agarbatti-pouch-75g' },
        { size: '150gm', dimensions: '4.25" x 11"', image: pouchStandupDesign, link: '/products/agarbatti-pouch-150g' },
        { size: '200gm', dimensions: '5.5" x 11"', image: pouchStandupDesign, link: '/products/agarbatti-pouch-200g' },
        { size: '350gm', dimensions: '8.5" x 11"', image: pouchStandupDesign, link: '/products/agarbatti-pouch-350g' },
    ];

    const industries = [
        { name: 'Real Estate', icon: '🏠', link: '/products?category=business-cards&industry=real-estate' },
        { name: 'Healthcare', icon: '⚕️', link: '/products?category=business-cards&industry=healthcare' },
        { name: 'Legal', icon: '⚖️', link: '/products?category=business-cards&industry=legal' },
        { name: 'Education', icon: '🎓', link: '/products?category=business-cards&industry=education' },
        { name: 'Fashion', icon: '👗', link: '/products?category=business-cards&industry=fashion' },
        { name: 'Technology', icon: '💻', link: '/products?category=business-cards&industry=technology' },
    ];

    const PouchInfoSection = () => (
        <>
            {/* Why Choose Us */}
            <section className="category-section feature-section-light" style={{ marginTop: '4rem' }}>
                <div className="container">
                    <h2 className="section-title text-center">Why Choose Our Pouches?</h2>
                    <div className="features-grid-3">
                        <div className="feature-card-simple">
                            <div className="feature-icon-circle">🛡️</div>
                            <h3>Superior Protection</h3>
                            <p>Multi-layer barrier films ensure your product stays fresh and fragrant for longer.</p>
                        </div>
                        <div className="feature-card-simple">
                            <div className="feature-icon-circle">🎨</div>
                            <h3>Premium Printing</h3>
                            <p>High-definition rotogravure printing makes your brand stand out on the shelf.</p>
                        </div>
                        <div className="feature-card-simple">
                            <div className="feature-icon-circle">✨</div>
                            <h3>Custom Finishes</h3>
                            <p>Choose from Gloss, Matte, or Spot UV finishes to match your brand identity.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Specifications */}
            <section className="category-section">
                <div className="container">
                    <div className="specs-wrapper">
                        <div className="specs-content">
                            <h2 className="section-title" style={{ textAlign: 'left' }}>Technical Specifications</h2>
                            <ul className="specs-list-styled">
                                <li>
                                    <span className="spec-key">Material Structure</span>
                                    <span className="spec-val">PET / MET PET / Poly (3 Layer)</span>
                                </li>
                                <li>
                                    <span className="spec-key">Thickness</span>
                                    <span className="spec-val">100 to 140 Microns (Customizable)</span>
                                </li>
                                <li>
                                    <span className="spec-key">Printing Technique</span>
                                    <span className="spec-val">Rotogravure / Digital</span>
                                </li>
                                <li>
                                    <span className="spec-key">Closure Type</span>
                                    <span className="spec-val">Press-to-Close Zipper / Heat Seal</span>
                                </li>
                                <li>
                                    <span className="spec-key">Food Grade</span>
                                    <span className="spec-val">Yes, 100% Food Grade Certified</span>
                                </li>
                                <li>
                                    <span className="spec-key">Origin</span>
                                    <span className="spec-val">Made in India</span>
                                </li>
                            </ul>
                        </div>
                        <div className="specs-image-box">
                            <img src={pouchStandupDesign} alt="Pouch Specs" />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="category-section bg-light-gray">
                <div className="container">
                    <h2 className="section-title text-center">Frequently Asked Questions</h2>
                    <div className="faq-grid-2">
                        <div className="faq-card">
                            <h4>What is the minimum order quantity (MOQ)?</h4>
                            <p>Our MOQ starts from just 1000 pouches for digital printing and varies for rotogravure.</p>
                        </div>
                        <div className="faq-card">
                            <h4>Do you provide design services?</h4>
                            <p>Yes! We have a dedicated team of designers to help bring your vision to life.</p>
                        </div>
                        <div className="faq-card">
                            <h4>What is the lead time?</h4>
                            <p>Standard lead time is 15-20 days after design approval.</p>
                        </div>
                        <div className="faq-card">
                            <h4>Can I get a sample?</h4>
                            <p>Yes, we offer sample kits so you can check the quality before ordering.</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch category details
                try {
                    const categoryRes = await categoriesAPI.getBySlug(slug);
                    if (categoryRes.data.success) {
                        setCategory(categoryRes.data.data);
                    }
                } catch (err) {
                    console.error("Error fetching category:", err);
                    setCategory({ name: slug.replace(/-/g, ' '), slug: slug });
                }

                // Fetch products for this category
                const productsRes = await productsAPI.getAll({ category: slug, sort: 'popular' });
                if (productsRes.data.success) {
                    setProducts(productsRes.data.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="category-page">
            {/* Hero Section */}
            {slug === 'pouches' ? (
                <div className="pouches-hero-container">
                    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="pouches-hero-content" style={{ flex: 1, zIndex: 2 }}>
                            <h1>TYPES OF<br />POUCHES</h1>
                            <div className="pouches-hero-accent-line"></div>
                            <p className="pouches-hero-subtitle">
                                Premium, food-grade packaging solutions designed to make your product stand out.
                                Explore our wide range of custom pouches.
                            </p>
                        </div>
                        <div className="hero-image" style={{ flex: 1, position: 'relative', height: '500px' }}>
                            {/* Composition of 3 pouches */}
                            <img
                                src={pouchFlatDesign}
                                alt="Flat Pouch"
                                style={{
                                    position: 'absolute',
                                    bottom: '20px',
                                    left: '0',
                                    height: '75%',
                                    zIndex: 5,
                                    transform: 'rotate(-10deg)'
                                }}
                            />
                            <img
                                src={pouchStandupDesign}
                                alt="Stand Up Pouch"
                                style={{
                                    position: 'absolute',
                                    top: '0',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    height: '95%',
                                    zIndex: 10
                                }}
                            />
                            <img
                                src={pouchKraftDesign}
                                alt="Kraft Pouch"
                                style={{
                                    position: 'absolute',
                                    bottom: '20px',
                                    right: '0',
                                    height: '75%',
                                    zIndex: 5,
                                    transform: 'rotate(10deg)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : getPouchPricing(slug) ? (
                null
            ) : (
                <div
                    className="category-hero"
                    style={config.heroImage ? {
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${config.heroImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    } : {}}
                >
                    <div className="container">
                        <div className="hero-content">
                            <h1 className="hero-title">{config.title}</h1>
                            <p className="hero-subtitle">{config.subtitle}</p>
                            {config.buttonText && (
                                <a href={config.buttonLink} className="hero-btn">
                                    {config.buttonText}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Specific Layout for Business Cards */}
            {slug === 'business-cards' ? (
                <div className="container">
                    {/* Explore Business Cards (Grid from Screenshot) */}
                    <section className="category-section" id="products">
                        <h2 className="section-title">Explore Business Cards</h2>
                        <div className="products-grid-4">
                            {businessCardTypes.map((card, index) => (
                                <Link to={card.link} key={index} className="product-card-minimal">
                                    <div className="pcm-image">
                                        <img src={card.image} alt={card.name} />
                                    </div>
                                    <div className="pcm-content text-center">
                                        <h3 className="pcm-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{card.name}</h3>
                                        <div className="pcm-price" style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
                                            {card.price}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Shop By Industry */}

                </div>
            ) : slug === 'pouches' ? (
                <div className="container-full-width">
                    {/* Explore Custom Pouches - NEW ATTRACTIVE LAYOUT */}
                    <section className="category-section" id="products">
                        <h2 className="section-title" style={{ marginBottom: '3rem' }}>Explore Custom Pouches</h2>
                        <div className="pouches-grid">
                            {pouchTypes.map((pouch, index) => (
                                <Link to={pouch.link} key={index} className="pouch-card">
                                    <div className="pouch-image-wrapper">
                                        <img src={pouch.image} alt={pouch.name} />
                                    </div>
                                    <div className="pouch-content">
                                        <h3 className="pouch-title">{pouch.name}</h3>
                                        <div className="pouch-action">Explore &rarr;</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                    <PouchInfoSection />
                </div>
            ) : slug === 'agarbatti-pouches' ? (
                <div className="container-full-width">
                    {/* Full Width Layout for Agarbatti Pouch Sizes */}
                    <section className="category-section" id="sizes">
                        <h2 className="section-title text-center" style={{ fontSize: '2rem', marginBottom: '2rem', color: '#333' }}>Select Size</h2>
                        <div className="pouches-grid">
                            {agarbattiSizes.map((item, index) => (
                                <Link to={item.link} key={index} className="product-card-minimal" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="pcm-image" style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={item.image} alt={item.size} style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain' }} />
                                    </div>
                                    <div className="pcm-content text-center">
                                        <h3 className="pcm-title" style={{ fontSize: '1.2rem', fontWeight: '600' }}>{item.size}</h3>
                                        <p style={{ color: '#666' }}>{item.dimensions}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                    <PouchInfoSection />
                </div>
            ) : getPouchPricing(slug) ? (
                <div className="container-full-width">
                    {/* Full Width Layout for Generic Pouch Sizes */}
                    <section className="category-section" id="sizes">
                        <h2 className="section-title text-center" style={{ fontSize: '2rem', marginBottom: '2rem', color: '#333' }}>Select Size</h2>
                        <div className="pouches-grid">
                            {Object.entries(getPouchPricing(slug)).map(([key, val]) => {
                                let currentPouchImage = pouchStandupDesign;
                                if (['chocolate-pouches', 'cookie-pouches', 'bakery-pouches', 'grains-pouches', 'namkeen-pouches'].includes(slug)) {
                                    currentPouchImage = pouchKraftDesign;
                                } else if (['dates-pouches', 'spices-pouches', 'dry-fruits-pouches'].includes(slug)) {
                                    currentPouchImage = pouchFlatDesign;
                                } else if (['energy-bar'].includes(slug)) {
                                    currentPouchImage = pouchSpoutDesign;
                                }

                                return (
                                    <Link to={`/products/${slug}-${key}`} key={key} className="product-card-minimal" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="pcm-image" style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img src={currentPouchImage} alt={val.label} style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain' }} />
                                        </div>
                                        <div className="pcm-content text-center">
                                            <h3 className="pcm-title" style={{ fontSize: '1.2rem', fontWeight: '600' }}>{val.label}</h3>
                                            <p style={{ color: '#666' }}>{val.size}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                    <PouchInfoSection />
                </div>
            ) : (
                /* Generic Layout for other categories */
                <div className="container" id="products">
                    {products.length === 0 ? (
                        <div className="no-products">
                            <h2>No products found in this category.</h2>
                            <Link to="/products" className="btn btn-primary mt-3">View All Products</Link>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {products.map(product => (
                                <Link to={`/products/${product.slug}`} key={product._id} className="product-card">
                                    <div className="product-image">
                                        {product.images && product.images.length > 0 ? (
                                            <img src={getImageUrl(product.images[0])} alt={product.name} />
                                        ) : (
                                            <div className="product-placeholder">🖼️</div>
                                        )}
                                        {product.isNew && <span className="product-badge">New</span>}
                                    </div>
                                    <div className="product-info">
                                        <h3>{product.name}</h3>
                                        <p className="product-description">
                                            {product.description?.substring(0, 60)}...
                                        </p>
                                        <div className="product-footer">
                                            <div className="product-price">
                                                <span className="price">₹{product.price}</span>
                                                {product.comparePrice && (
                                                    <span className="compare-price">₹{product.comparePrice}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
