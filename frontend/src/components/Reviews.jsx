import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Reviews.css';

const Reviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const response = await reviewsAPI.getByProduct(productId);
            setReviews(response.data.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Please login to write a review');
            return;
        }

        setSubmitting(true);
        try {
            await reviewsAPI.create({ productId, rating, comment });
            setComment('');
            setRating(5);
            setShowForm(false);
            fetchReviews(); // Refresh reviews
            alert('Review submitted successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="reviews-section">
            <div className="reviews-header">
                <h2>Customer Reviews ({reviews.length})</h2>
                {isAuthenticated && !showForm && (
                    <button className="write-review-btn" onClick={() => setShowForm(true)}>
                        Write a Review
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="review-form">
                    <h3>Write your review</h3>
                    <div className="rating-input">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`star-btn ${star <= rating ? 'active' : ''}`}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <textarea
                        rows="4"
                        placeholder="Share your experience with this product..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    ></textarea>
                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-review-btn"
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            )}

            <div className="reviews-list">
                {loading ? (
                    <div className="text-center">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="no-reviews">
                        <p>No reviews yet. Be the first to review this product!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="review-card">
                            <div className="review-header">
                                <span className="reviewer-name">{review.user?.name || 'Anonymous'}</span>
                                <span className="review-date">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="review-rating">
                                {'★'.repeat(review.rating)}
                                {'☆'.repeat(5 - review.rating)}
                            </div>
                            <p className="review-text">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Reviews;
