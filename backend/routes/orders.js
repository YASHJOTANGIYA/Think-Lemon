const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const { calculateItemPrice, calculateItemWeight } = require('../utils/priceUtils');
const fs = require('fs');



router.post('/', protect, async (req, res) => {
    try {
        console.log('Received order request:', JSON.stringify(req.body, null, 2));
        const { items, shippingAddress, paymentMethod, notes, paymentInfo, paidAmount, remainingAmount, paymentStatus } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items in order' });
        }

        let subtotal = 0;
        let totalWeight = 0;
        const orderItems = [];

        // Fetch product details for each item to ensure valid prices and names
        for (const item of items) {
            console.log(`Processing item: ${item.product}`);
            const product = await Product.findById(item.product);
            if (!product) {
                console.error(`Product not found: ${item.product}`);
                return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
            }

            // Calculate price using shared utility logic (handles pouch variants + bulk pricing)
            let price = 0;
            try {
                // Log inputs for debugging
                console.log(`Calculating price for product: ${product.slug}, Quantity: ${item.quantity}, Customization:`, item.customization);

                price = calculateItemPrice({
                    product: product,
                    quantity: item.quantity,
                    customization: item.customization
                });
                console.log(`Calculated unit price: ${price}`);
            } catch (calcError) {
                console.error('Error calculating item price:', calcError);
                price = product.price || 0; // Fallback to base price
            }

            // Ensure price is a valid number
            if (isNaN(price)) {
                console.error(`Price calculation resulted in NaN for product: ${product.slug}`);
                price = product.price || 0;
            }

            // Calculate Weight
            try {
                const itemWeight = calculateItemWeight({
                    product: product,
                    quantity: item.quantity,
                    customization: item.customization
                });
                totalWeight += itemWeight;
                console.log(`Item Weight: ${itemWeight}g, Total Weight so far: ${totalWeight}g`);
            } catch (weightError) {
                console.error('Error calculating item weight:', weightError);
                totalWeight += (0.5 * item.quantity * 1000); // Fallback 500g
            }

            const itemTotal = price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: price,
                quantity: item.quantity,
                customization: item.customization || {},
                uploadedFiles: item.uploadedFiles || []
            });
        }

        const shippingCost = Math.max(50, Math.ceil(totalWeight / 500) * 34);
        const tax = Math.round(subtotal * 0.18);
        const total = subtotal + shippingCost + tax;

        console.log('Calculated totals:', { subtotal, shippingCost, tax, total });

        const orderData = {
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            paymentInfo,
            subtotal,
            shippingCost,
            tax,
            total,
            paidAmount: paidAmount || 0,
            remainingAmount: remainingAmount || 0,
            paymentStatus: paymentStatus || 'pending',
            notes,
            statusHistory: [{ status: 'pending', note: 'Order placed' }]
        };

        console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

        const order = await Order.create(orderData);

        console.log('Order created successfully:', order._id);

        await Cart.findOneAndDelete({ user: req.user._id });

        // Send order confirmation email
        try {
            await sendEmail({
                email: req.user.email,
                subject: `Order Confirmation - #${order.orderNumber}`,
                message: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #FF6B35;">Thank you for your order!</h1>
                        <p>Hi ${req.user.name},</p>
                        <p>Your order <strong>#${order.orderNumber}</strong> has been placed successfully.</p>
                        
                        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                            <h3 style="margin-top: 0; color: #1f2937;">Payment Summary</h3>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                                <span><strong>Total Order Value:</strong></span>
                                <span>₹${total}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #10b981;">
                                <span><strong>Received Advance (75%):</strong></span>
                                <span>₹${paidAmount || 0}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; color: #d97706; font-size: 1.1em; font-weight: bold; padding-top: 10px; border-top: 1px dashed #d1d5db;">
                                <span>Balance Amount (Due Later):</span>
                                <span>₹${remainingAmount || 0}</span>
                            </div>
                        </div>

                        <div style="background-color: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; margin-bottom: 20px; color: #92400e;">
                            <strong>Note:</strong> When your order is ready, we will email you to pay the remaining amount before shipping.
                        </div>

                        <p>We will notify you soon with updates.</p>
                        <br>
                        <p>View your order details <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track-order/${order.orderNumber}" style="color: #FF6B35; text-decoration: none; font-weight: bold;">here</a>.</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Error sending order confirmation email:', emailError);
            try {
                fs.appendFileSync('email_errors.log', `${new Date().toISOString()} - Error: ${emailError.message}\nStack: ${emailError.stack}\n`);
            } catch (logErr) {
                console.error('Could not write to log file', logErr);
            }
        }

        res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
    } catch (error) {
        console.error('Order creation error details:', error);
        res.status(500).json({ success: false, message: `Error creating order: ${error.message}`, error: error.message });
    }
});

router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('items.product', 'name images').sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
    }
});

router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product', 'name images slug').populate('user', 'name email phone');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
        }
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching order', error: error.message });
    }
});

router.get('/track/:orderNumber', async (req, res) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber }).select('orderNumber orderStatus statusHistory trackingNumber awbCode shipmentId createdAt');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error tracking order', error: error.message });
    }
});

router.get('/admin/all', protect, adminOnly, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let query = {};
        if (status) query.orderStatus = status;

        const orders = await Order.find(query).populate('user', 'name email phone').populate('items.product', 'name').sort({ createdAt: -1 }).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit));
        const total = await Order.countDocuments(query);

        res.json({ success: true, data: orders, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
    }
});

router.put('/:id/status', protect, adminOnly, async (req, res) => {
    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id).populate('user', 'email name');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        order.orderStatus = status;
        order.statusHistory.push({ status, note });
        await order.save();

        // Send email if status is updated to 'ready'
        if (status === 'ready') {
            try {
                const message = `
                    <h1>Good News! Your Order is Ready</h1>
                    <p>Hi ${order.user.name},</p>
                    <p>Your order <strong>#${order.orderNumber}</strong> has been marked as <strong>Ready</strong>.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
                        <p><strong>Order Summary:</strong></p>
                        <p>Total Amount: ₹${order.total}</p>
                        <p>Paid Amount: ₹${order.paidAmount}</p>
                        <p style="font-size: 1.1em; color: ${order.remainingAmount > 0 ? '#d97706' : 'green'};">
                            <strong>To Pay (Balance): ₹${order.remainingAmount}</strong>
                        </p>
                    </div>

                    ${order.remainingAmount > 0 ? `
                    <p style="color: #d97706; font-weight: bold;">
                        Please log in to your dashboard to pay the remaining balance so we can ship your order.
                    </p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" style="display: inline-block; background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                        Pay Balance Now
                    </a>
                    ` : `
                    <p>Your order is fully paid and will be shipped shortly.</p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track-order/${order.orderNumber}" style="display: inline-block; background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                        Track Order
                    </a>
                    `}
                    
                    <p>Thank you for choosing PrintLok Studio!</p>
                `;

                await sendEmail({
                    email: order.user.email,
                    subject: `Update: Order #${order.orderNumber} is Ready!`,
                    message
                });
                console.log(`Ready status email sent for order ${order.orderNumber}`);
            } catch (emailError) {
                console.error('Error sending ready status email:', emailError);
            }
        }

        res.json({ success: true, message: 'Order status updated', data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating order status', error: error.message });
    }
});


router.put('/:id/pay-balance', protect, async (req, res) => {
    try {
        const { paymentInfo } = req.body;
        // Populate user to get email for notification
        const order = await Order.findById(req.params.id).populate('user', 'email name');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check ownership (handle populated user object)
        if (order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (order.remainingAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Order is already fully paid' });
        }

        // Capture payment details
        const previousRemaining = order.remainingAmount;

        // Update payment details
        order.paidAmount = order.total;
        order.remainingAmount = 0;
        order.paymentStatus = 'paid';
        order.paymentInfo = { ...order.paymentInfo, ...paymentInfo };

        // Add status history
        order.statusHistory.push({
            status: order.orderStatus,
            note: 'Balance payment received - Order Fully Paid',
            timestamp: Date.now()
        });

        await order.save();

        // Send 'Fully Paid' Confirmation Email
        try {
            const message = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                     <div style="background-color: #059669; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: white; margin: 0;">Payment Complete!</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                        <p style="font-size: 1.1em;">Hi ${order.user.name},</p>
                        <p>Thank you! We have received your balance payment of <strong>₹${previousRemaining}</strong>.</p>
                        
                        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; margin: 20px 0; border-radius: 6px; color: #065f46;">
                            <strong>✓ Your order is now fully paid.</strong>
                        </div>

                        <p>We are now getting your order <strong>#${order.orderNumber}</strong> ready for shipping. You will receive a tracking number as soon as it is dispatched.</p>
                        
                        <p style="margin-top: 30px;">Thank you for choosing PrintLok Studio!</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <small style="color: #666;">View your order details <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track-order/${order.orderNumber}">here</a>.</small>
                    </div>
                </div>
            `;

            await sendEmail({
                email: order.user.email,
                subject: `Payment Received - Order #${order.orderNumber} is Ready to Ship`,
                message
            });
            console.log(`Balance payment confirmation email sent to ${order.user.email}`);
        } catch (emailError) {
            console.error('Error sending balance payment email:', emailError);
            // Log error but don't fail the request
        }

        res.json({ success: true, message: 'Balance paid successfully', data: order });
    } catch (error) {
        console.error('Error paying balance:', error);
        res.status(500).json({ success: false, message: 'Error processing balance payment', error: error.message });
    }
});


const { createShiprocketOrder } = require('../utils/shiprocket');

router.post('/:id/ship', protect, adminOnly, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'name price')
            .populate('user', 'email name');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.shiprocketOrderId) {
            return res.status(400).json({ success: false, message: 'Order already shipped via Shiprocket' });
        }

        // Check if order is marked as 'Ready'
        if (order.orderStatus !== 'ready') {
            return res.status(400).json({ success: false, message: 'Order must be marked as "Ready" before shipping.' });
        }

        // Check if balance payment is pending
        if (order.remainingAmount > 0) {
            return res.status(400).json({ success: false, message: `Cannot ship! Pending balance payment of ₹${order.remainingAmount}.` });
        }

        const { weight } = req.body;

        // Call Shiprocket Utility
        const shiprocketResponse = await createShiprocketOrder(order, weight);

        // Update Order with Shiprocket details
        order.shiprocketOrderId = shiprocketResponse.order_id;
        order.shipmentId = shiprocketResponse.shipment_id;
        order.awbCode = shiprocketResponse.awb_code;

        // Update status to 'shipped' (Out for Delivery)
        order.orderStatus = 'shipped';
        order.statusHistory.push({
            status: 'shipped',
            note: `Handed to Courier. SR Order ID: ${shiprocketResponse.order_id}`,
            timestamp: Date.now()
        });

        await order.save();

        res.json({ success: true, message: 'Order pushed to Shiprocket successfully', data: shiprocketResponse });
    } catch (error) {
        console.error('Shiprocket Integration Error:', error);
        res.status(500).json({ success: false, message: 'Failed to push order to Shiprocket', error: error.message });
    }
});

module.exports = router;
