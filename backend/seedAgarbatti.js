const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const seedAgarbatti = async () => {
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
        const existingProduct = await Product.findOne({ slug: 'agarbatti-pouches' });
        if (existingProduct) {
            console.log('Product already exists. Updating...');
            // Optional: Update if needed, but for now just log
            existingProduct.bulkPricing = [
                { minQty: 6000, price: 3.80 }, // Example base price
                { minQty: 10000, price: 3.60 }
            ];
            await existingProduct.save();
            console.log('Product updated');
        } else {
            // 3. Create Product
            const newProduct = await Product.create({
                name: 'Agarbatti Stand Up Pouch',
                slug: 'agarbatti-pouches',
                description: 'Premium Agarbatti packaging with customizable options.',
                category: category._id,
                price: 45, // Base price, though dynamic pricing overrides this in frontend
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
            console.log('Created Product: Agarbatti Stand Up Pouch');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding product:', error);
        process.exit(1);
    }
};

seedAgarbatti();
