import { useState, useEffect } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI, productsAPI, usersAPI } from '../../services/api';
import AdminProducts from './Products';
import AdminProductForm from './ProductForm';
import AdminOrders from './Orders';
import AdminUsers from './Users';
import AdminInquiries from './Inquiries';
import './Admin.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// Dashboard Overview Component
const DashboardOverview = () => {
    const [stats, setStats] = useState({
        orders: 0,
        products: 0,
        users: 0,
        revenue: 0
    });
    const [salesData, setSalesData] = useState(null);
    const [orderStatusData, setOrderStatusData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            // Fetch all orders for analytics (limit 1000 for now)
            const [ordersRes, productsRes, usersRes] = await Promise.all([
                ordersAPI.getAllAdmin({ limit: 1000 }),
                productsAPI.getAll({ limit: 1 }),
                usersAPI.getAllAdmin()
            ]);

            const orders = ordersRes.data.data || [];
            const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

            setStats({
                orders: ordersRes.data.pagination?.total || 0,
                products: productsRes.data.pagination?.total || 0,
                users: usersRes.data.data?.length || 0,
                revenue: totalRevenue
            });

            processChartData(orders);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const processChartData = (orders) => {
        // 1. Sales Over Time (Last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const salesMap = {};
        last7Days.forEach(date => salesMap[date] = 0);

        orders.forEach(order => {
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            if (salesMap[date] !== undefined) {
                salesMap[date] += order.total;
            }
        });

        setSalesData({
            labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [
                {
                    label: 'Sales (₹)',
                    data: last7Days.map(date => salesMap[date]),
                    borderColor: 'rgb(255, 107, 53)',
                    backgroundColor: 'rgba(255, 107, 53, 0.5)',
                    tension: 0.4,
                },
            ],
        });

        // 2. Order Status Distribution
        const statusCounts = {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };

        orders.forEach(order => {
            const status = order.orderStatus || 'pending';
            if (statusCounts[status] !== undefined) {
                statusCounts[status]++;
            }
        });

        setOrderStatusData({
            labels: Object.keys(statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
            datasets: [
                {
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        '#FCD34D', // Pending - Yellow
                        '#60A5FA', // Processing - Blue
                        '#818CF8', // Shipped - Indigo
                        '#34D399', // Delivered - Green
                        '#F87171', // Cancelled - Red
                    ],
                    borderWidth: 1,
                },
            ],
        });
    };

    if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;

    return (
        <div className="dashboard-overview">
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <h3>Total Orders</h3>
                        <div className="stat-value">{stats.orders}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📄</div>
                    <div className="stat-info">
                        <h3>Products</h3>
                        <div className="stat-value">{stats.products}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>Users</h3>
                        <div className="stat-value">{stats.users}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <h3>Revenue</h3>
                        <div className="stat-value">₹{stats.revenue.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Sales Overview (Last 7 Days)</h3>
                    {salesData && <Line options={{ responsive: true, maintainAspectRatio: false }} data={salesData} />}
                </div>
                <div className="chart-card">
                    <h3>Order Status</h3>
                    <div className="doughnut-container">
                        {orderStatusData && <Doughnut options={{ responsive: true, maintainAspectRatio: false }} data={orderStatusData} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Admin Layout
const AdminDashboard = () => {
    const { user, isAdmin } = useAuth();
    const location = useLocation();

    if (!isAdmin()) {
        return <div className="container py-5 text-center"><h2>Access Denied</h2></div>;
    }

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <nav className="admin-nav">
                    <Link
                        to="/admin"
                        className={`admin-nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
                    >
                        <span>📊</span> Dashboard
                    </Link>
                    <Link
                        to="/admin/products"
                        className={`admin-nav-item ${location.pathname.includes('/products') ? 'active' : ''}`}
                    >
                        <span>📦</span> Products
                    </Link>
                    <Link
                        to="/admin/orders"
                        className={`admin-nav-item ${location.pathname.includes('/orders') ? 'active' : ''}`}
                    >
                        <span>🛍️</span> Orders
                    </Link>
                    <Link
                        to="/admin/users"
                        className={`admin-nav-item ${location.pathname.includes('/users') ? 'active' : ''}`}
                    >
                        <span>👥</span> Users
                    </Link>
                    <Link
                        to="/admin/inquiries"
                        className={`admin-nav-item ${location.pathname.includes('/inquiries') ? 'active' : ''}`}
                    >
                        <span>📨</span> Inquiries
                    </Link>
                </nav>
            </aside>

            <main className="admin-content">
                <div className="admin-header">
                    <h1>Admin Dashboard</h1>
                    <div className="admin-user">
                        Welcome, {user?.name}
                    </div>
                </div>

                <Routes>
                    <Route path="/" element={<DashboardOverview />} />
                    <Route path="/products" element={<AdminProducts />} />
                    <Route path="/products/new" element={<AdminProductForm />} />
                    <Route path="/products/edit/:id" element={<AdminProductForm />} />
                    <Route path="/orders" element={<AdminOrders />} />
                    <Route path="/users" element={<AdminUsers />} />
                    <Route path="/inquiries" element={<AdminInquiries />} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminDashboard;
