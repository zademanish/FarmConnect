import Order from "../models/Order.js";
import Product from "../models/Product.js";
import DeliveryWorker from "../models/DeliveryWorker.js";
import { asyncHandler, ApiError, sendSuccess } from "../utils/helpers.js";

const POPULATE = [
  { path: "buyerId", select: "name email phone city state address" },
  { path: "farmerId", select: "name email phone city state" },
  { path: "productId", select: "name images unit price" },
  { path: "deliveryWorkerId", select: "name phone city status" },
];

// Allowed transitions — keeps the delivery flow moving in one direction
const FLOW = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Processing", "Cancelled"],
  Processing: ["Ready for Delivery", "Cancelled"],
  "Ready for Delivery": ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

// GET /api/orders — scoped by role
export const getOrders = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filter = {};

  if (req.user.role === "buyer") filter.buyerId = req.user._id;
  else if (req.user.role === "farmer") filter.farmerId = req.user._id;

  if (status) filter.orderStatus = status;
  if (search) filter.orderNumber = new RegExp(search, "i");

  const orders = await Order.find(filter).populate(POPULATE).sort("-createdAt");
  sendSuccess(res, 200, "Orders fetched", orders);
});

// GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(POPULATE);
  if (!order) throw new ApiError(404, "Order not found");

  const uid = req.user._id.toString();
  const allowed =
    req.user.role === "admin" ||
    order.buyerId._id.toString() === uid ||
    order.farmerId._id.toString() === uid;
  if (!allowed) throw new ApiError(403, "You cannot view this order");

  sendSuccess(res, 200, "Order fetched", order);
});

// PUT /api/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const uid = req.user._id.toString();
  const isFarmer = order.farmerId.toString() === uid;
  const isBuyer = order.buyerId.toString() === uid;
  const isAdmin = req.user.role === "admin";

  if (!isAdmin && !isFarmer && !isBuyer) {
    throw new ApiError(403, "You cannot update this order");
  }

  if (orderStatus) {
    if (!FLOW[order.orderStatus]?.includes(orderStatus)) {
      throw new ApiError(
        400,
        `Cannot change status from "${order.orderStatus}" to "${orderStatus}"`
      );
    }

    // Buyers may only cancel, and only before the order ships
    if (isBuyer && !isAdmin) {
      if (orderStatus !== "Cancelled") {
        throw new ApiError(403, "Buyers can only cancel an order");
      }
      if (["Out for Delivery", "Delivered"].includes(order.orderStatus)) {
        throw new ApiError(400, "This order can no longer be cancelled");
      }
    }

    // Cancelling returns the reserved stock to the product
    if (orderStatus === "Cancelled") {
      const product = await Product.findById(order.productId);
      if (product) {
        product.quantity += order.quantity;
        if (product.quantity > 0) product.availabilityStatus = "Available";
        await product.save();
      }
    }

    // Delivery completes the job — free the assigned worker and settle payment
    if (orderStatus === "Delivered") {
      if (order.deliveryWorkerId) {
        await DeliveryWorker.findByIdAndUpdate(order.deliveryWorkerId, { status: "Available" });
      }
      order.paymentStatus = "Paid";
    }

    order.orderStatus = orderStatus;
  }

  if (paymentStatus && (isAdmin || isFarmer)) order.paymentStatus = paymentStatus;

  await order.save();
  sendSuccess(res, 200, "Order updated successfully", order);
});

// PUT /api/orders/:id/assign-worker — admin only
export const assignDeliveryWorker = asyncHandler(async (req, res) => {
  const { deliveryWorkerId } = req.body;
  if (!deliveryWorkerId) throw new ApiError(400, "Delivery worker is required");

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  if (["Delivered", "Cancelled"].includes(order.orderStatus)) {
    throw new ApiError(400, `Cannot assign a worker to a ${order.orderStatus.toLowerCase()} order`);
  }

  const worker = await DeliveryWorker.findById(deliveryWorkerId);
  if (!worker) throw new ApiError(404, "Delivery worker not found");
  if (worker.status !== "Available") {
    throw new ApiError(400, `${worker.name} is currently ${worker.status.toLowerCase()}`);
  }

  // Release the previously assigned worker, if any
  if (order.deliveryWorkerId) {
    await DeliveryWorker.findByIdAndUpdate(order.deliveryWorkerId, { status: "Available" });
  }

  order.deliveryWorkerId = worker._id;
  if (order.orderStatus === "Ready for Delivery") order.orderStatus = "Out for Delivery";
  await order.save();

  worker.status = "Busy";
  await worker.save();

  const populated = await Order.findById(order._id).populate(POPULATE);
  sendSuccess(res, 200, `${worker.name} assigned to this order`, populated);
});
