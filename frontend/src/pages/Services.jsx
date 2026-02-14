import React from 'react';

const Services = () => {
    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Digital Services</h1>
            <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem', color: '#666' }}>
                From branding to web presence, we offer a range of digital services to help your business grow.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {['Graphic Design', 'Web Development', 'Social Media Management', 'Content Creation', 'SEO Optimization', 'Brand Strategy'].map((service, index) => (
                    <div key={index} style={{
                        padding: '2rem',
                        border: '1px solid #eee',
                        borderRadius: '10px',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <h3 style={{ color: '#333' }}>{service}</h3>
                        <p style={{ color: '#777', marginTop: '0.5rem' }}>Professional {service.toLowerCase()} services tailored to your needs.</p>
                        <button style={{
                            marginTop: '1rem',
                            background: 'none',
                            border: 'none',
                            color: '#e65100',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: 0
                        }}>Learn More →</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Services;
