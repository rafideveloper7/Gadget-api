# GADGETS STORE API - BACKEND README

## Project Overview
A complete REST API for an e-commerce gadget store. Built with Node.js, Express, MongoDB, and Cloudinary.

## Tech Stack
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary for image storage
- Multer for file uploads

## Folder Structure
```
server/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   ├── customerController.js
│   │   ├── blogController.js
│   │   └── dashboardController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Admin.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── Customer.js
│   │   └── Blog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── blogRoutes.js
│   │   └── dashboardRoutes.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── multerConfig.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── logger.js
│   ├── app.js
│   └── server.js
└── .env
```

## Environment Variables
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin (Login uses these directly)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Super Admin
```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production mode
npm start
```

Server runs on: http://localhost:5000

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/admin/login` | Admin login (checks .env) | Public |
| GET | `/api/auth/profile` | Get user profile | User |
| PUT | `/api/auth/profile` | Update profile | User |

**Admin Login:** Validates against `ADMIN_EMAIL` and `ADMIN_PASSWORD` from .env file. No database required.

### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Get all products (filter, sort, paginate) | Public |
| GET | `/api/products/:id` | Get single product | Public |
| GET | `/api/products/featured` | Get featured products | Public |
| GET | `/api/products/search?q=query` | Search products | Public |
| POST | `/api/products` | Create product (with image) | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name/brand
- `category` - Filter by category ID
- `brand` - Filter by brand
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `sort` - Sort field (price, rating, createdAt)
- `order` - Sort order (asc, desc)

### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | Get all categories | Public |
| GET | `/api/categories/:id` | Get category by ID | Public |
| GET | `/api/categories/slug/:slug` | Get category by slug | Public |
| POST | `/api/categories` | Create category (with image) | Admin |
| PUT | `/api/categories/:id` | Update category | Admin |
| DELETE | `/api/categories/:id` | Delete category | Admin |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Create new order | User |
| GET | `/api/orders/my-orders` | Get user's orders | User |
| GET | `/api/orders/:id` | Get order by ID | User/Admin |
| GET | `/api/orders` | Get all orders | Admin |
| PUT | `/api/orders/:id/status` | Update order status | Admin |
| PUT | `/api/orders/:id/payment` | Update payment status | Admin |

**Order Status:** pending, processing, shipped, delivered, cancelled
**Payment Status:** pending, paid, failed, refunded

### Customers
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/customers/profile` | Get customer profile | User |
| PUT | `/api/customers/address` | Update shipping address | User |
| POST | `/api/customers/wishlist/:productId` | Add to wishlist | User |
| DELETE | `/api/customers/wishlist/:productId` | Remove from wishlist | User |
| GET | `/api/customers` | Get all customers | Admin |
| GET | `/api/customers/:id` | Get customer details | Admin |

### Blogs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/blogs` | Get all published blogs | Public |
| GET | `/api/blogs/:id` | Get blog by ID | Public |
| GET | `/api/blogs/slug/:slug` | Get blog by slug | Public |
| GET | `/api/blogs/admin/stats` | Get blog analytics | Admin |
| POST | `/api/blogs` | Create blog (with image) | Admin |
| PUT | `/api/blogs/:id` | Update blog | Admin |
| DELETE | `/api/blogs/:id` | Delete blog | Admin |

### Admin Dashboard
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/dashboard` | Get dashboard statistics | Admin |
| GET | `/api/admin/reports/sales` | Get sales report | Admin |
| GET | `/api/admin/reports/inventory` | Get inventory report | Admin |

**Dashboard Response Includes:**
- Total products, categories, customers, orders
- Order status breakdown
- Total revenue
- Low stock alerts
- Top selling products
- Recent orders
- Monthly revenue chart data

## File Upload with Cloudinary

All images are uploaded directly to Cloudinary. Supported formats:
- JPEG, JPG, PNG, WEBP
- Max file size: 5MB

**Upload endpoints:**
- Products: `POST /api/products` with field `image`
- Categories: `POST /api/categories` with field `image`
- Blogs: `POST /api/blogs` with field `image`

**Response includes Cloudinary URL:**
```json
{
  "images": ["https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/image.jpg"]
}
```

## Authentication

### User Registration
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

### User Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Admin Login (Uses .env credentials)
```json
POST /api/auth/admin/login
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

## Sample API Calls

### Get Products with Filters
```
GET /api/products?page=1&limit=10&search=iphone&minPrice=500&maxPrice=1500&sort=price&order=asc
```

### Create Product (Admin)
```
POST /api/products
Headers: { Authorization: Bearer <admin_token> }
Body: form-data
- name: "iPhone 15 Pro"
- brand: "Apple"
- price: 1099
- stock: 50
- category: "category_id"
- description: "Latest iPhone"
- image: [file]
```

### Update Order Status (Admin)
```
PUT /api/orders/order_id/status
Headers: { Authorization: Bearer <admin_token> }
{
  "status": "shipped"
}
```

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description here"
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## NPM Scripts

```bash
npm run dev     # Start with nodemon (auto-reload)
npm start       # Start production server
npm run seed    # Seed database with sample data
```

## Features Summary

### Public Features
- Browse products with filters and pagination
- View product details
- Browse categories
- Read blogs
- User registration and login

### User Features
- Place orders
- View order history
- Manage wishlist
- Update profile and address
- Track order status

### Admin Features
- Admin login using .env credentials
- Full product management (CRUD with images)
- Category management
- Order management with status updates
- Customer management
- Blog management
- Dashboard with analytics
- Sales and inventory reports
- Cloudinary image upload

## Cloudinary Integration

All images are stored on Cloudinary CDN:
- Automatic image optimization
- Fast global delivery
- No local file storage
- Image transformations via URL

Example transformation:
```
https://res.cloudinary.com/cloud_name/image/upload/w_300,h_300,c_fill/v123456/products/image.jpg
```

## Performance Features
- Pagination on all list endpoints
- Filtering and sorting
- Search functionality
- Indexed database queries

## Security Features
- JWT token authentication
- Password hashing with bcrypt
- Admin credentials in .env (not in database)
- File type validation
- Input validation
- CORS enabled

---

**Base URL:** `http://localhost:5000/api`  
**Postman Collection:** Import from `gadgets-api-postman.json`  
**Environment:** Node.js v18+ required