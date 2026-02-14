const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/auth');

// Get user's wishlist
router.get('/', protect, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        res.json({ success: true, data: wishlist.products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching wishlist', error: error.message });
    }
});

// Add product to wishlist
router.post('/add/:productId', protect, async (req, res) => {
    try {
        const { productId } = req.params;

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
        } else {
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
                await wishlist.save();
            }
        }

        res.json({ success: true, message: 'Product added to wishlist' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding to wishlist', error: error.message });
    }
});

// Remove product from wishlist
router.delete('/remove/:productId', protect, async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (wishlist) {
            wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
            await wishlist.save();
        }

        res.json({ success: true, message: 'Product removed from wishlist' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error removing from wishlist', error: error.message });
    }
});

// Check if product is in wishlist
router.get('/check/:productId', protect, async (req, res) => {
    try {
        const { productId } = req.params;
        const wishlist = await Wishlist.findOne({ user: req.user._id });

        const isInWishlist = wishlist ? wishlist.products.includes(productId) : false;

        res.json({ success: true, isInWishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error checking wishlist', error: error.message });
    }
});

module.exports = router;
