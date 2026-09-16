import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { asyncHandler, ApiError, sendSuccess } from "../utils/helpers.js";

// Recalculates a product's average rating after any review change
const refreshProductRating = async (productId) => {
  const reviews = await Review.find({ productId, status: "visible" });
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  await Product.findByIdAndUpdate(productId, {
    avgRating: reviews.length ? Number((total / reviews.length).toFixed(1)) : 0,
    totalReviews: reviews.length,
  });
};

// POST /api/reviews — buyer reviews a delivered order
export const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, comment } = req.body;
  if (!orderId || !rating) throw new ApiError(400, "Order and rating are required");
  if (rating < 1 || rating > 5) throw new ApiError(400, "Rating must be between 1 and 5");

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.buyerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only review your own orders");
  }
  if (order.orderStatus !== "Delivered") {
    throw new ApiError(400, "You can review only after the order is delivered");
  }

  const existing = await Review.findOne({ orderId, buyerId: req.user._id });
  if (existing) throw new ApiError(409, "You have already reviewed this order");

  const review = await Review.create({
    buyerId: req.user._id,
    farmerId: order.farmerId,
    productId: order.productId,
    orderId: order._id,
    rating: Number(rating),
    comment,
  });

  order.isReviewed = true;
  await order.save();
  await refreshProductRating(order.productId);

  sendSuccess(res, 201, "Review submitted successfully", review);
});

// GET /api/reviews — role-scoped list (admin sees all, for moderation)
export const getReviews = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "buyer") filter.buyerId = req.user._id;
  else if (req.user.role === "farmer") {
    filter.farmerId = req.user._id;
    filter.status = "visible";
  }

  const reviews = await Review.find(filter)
    .populate("buyerId", "name profileImage")
    .populate("farmerId", "name")
    .populate("productId", "name images")
    .sort("-createdAt");

  sendSuccess(res, 200, "Reviews fetched", reviews);
});

// GET /api/reviews/product/:productId — public
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ productId: req.params.productId, status: "visible" })
    .populate("buyerId", "name profileImage")
    .sort("-createdAt");
  sendSuccess(res, 200, "Reviews fetched", reviews);
});

// PUT /api/reviews/:id — buyer edits own review, admin moderates visibility
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  const { rating, comment, status } = req.body;

  if (req.user.role === "admin") {
    if (status) review.status = status;
  } else {
    if (review.buyerId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You can only edit your own review");
    }
    if (rating) {
      if (rating < 1 || rating > 5) throw new ApiError(400, "Rating must be between 1 and 5");
      review.rating = Number(rating);
    }
    if (comment !== undefined) review.comment = comment;
  }

  await review.save();
  await refreshProductRating(review.productId);
  sendSuccess(res, 200, "Review updated successfully", review);
});

// DELETE /api/reviews/:id
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  const isOwner = review.buyerId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "You can only delete your own review");
  }

  const { productId, orderId } = review;
  await review.deleteOne();
  await Order.findByIdAndUpdate(orderId, { isReviewed: false });
  await refreshProductRating(productId);

  sendSuccess(res, 200, "Review deleted successfully");
});
