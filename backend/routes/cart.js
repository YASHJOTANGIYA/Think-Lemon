const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price images slug').lean();
        if (!cart) return res.json({ success: true, data: { items: [] } });
        res.json({ success: true, data: cart });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching cart', error: error.message });
    }
});

router.post('/add', protect, async (req, res) => {
    try {
        const { productId, quantity: qtyInput = 1, customization, uploadedFiles } = req.body;
        const quantity = parseInt(qtyInput) || 1;

        console.log('Adding to cart - Request Body:', { productId, quantity, customization, uploadedFiles });

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            console.error(`Product not found with ID: ${productId}`);
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        // Helper to normalize customization object/map
        const normalizeCustomization = (cust) => {
            if (!cust) return {};
            if (cust instanceof Map) return Object.fromEntries(cust);
            if (typeof cust.toObject === 'function') return cust.toObject();
            return cust;
        };

        const areCustomizationsEqual = (c1, c2) => {
            try {
                const obj1 = normalizeCustomization(c1);
                const obj2 = normalizeCustomization(c2);

                const keys1 = Object.keys(obj1).sort();
                const keys2 = Object.keys(obj2).sort();

                if (keys1.length !== keys2.length) return false;

                for (let key of keys1) {
                    if (String(obj1[key]) !== String(obj2[key])) return false;
                }
                return true;
            } catch (err) {
                console.error('Comparing customization error:', err);
                return false;
            }
        };

        const sanitizedCustomization = {};
        if (customization) {
            Object.entries(customization).forEach(([k, v]) => {
                if (v !== null && v !== undefined) sanitizedCustomization[k] = String(v);
            });
        }
        const files = Array.isArray(uploadedFiles) ? uploadedFiles : [];

        if (!cart) {
            console.log('Creating new cart for user:', req.user._id);
            cart = await Cart.create({
                user: req.user._id,
                items: [{
                    product: productId,
                    quantity,
                    customization: sanitizedCustomization,
                    uploadedFiles: files
                }]
            });
        } else {
            console.log('Updating existing cart for user:', req.user._id);

            // Validate items array exists
            if (!cart.items) cart.items = [];

            let itemIndex = cart.items.findIndex(item => {
                if (!item || !item.product) return false;
                if (item.product.toString() !== productId) return false;
                return areCustomizationsEqual(item.customization, customization);
            });

            if (itemIndex > -1) {
                console.log(`Item found at index ${itemIndex}, updating quantity`);
                cart.items[itemIndex].quantity += quantity;
                if (uploadedFiles && Array.isArray(uploadedFiles)) {
                    cart.items[itemIndex].uploadedFiles = uploadedFiles;
                }
            } else {
                console.log('Item not found, adding new item');
                cart.items.push({
                    product: productId,
                    quantity,
                    customization: sanitizedCustomization,
                    uploadedFiles: files
                });
            }
            await cart.save();
        }

        // Re-fetch cart to ensure populated fields are returned
        const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price images slug').lean();

        // Filter out null products just in case
        if (populatedCart && populatedCart.items) {
            populatedCart.items = populatedCart.items.filter(item => item.product !== null);
        }

        res.json({ success: true, message: 'Item added to cart', data: populatedCart });
    } catch (error) {
        console.error('CRITICAL ERROR in /api/cart/add:', error);
        console.error(error.stack);
        res.status(500).json({
            success: false,
            message: 'Error adding item to cart',
            error: error.message
        });
    }
});

router.put('/update/:itemId', protect, async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        const item = cart.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });

        item.quantity = quantity;
        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name price images slug').lean();
        res.json({ success: true, message: 'Cart updated', data: updatedCart });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating cart', error: error.message });
    }
});

router.delete('/remove/:itemId', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name price images slug').lean();
        res.json({ success: true, message: 'Item removed from cart', data: updatedCart });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error removing item from cart', error: error.message });
    }
});

router.delete('/clear', protect, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user._id });
        res.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error clearing cart', error: error.message });
    }
});

module.exports = router;
