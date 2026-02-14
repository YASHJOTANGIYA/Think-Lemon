const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const seedTeaPouches = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Find Category
        let category = await Category.findOne({ slug: 'pouches' });
        if (!category) {
            console.log('Category Pouches not found, creating...');
            category = await Category.create({
                name: 'Pouches',
                slug: 'pouches',
                description: 'Various types of pouches',
                image: 'pouches_category.png'
            });
        }

        // 2. Create Product
        const newProduct = await Product.create({
            name: 'Tea Pouches',
            slug: 'tea-pouches',
            description: 'Premium Tea Pouch packaging with customizable options.',
            category: category._id,
            price: 45, // Base price
            images: ['pouch_standup_design.png'],
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
        console.log('Created Product: Tea Pouches');

        const verify = await Product.findOne({ slug: 'tea-pouches' });
        console.log('Verification:', verify ? 'Persisted' : 'FAILED TO PERSIST');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding product:', error);
        process.exit(1);
    }
};

seedTeaPouches();
