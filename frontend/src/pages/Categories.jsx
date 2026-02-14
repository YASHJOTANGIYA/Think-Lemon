import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import './Categories.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="categories-page">
            <div className="container">
                <div className="categories-header">
                    <h1>Browse Categories</h1>
                    <p>Explore our wide range of printing services</p>
                </div>

                <div className="categories-grid-large">
                    {categories.map((category) => (
                        <Link key={category._id} to={`/products?category=${category._id}`} className="category-card-large">
                            <div className="category-icon-large">{category.icon || '📦'}</div>
                            <div className="category-content">
                                <h3>{category.name}</h3>
                                <p>{category.description}</p>
                                <span className="category-link">View Products →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Categories;
