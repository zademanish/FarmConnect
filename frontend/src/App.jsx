import { Routes, Route, Navigate } from "react-router-dom";
import {
  LayoutDashboard, Package, PlusCircle, Inbox, ShoppingBag, Star, User,
  Users, Tractor, FolderTree, Truck, MessageSquare,
} from "lucide-react";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Public
import Home from "./pages/public/Home";
import Products from "./pages/public/Products";
import ProductDetail from "./pages/public/ProductDetail";
import Categories from "./pages/public/Categories";
import About from "./pages/public/About";
import FarmerProfilePublic from "./pages/public/FarmerProfile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";

// Farmer
import FarmerDashboard from "./pages/farmer/Dashboard";
import FarmerProducts from "./pages/farmer/MyProducts";
import ProductForm from "./pages/farmer/ProductForm";
import FarmerRequests from "./pages/farmer/Requests";
import FarmerOrders from "./pages/farmer/Orders";
import FarmerOrderDetail from "./pages/farmer/OrderDetail";
import FarmerReviews from "./pages/farmer/Reviews";
import FarmerComplaints from "./pages/farmer/Complaints";
import FarmerProfilePage from "./pages/farmer/Profile";

// Buyer
import BuyerDashboard from "./pages/buyer/Dashboard";
import BuyerRequests from "./pages/buyer/Requests";
import BuyerOrders from "./pages/buyer/Orders";
import BuyerOrderDetail from "./pages/buyer/OrderDetail";
import BuyerReviews from "./pages/buyer/Reviews";
import BuyerComplaints from "./pages/buyer/Complaints";
import BuyerProfile from "./pages/buyer/Profile";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AdminFarmers from "./pages/admin/Farmers";
import AdminBuyers from "./pages/admin/Buyers";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminRequests from "./pages/admin/Requests";
import AdminOrders from "./pages/admin/Orders";
import AdminWorkers from "./pages/admin/DeliveryWorkers";
import AdminComplaints from "./pages/admin/Complaints";
import AdminReviews from "./pages/admin/Reviews";

const FARMER_LINKS = [
  { to: "/farmer/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/farmer/products", label: "My Products", icon: Package },
  { to: "/farmer/products/add", label: "Add Product", icon: PlusCircle },
  { to: "/farmer/requests", label: "Purchase Requests", icon: Inbox },
  { to: "/farmer/orders", label: "Orders", icon: ShoppingBag },
  { to: "/farmer/reviews", label: "Reviews", icon: Star },
  { to: "/farmer/complaints", label: "Complaints", icon: MessageSquare },
  { to: "/farmer/profile", label: "My Profile", icon: User },
];

const BUYER_LINKS = [
  { to: "/buyer/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/buyer/requests", label: "My Requests", icon: Inbox },
  { to: "/buyer/orders", label: "My Orders", icon: ShoppingBag },
  { to: "/buyer/reviews", label: "My Reviews", icon: Star },
  { to: "/buyer/complaints", label: "Complaints", icon: MessageSquare },
  { to: "/buyer/profile", label: "My Profile", icon: User },
];

const ADMIN_LINKS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/farmers", label: "Farmers", icon: Tractor },
  { to: "/admin/buyers", label: "Buyers", icon: Users },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/requests", label: "Purchase Requests", icon: Inbox },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/delivery-workers", label: "Delivery Workers", icon: Truck },
  { to: "/admin/complaints", label: "Complaints", icon: MessageSquare },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
];

const App = () => (
  <Routes>
    {/* Auth pages sit outside the public shell */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Public */}
    <Route element={<PublicLayout />}>
      <Route index element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/farmers/:id" element={<FarmerProfilePublic />} />
      <Route path="/about" element={<About />} />
    </Route>

    {/* Farmer */}
    <Route
      path="/farmer"
      element={
        <ProtectedRoute roles={["farmer"]}>
          <DashboardLayout links={FARMER_LINKS} title="Farmer Panel" />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/farmer/dashboard" replace />} />
      <Route path="dashboard" element={<FarmerDashboard />} />
      <Route path="products" element={<FarmerProducts />} />
      <Route path="products/add" element={<ProductForm />} />
      <Route path="products/edit/:id" element={<ProductForm />} />
      <Route path="requests" element={<FarmerRequests />} />
      <Route path="orders" element={<FarmerOrders />} />
      <Route path="orders/:id" element={<FarmerOrderDetail />} />
      <Route path="reviews" element={<FarmerReviews />} />
      <Route path="complaints" element={<FarmerComplaints />} />
      <Route path="profile" element={<FarmerProfilePage />} />
    </Route>

    {/* Buyer */}
    <Route
      path="/buyer"
      element={
        <ProtectedRoute roles={["buyer"]}>
          <DashboardLayout links={BUYER_LINKS} title="Buyer Panel" />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/buyer/dashboard" replace />} />
      <Route path="dashboard" element={<BuyerDashboard />} />
      <Route path="requests" element={<BuyerRequests />} />
      <Route path="orders" element={<BuyerOrders />} />
      <Route path="orders/:id" element={<BuyerOrderDetail />} />
      <Route path="reviews" element={<BuyerReviews />} />
      <Route path="complaints" element={<BuyerComplaints />} />
      <Route path="profile" element={<BuyerProfile />} />
    </Route>

    {/* Admin */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute roles={["admin"]}>
          <DashboardLayout links={ADMIN_LINKS} title="Admin Panel" />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="farmers" element={<AdminFarmers />} />
      <Route path="buyers" element={<AdminBuyers />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="categories" element={<AdminCategories />} />
      <Route path="requests" element={<AdminRequests />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="delivery-workers" element={<AdminWorkers />} />
      <Route path="complaints" element={<AdminComplaints />} />
      <Route path="reviews" element={<AdminReviews />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
