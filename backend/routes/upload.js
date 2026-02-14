const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use /tmp for Vercel/Production, otherwise uploads/
        const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp' : 'uploads/';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: timestamp-random-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept only cdr files as per requirement, but maybe allow others for flexibility if needed later
    // For now, strict check as per user request context, but backend should generally be safer
    if (file.originalname.toLowerCase().endsWith('.cdr')) {
        cb(null, true);
    } else {
        cb(new Error('Only .cdr files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Upload route
router.post('/', upload.array('files', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const fileUrls = req.files.map(file => {
            // Return relative path that can be served by static middleware
            return `/uploads/${file.filename}`;
        });

        res.json({
            success: true,
            message: 'Files uploaded successfully',
            data: fileUrls
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error uploading files', error: error.message });
    }
});

module.exports = router;
