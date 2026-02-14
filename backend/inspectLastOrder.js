require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

const inspect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const latestOrder = await Order.findOne().sort({ createdAt: -1 });

        if (latestOrder) {
            console.log('Latest Order:', latestOrder.orderNumber);
            console.log('Created At:', latestOrder.createdAt);
            console.log('Total:', latestOrder.total);
            console.log('Items:', latestOrder.items.length);
            // Check if created recently (within last 10 mins)
            const now = new Date();
            const diff = (now - latestOrder.createdAt) / 1000 / 60; // Minutes
            console.log(`Created ${diff.toFixed(1)} minutes ago.`);
        } else {
            console.log('No orders found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

inspect();
