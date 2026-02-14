const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const seedWindowPouches = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Find or Create Category
        let category = await Category.findOne({ slug: 'pouches' });
        if (!category) {
            category = await Category.create({
                name: 'Pouches',
                slug: 'pouches',
                description: 'Various types of pouches',
                image: 'pouches_category.png'
            });
            console.log('Created Category: Pouches');
        } else {
            console.log('Found Category: Pouches');
        }

        // 2. Check if Product Exists
        const existingProduct = await Product.findOne({ slug: 'window-pouches' });
        if (existingProduct) {
            console.log('Product already exists. Updating...');
            existingProduct.bulkPricing = [
                { minQty: 6000, price: 3.80 },
                { minQty: 10000, price: 3.60 }
            ];
            await existingProduct.save();
            console.log('Product updated');
        } else {
            // 3. Create Product
            const newProduct = await Product.create({
                name: 'Window Stand Up Pouch',
                slug: 'window-pouches',
                description: 'Premium Window Pouch packaging with customizable options.',
                category: category._id,
                price: 45, // Base price
                images: ['pouch_standup_design.png'], // Using same image for now as per request
                stock: 100000,
                isActive: true,
                bulkPricing: [
                    { minQty: 6000, price: 3.80 },
                    { minQty: 10000, price: 3.60 }
                ],
                customizationOptions: [
                    { name: 'Capacity', type: 'select', options: ['25 G', '75 G', '150 G', '200 G', '350 G'] },
                    { name: 'Finish', type: 'select', options: ['Gloss', 'Matt'] }
                ]
            });
            console.log('Created Product: Window Stand Up Pouch');
            const verify = await Product.findOne({ slug: 'window-pouches' });
            console.log('Verification:', verify ? 'Persisted' : 'FAILED TO PERSIST');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding product:', error);
        process.exit(1);
    }
};

seedWindowPouches();
