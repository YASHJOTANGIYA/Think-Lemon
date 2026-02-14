const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const newPouchProducts = [
    { name: 'Chips Pouches', slug: 'chips-pouches' },
    { name: 'Flour Pouches', slug: 'flour-pouches' },
    { name: 'Pet Food Pouches', slug: 'pet-food-pouches' },
    { name: 'Seed Pouches', slug: 'seed-pouches' },
    { name: 'Skincare and Cosmetics Pouches', slug: 'skincare-cosmetics-pouches' },
];

const seedNewPouches = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

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

        for (const pouch of newPouchProducts) {
            const existingProduct = await Product.findOne({ slug: pouch.slug });
            if (existingProduct) {
                console.log(`Product ${pouch.name} already exists. Updating...`);
                // Update to ensure consistency if needed
                existingProduct.category = category._id;
                await existingProduct.save();
            } else {
                await Product.create({
                    name: pouch.name,
                    slug: pouch.slug,
                    description: `Premium ${pouch.name} with customizable options.`,
                    category: category._id,
                    price: 45,
                    images: ['pouch_standup_design.png'],
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

        console.log('Seeding completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedNewPouches();
