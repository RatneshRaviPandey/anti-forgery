# E-Commerce Application - Project Setup Guide

## Prerequisites

Before running this project, ensure you have installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** (local or MongoDB Atlas account) - [Download here](https://www.mongodb.com/try/download/community)

## Project Structure

```
ecommerce-app/
├── client/                          # React Frontend
│   ├── public/
│   │   └── index.html              # Main HTML file
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js           # Navigation header with cart
│   │   │   └── Footer.js           # Footer component
│   │   ├── pages/
│   │   │   ├── HomePage.js         # Products listing
│   │   │   ├── ProductPage.js      # Individual product details
│   │   │   ├── CartPage.js         # Shopping cart
│   │   │   └── LoginPage.js        # Authentication
│   │   ├── context/                # React Context (state management)
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── utils/                  # Utility functions
│   │   ├── styles/
│   │   │   └── index.css           # Global styles
│   │   ├── App.js                  # Main App component
│   │   ├── App.css                 # App styles
│   │   └── index.js                # Entry point
│   ├── tailwind.config.js          # Tailwind CSS config
│   ├── postcss.config.js           # PostCSS config
│   └── package.json                # Frontend dependencies
│
├── server/                          # Express Backend
│   ├── models/
│   │   ├── Product.js              # Product schema
│   │   ├── User.js                 # User schema
│   │   └── Order.js                # Order schema
│   ├── routes/
│   │   ├── productRoutes.js        # Product endpoints
│   │   ├── userRoutes.js           # User authentication
│   │   ├── orderRoutes.js          # Order management
│   │   └── cartRoutes.js           # Cart operations
│   ├── controllers/
│   │   ├── productController.js    # Product logic
│   │   ├── userController.js       # User logic
│   │   └── orderController.js      # Order logic
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT authentication
│   ├── config/                     # Configuration files
│   ├── server.js                   # Express app entry point
│   ├── .env.example                # Environment variables template
│   └── package.json                # Backend dependencies
│
├── .github/
│   └── copilot-instructions.md     # Project instructions
├── .gitignore                      # Git ignore rules
├── README.md                       # Project documentation
├── SETUP_GUIDE.md                  # This file
└── package.json                    # Root dependencies & scripts
```

## Installation Steps

### 1. Install Dependencies

```bash
# Install all project dependencies at once
npm run install-all

# Or install manually:
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Configure Environment Variables

#### Server Configuration
Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

#### Client Configuration
Create a `.env` file in the `client/` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service (Windows)
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string and add to `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
   ```

## Running the Application

### Development Mode

```bash
# Start both client and server concurrently
npm run dev

# Or run them separately:
# Terminal 1: Client
cd client && npm start

# Terminal 2: Server
cd server && npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/health

### Production Build

```bash
# Build frontend for production
npm run build

# Start production server
cd server && npm start
```

## API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (authenticated)

### Orders
- `POST /api/orders` - Create order (authenticated)
- `GET /api/orders` - Get user orders (authenticated)
- `GET /api/orders/:id` - Get order details (authenticated)
- `PUT /api/orders/:id` - Update order status (admin)

### Cart
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart` - Get cart items
- `DELETE /api/cart/:itemId` - Remove item from cart

## Features Implemented

✅ **Frontend**
- React 18 with functional components and hooks
- React Router for navigation
- Tailwind CSS for styling
- Amazon-like UI components (Header, Footer, Product Cards)
- Shopping cart management
- User authentication pages
- Responsive design

✅ **Backend**
- Express.js REST API
- MongoDB database integration
- JWT authentication
- Bcryptjs password hashing
- Product management (CRUD)
- User management (Register, Login, Profile)
- Order management (Create, Track, Update)
- Error handling middleware

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | grep :5000
# Kill process (Windows)
taskkill /PID <PID> /F
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify network connection for Atlas

### Dependencies Installation Failed
```bash
# Clear npm cache
npm cache clean --force
# Try installing again
npm install
```

## Next Steps

1. **Add Sample Data**: Create a seed script to populate MongoDB with sample products
2. **Frontend Enhancements**: 
   - Add Redux for state management
   - Implement product search and filtering
   - Add checkout form
3. **Backend Enhancements**:
   - Implement payment gateway integration
   - Add email notifications
   - Create admin dashboard
4. **Testing**: Add Jest and React Testing Library
5. **Deployment**: Deploy to Heroku, AWS, or Vercel

## Technologies Used

| Category | Technology |
|----------|-----------|
| Frontend | React 18, React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express.js, MongoDB, JWT |
| Tools | npm, Concurrently, Nodemon |
| Styling | Tailwind CSS, PostCSS, Autoprefixer |

## License

MIT

## Support

For issues or questions, please refer to the README.md file or create an issue in the repository.
