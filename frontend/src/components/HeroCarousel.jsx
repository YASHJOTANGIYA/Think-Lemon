import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeroCarousel.css';

import printingHero from '../assets/printing_hero.png';
import businessPrintingHero from '../assets/business_printing_hero.png';
import corporateGiftingHero from '../assets/corporate_gifting_hero.png';

const HeroCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 1,
            image: businessPrintingHero,
            title: "Premium Business Printing",
            subtitle: "High-quality business cards, brochures, and flyers delivered fast.",
            ctaText: "Explore Business",
            ctaLink: "/business-solutions",
            align: "left"
        },
        {
            id: 2,
            image: corporateGiftingHero,
            title: "Custom Corporate Gifting",
            subtitle: "Personalized gifts that make a lasting impression on your clients.",
            ctaText: "Shop Gifts",
            ctaLink: "/products?category=gifts",
            align: "center"
        },
        {
            id: 3,
            image: printingHero,
            title: "Think Lemon Express",
            subtitle: "Need it yesterday? Get 24-hour delivery on select items.",
            ctaText: "Order Now",
            ctaLink: "/products",
            align: "right"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    return (
        <div className="hero-carousel">
            <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {slides.map((slide) => (
                    <div key={slide.id} className="carousel-slide">
                        <div className="slide-image" style={{ backgroundImage: `url(${slide.image})` }}>
                            <div className="slide-overlay"></div>
                        </div>
                        <div className={`slide-content align-${slide.align}`}>
                            <div className="container">
                                <h1 className="slide-title">{slide.title}</h1>
                                <p className="slide-subtitle">{slide.subtitle}</p>
                                <Link to={slide.ctaLink} className="btn btn-primary btn-lg slide-btn">
                                    {slide.ctaText}
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="carousel-arrow prev" onClick={prevSlide}>❮</button>
            <button className="carousel-arrow next" onClick={nextSlide}>❯</button>

            <div className="carousel-dots">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`dot ${currentSlide === index ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
