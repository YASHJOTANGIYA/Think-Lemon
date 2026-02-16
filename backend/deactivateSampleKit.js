const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const deactivateSampleKit = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find and deactivate the Think Lemon Sample Kit
        const result = await Product.updateMany(
            {
                $or: [
                    { name: { $regex: 'Think Lemon Sample Kit', $options: 'i' } },
                    { slug: 'think-lemon-sample-kit' }
                ]
            },
            {
                $set: { isActive: false }
            }
        );

        console.log(`✅ Deactivated ${result.modifiedCount} product(s)`);

        // Show the deactivated product
        const deactivated = await Product.find({
            $or: [
                { name: { $regex: 'Think Lemon Sample Kit', $options: 'i' } },
                { slug: 'think-lemon-sample-kit' }
            ]
        });

        console.log('\nDeactivated products:');
        deactivated.forEach(p => {
            console.log(`- ${p.name} (${p.slug}) - isActive: ${p.isActive}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

deactivateSampleKit();
