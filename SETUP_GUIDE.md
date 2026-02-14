# Think Lemon - Setup Guide

## 🚀 Quick Start Guide

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** (comes with Node.js)

### Step 1: MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   ```
3. MongoDB will run on `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `backend/.env` with your connection string

### Step 2: Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies** (already done):
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Open `backend/.env`
   - Update `MONGODB_URI` if using MongoDB Atlas
   - Change `JWT_SECRET` to a secure random string

4. **Seed the database with sample data:**
   ```bash
   npm run seed
   ```
   This will create:
   - 6 product categories
   - 6 sample products
   - 1 admin user (email: admin@thinklemon.com, password: admin123)

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

### Step 3: Frontend Setup

1. **Open a new terminal** and navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. **Install dependencies** (already done):
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

### Step 4: Access the Application

1. **Open your browser** and go to: `http://localhost:5173`
2. **Login as admin:**
   - Email: `admin@thinklemon.com`
   - Password: `admin123`

## 📁 Project Structure

```
Think Lemon/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── server.js        # Express server
│   ├── seed.js          # Database seeding script
│   └── .env             # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context (Auth, Cart)
│   │   ├── services/    # API services
│   │   ├── App.jsx      # Main app component
│   │   └── index.css    # Global styles
│   └── .env             # Frontend environment variables
│
└── README.md
```

## 🔧 Available Scripts

### Backend
```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
npm run seed    # Seed database with sample data
```

### Frontend
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

## 🎨 Features Implemented

### ✅ Backend (Complete)
- User authentication with JWT
- Product management (CRUD)
- Category management (CRUD)
- Shopping cart functionality
- Order management
- Admin dashboard APIs
- File upload support (Multer)
- MongoDB integration

### ✅ Frontend (Phase 1)
- Modern, responsive UI
- Home page with hero section
- Product categories display
- Featured products showcase
- Authentication context
- Cart context
- Navbar with user menu
- Footer

### 🚧 Coming Soon (Phase 2)
- Product listing page with filters
- Product detail page with customization
- Shopping cart page
- Checkout process
- User profile page
- Order tracking
- Admin dashboard
- Login/Register pages

## 🔐 Default Admin Credentials

```
Email: admin@thinklemon.com
Password: admin123
```

**⚠️ Important:** Change these credentials in production!

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:slug` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get single category
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item
- `DELETE /api/cart/remove/:itemId` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/track/:orderNumber` - Track order
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/admin/all` - Get all users (Admin)

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `backend/.env`
- For Atlas, ensure your IP is whitelisted

### Port Already in Use
- Backend (5000): Change `PORT` in `backend/.env`
- Frontend (5173): Vite will automatically use next available port

### CORS Errors
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `frontend/.env`

## 📝 Next Steps

1. **Test the application:**
   - Browse products
   - Add items to cart
   - Create an account
   - Place an order

2. **Customize:**
   - Update colors in `frontend/src/index.css`
   - Add your logo
   - Modify product categories

3. **Deploy:**
   - Backend: Heroku, Railway, or DigitalOcean
   - Frontend: Vercel, Netlify, or GitHub Pages
   - Database: MongoDB Atlas

## 💡 Tips

- Use the seed script (`npm run seed`) to reset the database
- Check browser console for any errors
- Use MongoDB Compass to view database contents
- Test API endpoints with Postman or Thunder Client

## 🤝 Support

For issues or questions:
- Check the troubleshooting section
- Review the code comments
- Ensure all dependencies are installed

---

**Happy Coding! 🚀**
