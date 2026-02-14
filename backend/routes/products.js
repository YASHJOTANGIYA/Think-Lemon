const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const Category = require('../models/Category');

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, search, featured, sort, tag, shape, finish, industry, limit = 20, page = 1 } = req.query;

        let query = { isActive: true };

        // Filter by Category (ID or Slug)
        if (category) {
            const mongoose = require('mongoose');
            if (mongoose.Types.ObjectId.isValid(category)) {
                query.category = category;
            } else {
                // It's a slug, find the category first
                const categoryDoc = await Category.findOne({ slug: category });
                if (categoryDoc) {
                    query.category = categoryDoc._id;
                } else {
                    // Category not found, return empty result immediately
                    return res.json({
                        success: true,
                        data: [],
                        pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 }
                    });
                }
            }
        }

        // Filter by Tags (combining tag, shape, finish, industry)
        const tagsToFilter = [];
        if (tag) tagsToFilter.push(tag);
        if (shape) tagsToFilter.push(shape);
        if (finish) tagsToFilter.push(finish);
        if (industry) tagsToFilter.push(industry);

        if (tagsToFilter.length > 0) {
            query.tags = { $all: tagsToFilter };
        }

        if (featured === 'true') query.isFeatured = true;
        if (search) query.$text = { $search: search };

        let sortOption = {};
        if (sort === 'price-low') sortOption = { price: 1 };
        else if (sort === 'price-high') sortOption = { price: -1 };
        else if (sort === 'newest') sortOption = { createdAt: -1 };
        else if (sort === 'popular') sortOption = { 'rating.average': -1 };
        else sortOption = { createdAt: -1 };

        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sortOption)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// @route   GET /api/products/:slug
// @desc    Get single product by slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isActive: true })
            .populate('category', 'name slug');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
});

module.exports = router;
