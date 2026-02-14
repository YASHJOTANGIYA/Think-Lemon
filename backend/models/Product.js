const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Product category is required']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: 0
    },
    comparePrice: {
        type: Number,
        min: 0
    },
    bulkPricing: [{
        minQty: { type: Number, required: true },
        maxQty: { type: Number }, // null or undefined means "and above"
        price: { type: Number, required: true }
    }],
    images: [{
        type: String
    }],
    specifications: [{
        name: String,
        value: String
    }],
    customizationOptions: [{
        name: String,
        type: { type: String, enum: ['text', 'file', 'select', 'color'] },
        required: { type: Boolean, default: false },
        options: [String]
    }],
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    tags: [String],
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    deliveryTime: {
        type: String,
        default: '3-5 business days'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create slug from name before saving
// Create slug from name before saving
productSchema.pre('save', async function () {
    if (!this.slug && (this.isModified('name') || this.isNew)) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }
});

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
