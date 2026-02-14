const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const replaceVacuumWithDryFruits = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Delete Vacuum Pouches
        const deleteResult = await Product.deleteOne({ slug: 'vacuum-pouches' });
        console.log('Deleted Vacuum Pouches count:', deleteResult.deletedCount);

        // 2. Create Dry Fruits Pouches
        const category = await Category.findOne({ slug: 'pouches' });
        if (!category) {
            console.error('Category Pouches not found!');
            process.exit(1);
        }

        const newProduct = await Product.create({
            name: 'Dry Fruits Pouches',
            slug: 'dry-fruits-pouches',
            description: 'Premium Dry Fruits Pouch packaging with customizable options.',
            category: category._id,
            price: 45,
            images: ['pouch_flat_design.png'], // Using the same image as Vacuum was using
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
        console.log('Created Product: Dry Fruits Pouches');

        const verify = await Product.findOne({ slug: 'dry-fruits-pouches' });
        console.log('Verification:', verify ? 'Persisted' : 'FAILED TO PERSIST');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

replaceVacuumWithDryFruits();
