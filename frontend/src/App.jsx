import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SmoothScroll from './components/SmoothScroll';
import WhatsAppButton from './components/WhatsAppButton';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import Products from './pages/Products';
import CategoryPage from './pages/CategoryPage';
import Categories from './pages/Categories';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/admin/Dashboard';
import BusinessSolutions from './pages/BusinessSolutions';
import HelpCenter from './pages/HelpCenter';
import TrackOrder from './pages/TrackOrder';
import SampleKit from './pages/SampleKit';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import DesignTool from './pages/DesignTool';
import Contact from './pages/Contact';
import About from './pages/About';
import Services from './pages/Services';
import './App.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <div className="app">
                        <SmoothScroll />
                        <Navbar />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/products" element={<Products />} />
                                <Route path="/products/:slug" element={<ProductDetails />} />
                                <Route path="/categories" element={<Categories />} />
                                <Route path="/categories/:slug" element={<CategoryPage />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/orders" element={<OrderHistory />} />
                                <Route path="/admin/*" element={<AdminDashboard />} />
                                <Route path="/business-solutions" element={<BusinessSolutions />} />
                                <Route path="/track-order" element={<TrackOrder />} />
                                <Route path="/track-order/:orderNumber" element={<TrackOrder />} />
                                <Route path="/help" element={<HelpCenter />} />
                                <Route path="/sample-kit" element={<SampleKit />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/wishlist" element={<Wishlist />} />
                                <Route path="/design-tool" element={<DesignTool />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/services" element={<Services />} />
                            </Routes>
                        </main>
                        <Footer />
                        <CartDrawer />
                        <WhatsAppButton />
                    </div>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
