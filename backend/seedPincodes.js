const mongoose = require('mongoose');
const Pincode = require('./models/Pincode');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const seedPincodes = async () => {
    try {
        await Pincode.deleteMany(); // Clear existing

        const pincodes = [
            { code: '360005', city: 'Rajkot', state: 'Gujarat', deliveryDays: 2 },
            { code: '380001', city: 'Ahmedabad', state: 'Gujarat', deliveryDays: 2 },
            { code: '400001', city: 'Mumbai', state: 'Maharashtra', deliveryDays: 3 },
            { code: '110001', city: 'Delhi', state: 'Delhi', deliveryDays: 4 },
            { code: '560001', city: 'Bangalore', state: 'Karnataka', deliveryDays: 5 },
            { code: '600001', city: 'Chennai', state: 'Tamil Nadu', deliveryDays: 5 },
            { code: '700001', city: 'Kolkata', state: 'West Bengal', deliveryDays: 4 },
            { code: '395001', city: 'Surat', state: 'Gujarat', deliveryDays: 2 },
            { code: '390001', city: 'Vadodara', state: 'Gujarat', deliveryDays: 2 },
            { code: '360010', city: 'Rajkot', state: 'Gujarat', deliveryDays: 2 },
            // Add more Rajkot pincodes
            { code: '360001', city: 'Rajkot', state: 'Gujarat', deliveryDays: 2 },
            { code: '360002', city: 'Rajkot', state: 'Gujarat', deliveryDays: 2 },
            { code: '360003', city: 'Rajkot', state: 'Gujarat', deliveryDays: 2 },
            { code: '360004', city: 'Rajkot', state: 'Gujarat', deliveryDays: 2 },
            { code: '360006', city: 'Rajkot', state: 'Gujarat', deliveryDays: 2 },
            { code: '360007', city: 'Rajkot', state: 'Gujarat', deliveryDays: 2 },
            { code: '360008', city: 'Rajkot', state: 'Gujarat', deliveryDays: 2 },
            { code: '360009', city: 'Rajkot', state: 'Gujarat', deliveryDays: 2 }
        ];

        await Pincode.insertMany(pincodes);
        console.log('Pincodes seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding pincodes:', error);
        process.exit(1);
    }
};

seedPincodes();
