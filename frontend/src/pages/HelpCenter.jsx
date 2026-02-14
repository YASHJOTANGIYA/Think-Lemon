import React, { useState } from 'react';
import './HelpCenter.css';

const HelpCenter = () => {
    const [activeQuestion, setActiveQuestion] = useState(null);

    const toggleQuestion = (index) => {
        setActiveQuestion(activeQuestion === index ? null : index);
    };

    const faqs = [
        {
            category: 'My orders',
            questions: [
                { q: 'How do I place an order?', a: 'Simply browse our products, select your desired customization options, upload your design (if applicable), and click "Add to Cart". Proceed to checkout to complete your purchase.' },
                { q: 'Can I place multiple orders for a single product?', a: 'Yes, you can add multiple configurations of the same product to your cart before checking out.' },
                { q: 'Will I get a design proof / preview before placing the order?', a: 'Yes, for most customized products, you will see a digital preview immediately after uploading your design. For bulk orders, you can request a manual proof.' },
                { q: 'Can I share multiple images / designs in an order?', a: 'Absolutely. You can upload different designs for different items in your cart.' },
                { q: 'Should I place an order only via online?', a: 'Yes, placing orders online ensures accuracy in customization and faster processing. However, for very large corporate orders, you can contact our sales team.' },
                { q: 'Do you provide Tax Invoices? How can I get my invoice after placing the order?', a: 'Yes, we provide GST invoices. You can download your invoice from the "Order History" section after your order has been shipped.' },
                { q: 'I am placing a re-order and the price seems to be higher than the previous time I ordered', a: 'Prices may fluctuate based on raw material costs or active promotions. Please check the current pricing on the product page.' },
                { q: 'How do I Re-order? Is it possible to re-order with design changes?', a: 'Go to "Order History" and click "Reorder". You can then edit the design if needed before adding it to the cart.' },
                { q: 'I have a re-order token but am not able to use it!', a: 'Please ensure the token is valid and applicable to the specific product. Contact support if the issue persists.' }
            ]
        },
        {
            category: 'Designing My product',
            questions: [
                { q: 'How do I upload my design?', a: 'On the product page, click the "Upload Design" button. You can select files from your computer or mobile device.' },
                { q: 'What file formats do you guys support?', a: 'We support JPG, PNG, PDF, and AI files. For best print quality, ensure files are at least 300 DPI.' },
                { q: 'Why is the page showing an error that my image is larger?', a: 'We have a file size limit of 50MB to ensure smooth processing. Please compress your file or contact support for assistance with large files.' },
                { q: 'Why do you show square shapes for rounded cards?', a: 'The preview might show a square canvas, but the final cut will follow the rounded die-line indicated in the design template.' },
                { q: 'Don\'t you have an option to curve the letters for stamps or rounded stamps?', a: 'Currently, our online editor supports standard text alignment. For curved text, we recommend uploading a pre-designed image.' },
                { q: 'Why do you have standard color options for all products and not specific for each product?', a: 'Standard colors ensure consistency and faster production. For custom Pantone matching, please contact our bulk order team.' },
                { q: 'Why are there no design templates for many products?', a: 'We are constantly adding new templates! If you don\'t see one for your product, you can upload your own complete design.' },
                { q: 'I have designed and placed the order but the design is not seen on my order page.', a: 'Sometimes the preview generation takes a moment. If you received an order confirmation, your design file has been safely received.' },
                { q: 'Where do I find my digital proof? How do I approve it?', a: 'Digital proofs are usually shown before adding to cart. If a manual proof was requested, it will be emailed to you for approval.' }
            ]
        },
        {
            category: 'Products',
            questions: [
                { q: 'What if I can\'t find the product I\'m looking for?', a: 'Try using the search bar or browsing by category. If you still can\'t find it, contact us—we might be able to custom make it for you!' }
            ]
        },
        {
            category: 'Delivery and Shipment',
            questions: [
                { q: 'How do I track my order?', a: 'Visit the "Track Order" page and enter your Order ID. You will also receive SMS and email updates.' },
                { q: 'What are the shipping charges?', a: 'Shipping is free for orders above ₹500. A nominal fee of ₹50 applies for smaller orders.' },
                { q: 'Do you offer express delivery?', a: 'Yes, we offer "Next Day Delivery" for select pin codes and products. Check availability on the product page.' }
            ]
        }
    ];

    return (
        <div className="help-center-container">
            <div className="container">
                <h1 className="help-page-title">Help Center</h1>

                <div className="help-contact-grid">
                    <div className="help-contact-card">
                        <div className="help-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <h3>Call us for Queries</h3>
                        <p className="contact-detail">Helpdesk: +91 98765 43210</p>
                        <p className="contact-sub">(Mon - Sat: 10:00 AM - 7:00 PM)</p>
                    </div>

                    <div className="help-contact-card">
                        <div className="help-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </div>
                        <h3>E-Mail us</h3>
                        <p className="contact-detail">Sales enquiries and customer support:</p>
                        <p className="contact-email">support@thinklemon.in</p>
                    </div>

                    <div className="help-contact-card">
                        <div className="help-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </div>
                        <h3>Postal address</h3>
                        <p className="contact-detail">Think Lemon Printing Services Pvt. Ltd.</p>
                        <p className="contact-sub">123, Print Street, Tech Park, Bangalore, Karnataka 560001</p>
                    </div>
                </div>

                <div className="faq-section-wrapper">
                    <h2 className="faq-main-title">FAQs</h2>

                    {faqs.map((category, catIndex) => (
                        <div key={catIndex} className="faq-category-group">
                            <h3 className="faq-category-title">{category.category}</h3>
                            <div className="faq-questions-grid">
                                {category.questions.map((item, qIndex) => {
                                    const uniqueIndex = `${catIndex}-${qIndex}`;
                                    const isActive = activeQuestion === uniqueIndex;
                                    return (
                                        <div
                                            key={qIndex}
                                            className={`faq-item-card ${isActive ? 'active' : ''}`}
                                            onClick={() => toggleQuestion(uniqueIndex)}
                                        >
                                            <div className="faq-question-header">
                                                <span className="q-text">{item.q}</span>
                                                <span className="q-icon">{isActive ? '−' : '+'}</span>
                                            </div>
                                            <div className={`faq-answer-content ${isActive ? 'open' : ''}`}>
                                                <p>{item.a}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
