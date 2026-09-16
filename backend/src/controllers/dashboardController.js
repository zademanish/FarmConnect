import Product from "../models/Product.js";
import PurchaseRequest from "../models/PurchaseRequest.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import { asyncHandler, sendSuccess } from "../utils/helpers.js";

// GET /api/users/farmer/dashboard
export const getFarmerDashboard = asyncHandler(async (req, res) => {
  const farmerId = req.user._id;

  const [
    totalProducts,
    approvedProducts,
    pendingProducts,
    totalRequests,
    pendingRequests,
    acceptedRequests,
    activeOrders,
    completedOrders,
  ] = await Promise.all([
    Product.countDocuments({ farmerId }),
    Product.countDocuments({ farmerId, approvalStatus: "Approved" }),
    Product.countDocuments({ farmerId, approvalStatus: "Pending" }),
    PurchaseRequest.countDocuments({ farmerId }),
    PurchaseRequest.countDocuments({ farmerId, status: "Pending" }),
    PurchaseRequest.countDocuments({ farmerId, status: "Accepted" }),
    Order.countDocuments({ farmerId, orderStatus: { $nin: ["Delivered", "Cancelled"] } }),
    Order.countDocuments({ farmerId, orderStatus: "Delivered" }),
  ]);

  const earnings = await Order.aggregate([
    { $match: { farmerId, orderStatus: "Delivered" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  const [recentRequests, recentOrders] = await Promise.all([
    PurchaseRequest.find({ farmerId })
      .populate("buyerId", "name city")
      .populate("productId", "name unit")
      .sort("-createdAt")
      .limit(5),
    Order.find({ farmerId })
      .populate("buyerId", "name city")
      .populate("productId", "name unit")
      .sort("-createdAt")
      .limit(5),
  ]);

  sendSuccess(res, 200, "Farmer dashboard fetched", {
    stats: {
      totalProducts,
      approvedProducts,
      pendingProducts,
      totalRequests,
      pendingRequests,
      acceptedRequests,
      activeOrders,
      completedOrders,
      totalEarnings: earnings[0]?.total || 0,
    },
    recentRequests,
    recentOrders,
  });
});

// GET /api/users/buyer/dashboard
export const getBuyerDashboard = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;

  const [totalRequests, pendingRequests, activeOrders, completedOrders, totalReviews] =
    await Promise.all([
      PurchaseRequest.countDocuments({ buyerId }),
      PurchaseRequest.countDocuments({ buyerId, status: "Pending" }),
      Order.countDocuments({ buyerId, orderStatus: { $nin: ["Delivered", "Cancelled"] } }),
      Order.countDocuments({ buyerId, orderStatus: "Delivered" }),
      Review.countDocuments({ buyerId }),
    ]);

  const spent = await Order.aggregate([
    { $match: { buyerId, orderStatus: "Delivered" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  const [recentOrders, recentRequests] = await Promise.all([
    Order.find({ buyerId })
      .populate("productId", "name images unit")
      .populate("farmerId", "name city")
      .sort("-createdAt")
      .limit(5),
    PurchaseRequest.find({ buyerId })
      .populate("productId", "name images unit")
      .populate("farmerId", "name city")
      .sort("-createdAt")
      .limit(5),
  ]);

  sendSuccess(res, 200, "Buyer dashboard fetched", {
    stats: {
      totalRequests,
      pendingRequests,
      activeOrders,
      completedOrders,
      totalReviews,
      totalSpent: spent[0]?.total || 0,
    },
    recentOrders,
    recentRequests,
  });
});
