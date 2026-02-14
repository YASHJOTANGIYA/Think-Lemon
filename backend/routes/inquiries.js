const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /api/inquiries
// @desc    Submit a new business inquiry
// @access  Public
router.post('/', async (req, res) => {
    try {
        const inquiry = await Inquiry.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Inquiry submitted successfully',
            data: inquiry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting inquiry',
            error: error.message
        });
    }
});

// @route   GET /api/inquiries
// @desc    Get all inquiries (Admin only)
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: inquiries.length,
            data: inquiries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching inquiries',
            error: error.message
        });
    }
});

// @route   PUT /api/inquiries/:id
// @desc    Update inquiry status (Admin only)
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        res.json({
            success: true,
            message: 'Inquiry updated successfully',
            data: inquiry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating inquiry',
            error: error.message
        });
    }
});

module.exports = router;
