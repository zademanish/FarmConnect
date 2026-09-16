import mongoose from "mongoose";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import FarmerProfile from "../models/FarmerProfile.js";
import { asyncHandler, ApiError, sendSuccess } from "../utils/helpers.js";
import { toPublicPath, removeFile } from "../middleware/upload.js";

// GET /api/products — public listing with search, filters, sorting, pagination
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    location,
    availability,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  // Buyers only ever see approved products
  const filter = { approvalStatus: "Approved" };

  if (category && mongoose.isValidObjectId(category)) filter.categoryId = category;
  if (location) filter.location = new RegExp(location, "i");
  if (availability) filter.availabilityStatus = availability;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Search matches product name, location, or the farmer's name
  if (search) {
    const rx = new RegExp(search, "i");
    const farmers = await User.find({ role: "farmer", name: rx }).select("_id");
    filter.$or = [
      { name: rx },
      { description: rx },
      { location: rx },
      { farmerId: { $in: farmers.map((f) => f._id) } },
    ];
  }

  const sortMap = {
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    newest: { createdAt: -1 },
    rating: { avgRating: -1 },
  };
  const sortBy = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(1, Number(page));
  const perPage = Math.min(50, Math.max(1, Number(limit)));

  const [products, totalProducts] = await Promise.all([
    Product.find(filter)
      .populate("farmerId", "name city state profileImage")
      .populate("categoryId", "name")
      .sort(sortBy)
      .skip((pageNum - 1) * perPage)
      .limit(perPage),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: "Products fetched",
    products,
    currentPage: pageNum,
    totalPages: Math.ceil(totalProducts / perPage) || 1,
    totalProducts,
  });
});

// GET /api/products/:id — public detail page
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("farmerId", "name email phone city state address profileImage createdAt")
    .populate("categoryId", "name");
  if (!product) throw new ApiError(404, "Product not found");

  // Unapproved products are visible only to their farmer and to admins
  const viewerId = req.user?._id?.toString();
  const isOwner = viewerId === product.farmerId?._id?.toString();
  if (product.approvalStatus !== "Approved" && !isOwner && req.user?.role !== "admin") {
    throw new ApiError(404, "Product not found");
  }

  const [reviews, farmerProfile] = await Promise.all([
    Review.find({ productId: product._id, status: "visible" })
      .populate("buyerId", "name profileImage")
      .sort("-createdAt"),
    FarmerProfile.findOne({ userId: product.farmerId?._id }),
  ]);

  sendSuccess(res, 200, "Product fetched", { product, reviews, farmerProfile });
});

// GET /api/products/farmer/my-products — farmer's own listings
export const getMyProducts = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filter = { farmerId: req.user._id };
  if (status) filter.approvalStatus = status;
  if (search) filter.name = new RegExp(search, "i");

  const products = await Product.find(filter)
    .populate("categoryId", "name")
    .sort("-createdAt");

  sendSuccess(res, 200, "Products fetched", products);
});

// POST /api/products — farmer creates a listing (starts as Pending)
export const createProduct = asyncHandler(async (req, res) => {
  const { name, categoryId, description, quantity, unit, price, location, availableFrom } =
    req.body;

  if (!name || !categoryId || !quantity || !price || !location) {
    throw new ApiError(400, "Name, category, quantity, price and location are required");
  }
  if (Number(quantity) <= 0) throw new ApiError(400, "Quantity must be greater than 0");
  if (Number(price) <= 0) throw new ApiError(400, "Price must be greater than 0");

  const product = await Product.create({
    farmerId: req.user._id,
    categoryId,
    name,
    description,
    quantity: Number(quantity),
    unit: unit || "KG",
    price: Number(price),
    location,
    availableFrom: availableFrom || Date.now(),
    images: (req.files || []).map(toPublicPath),
    approvalStatus: "Pending", // admin must approve before buyers see it
  });

  sendSuccess(res, 201, "Product created and sent for admin approval", product);
});

// PUT /api/products/:id — farmer edits own product (admin may edit any)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  const isOwner = product.farmerId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "You can only edit your own products");
  }

  const { name, categoryId, description, quantity, unit, price, location, availabilityStatus, existingImages } =
    req.body;

  if (quantity !== undefined && Number(quantity) < 0) {
    throw new ApiError(400, "Quantity cannot be negative");
  }
  if (price !== undefined && Number(price) <= 0) {
    throw new ApiError(400, "Price must be greater than 0");
  }

  if (name) product.name = name;
  if (categoryId) product.categoryId = categoryId;
  if (description !== undefined) product.description = description;
  if (quantity !== undefined) product.quantity = Number(quantity);
  if (unit) product.unit = unit;
  if (price !== undefined) product.price = Number(price);
  if (location) product.location = location;
  if (availabilityStatus) product.availabilityStatus = availabilityStatus;

  // Images the farmer kept (sent back as JSON array); the rest are deleted from disk
  if (existingImages !== undefined) {
    const keep = typeof existingImages === "string" ? JSON.parse(existingImages) : existingImages;
    product.images.filter((img) => !keep.includes(img)).forEach(removeFile);
    product.images = keep;
  }
  if (req.files?.length) {
    product.images.push(...req.files.map(toPublicPath));
  }

  // An edited product goes back to Pending for re-approval
  if (req.user.role !== "admin") {
    product.approvalStatus = "Pending";
    product.rejectionReason = "";
  }

  await product.save();
  sendSuccess(res, 200, "Product updated successfully", product);
});

// DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  const isOwner = product.farmerId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "You can only delete your own products");
  }

  product.images.forEach(removeFile); // clean up local image files
  await product.deleteOne();
  sendSuccess(res, 200, "Product deleted successfully");
});

// GET /api/products/home/featured — home page sections
export const getHomeProducts = asyncHandler(async (req, res) => {
  const base = { approvalStatus: "Approved", availabilityStatus: "Available" };
  const populate = [
    { path: "farmerId", select: "name city state" },
    { path: "categoryId", select: "name" },
  ];

  const [featured, recent] = await Promise.all([
    Product.find(base).populate(populate).sort("-avgRating -totalReviews").limit(8),
    Product.find(base).populate(populate).sort("-createdAt").limit(8),
  ]);

  sendSuccess(res, 200, "Home products fetched", { featured, recent });
});
