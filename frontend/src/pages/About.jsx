import React from 'react';

const About = () => {
    return (
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
            <h1>About PrintLok Studio</h1>
            <p className="lead" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
                We are a creative agency and e-commerce platform dedicated to providing high-quality custom merchandise and digital services.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
                <div style={{ padding: '2rem', background: '#f9f9f9', borderRadius: '8px' }}>
                    <h3>Our Mission</h3>
                    <p>To empower businesses and individuals with premium branding solutions.</p>
                </div>
                <div style={{ padding: '2rem', background: '#f9f9f9', borderRadius: '8px' }}>
                    <h3>Our Vision</h3>
                    <p>To be the leading provider of innovative digital and physical products.</p>
                </div>
                <div style={{ padding: '2rem', background: '#f9f9f9', borderRadius: '8px' }}>
                    <h3>Our Values</h3>
                    <p>Quality, Creativity, and Customer Satisfaction.</p>
                </div>
            </div>
        </div>
    );
};

export default About;
