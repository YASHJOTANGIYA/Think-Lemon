import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI, pincodesAPI, wishlistAPI, uploadAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import Reviews from '../components/Reviews';
import WhatsAppButton from '../components/WhatsAppButton';
import './ProductDetails.css';
import RelatedProducts from '../components/RelatedProducts';
import standardBusinessCard from '../assets/standard_business_card.png';
import pouchStandupDesign from '../assets/pouch_standup_design.png';
import pouchFlatDesign from '../assets/pouch_flat_design.png';
import pouchKraftDesign from '../assets/pouch_kraft_design.png';
import pouchSpoutDesign from '../assets/pouch_spout_design.png';
import { agarbattiPricing, teaPouchPricing, TEA_POUCH_SLUGS, getPouchPricing } from '../utils/priceUtils';

const ProductDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart, toggleCart } = useCart();
    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [printingSides, setPrintingSides] = useState(['Front']);
    const [quantity, setQuantity] = useState(1);
    const [customization, setCustomization] = useState({});
    const [files, setFiles] = useState({});
    const [addingToCart, setAddingToCart] = useState(false);
    const [pincode, setPincode] = useState('');
    const [deliveryDate, setDeliveryDate] = useState(null);
    const [checkingDelivery, setCheckingDelivery] = useState(false);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [isInWishlist, setIsInWishlist] = useState(false);

    // Agarbatti & Tea Pouches State
    const [agarbattiWeight, setAgarbattiWeight] = useState('10-25g'); // Default for Agarbatti
    const [agarbattiFinish, setAgarbattiFinish] = useState('Gloss');
    const [selectedSku, setSelectedSku] = useState(1);
    const [hasDesign, setHasDesign] = useState(null);
    const [leadTime, setLeadTime] = useState('21 business days');



    useEffect(() => {
        const pricingConfig = getPouchPricing(slug);

        if (pricingConfig) {
            // Check if it's a size variant
            const sizeKeys = Object.keys(pricingConfig);
            for (const sizeKey of sizeKeys) {
                if (slug.endsWith(`-${sizeKey}`)) {
                    // It's a variant, weight is already set by fetchProduct or default
                    break;
                }
            }

            // Handle initial load or switch where current weight might not exist in new config
            let config = pricingConfig[agarbattiWeight];
            if (!config) {
                // Default to first option if current weight is invalid for this product
                const firstKey = Object.keys(pricingConfig)[0];
                setAgarbattiWeight(firstKey);
                config = pricingConfig[firstKey];
            }

            if (config) {
                const price = agarbattiFinish === 'Gloss' ? config.gloss : config.matt;
                setCurrentPrice(price);
                // Always set quantity to minQty when config changes (size/weight change)
                setQuantity(config.minQty);
            }
        }
    }, [agarbattiWeight, agarbattiFinish, slug]);

    useEffect(() => {
        if (product && !getPouchPricing(product.slug)) {
            let price = product.price;
            if (product.bulkPricing && product.bulkPricing.length > 0) {
                const bulkTier = product.bulkPricing.find(tier =>
                    quantity >= tier.minQty && (!tier.maxQty || quantity <= tier.maxQty)
                );
                if (bulkTier) {
                    price = bulkTier.price;
                }
            }
            setCurrentPrice(price);
        }
    }, [product, quantity]);

    useEffect(() => {
        let currentMinQty = 1000;
        const pricingConfig = getPouchPricing(slug);
        if (pricingConfig) {
            const config = pricingConfig[agarbattiWeight] || pricingConfig[Object.keys(pricingConfig)[0]];
            if (config) currentMinQty = config.minQty;
        }

        const maxDesigns = Math.max(1, Math.floor(currentMinQty / 1000));
        if (selectedSku > maxDesigns) {
            setSelectedSku(maxDesigns);
        }
    }, [quantity, slug, agarbattiWeight]);

    useEffect(() => {
        fetchProduct();
    }, [slug]);

    const fetchProduct = async () => {
        try {
            setLoading(true);

            let fetchSlug = slug;
            const pricingConfig = getPouchPricing(slug);

            if (pricingConfig) {
                if (slug.startsWith('agarbatti-pouch-')) {
                    fetchSlug = 'agarbatti-pouches';
                    // Pre-select weight based on slug
                    if (slug.includes('25g')) setAgarbattiWeight('10-25g');
                    else if (slug.includes('75g')) setAgarbattiWeight('30-75g');
                    else if (slug.includes('150g')) setAgarbattiWeight('100-150g');
                    else if (slug.includes('200g')) setAgarbattiWeight('150-200g');
                    else if (slug.includes('350g')) setAgarbattiWeight('200-350g');
                } else {
                    // Check for other pouch variants
                    const sizeKeys = Object.keys(pricingConfig);
                    for (const sizeKey of sizeKeys) {
                        if (slug.endsWith(`-${sizeKey}`)) {
                            const potentialBaseSlug = slug.substring(0, slug.length - sizeKey.length - 1);
                            // Verify if the base slug is a valid pouch slug
                            if (getPouchPricing(potentialBaseSlug)) {
                                fetchSlug = potentialBaseSlug;
                                setAgarbattiWeight(sizeKey);
                                break;
                            }
                        }
                    }
                }
            }

            const response = await productsAPI.getBySlug(fetchSlug);
            setProduct(response.data.data);

            // Initialize default customization options
            const initialCustomization = {};
            response.data.data.customizationOptions?.forEach(option => {
                if (option.type === 'select' && option.options.length > 0) {
                    initialCustomization[option.name] = option.options[0];
                }
            });
            setCustomization(initialCustomization);

            // Set initial quantity based on bulk pricing or default to 1
            // Skip for pouch products as they are handled by the pricing effect
            if (!getPouchPricing(response.data.data.slug)) {
                if (response.data.data.bulkPricing && response.data.data.bulkPricing.length > 0) {
                    // Find the lowest minQty
                    const minQty = Math.min(...response.data.data.bulkPricing.map(tier => tier.minQty));
                    setQuantity(minQty);
                } else {
                    setQuantity(1);
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            // Mock data removed to ensure real data is used
        } finally {
            setLoading(false);
        }
    };
    const handleCustomizationChange = (name, value) => {
        setCustomization(prev => ({ ...prev, [name]: value }));
    };

    const toggleSide = (side) => {
        if (side === 'Front') return; // Front is mandatory/default

        setPrintingSides(prev => {
            if (prev.includes(side)) {
                return prev.filter(s => s !== side);
            } else {
                return [...prev, side];
            }
        });
    };

    const handleFileChange = (name, fileOrFiles, index = -1) => {
        if (fileOrFiles) {
            // Handle FileList (multiple files) or single File
            const filesList = fileOrFiles instanceof FileList ? Array.from(fileOrFiles) : [fileOrFiles];

            if (index !== -1) {
                // Handle individual file upload for specific index
                setFiles(prev => {
                    const currentFiles = prev[name] ? [...prev[name]] : [];
                    // Ensure array is large enough
                    while (currentFiles.length <= index) currentFiles.push(null);
                    currentFiles[index] = filesList[0];
                    return { ...prev, [name]: currentFiles };
                });
                return;
            }

            // Validation for SKU 3
            if (selectedSku === 3) {
                alert('Uploading 3 designs is currently not supported. Please contact support or choose a different number of designs.');
                return;
            }

            // Validation for file count matching SKU
            if (filesList.length !== selectedSku) {
                alert(`Please upload exactly ${selectedSku} design file(s) for the selected number of designs.`);
                return;
            }

            // Validate file type
            const invalidFiles = filesList.filter(file => !file.name.toLowerCase().endsWith('.cdr'));
            if (invalidFiles.length > 0) {
                alert('Only .cdr files are allowed. Please upload CorelDRAW files.');
                return;
            }

            setFiles(prev => ({ ...prev, [name]: filesList }));
        }
    };



    const handleQuantityChange = (value) => {
        if (value >= 1 && value <= (product.stock || 10000)) {
            setQuantity(value);
        }
    };

    const checkDelivery = async () => {
        if (!pincode || pincode.length !== 6) {
            alert('Please enter a valid 6-digit pincode');
            return;
        }
        setCheckingDelivery(true);
        setDeliveryDate(null);

        try {
            const response = await pincodesAPI.check(pincode);
            const data = response.data.data;

            let daysToAdd = 0;

            // Check if Rajkot (City name or Pincode starting with 360)
            if (data.city.toLowerCase() === 'rajkot' || data.code.startsWith('360')) {
                daysToAdd = 4;
                setLeadTime('4 days');
            } else {
                // 21 business days (approx 29 calendar days) + 4 days shipping = 33 days
                daysToAdd = 33;
                setLeadTime('21 business days + 4 days shipping');
            }

            const date = new Date();
            date.setDate(date.getDate() + daysToAdd);
            setDeliveryDate(date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }));
        } catch (error) {
            alert(error.response?.data?.message || 'Delivery not available for this pincode');
            setDeliveryDate(null);
            setLeadTime('21 business days'); // Reset to default on error
        } finally {
            setCheckingDelivery(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setAddingToCart(true);

        try {
            // Validation for Pouch Products
            const pricingConfig = getPouchPricing(product.slug);

            if (pricingConfig) {
                if (hasDesign === null) {
                    alert('Please select applicable option: "Yes, I have a design" or "No, I need a design"');
                    setAddingToCart(false);
                    return;
                }

                if (hasDesign === true) {
                    const filesToUpload = files['design'];
                    const validFiles = filesToUpload ? filesToUpload.filter(f => f) : [];

                    if (validFiles.length !== selectedSku) {
                        alert(`Please upload exactly ${selectedSku} design file(s) before adding to cart.`);
                        setAddingToCart(false);
                        return;
                    }
                }
            }

            let uploadedFileUrls = [];

            // Handle file upload if files exist
            const filesToUpload = files['design'];
            if (filesToUpload && filesToUpload.length > 0) {
                // Filter out nulls/undefined from the array
                const validFiles = filesToUpload.filter(f => f);

                if (validFiles.length !== selectedSku) {
                    alert(`Please upload exactly ${selectedSku} design file(s) before adding to cart.`);
                    setAddingToCart(false);
                    return;
                }

                const formData = new FormData();
                validFiles.forEach(file => {
                    formData.append('files', file);
                });

                const uploadRes = await uploadAPI.upload(formData);
                if (uploadRes.data.success) {
                    uploadedFileUrls = uploadRes.data.data;
                } else {
                    throw new Error('File upload failed');
                }
            }

            const finalCustomization = { ...customization };
            if (product.slug === 'standard-business-cards' && printingSides && printingSides.length > 0) {
                finalCustomization['Printing Location'] = printingSides.join(', ');
            }

            if (pricingConfig) {
                const config = pricingConfig[agarbattiWeight];
                finalCustomization['Capacity'] = config.label;
                finalCustomization['Size'] = config.size;
                finalCustomization['Finish'] = agarbattiFinish;
            }

            const result = await addToCart(product._id, quantity, finalCustomization, uploadedFileUrls);

            if (result.success) {
                toggleCart(true);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Add to cart error:', error);

            let errorMessage = 'Unknown error';
            if (error.response) {
                // Server responded with a status code outside 2xx
                console.error('Server Error Response:', error.response.data);
                errorMessage = error.response.data?.message
                    || (typeof error.response.data === 'string' ? error.response.data : error.response.statusText)
                    || `Server Error (${error.response.status})`;
            } else if (error.request) {
                // Request made but no response received
                errorMessage = 'No response from server. Please check your internet connection.';
            } else {
                // Error setting up the request
                errorMessage = error.message;
            }

            alert(`Failed to add to cart: ${errorMessage}`);
        } finally {
            setAddingToCart(false);
        }
    };

    useEffect(() => {
        if (product && isAuthenticated) {
            const check = async () => {
                try {
                    const response = await wishlistAPI.check(product._id);
                    setIsInWishlist(response.data.isInWishlist);
                } catch (error) {
                    console.error('Error checking wishlist:', error);
                }
            };
            check();
        }
    }, [product, isAuthenticated]);

    const handleWishlist = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            if (isInWishlist) {
                await wishlistAPI.remove(product._id);
                setIsInWishlist(false);
                alert('Removed from wishlist');
            } else {
                await wishlistAPI.add(product._id);
                setIsInWishlist(true);
                alert('Added to wishlist');
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
            alert('Failed to update wishlist');
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
    if (!product) return <div className="container text-center py-5"><h2>Product not found</h2></div>;

    const discount = product.comparePrice
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

    // Custom Layout for Agarbatti & Tea Pouches
    const pricingConfig = getPouchPricing(product.slug);
    if (pricingConfig) {
        const config = pricingConfig[agarbattiWeight] || pricingConfig[Object.keys(pricingConfig)[0]];
        const minQty = config.minQty;
        // Generate quantity options
        let qtyOptions = [];
        if (product.slug === 'agarbatti-pouches') {
            for (let i = 1; i <= 5; i++) {
                qtyOptions.push(minQty * i);
            }
        } else {
            // For other pouches, generate multiples of minQty up to 40,000
            for (let q = minQty; q <= 40000; q += minQty) {
                qtyOptions.push(q);
            }
        }

        const getPouchImage = (slug) => {
            if (['chocolate-pouches', 'cookie-pouches', 'bakery-pouches', 'grains-pouches', 'namkeen-pouches'].includes(slug)) {
                return pouchKraftDesign;
            }
            if (['dates-pouches', 'spices-pouches', 'dry-fruits-pouches'].includes(slug)) {
                return pouchFlatDesign;
            }
            if (['energy-bar'].includes(slug)) {
                return pouchSpoutDesign;
            }
            return pouchStandupDesign; // Default for tea, coffee, agarbatti
        };

        const currentPouchImage = getPouchImage(product.slug);

        return (
            <div className="product-details-container pouch-custom-layout" style={{ backgroundColor: '#fff', padding: '4rem 0' }}>
                <div className="container">
                    <div className="product-details-grid" style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: '4rem' }}>
                        {/* Left: Image */}
                        <div className="product-gallery">
                            <div className="main-image" style={{ border: 'none', padding: 0, display: 'block', background: 'transparent', boxShadow: 'none', height: 'auto' }}>
                                <img src={currentPouchImage} alt={product.name} style={{ width: '100%', borderRadius: '12px', display: 'block' }} />
                            </div>
                            <div className="thumbnail-list" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                                <div className="thumbnail active" style={{ border: '2px solid #0d3b66', width: '60px', height: '60px' }}>
                                    <img src={currentPouchImage} alt="Thumbnail" />
                                </div>
                            </div>
                        </div>

                        {/* Right: Info */}
                        <div className="product-info-content">
                            <h1 className="product-title-large">Stand Up {config.size}</h1>

                            <div className="specs-grid">
                                <div className="spec-item">
                                    <span className="spec-label">Dimensions</span>
                                    <span className="spec-value">{config.size}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-label">Capacity</span>
                                    <span className="spec-value">{config.label}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-label">Product Type</span>
                                    <span className="spec-value">{TEA_POUCH_SLUGS.includes(product.slug) ? product.name : 'Agarbatti / Incense Sticks'}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-label">Material</span>
                                    <span className="spec-value">Food Grade Foil Based Eco Friendly Paper Pouch</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-label">Accessories</span>
                                    <span className="spec-value">3 Side Seal , Pillow Pouch, Sachet Pouch</span>
                                </div>
                            </div>

                            <div className="moq-lead-row">
                                <div className="moq-item">
                                    <div className="icon-box">📦</div>
                                    <div className="info-text">
                                        <span className="info-label">MOQ</span>
                                        <span className="info-value">{minQty}</span>
                                    </div>
                                </div>
                                <div className="lead-item">
                                    <div className="icon-box">🕒</div>
                                    <div className="info-text">
                                        <span className="info-label">Lead Time</span>
                                        <span className="info-value">{leadTime}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Selectors */}
                            <div className="selectors-row">
                                <div className="selector-group">
                                    <label className="selector-label">How many designs do you want to print?</label>
                                    <select
                                        className="custom-select"
                                        value={selectedSku}
                                        onChange={(e) => setSelectedSku(parseInt(e.target.value))}
                                    >
                                        {Array.from({ length: Math.max(1, Math.floor(minQty / 1000)) }, (_, i) => i + 1).map(num => (
                                            <option key={num} value={num}>
                                                {num} Design{num > 1 ? 's' : ''} ({Math.floor(quantity / num).toLocaleString()} per design)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="selector-group">
                                    <label className="selector-label">Finish</label>
                                    <select
                                        className="custom-select"
                                        value={agarbattiFinish}
                                        onChange={(e) => setAgarbattiFinish(e.target.value)}
                                    >
                                        <option value="Gloss">Gloss Finish</option>
                                        <option value="Matt">Matt Finish</option>
                                    </select>
                                </div>
                            </div>

                            {/* Quantity Selection */}
                            <div className="quantity-section">
                                <label className="selector-label" style={{ marginBottom: '1rem' }}>Select Quantity</label>
                                <div className="qty-grid">
                                    {qtyOptions.map((qty) => (
                                        <div
                                            key={qty}
                                            className={`qty-pill ${quantity === qty ? 'active' : ''}`}
                                            onClick={() => setQuantity(qty)}
                                        >
                                            {qty.toLocaleString()}
                                        </div>
                                    ))}

                                </div>
                            </div>

                            {/* Price Calculation */}
                            <div className="price-section-large">
                                <div className="total-price">
                                    <span className="currency">₹</span>
                                    <span className="amount">{(currentPrice * (typeof quantity === 'number' ? quantity : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    <span className="tax-text">inclusive of all taxes</span>
                                </div>
                                <div className="unit-price">
                                    for {quantity} Qty (₹{currentPrice} / piece)
                                </div>
                            </div>

                            {/* Design Availability Question */}
                            <div className="design-question-section">
                                <label className="design-question-label">Do you have a design for your brand pouches?</label>
                                <div className="design-options-row">
                                    <button
                                        className={`design-option-btn ${hasDesign === true ? 'active' : ''}`}
                                        onClick={() => setHasDesign(true)}
                                    >
                                        <span className="option-icon">✨</span>
                                        <span className="option-text">Yes, I have a design</span>
                                    </button>
                                    <button
                                        className={`design-option-btn ${hasDesign === false ? 'active' : ''}`}
                                        onClick={() => setHasDesign(false)}
                                    >
                                        <span className="option-icon">🎨</span>
                                        <span className="option-text">No, I need a design</span>
                                    </button>
                                </div>

                                {/* Conditional Content */}
                                {hasDesign === true && (
                                    <div className="upload-section fade-in">
                                        <label className="selector-label">Upload Your Design Files (.cdr)</label>
                                        <div className="upload-grid">
                                            {Array.from({ length: selectedSku }).map((_, index) => (
                                                <div key={index} className="upload-row">
                                                    <button
                                                        className={`btn-upload ${files['design'] && files['design'][index] ? 'uploaded' : ''}`}
                                                        onClick={() => document.getElementById(`file-upload-${index}`).click()}
                                                    >
                                                        {files['design'] && files['design'][index] ? (
                                                            <><span>✅</span> {files['design'][index].name}</>
                                                        ) : (
                                                            <><span>⬆️</span> Upload Design {index + 1}</>
                                                        )}
                                                    </button>
                                                    <input
                                                        type="file"
                                                        id={`file-upload-${index}`}
                                                        style={{ display: 'none' }}
                                                        onChange={(e) => handleFileChange('design', e.target.files, index)}
                                                        accept=".cdr"
                                                    />
                                                    {files['design'] && files['design'][index] && (
                                                        <button
                                                            className="btn-remove-file"
                                                            onClick={() => {
                                                                setFiles(prev => {
                                                                    const newFiles = [...prev['design']];
                                                                    newFiles[index] = null;
                                                                    return { ...prev, 'design': newFiles };
                                                                });
                                                                const fileInput = document.getElementById(`file-upload-${index}`);
                                                                if (fileInput) fileInput.value = '';
                                                            }}
                                                            title="Remove file"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {hasDesign === false && (
                                    <div className="design-assistance-card fade-in">
                                        <div className="assistance-icon">👩‍🎨</div>
                                        <div className="assistance-content">
                                            <h4>Let's Create Something Amazing!</h4>
                                            <p>Our expert designers are ready to bring your vision to life. Chat with us to get started.</p>
                                            <button
                                                onClick={() => window.open(`https://wa.me/917383838785?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} but I need help with the design.`)}`, '_blank')}
                                                className="btn-whatsapp-chat"
                                            >
                                                <span>💬</span> Chat on WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="action-row">
                                <button
                                    className="btn-add-cart"
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                >
                                    <span className="btn-icon">🛒</span>
                                    {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                                </button>
                                <WhatsAppButton
                                    message={`Hi, I'm interested in ${product.name} (${config.size}, ${config.label}).`}
                                    className="btn-chat"
                                />
                            </div>

                            {/* Pincode Checker (Reused) */}
                            <div className="delivery-estimator" style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#333' }}>Check Delivery Availability</h3>
                                <div className="pincode-input-wrapper" style={{ display: 'flex', gap: '1rem', maxWidth: '300px' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter Pincode"
                                        maxLength="6"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                        style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                    />
                                    <button
                                        onClick={checkDelivery}
                                        disabled={checkingDelivery || pincode.length !== 6}
                                        style={{ padding: '0 1.5rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        Check
                                    </button>
                                </div>
                                {deliveryDate && (
                                    <p style={{ marginTop: '0.5rem', color: '#38a169', fontSize: '0.9rem' }}>
                                        Estimated delivery by {deliveryDate}
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
                <RelatedProducts currentProduct={product} />
            </div>
        );
    }

    if (product.slug === 'custom-printed-envelopes') {
        return (
            <div className="product-details-container envelope-custom-layout">
                <div className="container">
                    <div className="product-details-grid">
                        <div className="product-gallery">
                            <div className="main-image">
                                <img src={getImageUrl(product.images[selectedImage])} alt={product.name} />
                            </div>
                            <div className="thumbnail-list">
                                {product.images.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={getImageUrl(img)} alt={`Thumbnail ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Configuration */}
                        <div className="product-info-content">
                            <h1 className="product-title-large">{product.name}</h1>
                            <p className="product-subtitle">Cater to your business needs with Personalised business envelopes.</p>
                            <ul className="product-features-list">
                                <li>3 different sizes</li>
                                <li>Design online or upload your design.</li>
                            </ul>

                            <div className="customization-panel">
                                {/* Size & Paper Type from Customization Options */}
                                {product.customizationOptions?.map((option, index) => (
                                    <div key={index} className="config-row">
                                        <label>{option.name}</label>
                                        <div className="config-input-wrapper">
                                            <select
                                                className="config-select"
                                                value={customization[option.name] || ''}
                                                onChange={(e) => handleCustomizationChange(option.name, e.target.value)}
                                            >
                                                {option.options.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}

                                {/* Quantity Dropdown */}
                                <div className="config-row">
                                    <label>Quantity</label>
                                    <div className="config-input-wrapper">
                                        <select
                                            className="config-select"
                                            value={quantity}
                                            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                                        >
                                            {product.bulkPricing?.map((tier, index) => (
                                                <option key={index} value={tier.minQty}>{tier.minQty}</option>
                                            ))}
                                            <option value="1000">1000</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="price-section-large">
                                <div className="total-price">
                                    <span className="currency">₹</span>
                                    <span className="amount">{(currentPrice * quantity).toFixed(2)}</span>
                                    <span className="tax-text">inclusive of all taxes</span>
                                </div>
                                <div className="unit-price">
                                    for {quantity} Qty (₹{currentPrice} / piece)
                                </div>
                                <div className="bulk-savings">
                                    <Link to="#" className="bulk-link">Buy in bulk and save ⓘ</Link>
                                </div>
                            </div>

                            <div className="action-buttons-stack">
                                <button className="btn-purple-block" onClick={() => document.getElementById('file-upload').click()}>
                                    <span className="icon">⬆️</span> Upload your Files (.cdr only)
                                </button>
                                <input
                                    type="file"
                                    id="file-upload"
                                    hidden
                                    accept=".cdr"
                                    onChange={(e) => handleFileChange('design', e.target.files[0])}
                                />
                                <button className="btn-white-block" onClick={() => {
                                    // Standard #10 Envelope: 9.5" x 4.125"
                                    // With 0.125" bleed: 9.75" x 4.375"
                                    // At 96 DPI: 936px x 420px
                                    let width = 936;
                                    let height = 420;

                                    // Try to determine size from customization
                                    const sizeOption = Object.entries(customization).find(([key, val]) => key.toLowerCase().includes('size'));
                                    if (sizeOption) {
                                        const val = sizeOption[1].toLowerCase();
                                        if (val.includes('dl')) {
                                            // DL: 220mm x 110mm -> 8.66" x 4.33"
                                            // With bleed: 8.91" x 4.58" -> 855px x 440px
                                            width = 855; height = 440;
                                        } else if (val.includes('c5') || val.includes('a5')) {
                                            // C5: 229mm x 162mm -> 9.01" x 6.38"
                                            // With bleed: 9.26" x 6.63" -> 889px x 636px
                                            width = 889; height = 636;
                                        } else if (val.includes('small') || val.includes('6')) {
                                            width = 650; height = 350; // Approx small size
                                        }
                                    }

                                    navigate('/design-tool', {
                                        state: {
                                            product,
                                            canvasWidth: width,
                                            canvasHeight: height,
                                            templateType: 'envelope'
                                        }
                                    });
                                }}>
                                    <span className="icon">✏️</span> Create your Design
                                </button>
                                <button
                                    className="btn-primary-block"
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || product.stock === 0}
                                    style={{ marginTop: '1rem', padding: '1rem', width: '100%', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    {addingToCart ? 'Processing...' : 'Order Now'}
                                </button>
                            </div>

                            <div className="delivery-estimator">
                                <h3>Estimate Delivery</h3>
                                <div className="pincode-row">
                                    <input
                                        type="text"
                                        placeholder="Pincode"
                                        maxLength="6"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                    />
                                    {pincode.length === 6 && <span className="check-icon">✅</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <RelatedProducts currentProduct={product} />
            </div>
        );
    }

    if (product.slug === 'custom-brochures') {
        return (
            <div className="product-details-container brochure-custom-layout">
                <div className="container">
                    <div className="product-details-grid">
                        {/* Left: Image Gallery */}
                        <div className="product-gallery">
                            <div className="main-image">
                                <img src={getImageUrl(product.images[selectedImage])} alt={product.name} />
                            </div>
                            <div className="thumbnail-list">
                                {product.images.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={getImageUrl(img)} alt={`Thumbnail ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Configuration */}
                        <div className="product-info-content">
                            <h1 className="product-title-large">{product.name}</h1>
                            <p className="product-subtitle">Say more with less effort – let our Half Fold Brochure do the talking for you, with Professionalism and Sophistication.</p>
                            <ul className="product-features-list">
                                <li>Order from 5 distinct paper types and 10+ paper material options.</li>
                                <li>Select from 3 different sizes - A4, A5 and DL Sizes</li>
                                <li>Buy as low as 5 units - ideal for small businesses, events, or personal projects.</li>
                            </ul>
                            <p className="product-desc-small">
                                From Trade shows to Business presentations, our Half-Fold Brochures are your versatile marketing companion, delivering your message with impact and elegance.
                            </p>
                            <p className="same-day-delivery">Same-day delivery is available in Bengaluru, Hyderabad, Chennai, and Delhi.</p>

                            <div className="customization-panel">
                                {product.customizationOptions?.map((option, index) => (
                                    <div key={index} className="config-row">
                                        <label>{option.name}</label>
                                        <div className="config-input-wrapper">
                                            <select
                                                className="config-select"
                                                value={customization[option.name] || ''}
                                                onChange={(e) => handleCustomizationChange(option.name, e.target.value)}
                                            >
                                                {option.options.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}

                                {/* Quantity Input */}
                                <div className="config-row">
                                    <label>Quantity</label>
                                    <div className="config-input-wrapper">
                                        <input
                                            type="number"
                                            className="config-input"
                                            value={quantity}
                                            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                                            min="5"
                                        />
                                        <p className="qty-hint">Choose a quantity between 5 - 10000 for instant ordering.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="price-section-large">
                                <div className="total-price">
                                    <span className="currency">₹</span>
                                    <span className="amount">{(currentPrice * quantity).toFixed(2)}</span>
                                    <span className="tax-text">inclusive of all taxes</span>
                                </div>
                                <div className="unit-price">
                                    for {quantity} Qty (₹{currentPrice} / piece)
                                </div>
                                <div className="bulk-savings">
                                    <Link to="#" className="bulk-link">Buy in bulk and save ⓘ</Link>
                                </div>
                            </div>

                            <div className="action-buttons-stack">
                                <button className="btn-purple-block" onClick={() => document.getElementById('file-upload').click()}>
                                    <span className="icon">⬆️</span> Upload your Files (.cdr only)
                                </button>
                                <input
                                    type="file"
                                    id="file-upload"
                                    hidden
                                    accept=".cdr"
                                    onChange={(e) => handleFileChange('design', e.target.files[0])}
                                />
                                <button className="btn-white-block" onClick={() => navigate('/design-tool', { state: { product } })}>
                                    <span className="icon">✏️</span> Create your Design
                                </button>
                                <button
                                    className="btn-primary-block"
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || product.stock === 0}
                                    style={{ marginTop: '1rem', padding: '1rem', width: '100%', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    {addingToCart ? 'Processing...' : 'Order Now'}
                                </button>
                            </div>

                            <div className="delivery-estimator">
                                <h3>Estimate Delivery</h3>
                                <div className="pincode-row">
                                    <input
                                        type="text"
                                        placeholder="Pincode"
                                        maxLength="6"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                    />
                                    {pincode.length === 6 && <span className="check-icon">✅</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Design Guidelines Section */}
                    <div className="design-guidelines-section">
                        <h2 className="section-heading">Design Guidelines</h2>
                        <div className="guidelines-grid">
                            <div className="guideline-item">
                                <div className="guideline-visual">
                                    <div className="visual-box dl-fold"></div>
                                </div>
                                <h3>DL Half Fold</h3>
                                <ul className="specs-list">
                                    <li>Bleed Size - 8" x 8.4"<br />203 x 215mm</li>
                                    <li>Bleed Size - 7.8" x 8.3"<br />198 x 210mm</li>
                                    <li>Bleed Size - 7.6" x 8"<br />193 x 205mm</li>
                                </ul>
                                <button className="btn-download">Download template</button>
                            </div>
                            <div className="guideline-item">
                                <div className="guideline-visual">
                                    <div className="visual-box a5-fold"></div>
                                </div>
                                <h3>A5 Half Fold</h3>
                                <ul className="specs-list">
                                    <li>Bleed Size - 11.89" x 8.49"<br />302 x 215mm</li>
                                    <li>Bleed Size - 11.89" x 8.49"<br />302 x 215mm</li>
                                    <li>Bleed Size - 11.89" x 8.49"<br />302 x 215mm</li>
                                </ul>
                                <button className="btn-download">Download template</button>
                            </div>
                            <div className="guideline-item">
                                <div className="guideline-visual">
                                    <div className="visual-box a4-fold"></div>
                                </div>
                                <h3>A4 Half Fold</h3>
                                <ul className="specs-list">
                                    <li>Bleed Size - 16.73" x 11.89"<br />425 x 302mm</li>
                                    <li>Bleed Size - 16.5" x 11.7"<br />420 x 297mm</li>
                                    <li>Bleed Size - 16.34" x 11.5"<br />415 x 295mm</li>
                                </ul>
                                <button className="btn-download">Download template</button>
                            </div>
                        </div>
                        <div className="guidelines-notes">
                            <ul>
                                <li>Use the bleed size of your design to avoid white edges.</li>
                                <li>Keep images and text within the safety area.</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <RelatedProducts currentProduct={product} />
            </div>
        );
    }

    if (product.slug === 'standard-business-cards') {
        return (
            <div className="product-details-container business-card-standard-layout">
                <div className="container">
                    <div className="breadcrumbs">
                        <Link to="/">Home</Link> / <Link to="/categories/business-cards">Business Cards</Link> / <span>Standard Business Card</span>
                    </div>

                    <div className="product-details-grid">
                        {/* Left: Image Gallery */}
                        <div className="product-gallery">
                            <div className="main-image">
                                <img src={getImageUrl(product.images[selectedImage])} alt={product.name} />
                            </div>
                            <div className="thumbnail-list">
                                {product.images.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={getImageUrl(img)} alt={`Thumbnail ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Configuration */}
                        <div className="product-info-content">
                            <h1 className="product-title-large">{product.name}</h1>


                            <p className="product-desc-text">
                                {product.description || "Clean, polished, and versatile – perfect for everyday business interactions."}
                            </p>

                            <ul className="product-specs-list">
                                <li><strong>Size:</strong> 3.5 x 2 inches</li>
                                <li><strong>Paper Options:</strong> 300 GSM Lykam Matte or Glossy Coated Paper</li>
                                <li><strong>Lamination:</strong> Matte, Glossy, or No Lamination</li>
                                <li><strong>Finish:</strong> Sharp digital printing with a professional look</li>
                                <li><strong>MOQ:</strong> 100 cards</li>
                            </ul>

                            <div className="ideal-for-section">
                                <strong>Ideal for:</strong> Startups, Consultants, Professionals, Events & Walk-in Customers
                            </div>

                            <div className="same-day-delivery-styled">
                                <span className="icon">⚡</span>
                                <div className="text">
                                    <strong>Same-day delivery</strong> is available in Bengaluru, Hyderabad, Chennai, and Delhi.
                                </div>
                            </div>

                            <Link to="/products/premium-business-cards" className="premium-link">
                                Explore our Premium Business Cards for a standout finish ↗
                            </Link>



                            <div className="customization-panel-styled">
                                {product.customizationOptions?.map((option, index) => (
                                    <div key={index} className="config-row-styled">
                                        <label>{option.name}</label>
                                        <div className="select-wrapper">
                                            <select
                                                value={customization[option.name] || ''}
                                                onChange={(e) => handleCustomizationChange(option.name, e.target.value)}
                                            >
                                                {option.options.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}

                                {/* Printing Location */}
                                <div className="config-row-styled">
                                    <label>Printing Location</label>
                                    <div className="select-wrapper printing-location-chips">
                                        {['Front', 'Back'].map(side => {
                                            const isSelected = printingSides.includes(side);
                                            return (
                                                <div
                                                    key={side}
                                                    className={`chip ${isSelected ? 'selected' : 'unselected'}`}
                                                    onClick={() => toggleSide(side)}
                                                >
                                                    <span>{side}</span>
                                                    {isSelected && (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="close-icon">
                                                            <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M9.16998 14.83L14.83 9.17004" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M14.83 14.83L9.16998 9.17004" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Quantity Dropdown */}
                                <div className="config-row-styled">
                                    <label>Quantity</label>
                                    <div className="select-wrapper">
                                        <select
                                            value={quantity}
                                            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                                        >
                                            {product.bulkPricing?.map((tier, index) => (
                                                <option key={index} value={tier.minQty}>{tier.minQty}</option>
                                            ))}
                                            <option value="1000">1000</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="price-calculator-box">
                                <div className="price-row">
                                    <span className="price-label">Unit Price</span>
                                    <span className="price-value">₹{currentPrice} / card</span>
                                </div>
                                <div className="price-row total">
                                    <span className="price-label">Total</span>
                                    <span className="price-value">₹{(currentPrice * quantity).toFixed(2)}</span>
                                </div>
                                <div className="tax-note">inclusive of all taxes</div>
                            </div>

                            <div className="action-buttons-grid">
                                <button className="btn-upload-design" onClick={() => document.getElementById('file-upload').click()}>
                                    <span className="icon">⬆️</span> Upload Design
                                </button>
                                <input
                                    type="file"
                                    id="file-upload"
                                    hidden
                                    accept=".cdr"
                                    onChange={(e) => handleFileChange('design', e.target.files[0])}
                                />
                            </div>

                            <button
                                className="btn-add-to-cart-large"
                                onClick={handleAddToCart}
                                disabled={addingToCart || product.stock === 0}
                            >
                                {addingToCart ? 'Processing...' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
                <RelatedProducts currentProduct={product} />
            </div>
        );
    }

    if (product.slug === 'premium-business-cards') {
        return (
            <div className="product-details-container business-card-custom-layout">
                <div className="container">
                    <div className="product-details-grid">
                        {/* Left: Image Gallery */}
                        <div className="product-gallery">
                            <div className="main-image">
                                <img src={getImageUrl(product.images[selectedImage])} alt={product.name} />
                            </div>
                            <div className="thumbnail-list">
                                {product.images.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={getImageUrl(img)} alt={`Thumbnail ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Configuration */}
                        <div className="product-info-content">
                            <h1 className="product-title-large">{product.name}</h1>
                            <p className="product-subtitle">Make a lasting first impression with premium quality business cards.</p>
                            <ul className="product-features-list">
                                <li>Standard 3.5" x 2" size</li>
                                <li>Premium paper options available</li>
                                <li>High-quality full color printing</li>
                            </ul>

                            <div className="customization-panel">
                                {product.customizationOptions?.map((option, index) => (
                                    <div key={index} className="config-row">
                                        <label>{option.name}</label>
                                        <div className="config-input-wrapper">
                                            <select
                                                className="config-select"
                                                value={customization[option.name] || ''}
                                                onChange={(e) => handleCustomizationChange(option.name, e.target.value)}
                                            >
                                                {option.options.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}

                                {/* Quantity Input */}
                                <div className="config-row">
                                    <label>Quantity</label>
                                    <div className="config-input-wrapper">
                                        <input
                                            type="number"
                                            className="config-input"
                                            value={quantity}
                                            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                                            min="100"
                                            step="50"
                                        />
                                        <p className="qty-hint">Minimum order quantity is 100 cards.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="price-section-large">
                                <div className="total-price">
                                    <span className="currency">₹</span>
                                    <span className="amount">{(currentPrice * quantity).toFixed(2)}</span>
                                    <span className="tax-text">inclusive of all taxes</span>
                                </div>
                                <div className="unit-price">
                                    for {quantity} Qty (₹{currentPrice} / piece)
                                </div>
                                <div className="bulk-savings">
                                    <Link to="#" className="bulk-link">Buy in bulk and save ⓘ</Link>
                                </div>
                            </div>

                            <div className="action-buttons-stack">
                                <button className="btn-purple-block" onClick={() => document.getElementById('file-upload').click()}>
                                    <span className="icon">⬆️</span> Upload your Files (.cdr only)
                                </button>
                                <input
                                    type="file"
                                    id="file-upload"
                                    hidden
                                    accept=".cdr"
                                    onChange={(e) => handleFileChange('design', e.target.files[0])}
                                />
                                <button className="btn-white-block" onClick={() => navigate('/design-tool', { state: { product } })}>
                                    <span className="icon">✏️</span> Create your Design
                                </button>
                                <button
                                    className="btn-primary-block"
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || product.stock === 0}
                                    style={{ marginTop: '1rem', padding: '1rem', width: '100%', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    {addingToCart ? 'Processing...' : 'Order Now'}
                                </button>
                            </div>

                            <div className="delivery-estimator">
                                <h3>Estimate Delivery</h3>
                                <div className="pincode-row">
                                    <input
                                        type="text"
                                        placeholder="Pincode"
                                        maxLength="6"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                    />
                                    {pincode.length === 6 && <span className="check-icon">✅</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Design Guidelines Section */}
                    <div className="design-guidelines-section">
                        <h2 className="section-heading">Design Guidelines</h2>
                        <div className="guidelines-grid">
                            <div className="guideline-item">
                                <div className="guideline-visual">
                                    <div className="visual-box business-card-h"></div>
                                </div>
                                <h3>Standard Horizontal</h3>
                                <ul className="specs-list">
                                    <li>Bleed Size - 3.62" x 2.12"<br />92 x 54mm</li>
                                    <li>Trim Size - 3.5" x 2"<br />89 x 51mm</li>
                                    <li>Safe Area - 3.38" x 1.88"<br />86 x 48mm</li>
                                </ul>
                                <button className="btn-download">Download template</button>
                            </div>
                            <div className="guideline-item">
                                <div className="guideline-visual">
                                    <div className="visual-box business-card-v"></div>
                                </div>
                                <h3>Standard Vertical</h3>
                                <ul className="specs-list">
                                    <li>Bleed Size - 2.12" x 3.62"<br />54 x 92mm</li>
                                    <li>Trim Size - 2" x 3.5"<br />51 x 89mm</li>
                                    <li>Safe Area - 1.88" x 3.38"<br />48 x 86mm</li>
                                </ul>
                                <button className="btn-download">Download template</button>
                            </div>
                        </div>
                        <div className="guidelines-notes">
                            <ul>
                                <li>Keep text and logos within the safe area.</li>
                                <li>Extend background images to the bleed edge.</li>
                                <li>Use high-resolution images (300 DPI or higher).</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <RelatedProducts currentProduct={product} />
            </div>
        );
    }


    return (
        <div className="product-details-container">
            <div className="container">
                <div className="product-details-grid">
                    {/* Image Gallery */}
                    <div className="product-gallery">
                        <div className="main-image">
                            {product.images && product.images.length > 0 ? (
                                <img src={getImageUrl(product.images[selectedImage])} alt={product.name} />
                            ) : (
                                <div className="image-placeholder">🖼️</div>
                            )}
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="thumbnail-list">
                                {product.images.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={getImageUrl(img)} alt={`Thumbnail ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="product-info-content">
                        <div className="product-header">
                            <h1>{product.name}</h1>
                            <div className="product-meta">
                                <span className="category-tag">{product.category?.name}</span>
                                <span className="rating">★ {product.rating?.average || 'New'}</span>
                                <span className={`stock-status ${product.stock === 0 ? 'out-of-stock' : ''}`}>
                                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                        </div>



                        <div className="product-price-large">
                            <span className="current-price">₹{currentPrice}</span>
                            {product.comparePrice && (
                                <>
                                    <span className="original-price">₹{product.comparePrice}</span>
                                    <span className="discount-badge">{discount}% OFF</span>
                                </>
                            )}
                        </div>

                        {/* Bulk Pricing Table */}
                        {product.bulkPricing && product.bulkPricing.length > 0 && (
                            <div className="bulk-pricing-container">
                                <h4>Bulk Quantity Discounts</h4>
                                <div className="bulk-pricing-table">
                                    <div className="bulk-header">
                                        <span>Quantity</span>
                                        <span>Price / Unit</span>
                                    </div>
                                    {product.bulkPricing.map((tier, index) => (
                                        <div
                                            key={index}
                                            className={`bulk-row ${quantity >= tier.minQty && (!tier.maxQty || quantity <= tier.maxQty) ? 'active' : ''}`}
                                        >
                                            <span>{tier.minQty} {tier.maxQty ? `- ${tier.maxQty}` : '+'}</span>
                                            <span>₹{tier.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="product-description-full">
                            <p>{product.description}</p>
                        </div>

                        {/* Pincode Checker */}
                        <div className="pincode-checker">
                            <h3>Check Delivery Availability</h3>
                            <div className="pincode-input-group">
                                <input
                                    type="text"
                                    placeholder="Enter Pincode"
                                    maxLength="6"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                />
                                <button onClick={checkDelivery} disabled={checkingDelivery}>
                                    {checkingDelivery ? 'Checking...' : 'Check'}
                                </button>
                            </div>
                            {deliveryDate && (
                                <p className="delivery-message">
                                    ✅ Delivery by <strong>{deliveryDate}</strong>
                                </p>
                            )}
                        </div>

                        {/* Specifications */}
                        {product.specifications && product.specifications.length > 0 && (
                            <div className="specifications">
                                <h3>Specifications</h3>
                                <table className="specifications-table">
                                    <tbody>
                                        {product.specifications.map((spec, index) => (
                                            <tr key={index}>
                                                <td>{spec.name}</td>
                                                <td>{spec.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Customization Form */}
                        <div className="customization-form">
                            <h3>Customize Your Order</h3>

                            {product.customizationOptions?.map((option, index) => (
                                <div key={index} className="form-group">
                                    <label>{option.name} {option.required && '*'}</label>

                                    {option.type === 'select' && (
                                        <select
                                            className="form-control"
                                            value={customization[option.name] || ''}
                                            onChange={(e) => handleCustomizationChange(option.name, e.target.value)}
                                        >
                                            {option.options.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    )}

                                    {option.type === 'text' && (
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder={`Enter ${option.name}`}
                                            value={customization[option.name] || ''}
                                            onChange={(e) => handleCustomizationChange(option.name, e.target.value)}
                                        />
                                    )}

                                    {option.type === 'file' && (
                                        <label className="file-upload-label">
                                            <span className="upload-icon">📁</span>
                                            <span>{files[option.name]?.name || 'Click to upload .cdr file'}</span>
                                            <input
                                                type="file"
                                                hidden
                                                accept=".cdr"
                                                onChange={(e) => handleFileChange(option.name, e.target.files[0])}
                                            />
                                        </label>
                                    )}
                                </div>
                            ))}

                            <div className="quantity-selector">
                                <label>Quantity:</label>
                                <button className="qty-btn" onClick={() => handleQuantityChange(quantity - 1)}>-</button>
                                <input
                                    type="number"
                                    className="qty-input"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                />
                                <button className="qty-btn" onClick={() => handleQuantityChange(quantity + 1)}>+</button>
                            </div>

                            <div className="action-buttons">
                                <button
                                    className="btn btn-primary btn-lg btn-full"
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || product.stock === 0}
                                >
                                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                                </button>
                                <button
                                    className="btn btn-outline btn-lg"
                                    onClick={handleWishlist}
                                    title="Add to Wishlist"
                                >
                                    {isInWishlist ? '❤️' : '🤍'}
                                </button>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <Reviews productId={product._id} />
                    </div>
                </div>
                <RelatedProducts currentProduct={product} />
            </div>
        </div>
    );
};

export default ProductDetails;
