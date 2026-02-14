const express = require('express');
const router = express.Router();
const Pincode = require('../models/Pincode');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/pincodes/:code
// @desc    Check pincode serviceability
// @access  Public
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;

        if (code.length !== 6) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pincode format'
            });
        }

        const pincode = await Pincode.findOne({ code });

        if (!pincode || !pincode.isServiceable) {
            return res.status(404).json({
                success: false,
                message: 'Sorry, we do not deliver to this pincode yet.'
            });
        }

        // Calculate estimated delivery date
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + pincode.deliveryDays);

        res.json({
            success: true,
            data: {
                ...pincode.toObject(),
                estimatedDate: deliveryDate
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking pincode',
            error: error.message
        });
    }
});

// @route   POST /api/pincodes
// @desc    Add a serviceable pincode
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const pincode = await Pincode.create(req.body);
        res.status(201).json({
            success: true,
            data: pincode
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding pincode',
            error: error.message
        });
    }
});

module.exports = router;
