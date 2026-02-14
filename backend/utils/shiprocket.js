const axios = require('axios');

let token = null;
let tokenExpiry = null;

const getShiprocketToken = async () => {
    // If token exists and is valid (heuristic: < 9 days old, they last 10 days), reuse it.
    // For simplicity, we'll just check if it exists. Ideally check expiry.
    if (token) return token;

    try {
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD
        });
        token = response.data.token;
        return token;
    } catch (error) {
        console.error('Shiprocket Login Error:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with Shiprocket');
    }
};

const createShiprocketOrder = async (order, customWeight) => {
    const authToken = await getShiprocketToken();

    // Transform our Order model to Shiprocket structure
    // Note: Dimensions and weight need to be estimated or stored on product. 
    // Defaults: 0.5kg, 10x10x10cm if not available.

    const orderItems = order.items.map(item => ({
        name: item.name,
        sku: item.product._id,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 0 // Optional but good to have
    }));

    const payload = {
        order_id: order.orderNumber,
        order_date: new Date(order.createdAt).toISOString().split('T')[0] + ' ' + new Date(order.createdAt).toTimeString().split(' ')[0],
        pickup_location: "Home", // updated automatically based on API check
        billing_customer_name: order.shippingAddress.name.split(' ')[0],
        billing_last_name: order.shippingAddress.name.split(' ').slice(1).join(' ') || "",
        billing_address: order.shippingAddress.street,
        billing_city: order.shippingAddress.city,
        billing_pincode: order.shippingAddress.pincode,
        billing_state: order.shippingAddress.state,
        billing_country: "India",
        billing_email: order.user.email, // We need to populate user or pass email
        billing_phone: order.shippingAddress.phone,
        shipping_is_billing: true,
        order_items: orderItems,
        payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
        sub_total: order.subtotal,
        length: 10, // Placeholder
        breadth: 10, // Placeholder
        height: 10, // Placeholder
        weight: customWeight || 0.5 // Use custom weight or default placeholder (kg)
    };

    try {
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', payload, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        return response.data;
    } catch (error) {
        console.error('Shiprocket Create Order Error:', error.response?.data || error.message);
        throw new Error('Failed to create order in Shiprocket');
    }
};

module.exports = { createShiprocketOrder };
