import React, { useState } from 'react';
import './FAQSection.css';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`faq-item ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
            <div className="faq-question">
                {question}
                <span className="faq-icon">{isOpen ? '−' : '+'}</span>
            </div>
            <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                <p>{answer}</p>
            </div>
        </div>
    );
};

const FAQSection = ({ faqs }) => {
    if (!faqs || faqs.length === 0) return null;

    // Split FAQs into two columns
    const midPoint = Math.ceil(faqs.length / 2);
    const leftColumnFaqs = faqs.slice(0, midPoint);
    const rightColumnFaqs = faqs.slice(midPoint);

    return (
        <div className="faq-section">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="faq-grid">
                <div className="faq-column">
                    {leftColumnFaqs.map((faq, index) => (
                        <FAQItem key={`left-${index}`} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
                <div className="faq-column">
                    {rightColumnFaqs.map((faq, index) => (
                        <FAQItem key={`right-${index}`} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQSection;
