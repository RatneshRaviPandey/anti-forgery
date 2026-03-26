## E-Commerce Website Project Setup

### Project Overview
Full-stack e-commerce application similar to Amazon with:
- React frontend with modern UI
- Node.js/Express backend
- MongoDB database
- Product catalog and shopping cart
- User authentication
- Payment integration

### Setup Checklist

- [x] Create copilot-instructions.md file
- [x] Scaffold project structure (React + Node.js)
- [x] Customize project files
- [x] Install required extensions
- [x] Compile and validate
- [x] Create and run development task
- [x] Launch project
- [x] Complete documentation

### Development Stack
- **Frontend**: React 18, Axios, Context API, Tailwind CSS, React Router, React Icons
- **Backend**: Express.js, Node.js, MongoDB, JWT Auth, Bcryptjs
- **Tools**: npm, Concurrently, Nodemon, PostCSS

### Project Structure
```
ecommerce-app/
├── client/          # React frontend application
├── server/          # Express.js backend API
├── .github/         # GitHub configuration
├── .vscode/         # VS Code settings (tasks.json, launch.json)
├── README.md        # Main project documentation
├── SETUP_GUIDE.md   # Detailed setup and configuration guide
└── package.json     # Root package configuration
```

### Key Features Implemented

**Frontend**
- Header with shopping cart counter
- Footer with company links
- Home page with featured products
- Product detail page
- Shopping cart management
- User login page
- Responsive Tailwind CSS design

**Backend**
- Product management API (CRUD)
- User authentication (Register/Login)
- JWT-based authorization
- Order management system
- Cart API endpoints
- MongoDB integration
- Error handling middleware

### Instructions to Run

```bash
# Install all dependencies
npm run install-all

# Development server (runs both client and server)
npm run dev

# Production build
npm run build

# Run client only
npm run client

# Run server only
npm run server
```

### Environment Setup
- Create `.env` in `server/` directory (use `server/.env.example` as template)
- Create `.env` in `client/` directory with `REACT_APP_API_URL=http://localhost:5000/api`
- Install Node.js v16+ and MongoDB before running

### Available VS Code Tasks
- **Install Dependencies**: `npm run install-all`
- **Start Development Server**: `npm run dev`
- **Build for Production**: `npm run build`

All tasks are in `.vscode/tasks.json` and can be run from VS Code's Task Runner.
