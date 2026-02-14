const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Pincode is required'],
        unique: true,
        trim: true,
        length: 6
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    deliveryDays: {
        type: Number,
        default: 3
    },
    isServiceable: {
        type: Boolean,
        default: true
    },
    codAvailable: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Pincode', pincodeSchema);
