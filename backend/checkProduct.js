const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const checkProduct = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const product = await Product.findOne({ slug: 'chocolate-pouches-250g' });
        if (product) {
            console.log('Product found:', product.name);
            console.log('Slug:', product.slug);
            console.log('ID:', product._id);
            console.log(JSON.stringify(product, null, 2));
        } else {
            console.log('Product NOT found');
            const partial = await Product.findOne({ slug: 'chocolate-pouches' });
            if (partial) {
                console.log('Found chocolate-pouches instead:');
                console.log(JSON.stringify(partial, null, 2));
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkProduct();
