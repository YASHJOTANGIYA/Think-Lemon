import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import './Admin.css';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productsAPI.getAll({ limit: 100 }); // Fetch all for now
            setProducts(response.data.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productsAPI.delete(id);
                setProducts(products.filter(p => p._id !== id));
                alert('Product deleted successfully');
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product');
            }
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="admin-products">
            <div className="admin-header">
                <h1>Products Management</h1>
                <Link to="/admin/products/new" className="btn btn-primary">
                    + Add New Product
                </Link>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id}>
                                <td>
                                    <div className="product-thumb">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                        ) : (
                                            <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '4px' }}></div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '600' }}>{product.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{product.slug}</div>
                                </td>
                                <td>{product.category?.name || 'Uncategorized'}</td>
                                <td>₹{product.price}</td>
                                <td>
                                    <span className={`status-badge ${product.stock > 0 ? 'status-delivered' : 'status-cancelled'}`}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td>
                                    <Link to={`/admin/products/edit/${product._id}`} className="action-btn btn-edit">
                                        Edit
                                    </Link>
                                    <button
                                        className="action-btn btn-delete"
                                        onClick={() => handleDelete(product._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProducts;
