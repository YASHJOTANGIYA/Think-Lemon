const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cart = require('./models/Cart');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

dotenv.config();

const inspectCarts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const carts = await Cart.find().populate('items.product');

        console.log(`Found ${carts.length} carts.`);

        carts.forEach((cart, index) => {
            console.log(`\n--- Cart ${index + 1} (User: ${cart.user}) ---`);
            cart.items.forEach((item, i) => {
                console.log(`Item ${i + 1}:`);
                console.log(`  Product: ${item.product?.name} (Slug: ${item.product?.slug})`);
                console.log(`  Quantity: ${item.quantity}`);
                console.log(`  Customization:`, item.customization);
                console.log(`  Base Price: ${item.product?.price}`);
            });
        });

        process.exit(0);
    } catch (error) {
        console.error('Error inspecting carts:', error);
        process.exit(1);
    }
};

inspectCarts();
