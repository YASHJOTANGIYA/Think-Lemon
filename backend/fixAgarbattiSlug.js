const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const fixSlug = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const product = await Product.findOne({ slug: 'agarbatti-stand-up-pouch' });
        if (product) {
            console.log('Found product with wrong slug:', product.slug);
            // We need to bypass the pre-save hook or ensure it doesn't trigger.
            // The hook checks isModified('name') or isNew.
            // We are NOT modifying name, so it should be fine.
            product.slug = 'agarbatti-pouches';
            await product.save();
            console.log('Updated slug to:', product.slug);
        } else {
            console.log('Product with slug "agarbatti-stand-up-pouch" not found.');
            // Check if it already has the correct slug
            const correct = await Product.findOne({ slug: 'agarbatti-pouches' });
            if (correct) {
                console.log('Product already has correct slug:', correct.slug);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error fixing slug:', error);
        process.exit(1);
    }
};

fixSlug();
