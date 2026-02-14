const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const checkProduct = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const product = await Product.findOne({ slug: 'window-pouches' });
        if (product) {
            console.log('Product found:', product.name);
            console.log('Slug:', product.slug);
            console.log('ID:', product._id);
        } else {
            console.log('Product NOT found');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkProduct();
