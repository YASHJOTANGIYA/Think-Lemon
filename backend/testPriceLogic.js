const { calculateItemPrice } = require('./utils/priceUtils');

const dummyProduct = {
    slug: 'agarbatti-pouches',
    price: 1, // Base price
    bulkPricing: []
};

const dummyItem = {
    product: dummyProduct,
    quantity: 3000,
    customization: {
        'Capacity': '25 G',
        'Finish': 'Gloss'
    }
};

try {
    console.log('Testing calculateItemPrice...');
    const price = calculateItemPrice(dummyItem);
    console.log('Result Price:', price);

    if (price === 3.80) { // Based on agarbattiPricing for 25G Gloss
        console.log('SUCCESS: Price calculation is correct.');
    } else {
        console.log('FAILURE: Price is incorrect.');
    }
} catch (error) {
    console.error('CRASH: calculateItemPrice threw an error:', error);
}
