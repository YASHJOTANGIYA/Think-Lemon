const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug, isActive: true });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching category', error: error.message });
    }
});

router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, message: 'Category created successfully', data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating category', error: error.message });
    }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, message: 'Category updated successfully', data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating category', error: error.message });
    }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting category', error: error.message });
    }
});

module.exports = router;
