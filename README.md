# E-Commerce Website (Amazon-like)

A full-stack e-commerce application built with React, Node.js, Express, and MongoDB.

## Features

- **Product Catalog**: Browse thousands of products
- **Shopping Cart**: Add/remove items, manage quantities
- **User Authentication**: Secure login and registration with JWT
- **User Profiles**: Manage account information and order history
- **Product Search**: Search and filter products by category, price, rating
- **Orders**: Complete checkout process with order tracking
- **Admin Dashboard**: Manage products, orders, and users
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Project Structure

```
ecommerce-app/
├── client/              # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── styles/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/              # Express backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
└── package.json
```

## Tech Stack

### Frontend
- React 18
- Axios (API calls)
- Redux or Context API (state management)
- Tailwind CSS (styling)
- React Router (navigation)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT (authentication)
- Bcryptjs (password hashing)

## Installation

```bash
# Install all dependencies
npm run install-all
```

## Development

```bash
# Start both client and server in development mode
npm run dev
```

The application will run at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Build

```bash
# Build for production
npm run build
```

## Environment Variables

Create `.env` files in both `client/` and `server/` directories:

### server/.env
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### client/.env
```
REACT_APP_API_URL=http://localhost:5000/api
```

## License

MIT
