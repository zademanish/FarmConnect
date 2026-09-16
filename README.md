# Farm Connect — Agricultural Marketplace

A full-stack agricultural marketplace that connects **farmers directly with buyers**, removing middlemen from the supply chain. Farmers list their produce, an admin verifies each listing, buyers browse and send purchase requests, and orders are tracked through delivery to review.

Built as a college mini project with **React + Vite + Tailwind CSS + Node.js + Express + MongoDB + Mongoose + JWT**.

---

## Features

### Farmer
- Register, login, manage profile and farm details
- Add products with **multiple image uploads** (stored locally)
- Edit and delete listings, set price, quantity, unit and availability
- View and accept/reject purchase requests
- Advance order status through the delivery pipeline
- View a full order page with delivery tracking
- View ratings and reviews received
- Raise complaints and read admin responses

### Buyer
- Browse, search, filter and sort approved products
- View product details, farmer profile and reviews
- Submit purchase requests with an estimated total
- Track order status on a full order page, cancel eligible orders
- Rate and review delivered orders
- Raise complaints and read admin responses

### Admin
- Dashboard with statistics and an orders-by-status chart
- Manage farmers and buyers (view, activate/deactivate, delete)
- **Approve or reject** product listings with a rejection reason
- Manage categories, purchase requests and orders
- Manage delivery workers and assign them to orders
- Moderate reviews (hide/delete) and respond to complaints

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 3, React Router DOM, Axios, React Hook Form, Lucide React |
| Backend | Node.js, Express 4, REST API |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Uploads | Multer (local disk storage) |

State is managed with React **Context API** (auth + toasts). No AI/recommendation systems are used.

---

## System Requirements

- **Node.js** 18 or higher
- **MongoDB** installed and running locally (or a MongoDB Atlas URI)
- npm

---

## Installation

```bash
# 1. Backend
cd backend
npm install

# 2. Frontend
cd ../frontend
npm install
```

### Environment Variables

**`backend/.env`**

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/farmconnect
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**`frontend/.env`**

```env
VITE_API_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
```

> Both folders include a `.env.example` you can copy.

### Database Setup & Seeding

Make sure MongoDB is running, then populate demo data:

```bash
cd backend
npm run seed
```

This creates 1 admin, 5 farmers, 10 buyers, 8 categories, 20 products (with images), 12 purchase requests, 8 orders, 5 delivery workers, reviews and complaints. Re-running the seed **wipes and rebuilds** the database and the uploads folder.

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@farmconnect.com` | `admin123` |
| Farmer | `farmer1@farmconnect.com` … `farmer5@…` | `farmer123` |
| Buyer | `buyer1@farmconnect.com` … `buyer10@…` | `buyer123` |

The admin account is created **only** by the seed script — it cannot be registered publicly.

---

## Running the Project

Run each in its own terminal:

```bash
# Terminal 1 — backend  → http://localhost:5000
cd backend
npm run dev     # or: npm start

# Terminal 2 — frontend → http://localhost:5173
cd frontend
npm run dev
```

Open **http://localhost:5173**.

---

## API Overview

Base URL: `http://localhost:5000/api`

### Authentication
```http
POST   /auth/register
POST   /auth/login
GET    /auth/me
POST   /auth/logout
```

### Users & Dashboards
```http
PUT    /users/profile              # multipart, profile image
PUT    /users/change-password
GET    /users/farmers/:id          # public farmer profile
GET    /users/farmer/dashboard
GET    /users/buyer/dashboard
```

### Products
```http
GET    /products                   # search, filters, sorting, pagination
GET    /products/:id
GET    /products/home/featured
GET    /products/farmer/my-products
POST   /products                   # multipart, up to 5 images
PUT    /products/:id
DELETE /products/:id
```

### Categories
```http
GET    /categories
POST   /categories                 # admin
PUT    /categories/:id             # admin
DELETE /categories/:id             # admin
```

### Purchase Requests
```http
POST   /purchase-requests
GET    /purchase-requests
GET    /purchase-requests/:id
PUT    /purchase-requests/:id      # Accepted | Rejected | Cancelled
```

### Orders
```http
GET    /orders
GET    /orders/:id
PUT    /orders/:id/status
PUT    /orders/:id/assign-worker   # admin
```

### Delivery Workers (admin)
```http
GET    /delivery-workers
POST   /delivery-workers
GET    /delivery-workers/:id
PUT    /delivery-workers/:id
DELETE /delivery-workers/:id
```

### Reviews
```http
POST   /reviews
GET    /reviews
GET    /reviews/product/:productId
PUT    /reviews/:id
DELETE /reviews/:id
```

### Complaints
```http
POST   /complaints
GET    /complaints
GET    /complaints/:id
PUT    /complaints/:id             # admin responds
```

### Admin
```http
GET    /admin/stats
GET    /admin/users?role=farmer|buyer
GET    /admin/users/:id
PUT    /admin/users/:id/status
DELETE /admin/users/:id
GET    /admin/products
PUT    /admin/products/:id/approval
```

**Response format**

```json
{ "success": true, "message": "Product created successfully", "data": {} }
{ "success": false, "message": "Product not found" }
```

Status codes used: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`.

### Product search example

```http
GET /api/products?search=tomato&category=<id>&minPrice=20&maxPrice=100&location=Pune&sort=price-asc&page=1&limit=12
```

```json
{ "products": [], "currentPage": 1, "totalPages": 5, "totalProducts": 50 }
```

---

## Image Uploads

Images are stored on the **local server disk** — no third-party image hosting is used.

- Accepted types: **JPG, JPEG, PNG, WebP**
- Max size: **2 MB** per file, up to **5 images** per product
- Unique filenames are generated (`images-<timestamp>-<random>.png`)
- Only the path (e.g. `/uploads/products/abc.png`) is saved in MongoDB
- Files are served statically from `http://localhost:5000/uploads/...`
- Deleting a product or replacing an image removes the old file from disk
- The frontend shows **live previews** before submitting

```
backend/uploads/
├── products/     # product images
├── profiles/     # user profile pictures
├── categories/   # category images
└── seed/         # source images used by the seed script
```

---

## User Roles & Workflow

```
Farmer Registration → Login → Add Product (status = Pending)
        ↓
Admin Reviews → Approve → Product visible to buyers
        ↓
Buyer browses → Submits Purchase Request
        ↓
Farmer Accepts → Order created + stock reserved
        ↓
Admin assigns Delivery Worker → Out for Delivery → Delivered
        ↓
Buyer gives Rating & Review
```

### Business rules enforced
1. Only farmers can create products; new products start as `Pending`
2. Buyers only see **approved** products
3. A request cannot exceed available quantity
4. Rejected products must carry a rejection reason
5. Accepting a request creates an order and decrements stock
6. Stock reaching zero marks the product `Unavailable`
7. Cancelling an order returns the reserved stock
8. Order status follows a strict one-way pipeline
9. Only buyers with a **delivered** order can review it, once
10. Only admins assign delivery workers, and only **available** ones
11. Delivering an order frees the worker and marks payment `Paid`
12. Users can only access their own data; admins access everything

---

## Project Structure

```
FarmConnect/
├── backend/
│   ├── src/
│   │   ├── config/         # database connection
│   │   ├── controllers/    # route handlers
│   │   ├── middleware/     # auth, upload, error handling
│   │   ├── models/         # 9 Mongoose schemas
│   │   ├── routes/         # REST routes
│   │   ├── utils/          # helpers, seed script
│   │   └── app.js
│   ├── uploads/            # locally stored images
│   ├── .env
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/     # reusable UI + shared tables
    │   ├── context/        # AuthContext, ToastContext
    │   ├── layouts/        # public + dashboard shells
    │   ├── pages/          # auth, public, farmer, buyer, admin
    │   ├── routes/         # ProtectedRoute
    │   ├── services/       # axios instance + endpoints
    │   ├── App.jsx
    │   └── main.jsx
    └── .env
```

---

## Security

- Passwords hashed with **bcrypt** (never stored or returned in plain text)
- **JWT** authentication with an Authorization header
- Route protection middleware: `isAuthenticated`, `isFarmer`, `isBuyer`, `isAdmin`
- Ownership checks so users can only modify their own records
- Input validation on both frontend and backend
- File type and size validation on uploads
- CORS restricted to the configured client URL
- Secrets kept in `.env` (never hard-coded)
- Deactivated accounts are blocked at login and on every request

---

## Screenshots

> Add screenshots here for your report.

| Screen | File |
|---|---|
| Home page | `screenshots/home.png` |
| Product listing | `screenshots/products.png` |
| Product details | `screenshots/product-detail.png` |
| Farmer dashboard | `screenshots/farmer-dashboard.png` |
| Add product (image upload) | `screenshots/add-product.png` |
| Buyer dashboard | `screenshots/buyer-dashboard.png` |
| Admin dashboard | `screenshots/admin-dashboard.png` |
| Product approval | `screenshots/admin-products.png` |

---

## Troubleshooting

**`MongoDB connection failed`** — make sure MongoDB is running:
```bash
# Windows (service)
net start MongoDB
```

**Images not showing** — confirm the backend is on port 5000 and `VITE_SERVER_URL` matches it.

**401 on every request** — the token expired; log out and log in again.

**Port already in use** — change `PORT` in `backend/.env` and `VITE_API_URL` in `frontend/.env` to match.

---

## Future Improvements

- Real payment gateway integration
- Email/SMS notifications for order updates
- A dedicated delivery-worker login and app
- Chat between buyer and farmer
- Bulk/wholesale pricing tiers
- Multi-language support for regional farmers
- Export reports to PDF/Excel
- Image compression and thumbnail generation
