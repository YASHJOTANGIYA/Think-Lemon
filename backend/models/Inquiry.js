const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    contactPerson: {
        type: String,
        required: [true, 'Contact person name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    requirement: {
        type: String,
        required: [true, 'Requirement type is required'],
        enum: ['Employee Welcome Kits', 'Corporate Events', 'Client Gifting', 'Office Stationery', 'Other']
    },
    quantity: {
        type: String,
        required: [true, 'Quantity details are required']
    },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'In Progress', 'Closed'],
        default: 'New'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Inquiry', inquirySchema);
