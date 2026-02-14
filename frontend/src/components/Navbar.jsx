import logoImg from '../assets/logo.jpg';

// ... (existing imports)

return (
    <nav className="navbar">
        <div className="container navbar-content">
            <Link to="/" className="navbar-logo">
                <img src={logoImg} alt="Think Lemon Logo" className="logo-image" style={{ width: '32px', height: '32px', objectFit: 'contain', marginRight: '8px' }} />
                <span className="logo-text">Think Lemon</span>
            </Link>

            {/* Center Navigation Links */}
            <div className="nav-links desktop-only">
                {/* All Products Dropdown */}
                <div className="nav-item-dropdown">
                    <Link to="/products" className="nav-link">
                        All Products
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style={{ marginLeft: '6px', marginTop: '2px' }}>
                            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                        </svg>
                    </Link>
                    <div className="nav-dropdown-menu">
                        <Link to="/products?category=calendar" className="nav-dropdown-item">Calendar / Desk Calendar</Link>
                        <Link to="/products?category=business-card" className="nav-dropdown-item">Business Card</Link>
                        <Link to="/products?category=invitation" className="nav-dropdown-item">Invitation Card</Link>
                        <Link to="/products?category=sticker" className="nav-dropdown-item">Sticker</Link>
                        <Link to="/products?category=envelope" className="nav-dropdown-item">Envelope</Link>
                        <Link to="/products?category=letterhead" className="nav-dropdown-item">Letterhead</Link>
                        <Link to="/products?category=stamp" className="nav-dropdown-item">Stamp</Link>
                        <Link to="/products?category=brochure" className="nav-dropdown-item">3fold Brochure</Link>
                        <Link to="/products?category=paper-bag" className="nav-dropdown-item">Paper Bag</Link>
                        <Link to="/products?category=labels" className="nav-dropdown-item">Labels</Link>
                        <Link to="/products?category=non-woven-bag" className="nav-dropdown-item">None Woven Bags</Link>
                        <Link to="/products?category=standee" className="nav-dropdown-item">Standee</Link>
                        <Link to="/products?category=led-screen" className="nav-dropdown-item">LED Screen</Link>
                        <Link to="/products?category=welcome-kit" className="nav-dropdown-item">Welcome Kit</Link>
                        <Link to="/products?category=frames" className="nav-dropdown-item">Frames</Link>
                        <Link to="/products?category=flyer" className="nav-dropdown-item">Pamphlet/Flyer</Link>
                        <Link to="/products?category=id-cards" className="nav-dropdown-item">ID Cards</Link>
                    </div>
                </div>

                <Link to="/categories/pouches" className="nav-link">Pouches</Link>

                {/* Digital Services Dropdown */}
                <div className="nav-item-dropdown">
                    <Link to="/services" className="nav-link">
                        Digital Services
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style={{ marginLeft: '6px', marginTop: '2px' }}>
                            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                        </svg>
                    </Link>
                    <div className="nav-dropdown-menu">
                        <Link to="/services/social-media" className="nav-dropdown-item">Social Media Management</Link>
                        <Link to="/services/ppc" className="nav-dropdown-item">Pay Per Click</Link>
                        <Link to="/services/reel-ai" className="nav-dropdown-item">Reel AI</Link>
                        <Link to="/services/ai-photography" className="nav-dropdown-item">AI Photograph</Link>
                        <Link to="/services/whatsapp-marketing" className="nav-dropdown-item">Whatsapp Marketing</Link>
                        <Link to="/services/google-review" className="nav-dropdown-item">Google Review</Link>
                        <Link to="/services/google-all-in-one" className="nav-dropdown-item">Google all in one</Link>
                        <Link to="/services/website-making" className="nav-dropdown-item">Website Making</Link>
                        <Link to="/services/brand-promotion" className="nav-dropdown-item">Brand Promotion</Link>
                    </div>
                </div>

                <Link to="/contact" className="nav-link">Contact Us</Link>
                <Link to="/about" className="nav-link">About Us</Link>
            </div>

            {/* Right Side Actions */}
            <div className="navbar-actions">
                {/* Compact Search Bar */}
                <div className="search-container-compact" ref={searchRef}>
                    <form onSubmit={handleSearch} className="search-form-compact">
                        <button type="submit" className="search-btn-compact">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.length > 1 && setShowResults(true)}
                            className="search-input-compact"
                        />
                    </form>

                    {showResults && (
                        <div className="search-results-dropdown compact-dropdown">
                            {isSearching ? (
                                <div className="search-loading">Loading...</div>
                            ) : searchResults.length > 0 ? (
                                <>
                                    {searchResults.map((product) => (
                                        <Link
                                            key={product._id}
                                            to={`/products/${product.slug}`}
                                            className="search-result-item"
                                            onClick={() => setShowResults(false)}
                                        >
                                            <div className="result-image">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt={product.name} />
                                                ) : (
                                                    <span>📄</span>
                                                )}
                                            </div>
                                            <div className="result-info">
                                                <div className="result-name">{product.name}</div>
                                                <div className="result-price">₹{product.price}</div>
                                            </div>
                                        </Link>
                                    ))}
                                    <div className="view-all-results" onClick={handleSearch}>
                                        View all results
                                    </div>
                                </>
                            ) : (
                                <div className="no-results-found">
                                    No products found
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {isAuthenticated ? (
                    <div className="user-menu desktop-only">
                        <button className="user-btn action-link">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span>{user?.name?.split(' ')[0]}</span>
                        </button>
                        <div className="user-dropdown">
                            {isAdmin() && (
                                <Link to="/admin" className="dropdown-item">Admin Dashboard</Link>
                            )}
                            <Link to="/profile" className="dropdown-item">My Profile</Link>
                            <Link to="/wishlist" className="dropdown-item">My Wishlist</Link>
                            <Link to="/orders" className="dropdown-item">My Orders</Link>
                            <button onClick={logout} className="dropdown-item">Logout</button>
                        </div>
                    </div>
                ) : (
                    <Link to="/login" className="action-link login-link desktop-only">
                        <span style={{ fontWeight: 500 }}>Log In</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </Link>
                )}

                <Link to="/wishlist" className="action-link desktop-only">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </Link>

                <div className="cart-btn-new" onClick={() => toggleCart(true)} style={{ cursor: 'pointer' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    {getCartCount() > 0 && (
                        <span className="cart-badge-new">{getCartCount()}</span>
                    )}
                </div>
                {/* Mobile Menu Button */}
                <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {isMobileMenuOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" />
                        ) : (
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        )}
                    </svg>
                </button>
            </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="mobile-menu-header">
                <h3>Menu</h3>
                <button className="close-menu-btn" onClick={() => setIsMobileMenuOpen(false)}>×</button>
            </div>
            <div className="mobile-menu-content">
                {isAuthenticated ? (
                    <div className="mobile-user-section">
                        <div className="mobile-user-info">
                            <div className="user-avatar">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="user-name">{user?.name}</p>
                                <p className="user-email">{user?.email}</p>
                            </div>
                        </div>
                        <Link to="/profile" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
                        <Link to="/orders" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link>
                        <Link to="/wishlist" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>My Wishlist</Link>
                        {isAdmin() && (
                            <Link to="/admin" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>
                        )}
                        <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="mobile-link logout-btn">Logout</button>
                    </div>
                ) : (
                    <div className="mobile-auth-buttons">
                        <Link to="/login" className="btn btn-primary btn-block" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                        <Link to="/register" className="btn btn-outline btn-block" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                    </div>
                )}

                <div className="mobile-nav-links">
                    <h4>Shop</h4>
                    <Link to="/products" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>All Products</Link>
                    <Link to="/categories/pouches" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Pouches</Link>
                    {/* Note: Mobile menu doesn't have the fancy dropdown, it links to main Service page. Can be enhanced if requested */}
                    <Link to="/services" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Digital Services</Link>
                    <Link to="/contact" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
                    <Link to="/about" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                    <Link to="/track-order" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Track Order</Link>
                    <Link to="/help" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Help Center</Link>
                </div>
            </div>
        </div>
    </nav>
);
};

export default Navbar;
