const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Please provide a review comment'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent user from submitting multiple reviews for the same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function (productId) {
    const stats = await this.aggregate([
        {
            $match: { product: productId }
        },
        {
            $group: {
                _id: '$product',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    try {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            rating: {
                average: stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0,
                count: stats.length > 0 ? stats[0].nRating : 0
            }
        });
    } catch (err) {
        console.error(err);
    }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function () {
    this.constructor.calculateAverageRating(this.product);
});

// Call calculateAverageRating before remove
reviewSchema.pre('remove', function () {
    this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
