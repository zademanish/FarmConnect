import PurchaseRequest from "../models/PurchaseRequest.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import {
  asyncHandler,
  ApiError,
  sendSuccess,
  generateOrderNumber,
} from "../utils/helpers.js";

const POPULATE = [
  { path: "buyerId", select: "name email phone city" },
  { path: "farmerId", select: "name email phone city" },
  { path: "productId", select: "name images unit price" },
];

// POST /api/purchase-requests — buyer submits a request
export const createRequest = asyncHandler(async (req, res) => {
  const { productId, quantity, message, deliveryAddress, phone } = req.body;

  if (!productId || !quantity || !deliveryAddress || !phone) {
    throw new ApiError(400, "Product, quantity, delivery address and phone are required");
  }

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.approvalStatus !== "Approved" || product.availabilityStatus !== "Available") {
    throw new ApiError(400, "This product is not available for purchase");
  }

  const qty = Number(quantity);
  if (qty <= 0) throw new ApiError(400, "Quantity must be greater than 0");
  if (qty > product.quantity) {
    throw new ApiError(400, `Only ${product.quantity} ${product.unit} available`);
  }

  const request = await PurchaseRequest.create({
    buyerId: req.user._id,
    farmerId: product.farmerId,
    productId: product._id,
    quantity: qty,
    price: product.price,
    totalAmount: qty * product.price,
    message,
    deliveryAddress,
    phone,
  });

  sendSuccess(res, 201, "Purchase request submitted successfully", request);
});

// GET /api/purchase-requests — scoped to the caller's role
export const getRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};

  if (req.user.role === "buyer") filter.buyerId = req.user._id;
  else if (req.user.role === "farmer") filter.farmerId = req.user._id;
  // admin sees everything

  if (status) filter.status = status;

  const requests = await PurchaseRequest.find(filter).populate(POPULATE).sort("-createdAt");
  sendSuccess(res, 200, "Purchase requests fetched", requests);
});

// GET /api/purchase-requests/:id
export const getRequestById = asyncHandler(async (req, res) => {
  const request = await PurchaseRequest.findById(req.params.id).populate(POPULATE);
  if (!request) throw new ApiError(404, "Purchase request not found");

  const uid = req.user._id.toString();
  const allowed =
    req.user.role === "admin" ||
    request.buyerId._id.toString() === uid ||
    request.farmerId._id.toString() === uid;
  if (!allowed) throw new ApiError(403, "You cannot view this request");

  sendSuccess(res, 200, "Purchase request fetched", request);
});

// PUT /api/purchase-requests/:id — accept / reject / cancel
export const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["Accepted", "Rejected", "Cancelled"].includes(status)) {
    throw new ApiError(400, "Status must be Accepted, Rejected or Cancelled");
  }

  const request = await PurchaseRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, "Purchase request not found");
  if (request.status !== "Pending") {
    throw new ApiError(400, `This request is already ${request.status.toLowerCase()}`);
  }

  const uid = req.user._id.toString();
  const isFarmer = request.farmerId.toString() === uid;
  const isBuyer = request.buyerId.toString() === uid;
  const isAdmin = req.user.role === "admin";

  // Buyers may only cancel; farmers and admin may accept/reject
  if (status === "Cancelled" && !(isBuyer || isAdmin)) {
    throw new ApiError(403, "Only the buyer can cancel this request");
  }
  if (["Accepted", "Rejected"].includes(status) && !(isFarmer || isAdmin)) {
    throw new ApiError(403, "Only the farmer can accept or reject this request");
  }

  // Accepting a request creates the order and reserves the stock
  if (status === "Accepted") {
    const product = await Product.findById(request.productId);
    if (!product) throw new ApiError(404, "Product no longer exists");
    if (request.quantity > product.quantity) {
      throw new ApiError(400, `Only ${product.quantity} ${product.unit} left in stock`);
    }

    product.quantity -= request.quantity;
    if (product.quantity === 0) product.availabilityStatus = "Unavailable";
    await product.save();

    await Order.create({
      orderNumber: generateOrderNumber(),
      requestId: request._id,
      buyerId: request.buyerId,
      farmerId: request.farmerId,
      productId: request.productId,
      quantity: request.quantity,
      price: request.price,
      totalAmount: request.totalAmount,
      deliveryAddress: request.deliveryAddress,
      phone: request.phone,
      orderStatus: "Confirmed",
      paymentStatus: "Cash on Delivery",
    });
  }

  request.status = status;
  await request.save();

  sendSuccess(
    res,
    200,
    status === "Accepted"
      ? "Request accepted and order created"
      : `Request ${status.toLowerCase()} successfully`,
    request
  );
});
