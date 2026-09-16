import User from "../models/User.js";
import FarmerProfile from "../models/FarmerProfile.js";
import Product from "../models/Product.js";
import PurchaseRequest from "../models/PurchaseRequest.js";
import Order from "../models/Order.js";
import Complaint from "../models/Complaint.js";
import Review from "../models/Review.js";
import { asyncHandler, ApiError, sendSuccess, publicUser } from "../utils/helpers.js";
import { removeFile } from "../middleware/upload.js";

// GET /api/admin/stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalFarmers,
    totalBuyers,
    totalProducts,
    pendingProducts,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalComplaints,
    openComplaints,
    totalRequests,
  ] = await Promise.all([
    User.countDocuments({ role: "farmer" }),
    User.countDocuments({ role: "buyer" }),
    Product.countDocuments(),
    Product.countDocuments({ approvalStatus: "Pending" }),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: { $nin: ["Delivered", "Cancelled"] } }),
    Order.countDocuments({ orderStatus: "Delivered" }),
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: "Open" }),
    PurchaseRequest.countDocuments(),
  ]);

  const revenueAgg = await Order.aggregate([
    { $match: { orderStatus: "Delivered" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  // Orders per status — feeds the dashboard chart
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);

  const [recentOrders, recentProducts] = await Promise.all([
    Order.find()
      .populate("buyerId", "name")
      .populate("productId", "name")
      .sort("-createdAt")
      .limit(5),
    Product.find()
      .populate("farmerId", "name")
      .populate("categoryId", "name")
      .sort("-createdAt")
      .limit(5),
  ]);

  sendSuccess(res, 200, "Dashboard stats fetched", {
    stats: {
      totalFarmers,
      totalBuyers,
      totalProducts,
      pendingProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalComplaints,
      openComplaints,
      totalRequests,
      totalRevenue: revenueAgg[0]?.total || 0,
    },
    ordersByStatus,
    recentOrders,
    recentProducts,
  });
});

// GET /api/admin/users?role=farmer|buyer
export const getUsers = asyncHandler(async (req, res) => {
  const { role, search, status } = req.query;
  const filter = {};
  if (role) filter.role = role;
  else filter.role = { $ne: "admin" };
  if (status) filter.status = status;
  if (search) {
    const rx = new RegExp(search, "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { city: rx }];
  }

  const users = await User.find(filter).sort("-createdAt");

  // Farmers are listed with their farm name and product count
  const enriched = await Promise.all(
    users.map(async (u) => {
      const base = publicUser(u);
      if (u.role === "farmer") {
        const [profile, totalProducts] = await Promise.all([
          FarmerProfile.findOne({ userId: u._id }),
          Product.countDocuments({ farmerId: u._id }),
        ]);
        return { ...base, farmName: profile?.farmName || "", totalProducts };
      }
      const totalOrders = await Order.countDocuments({ buyerId: u._id });
      return { ...base, totalOrders };
    })
  );

  sendSuccess(res, 200, "Users fetched", enriched);
});

// GET /api/admin/users/:id
export const getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  const data = { user: publicUser(user) };

  if (user.role === "farmer") {
    [data.profile, data.products, data.orders] = await Promise.all([
      FarmerProfile.findOne({ userId: user._id }),
      Product.find({ farmerId: user._id }).populate("categoryId", "name").sort("-createdAt"),
      Order.find({ farmerId: user._id }).populate("productId", "name").sort("-createdAt").limit(10),
    ]);
  } else {
    [data.orders, data.requests] = await Promise.all([
      Order.find({ buyerId: user._id }).populate("productId", "name").sort("-createdAt").limit(10),
      PurchaseRequest.find({ buyerId: user._id })
        .populate("productId", "name")
        .sort("-createdAt")
        .limit(10),
    ]);
  }

  sendSuccess(res, 200, "User details fetched", data);
});

// PUT /api/admin/users/:id/status — activate / deactivate
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "admin") throw new ApiError(403, "Admin accounts cannot be modified");

  user.status = user.status === "active" ? "inactive" : "active";
  await user.save();

  sendSuccess(res, 200, `User ${user.status === "active" ? "activated" : "deactivated"}`, {
    user: publicUser(user),
  });
});

// DELETE /api/admin/users/:id — removes the user and their data
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "admin") throw new ApiError(403, "Admin accounts cannot be deleted");

  const activeOrders = await Order.countDocuments({
    $or: [{ buyerId: user._id }, { farmerId: user._id }],
    orderStatus: { $nin: ["Delivered", "Cancelled"] },
  });
  if (activeOrders > 0) {
    throw new ApiError(409, "Cannot delete: this user has active orders");
  }

  if (user.role === "farmer") {
    const products = await Product.find({ farmerId: user._id });
    products.forEach((p) => p.images.forEach(removeFile));
    await Product.deleteMany({ farmerId: user._id });
    await FarmerProfile.deleteOne({ userId: user._id });
  }

  removeFile(user.profileImage);
  await Promise.all([
    PurchaseRequest.deleteMany({ $or: [{ buyerId: user._id }, { farmerId: user._id }] }),
    Review.deleteMany({ $or: [{ buyerId: user._id }, { farmerId: user._id }] }),
    Complaint.deleteMany({ userId: user._id }),
  ]);
  await user.deleteOne();

  sendSuccess(res, 200, "User deleted successfully");
});

// GET /api/admin/products — all products regardless of status
export const getAllProducts = asyncHandler(async (req, res) => {
  const { status, category, search } = req.query;
  const filter = {};
  if (status) filter.approvalStatus = status;
  if (category) filter.categoryId = category;
  if (search) filter.name = new RegExp(search, "i");

  const products = await Product.find(filter)
    .populate("farmerId", "name email city")
    .populate("categoryId", "name")
    .sort("-createdAt");

  sendSuccess(res, 200, "Products fetched", products);
});

// PUT /api/admin/products/:id/approval — approve or reject a listing
export const updateProductApproval = asyncHandler(async (req, res) => {
  const { approvalStatus, rejectionReason } = req.body;
  if (!["Approved", "Rejected"].includes(approvalStatus)) {
    throw new ApiError(400, "Approval status must be Approved or Rejected");
  }
  if (approvalStatus === "Rejected" && !rejectionReason) {
    throw new ApiError(400, "A rejection reason is required");
  }

  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  product.approvalStatus = approvalStatus;
  product.rejectionReason = approvalStatus === "Rejected" ? rejectionReason : "";
  await product.save();

  sendSuccess(res, 200, `Product ${approvalStatus.toLowerCase()} successfully`, product);
});
