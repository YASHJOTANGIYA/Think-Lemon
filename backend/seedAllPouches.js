const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const pouchProducts = [
    { name: 'Kraft Pouches', slug: 'kraft-pouches' },
    { name: 'Zipper Pouches', slug: 'zipper-pouches' },
    { name: 'Three Side Seal', slug: 'three-side-seal' },
    { name: 'Center Seal', slug: 'center-seal' },
    { name: 'Vacuum Pouches', slug: 'vacuum-pouches' },
    { name: 'Spout Pouches', slug: 'spout-pouches' },
    { name: 'Paper Pouches', slug: 'paper-pouches' },
    { name: 'Biodegradable Pouches', slug: 'biodegradable-pouches' },
    { name: 'Recyclable Pouches', slug: 'recyclable-pouches' },
    { name: 'Oxo-degradable Pouches', slug: 'oxodegradable' },
];

const seedAllPouches = async () => {
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

        for (const pouch of pouchProducts) {
            const existingProduct = await Product.findOne({ slug: pouch.slug });
            if (existingProduct) {
                console.log(`Product ${pouch.name} already exists. Updating...`);
                // Update properties if needed, but for now we assume they might be different or we just want to ensure they exist.
                // If we want to enforce the "Tea Pouch" structure/pricing, we might need to update them.
                // For now, let's just ensure they exist with the basic structure.
                // Actually, the user wants the "same size and price page", so we should probably update them to match Tea Pouches structure if they differ.
                // But let's be careful not to overwrite if they are already customized.
                // Given the request "i want the same", I'll update them to match Tea Pouches.

                existingProduct.price = 45;
                existingProduct.bulkPricing = [
                    { minQty: 6000, price: 3.80 },
                    { minQty: 10000, price: 3.60 }
                ];
                existingProduct.customizationOptions = [
                    { name: 'Capacity', type: 'select', options: ['20 Gram', '50 Gram', '100 Gram', '200 Gram', '250 Gram', '500 Gram', '1 Kg'] },
                    { name: 'Finish', type: 'select', options: ['Gloss', 'Matt'] }
                ];
                await existingProduct.save();
                console.log(`Updated ${pouch.name}`);
            } else {
                await Product.create({
                    name: pouch.name,
                    slug: pouch.slug,
                    description: `Premium ${pouch.name} with customizable options.`,
                    category: category._id,
                    price: 45,
                    images: ['pouch_standup_design.png'], // Using placeholder
                    stock: 100000,
                    isActive: true,
                    bulkPricing: [
                        { minQty: 6000, price: 3.80 },
                        { minQty: 10000, price: 3.60 }
                    ],
                    customizationOptions: [
                        { name: 'Capacity', type: 'select', options: ['20 Gram', '50 Gram', '100 Gram', '200 Gram', '250 Gram', '500 Gram', '1 Kg'] },
                        { name: 'Finish', type: 'select', options: ['Gloss', 'Matt'] }
                    ]
                });
                console.log(`Created ${pouch.name}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedAllPouches();
