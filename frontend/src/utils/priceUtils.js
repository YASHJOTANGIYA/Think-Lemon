
export const agarbattiPricing = {
    '10-25g': { label: '25 G', weight: 4, size: '2.5" x 11"', minQty: 6000, gloss: 3.80, matt: 4.10 },
    '30-75g': { label: '75 G', weight: 5, size: '3.5" x 11"', minQty: 5000, gloss: 4.20, matt: 4.50 },
    '100-150g': { label: '150 G', weight: 7, size: '4.25" x 11"', minQty: 4000, gloss: 4.60, matt: 5.00 },
    '150-200g': { label: '200 G', weight: 8, size: '5.5" x 11"', minQty: 3000, gloss: 5.30, matt: 5.60 },
    '200-350g': { label: '350 G', weight: 10, size: '8.5" x 11"', minQty: 2000, gloss: 7.20, matt: 7.50 },
};

export const teaPouchPricing = {
    '20g': { label: '20 Gram', weight: 3, size: '2.75" x 4.25"', minQty: 16000, gloss: 2.50, matt: 2.70 },
    '50g': { label: '50 Gram', weight: 4, size: '4.25" x 5.25"', minQty: 8000, gloss: 3.00, matt: 3.30 },
    '100g': { label: '100 Gram', weight: 6, size: '5.5" x 5.5"', minQty: 6000, gloss: 3.50, matt: 3.90 },
    '200g': { label: '200 Gram', weight: 8, size: '5.5" x 8.5"', minQty: 4000, gloss: 4.60, matt: 5.10 },
    '250g': { label: '250 Gram', weight: 10, size: '8.5" x 7"', minQty: 3000, gloss: 5.60, matt: 6.00 },
    '500g': { label: '500 Gram', weight: 15, size: '7" x 10"', minQty: 2000, gloss: 7.00, matt: 7.40 },
    '1kg': { label: '1 Kg', weight: 25, size: '8.5" x 12"', minQty: 2000, gloss: 7.80, matt: 8.10 },
};

export const TEA_POUCH_SLUGS = [
    'tea-pouches', 'chocolate-pouches', 'coffee-pouches', 'dates-pouches',
    'spices-pouches', 'dry-fruits-pouches', 'energy-bar', 'cookie-pouches',
    'bakery-pouches', 'grains-pouches', 'namkeen-pouches', 'chips-pouches',
    'flour-pouches', 'pet-food-pouches', 'seed-pouches', 'skincare-cosmetics-pouches'
];

export const getPouchPricing = (slug) => {
    if (!slug) return null;
    if (slug === 'agarbatti-pouches' || slug.startsWith('agarbatti-pouch-')) {
        return agarbattiPricing;
    }
    // Check if it's one of the tea pouch types or a variant of them
    const baseSlug = TEA_POUCH_SLUGS.find(s => slug === s || slug.startsWith(s + '-'));
    if (baseSlug) {
        return teaPouchPricing;
    }
    return null;
};

export const calculateItemPrice = (item) => {
    if (!item || !item.product) return 0;

    // Check if it's a pouch product using the new helper
    const pricingConfig = getPouchPricing(item.product.slug);

    if (pricingConfig) {
        const capacity = item.customization?.['Capacity']; // e.g., "25 G"
        const finish = item.customization?.['Finish'];     // e.g., "Gloss" or "Matt"

        if (capacity && finish) {
            const pricingEntry = Object.values(pricingConfig).find(p => p.label === capacity);

            if (pricingEntry) {
                const unitPrice = finish === 'Gloss' ? pricingEntry.gloss : pricingEntry.matt;
                return unitPrice;
            }
        }
        // Fallback if customization is missing
        return item.product.price || 0;
    }

    // Default Logic (Base Price or Bulk Pricing)
    let price = item.product.price || 0;
    if (item.product.bulkPricing && item.product.bulkPricing.length > 0) {
        const bulkTier = item.product.bulkPricing.find(tier =>
            item.quantity >= tier.minQty && (!tier.maxQty || item.quantity <= tier.maxQty)
        );
        if (bulkTier) {
            price = bulkTier.price;
        }
    }
    return price;
};

export const calculateItemTotal = (item) => {
    return calculateItemPrice(item) * item.quantity;
};

// Calculate Estimated Weight in Grams
export const calculateItemWeight = (item) => {
    if (!item || !item.product) return 0;

    const pricingConfig = getPouchPricing(item.product.slug);
    if (pricingConfig) {
        const capacity = item.customization?.['Capacity'];
        if (capacity) {
            const pricingEntry = Object.values(pricingConfig).find(p => p.label === capacity);
            if (pricingEntry && pricingEntry.weight) {
                return pricingEntry.weight * item.quantity;
            }
        }
    }

    // Fallback: Assume 10g per item if unknown (empty pouch weight)
    return 10 * item.quantity;
};
