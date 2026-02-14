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
        const { productId, quantity = 1, customization, uploadedFiles } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [{ product: productId, quantity, customization, uploadedFiles }] });
        } else {
            // Find item with same product ID AND same customization
            const itemIndex = cart.items.findIndex(item => {
                if (item.product.toString() !== productId) return false;

                // Compare customizations
                const itemCust = item.customization instanceof Map
                    ? Object.fromEntries(item.customization)
                    : item.customization || {};

                const newCust = customization || {};

                const keys1 = Object.keys(itemCust);
                const keys2 = Object.keys(newCust);

                if (keys1.length !== keys2.length) return false;

                for (const key of keys1) {
                    if (itemCust[key] !== newCust[key]) return false;
                }

                return true;
            });

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
                // Update uploaded files if provided (append or replace? usually append for same item, but let's just replace for now as per previous logic)
                if (uploadedFiles) cart.items[itemIndex].uploadedFiles = uploadedFiles;
            } else {
                cart.items.push({ product: productId, quantity, customization, uploadedFiles });
            }
            await cart.save();
        }

        cart = await Cart.findById(cart._id).populate('items.product', 'name price images slug').lean();
        res.json({ success: true, message: 'Item added to cart', data: cart });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding item to cart', error: error.message });
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
