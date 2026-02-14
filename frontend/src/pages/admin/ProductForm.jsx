import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../../services/api';
import './Admin.css';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        comparePrice: '',
        stock: 0,
        isActive: true,
        isFeatured: false,
        tags: '', // Comma separated string for input
        deliveryTime: '3-5 business days',
        images: [] // Array of URL strings
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageInput, setImageInput] = useState('');

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const res = await categoriesAPI.getAll();
            if (res.data.success) {
                setCategories(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const res = await productsAPI.getBySlug(id); // Using ID or Slug? API says getBySlug but usually admin uses ID. 
            // Let's check api.js. productsAPI.update takes ID. productsAPI.getBySlug takes slug.
            // But usually edit URL uses ID. Let's assume ID for now and if it fails we might need a getById endpoint or use getAll with filter.
            // Wait, productsAPI.getBySlug is for public. Admin usually needs getById.
            // Let's check api.js again.
            // productsAPI.getById is NOT defined in the snippet I saw earlier (only getAll, getBySlug, create, update, delete).
            // I might need to add getById to api.js or use getAll({_id: id}) if backend supports it.
            // Or just try to fetch by ID using the same endpoint if backend supports it.
            // For now, I'll try to use the update endpoint's logic or just fetch all and find. 
            // Actually, best practice is to add getById.

            // Temporary workaround: Fetch all and find by ID (not efficient but works for small data)
            const allRes = await productsAPI.getAll({ limit: 1000 });
            const product = allRes.data.data.find(p => p._id === id);

            if (product) {
                setFormData({
                    name: product.name,
                    description: product.description,
                    category: product.category?._id || product.category,
                    price: product.price,
                    comparePrice: product.comparePrice || '',
                    stock: product.stock,
                    isActive: product.isActive,
                    isFeatured: product.isFeatured,
                    tags: product.tags ? product.tags.join(', ') : '',
                    deliveryTime: product.deliveryTime,
                    images: product.images || []
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddImage = () => {
        if (imageInput.trim()) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, imageInput.trim()]
            }));
            setImageInput('');
        }
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
                price: Number(formData.price),
                comparePrice: formData.comparePrice ? Number(formData.comparePrice) : undefined,
                stock: Number(formData.stock)
            };

            if (isEditMode) {
                await productsAPI.update(id, payload);
                alert('Product updated successfully!');
            } else {
                await productsAPI.create(payload);
                alert('Product created successfully!');
            }
            navigate('/admin/products');
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="admin-form-container">
            <div className="admin-header">
                <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
                <button onClick={() => navigate('/admin/products')} className="btn btn-secondary">
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                    <label>Product Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label>Compare Price (₹)</label>
                        <input
                            type="number"
                            name="comparePrice"
                            value={formData.comparePrice}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Stock</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label>Delivery Time</label>
                        <input
                            type="text"
                            name="deliveryTime"
                            value={formData.deliveryTime}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Tags (comma separated)</label>
                    <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="e.g. business-cards, square, matte, real-estate"
                    />
                    <small className="form-text text-muted">
                        Use tags like <b>square, rounded, matte, glossy, real-estate</b> to make products appear in specific filters.
                    </small>
                </div>

                <div className="form-group">
                    <label>Images (URLs)</label>
                    <div className="image-input-group">
                        <input
                            type="text"
                            value={imageInput}
                            onChange={(e) => setImageInput(e.target.value)}
                            placeholder="Enter image URL"
                        />
                        <button type="button" onClick={handleAddImage} className="btn btn-secondary">
                            Add
                        </button>
                    </div>
                    <div className="image-preview-list">
                        {formData.images.map((img, index) => (
                            <div key={index} className="image-preview-item">
                                <img src={img} alt={`Preview ${index}`} />
                                <button type="button" onClick={() => handleRemoveImage(index)} className="remove-btn">
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-row checkbox-row">
                    <div className="form-check">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            id="isActive"
                        />
                        <label htmlFor="isActive">Active</label>
                    </div>

                    <div className="form-check">
                        <input
                            type="checkbox"
                            name="isFeatured"
                            checked={formData.isFeatured}
                            onChange={handleChange}
                            id="isFeatured"
                        />
                        <label htmlFor="isFeatured">Featured</label>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
