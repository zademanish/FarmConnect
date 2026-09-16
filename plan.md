# Farm Connect — Agricultural Marketplace

Build a complete full-stack web application called **Farm Connect**.

Farm Connect is an agricultural marketplace that directly connects **farmers with buyers**. Farmers can register and list agricultural products with details such as product name, category, images, quantity, price, location, and availability. Buyers can browse and search products, view farmer/product details, and submit purchase requests or place orders.

An **Admin Dashboard** manages farmers, buyers, products, categories, purchase requests, orders, delivery workers, complaints, ratings, and reviews.

The project should be suitable for a **college mini project/final-year academic project** and should have a clean, professional, responsive UI.

---

## 1. Technology Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router DOM
* Axios
* React Hook Form
* Context API or Redux Toolkit for state management
* Lucide React or another icon library

### Backend

* Node.js
* Express.js
* REST API architecture
* JWT authentication
* bcrypt for password hashing
* Multer for image uploads

### Database

* MongoDB
* Mongoose ODM

### Development Requirements

* Use `.env` for sensitive configuration
* Proper error handling
* API validation
* Authentication and authorization
* Responsive design
* Clean folder structure
* Reusable React components
* Reusable backend controllers/services
* Proper HTTP status codes

Do not use AI-based recommendation systems.

---

# 2. User Roles

The application should have three main roles:

### 1. Farmer

Farmers can:

* Register and login
* Create and manage their profile
* Add agricultural products
* Upload product images
* Set product quantity
* Set price
* Set availability
* Edit/delete their products
* View purchase requests
* Accept/reject purchase requests
* View orders
* Update order-related status where permitted
* View order history
* View ratings and reviews

### 2. Buyer

Buyers can:

* Register and login
* Create and manage their profile
* Browse agricultural products
* Search products
* Filter products
* Sort products
* View product details
* View farmer details
* Submit purchase requests
* Place orders
* View order status
* View order history
* Cancel eligible orders
* Give ratings and reviews
* Submit complaints

### 3. Admin

Admin has complete management access through a separate dashboard.

Admin can:

* Manage farmers
* Manage buyers
* Manage products
* Manage categories
* Approve/reject product listings
* Manage purchase requests
* Manage orders
* Manage delivery workers
* Assign delivery workers
* Track delivery status
* Manage complaints
* Manage ratings/reviews
* View dashboard statistics

---

# 3. Authentication System

Create a secure authentication system.

### Registration

Create registration for:

* Farmer
* Buyer

Fields:

* Full Name
* Email
* Phone Number
* Password
* Confirm Password
* Address
* City
* State
* Pincode
* Role

Admin account should not be publicly registered.

### Login

Login fields:

* Email
* Password

After login, redirect the user according to their role:

```text
Farmer → Farmer Dashboard
Buyer → Buyer/Home Page
Admin → Admin Dashboard
```

Use JWT authentication.

Store passwords using bcrypt hashing.

Protect private routes using authentication middleware.

Create role-based authorization middleware:

```text
isAuthenticated
isFarmer
isBuyer
isAdmin
```

---

# 4. Farmer Module

Create a Farmer Dashboard.

### Dashboard

Display:

* Total Products
* Approved Products
* Pending Products
* Total Purchase Requests
* Accepted Requests
* Completed Orders

Show recent purchase requests and recent orders.

---

## Farmer Profile

Farmer can update:

* Profile image
* Full name
* Phone
* Email
* Address
* City
* State
* Pincode
* Farm name
* Farm location
* About farmer

---

# 5. Product Management

Farmers can create agricultural product listings.

### Product fields

```text
Product Name
Category
Description
Product Images
Quantity
Unit
Price
Location
Available From
Availability Status
```

Example:

```text
Product Name: Fresh Tomato
Category: Vegetables
Quantity: 500
Unit: KG
Price: ₹30/KG
Location: Pune, Maharashtra
Availability: Available
```

### Product Status

Use:

```text
Pending
Approved
Rejected
Unavailable
```

New products should initially have:

```text
Pending
```

Admin must approve the product before buyers can purchase it.

---

# 6. Product Categories

Create categories such as:

* Vegetables
* Fruits
* Grains
* Pulses
* Rice
* Wheat
* Spices
* Oil Seeds
* Dairy Products
* Other

Admin should be able to:

* Add category
* Edit category
* Delete category
* Activate/deactivate category

---

# 7. Buyer Module

Create a professional buyer interface.

### Home Page

Display:

* Hero section
* Search bar
* Product categories
* Featured agricultural products
* Recently added products
* Available products
* How Farm Connect works

Example:

```text
Connect Directly.
Buy Fresh.
Support Farmers.
```

---

# 8. Product Browsing

Create a product listing page.

Buyer should be able to:

### Search

Search by:

```text
Product Name
Category
Location
Farmer Name
```

### Filters

Filters should include:

```text
Category
Minimum Price
Maximum Price
Location
Availability
```

### Sorting

Provide:

```text
Price: Low to High
Price: High to Low
Newest Products
```

Use pagination for large product lists.

---

# 9. Product Details

Create a detailed product page.

Display:

* Product images
* Product name
* Category
* Description
* Price
* Available quantity
* Unit
* Location
* Availability
* Farmer name
* Farmer profile
* Farmer location
* Farmer rating

Add:

```text
Request to Buy
```

button.

---

# 10. Purchase Request System

When a buyer wants to purchase a product, allow them to submit:

```text
Product
Quantity Required
Message
Delivery Address
Phone Number
```

Calculate estimated total:

```text
Total Amount = Quantity × Product Price
```

Purchase request status:

```text
Pending
Accepted
Rejected
Cancelled
```

---

# 11. Order Management

Once a purchase request is accepted, create an order.

Order should contain:

```text
Order ID
Buyer
Farmer
Product
Quantity
Price
Total Amount
Delivery Address
Delivery Worker
Order Status
Payment Status
Created Date
Updated Date
```

### Order Status

Use:

```text
Pending
Confirmed
Processing
Ready for Delivery
Out for Delivery
Delivered
Cancelled
```

### Payment Status

For this mini project, keep payment simple:

```text
Pending
Cash on Delivery
Paid
```

Do not integrate a real payment gateway unless specifically required.

---

# 12. Delivery Worker Module

Create delivery worker management for Admin.

Admin can:

* Add delivery worker
* Edit delivery worker
* Activate/deactivate worker
* View worker details
* Assign worker to order

Delivery worker fields:

```text
Name
Phone
Email
Address
City
Availability Status
```

Worker status:

```text
Available
Busy
Inactive
```

Admin can assign an available worker to an order.

---

# 13. Delivery Tracking

After assigning a delivery worker, the order should show:

```text
Order Confirmed
      ↓
Processing
      ↓
Ready for Delivery
      ↓
Delivery Assigned
      ↓
Out for Delivery
      ↓
Delivered
```

Buyer should be able to see the current order status from their dashboard.

---

# 14. Rating and Review System

After an order is delivered, allow the buyer to rate the product/farmer.

Rating:

```text
1 Star
2 Stars
3 Stars
4 Stars
5 Stars
```

Review fields:

```text
Rating
Comment
```

Display reviews on the product/farmer details page.

Admin should be able to moderate/delete inappropriate reviews.

---

# 15. Complaint System

Buyers and farmers should be able to submit complaints.

Complaint fields:

```text
User
Order
Subject
Description
Status
Admin Response
Created Date
```

Complaint statuses:

```text
Open
In Progress
Resolved
Rejected
```

Admin can view and manage all complaints.

---

# 16. Admin Dashboard

Create a separate professional Admin Dashboard.

### Dashboard statistics

Display:

```text
Total Farmers
Total Buyers
Total Products
Pending Products
Total Orders
Pending Orders
Completed Orders
Total Complaints
```

Use cards and charts where useful.

---

# 17. Admin Farmer Management

Admin can:

* View all farmers
* Search farmers
* Filter farmers
* View farmer details
* Activate/deactivate farmer
* Delete farmer if necessary

Display:

```text
Name
Email
Phone
Location
Farm Name
Total Products
Status
Registration Date
```

---

# 18. Admin Buyer Management

Admin can:

* View buyers
* Search buyers
* View buyer details
* Activate/deactivate buyers
* Delete users if required

---

# 19. Admin Product Management

Admin can:

* View all products
* Search products
* Filter by category
* Filter by status
* View product details
* Approve products
* Reject products
* Edit products
* Delete products

Product approval workflow:

```text
Farmer Creates Product
        ↓
Product = Pending
        ↓
Admin Reviews Product
        ↓
Approve / Reject
        ↓
Approved Product
        ↓
Visible to Buyers
```

If rejected, store a rejection reason.

---

# 20. Admin Purchase Request Management

Admin should be able to view:

```text
Request ID
Buyer
Farmer
Product
Quantity
Total Amount
Request Date
Status
```

Admin can:

```text
Accept
Reject
Cancel
```

---

# 21. Admin Order Management

Admin can:

* View all orders
* Search orders
* Filter orders
* View order details
* Update order status
* Assign delivery worker
* Track delivery
* Cancel eligible orders

---

# 22. Admin Complaint Management

Admin dashboard should contain a complaints section.

Admin can:

* View complaints
* Filter complaints
* Open complaint details
* Change complaint status
* Add admin response
* Resolve complaints

---

# 23. Database Models

Create the following MongoDB/Mongoose models.

### User

```text
name
email
phone
password
role
profileImage
address
city
state
pincode
status
createdAt
updatedAt
```

Role:

```text
farmer
buyer
admin
```

---

### Farmer Profile

```text
userId
farmName
farmLocation
about
totalLand
createdAt
updatedAt
```

---

### Category

```text
name
description
image
status
createdAt
updatedAt
```

---

### Product

```text
farmerId
categoryId
name
description
images
quantity
unit
price
location
availableFrom
availabilityStatus
approvalStatus
rejectionReason
createdAt
updatedAt
```

---

### Purchase Request

```text
buyerId
farmerId
productId
quantity
price
totalAmount
message
deliveryAddress
phone
status
createdAt
updatedAt
```

---

### Order

```text
orderNumber
buyerId
farmerId
productId
quantity
price
totalAmount
deliveryAddress
deliveryWorkerId
orderStatus
paymentStatus
createdAt
updatedAt
```

---

### Delivery Worker

```text
name
email
phone
address
city
status
createdAt
updatedAt
```

---

### Review

```text
buyerId
farmerId
productId
orderId
rating
comment
status
createdAt
updatedAt
```

---

### Complaint

```text
userId
orderId
subject
description
adminResponse
status
createdAt
updatedAt
```

---

# 24. API Structure

Create REST APIs following this structure:

```text
/api/auth
/api/users
/api/farmers
/api/buyers
/api/categories
/api/products
/api/purchase-requests
/api/orders
/api/delivery-workers
/api/reviews
/api/complaints
/api/admin
```

Example APIs:

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout
```

### Products

```http
GET /api/products
GET /api/products/:id
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
```

### Purchase Requests

```http
POST /api/purchase-requests
GET /api/purchase-requests
GET /api/purchase-requests/:id
PUT /api/purchase-requests/:id
```

### Orders

```http
GET /api/orders
GET /api/orders/:id
POST /api/orders
PUT /api/orders/:id/status
```

### Reviews

```http
POST /api/reviews
GET /api/products/:id/reviews
PUT /api/reviews/:id
DELETE /api/reviews/:id
```

### Complaints

```http
POST /api/complaints
GET /api/complaints
PUT /api/complaints/:id
```

---

# 25. Frontend Pages

Create the following pages.

## Public Pages

```text
/
 /about
 /products
 /products/:id
 /categories
 /login
 /register
```

## Buyer Pages

```text
/buyer/dashboard
/buyer/profile
/buyer/orders
/buyer/orders/:id
/buyer/requests
/buyer/reviews
/buyer/complaints
```

## Farmer Pages

```text
/farmer/dashboard
/farmer/profile
/farmer/products
/farmer/products/add
/farmer/products/edit/:id
/farmer/requests
/farmer/orders
/farmer/orders/:id
/farmer/reviews
```

## Admin Pages

```text
/admin/dashboard
/admin/farmers
/admin/buyers
/admin/products
/admin/categories
/admin/requests
/admin/orders
/admin/delivery-workers
/admin/complaints
/admin/reviews
```

---

# 26. UI/UX Requirements

Use **Tailwind CSS**.

Design should be:

* Clean
* Modern
* Professional
* Responsive
* Mobile friendly
* Easy to navigate
* Suitable for a college project demonstration

Use an agricultural/nature-inspired visual design.

Create:

* Responsive navbar
* Sidebar for dashboards
* Cards
* Tables
* Forms
* Modals
* Dropdowns
* Search bars
* Filter panels
* Status badges
* Toast notifications
* Loading states
* Empty states
* Confirmation dialogs
* Error messages

Use reusable components such as:

```text
Navbar
Footer
Sidebar
Button
Input
Select
Modal
ProductCard
ProductTable
StatusBadge
Pagination
Loader
ConfirmDialog
Toast
```

---

# 27. Project Folder Structure

Use a clean structure.

### Frontend

```text
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── auth/
│   │   ├── buyer/
│   │   ├── farmer/
│   │   └── admin/
│   ├── layouts/
│   ├── routes/
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── utils/
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
├── public/
├── .env
└── package.json
```

### Backend

```text
backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   ├── validators/
│   └── app.js
├── uploads/
├── .env
├── server.js
└── package.json
```

---

# 28. Security Requirements

Implement:

* Password hashing with bcrypt
* JWT authentication
* Protected routes
* Role-based authorization
* Input validation
* MongoDB query validation
* File upload validation
* File size limits
* Proper CORS configuration
* Environment variables
* Secure error responses
* Do not expose passwords in API responses

Never store plain-text passwords.

---

# 29. Product Image Upload

Farmers should be able to upload product images.

Requirements:

* Accept JPG, JPEG, PNG, and WebP
* Limit image size
* Generate unique filenames
* Store uploaded images safely
* Save image paths/URLs in MongoDB
* Display image previews before submission
* Allow multiple product images

For the mini project, local server storage can be used instead of a third-party image hosting service.

---

# 30. Validation

Add frontend and backend validation.

Examples:

### Email

Must be valid.

### Password

Minimum 6 characters.

### Phone

Accept valid phone number.

### Product Quantity

Must be greater than 0.

### Product Price

Must be greater than 0.

### Order Quantity

Cannot be greater than available product quantity.

### Required fields

Show meaningful validation messages.

---

# 31. Important Business Rules

Implement these rules carefully:

1. Only registered farmers can create products.
2. Newly created products are `Pending`.
3. Buyers can only see approved and available products.
4. Buyers cannot request more quantity than available.
5. Admin can approve or reject products.
6. Rejected products should contain a rejection reason.
7. A purchase request belongs to one buyer, farmer, and product.
8. When a request is accepted, create an order.
9. Order quantity cannot exceed available quantity.
10. When an order is completed, update product quantity.
11. If product quantity becomes zero, mark it as `Unavailable`.
12. Only buyers who completed an order can submit a review.
13. A buyer should not review the same order multiple times.
14. Only Admin can assign delivery workers.
15. Only available delivery workers should be assignable.
16. Admin can manage complaints.
17. Users can only access their own private data.
18. Admin can access all management data.

---

# 32. Dashboard Statistics

Farmer dashboard:

```text
Total Products
Approved Products
Pending Products
Purchase Requests
Active Orders
Completed Orders
```

Buyer dashboard:

```text
Total Requests
Pending Requests
Active Orders
Completed Orders
Total Reviews
```

Admin dashboard:

```text
Total Farmers
Total Buyers
Total Products
Pending Products
Total Orders
Pending Orders
Completed Orders
Total Complaints
```

---

# 33. Search and Pagination

Implement server-side search/filtering where appropriate.

Product search should support:

```text
?search=tomato
?category=vegetables
?minPrice=20
?maxPrice=100
?location=Pune
?page=1
&limit=12
```

Return pagination information:

```json
{
  "products": [],
  "currentPage": 1,
  "totalPages": 5,
  "totalProducts": 50
}
```

---

# 34. Error Handling

Create a centralized backend error handler.

Return consistent responses such as:

```json
{
  "success": false,
  "message": "Product not found"
}
```

Success:

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {}
}
```

Handle:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

---

# 35. Seed Data

Create a database seed script with demo data:

```text
1 Admin
5 Farmers
10 Buyers
8 Categories
20 Products
Purchase Requests
Orders
Delivery Workers
Reviews
Complaints
```

Create a demo admin account through the seed process rather than public registration.

---

# 36. Environment Variables

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Backend `.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Never hard-code credentials.

---

# 37. README

Create a complete README containing:

* Project overview
* Features
* Technology stack
* System requirements
* Installation steps
* Environment variables
* Database setup
* Seed instructions
* How to run frontend
* How to run backend
* API overview
* User roles
* Screenshots section
* Future improvements

---

# 38. Development Order

Build the project in this order:

### Phase 1

Project setup

```text
React + Vite
Tailwind CSS
Node.js
Express
MongoDB
Mongoose
```

### Phase 2

Authentication

```text
Register
Login
JWT
Protected routes
Role-based access
```

### Phase 3

Farmer module

```text
Farmer dashboard
Profile
Product CRUD
Product images
```

### Phase 4

Admin module

```text
Admin dashboard
Farmers
Buyers
Categories
Product approval
```

### Phase 5

Buyer module

```text
Home
Product listing
Search
Filter
Product details
```

### Phase 6

Purchase system

```text
Purchase requests
Request approval
Order creation
Order management
```

### Phase 7

Delivery

```text
Delivery workers
Worker assignment
Delivery tracking
```

### Phase 8

Reviews and complaints

```text
Ratings
Reviews
Complaints
Admin moderation
```

### Phase 9

Testing

Test:

* Authentication
* Authorization
* Product CRUD
* Product approval
* Search
* Filters
* Purchase requests
* Orders
* Delivery assignment
* Reviews
* Complaints
* Responsive UI

### Phase 10

Final polish

* Fix UI issues
* Fix API errors
* Add loading states
* Add empty states
* Add confirmation dialogs
* Improve responsive design
* Optimize API calls
* Clean unused code
* Prepare README
* Prepare demo data

---

# 39. Final Workflow

The complete application workflow should be:

```text
Farmer Registration
        ↓
Farmer Login
        ↓
Create Farmer Profile
        ↓
Add Agricultural Product
        ↓
Product Status = Pending
        ↓
Admin Reviews Product
        ↓
Approve Product
        ↓
Product Visible to Buyers
        ↓
Buyer Searches/Browses Products
        ↓
Buyer Views Product Details
        ↓
Buyer Submits Purchase Request
        ↓
Admin/Farmer Processes Request
        ↓
Request Accepted
        ↓
Order Created
        ↓
Admin Assigns Delivery Worker
        ↓
Order Processing
        ↓
Ready for Delivery
        ↓
Out for Delivery
        ↓
Delivered
        ↓
Buyer Gives Rating & Review
        ↓
Order Completed
```

---

# 40. Important Implementation Instructions

Build this as a **real working full-stack application**, not just static UI pages.

Requirements:

* All forms should work.
* All buttons should have functionality.
* Frontend must communicate with the backend using Axios.
* Backend must communicate with MongoDB using Mongoose.
* Authentication must actually work.
* JWT must protect private APIs.
* Role-based access must actually work.
* CRUD operations must work.
* Product approval must work.
* Purchase request workflow must work.
* Order workflow must work.
* Delivery assignment must work.
* Reviews and complaints must work.
* Use reusable components.
* Avoid duplicated code.
* Use clean naming conventions.
* Keep the implementation understandable for a college student.
* Do not over-engineer the application.
* Do not add unnecessary technologies.

Start by creating the complete project structure and then implement the application module by module.

At every stage, provide:

1. Files created/modified
2. Complete code
3. Installation commands
4. Environment variables required
5. API endpoints created
6. How to test the feature
7. Any important implementation notes

The final result should be a **fully functional Farm Connect agricultural marketplace** using:

**React + Vite + Tailwind CSS + Node.js + Express.js + MongoDB + Mongoose + JWT**.
