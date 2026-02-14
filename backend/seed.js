const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await Category.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});
        console.log('Cleared existing data');

        const cat1 = await Category.create({ name: 'Business Cards', slug: 'business-cards', description: 'Professional business cards', icon: '💼', displayOrder: 1 });
        const cat2 = await Category.create({ name: 'Banners', slug: 'banners', description: 'Large format printing', icon: '🎯', displayOrder: 2 });
        const cat3 = await Category.create({ name: 'Stationery', slug: 'stationery', description: 'Office stationery', icon: '📝', displayOrder: 3 });
        const cat4 = await Category.create({ name: 'Brochures', slug: 'brochures', description: 'Marketing materials', icon: '📄', displayOrder: 4 });
        const cat5 = await Category.create({ name: 'Packaging', slug: 'packaging', description: 'Custom packaging', icon: '📦', displayOrder: 5 });
        const cat6 = await Category.create({ name: 'Photo Prints', slug: 'photo-prints', description: 'Photo printing', icon: '📸', displayOrder: 6 });

        console.log('Inserted 6 categories');

        await Product.create({
            name: 'Premium Business Cards',
            slug: 'premium-business-cards',
            description: 'Make a lasting impression with our Premium Business Cards. Choose from a variety of high-quality papers and finishes to create a card that truly represents your brand.',
            category: cat1._id,
            price: 299,
            comparePrice: 499,
            stock: 1000,
            isFeatured: true,
            tags: ['business', 'cards', 'premium'],
            deliveryTime: '3-4 business days',
            images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80'],
            customizationOptions: [
                {
                    name: 'Paper Type',
                    type: 'select',
                    options: ['Standard Matte (300gsm)', 'Premium Glossy (350gsm)', 'Textured White (300gsm)', 'Recycled Kraft (280gsm)'],
                    required: true
                },
                {
                    name: 'Finish',
                    type: 'select',
                    options: ['None', 'Matte Lamination', 'Glossy Lamination', 'Velvet Soft Touch'],
                    required: true
                },
                {
                    name: 'Corners',
                    type: 'select',
                    options: ['Standard Square', 'Rounded Corners'],
                    required: true
                }
            ],
            bulkPricing: [
                { minQty: 100, maxQty: 249, price: 2.50 },
                { minQty: 250, maxQty: 499, price: 2.00 },
                { minQty: 500, maxQty: 999, price: 1.50 },
                { minQty: 1000, price: 1.20 }
            ]
        });

        await Product.create({
            name: 'Standard Business Cards',
            slug: 'standard-business-cards',
            description: 'Clean, polished, and versatile – perfect for everyday business interactions.',
            category: cat1._id,
            price: 2.15,
            stock: 10000,
            isFeatured: true,
            tags: ['business', 'cards', 'standard'],
            deliveryTime: '3-4 business days',
            images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80'], // Placeholder
            customizationOptions: [
                {
                    name: 'Materials',
                    type: 'select',
                    options: ['Lykam Matte Coated Paper', 'Glossy Coated Paper'],
                    required: true
                },
                {
                    name: 'Lamination',
                    type: 'select',
                    options: ['No Lamination', 'Matte Lamination', 'Glossy Lamination'],
                    required: true
                },
                {
                    name: 'Orientation',
                    type: 'select',
                    options: ['Landscape', 'Portrait'],
                    required: true
                }
            ],
            bulkPricing: [
                { minQty: 100, price: 2.15 },
                { minQty: 200, price: 1.95 },
                { minQty: 500, price: 1.75 }
            ]
        });

        await Product.create({
            name: 'Matte Business Cards',
            slug: 'matte-business-cards',
            description: 'Smooth, non-reflective finish for a modern look',
            category: cat1._id,
            price: 249,
            comparePrice: 399,
            stock: 1000,
            isFeatured: true,
            tags: ['business', 'cards', 'matte'],
            deliveryTime: '3-4 business days'
        });

        await Product.create({
            name: 'Glossy Business Cards',
            slug: 'glossy-business-cards',
            description: 'Shiny finish that makes colors pop',
            category: cat1._id,
            price: 249,
            comparePrice: 399,
            stock: 1000,
            isFeatured: true,
            tags: ['business', 'cards', 'glossy'],
            deliveryTime: '3-4 business days'
        });

        await Product.create({
            name: 'Vinyl Banner',
            slug: 'vinyl-banner',
            description: 'Durable outdoor vinyl banners',
            category: cat2._id,
            price: 899,
            comparePrice: 1299,
            stock: 500,
            isFeatured: true,
            tags: ['banner', 'outdoor'],
            deliveryTime: '2-3 business days'
        });

        await Product.create({
            name: 'Letterhead Printing',
            slug: 'letterhead-printing',
            description: 'Professional letterheads',
            category: cat3._id,
            price: 499,
            stock: 800,
            isFeatured: true,
            tags: ['letterhead', 'stationery'],
            deliveryTime: '3-4 business days'
        });

        await Product.create({
            name: 'Tri-Fold Brochure',
            slug: 'tri-fold-brochure',
            description: 'Eye-catching tri-fold brochures',
            category: cat4._id,
            price: 599,
            stock: 600,
            isFeatured: true,
            tags: ['brochure', 'marketing'],
            deliveryTime: '4-5 business days'
        });

        await Product.create({
            name: 'Half Fold Brochure',
            slug: 'custom-brochures',
            description: 'Say more with less effort – let our Half Fold Brochure do the talking for you, with Professionalism and Sophistication.',
            category: cat4._id,
            price: 259.09,
            stock: 5000,
            isFeatured: true,
            tags: ['brochure', 'marketing', 'custom'],
            deliveryTime: '3-5 business days',
            images: ['https://images.unsplash.com/photo-1596276203592-34354271811f?q=80&w=800&auto=format&fit=crop'],
            customizationOptions: [
                {
                    name: 'Paper Type',
                    type: 'select',
                    options: ['Standard Papers', 'Premium Papers'],
                    required: true
                },
                {
                    name: 'Brochure Size',
                    type: 'select',
                    options: ['A4', 'A5', 'DL'],
                    required: true
                },
                {
                    name: 'Material',
                    type: 'select',
                    options: ['170gsm Glossy Coated Paper', '130gsm Matte Coated Paper', '300gsm Art Card'],
                    required: true
                }
            ],
            bulkPricing: [
                { minQty: 5, maxQty: 24, price: 51.82 },
                { minQty: 25, maxQty: 49, price: 45.00 },
                { minQty: 50, maxQty: 99, price: 40.00 },
                { minQty: 100, price: 35.00 }
            ]
        });

        await Product.create({
            name: 'Custom Packaging Box',
            slug: 'custom-packaging-box',
            description: 'Custom printed packaging boxes',
            category: cat5._id,
            price: 1299,
            stock: 300,
            isFeatured: false,
            tags: ['packaging', 'box'],
            deliveryTime: '5-7 business days'
        });

        await Product.create({
            name: 'Photo Prints',
            slug: 'photo-prints',
            description: 'High-quality photo prints',
            category: cat6._id,
            price: 199,
            stock: 1000,
            isFeatured: true,
            tags: ['photo', 'prints'],
            deliveryTime: '2-3 business days'
        });

        await Product.create({
            name: 'Think Lemon Sample Kit',
            slug: 'sample-kit',
            description: 'Experience our quality firsthand. Includes samples of business cards, flyers, stickers, and more. Fully refundable on your next order!',
            category: cat1._id,
            price: 99,
            comparePrice: 299,
            stock: 5000,
            isFeatured: false,
            tags: ['sample', 'kit'],
            deliveryTime: '2-3 business days',
            images: ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80']
        });

        // Letterheads Category
        const catLetterhead = await Category.create({ name: 'Letterheads', slug: 'letterheads', description: 'Official business letterheads', icon: '📝', displayOrder: 7 });

        await Product.create({
            name: 'Custom Letterheads',
            slug: 'custom-letterheads',
            description: '3 paper types available',
            category: catLetterhead._id,
            price: 19,
            stock: 1000,
            isFeatured: true,
            tags: ['letterhead', 'office'],
            deliveryTime: '3-4 business days',
            images: ['https://images.unsplash.com/photo-1586075010923-2dd45eeed8bd?w=800&q=80']
        });

        await Product.create({
            name: 'Prescription Note Pad',
            slug: 'prescription-note-pad',
            description: 'Size - A4 (8.3 x 11.7 in)',
            category: catLetterhead._id,
            price: 195,
            stock: 500,
            isFeatured: true,
            tags: ['notepad', 'medical'],
            deliveryTime: '3-4 business days',
            images: ['https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80']
        });

        // Envelopes Category
        const catEnvelopes = await Category.create({ name: 'Envelopes', slug: 'envelopes', description: 'Custom printed envelopes', icon: '✉️', displayOrder: 8 });

        await Product.create({
            name: 'Custom Printed Envelopes',
            slug: 'custom-printed-envelopes',
            description: 'Cater to your business needs with Personalised business envelopes.',
            category: catEnvelopes._id,
            price: 526,
            stock: 5000,
            isFeatured: true,
            tags: ['envelopes', 'office', 'custom'],
            deliveryTime: '3-5 business days',
            images: ['https://images.unsplash.com/photo-1596276203592-34354271811f?q=80&w=800&auto=format&fit=crop'],
            customizationOptions: [
                {
                    name: 'Size',
                    type: 'select',
                    options: ['#10', '#9', 'A4', 'C5'],
                    required: true
                },
                {
                    name: 'Paper Type',
                    type: 'select',
                    options: ['90 gsm Smooth Paper', '100 gsm Bond Paper', '120 gsm Texture Paper'],
                    required: true
                }
            ],
            bulkPricing: [
                { minQty: 25, maxQty: 49, price: 21 },
                { minQty: 50, maxQty: 99, price: 18 },
                { minQty: 100, maxQty: 499, price: 15 },
                { minQty: 500, price: 12 }
            ]
        });

        await Product.create({
            name: 'A5 Envelope',
            slug: 'a5-envelope',
            description: 'Standard A5 envelopes',
            category: catEnvelopes._id,
            price: 299,
            stock: 1000,
            isFeatured: false,
            tags: ['envelopes', 'a5'],
            deliveryTime: '2-3 business days',
            images: ['https://images.unsplash.com/photo-1623941002362-2d1265872658?q=80&w=800&auto=format&fit=crop']
        });

        await Product.create({
            name: 'A6 Envelope',
            slug: 'a6-envelope',
            description: 'Compact A6 envelopes',
            category: catEnvelopes._id,
            price: 249,
            stock: 1000,
            isFeatured: false,
            tags: ['envelopes', 'a6'],
            deliveryTime: '2-3 business days',
            images: ['https://images.unsplash.com/photo-1586075010923-2dd45eeed8bd?q=80&w=800&auto=format&fit=crop']
        });

        await Product.create({
            name: 'Eco-Friendly Shipping Envelopes',
            slug: 'eco-friendly-shipping-envelopes',
            description: 'Sustainable shipping solutions',
            category: catEnvelopes._id,
            price: 399,
            stock: 2000,
            isFeatured: true,
            tags: ['envelopes', 'eco', 'shipping'],
            deliveryTime: '3-4 business days',
            images: ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop']
        });

        console.log('Inserted products');

        await User.create({
            name: 'Admin',
            email: 'admin@thinklemon.com',
            password: 'admin123',
            phone: '+91 1234567890',
            role: 'admin'
        });

        console.log('Created admin user');
        console.log('\nDatabase seeded successfully!');
        console.log('\nAdmin Login:');
        console.log('Email: admin@thinklemon.com');
        console.log('Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

seedDatabase();
