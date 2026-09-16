import DeliveryWorker from "../models/DeliveryWorker.js";
import Order from "../models/Order.js";
import { asyncHandler, ApiError, sendSuccess } from "../utils/helpers.js";

// GET /api/delivery-workers — admin
export const getWorkers = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    const rx = new RegExp(search, "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { city: rx }];
  }

  const workers = await DeliveryWorker.find(filter).sort("-createdAt");
  sendSuccess(res, 200, "Delivery workers fetched", workers);
});

// POST /api/delivery-workers — admin
export const createWorker = asyncHandler(async (req, res) => {
  const { name, email, phone, address, city, status } = req.body;
  if (!name || !email || !phone) {
    throw new ApiError(400, "Name, email and phone are required");
  }

  const exists = await DeliveryWorker.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, "A worker with this email already exists");

  const worker = await DeliveryWorker.create({
    name,
    email,
    phone,
    address,
    city,
    status: status || "Available",
  });
  sendSuccess(res, 201, "Delivery worker added successfully", worker);
});

// PUT /api/delivery-workers/:id — admin
export const updateWorker = asyncHandler(async (req, res) => {
  const worker = await DeliveryWorker.findById(req.params.id);
  if (!worker) throw new ApiError(404, "Delivery worker not found");

  const { name, email, phone, address, city, status } = req.body;

  // Don't free a worker who is still attached to an active order
  if (status && status !== "Busy" && worker.status === "Busy") {
    const active = await Order.countDocuments({
      deliveryWorkerId: worker._id,
      orderStatus: { $nin: ["Delivered", "Cancelled"] },
    });
    if (active > 0) {
      throw new ApiError(409, "This worker is assigned to an active order");
    }
  }

  if (name) worker.name = name;
  if (email) worker.email = email;
  if (phone) worker.phone = phone;
  if (address !== undefined) worker.address = address;
  if (city !== undefined) worker.city = city;
  if (status) worker.status = status;

  await worker.save();
  sendSuccess(res, 200, "Delivery worker updated successfully", worker);
});

// GET /api/delivery-workers/:id — admin, with assigned orders
export const getWorkerById = asyncHandler(async (req, res) => {
  const worker = await DeliveryWorker.findById(req.params.id);
  if (!worker) throw new ApiError(404, "Delivery worker not found");

  const orders = await Order.find({ deliveryWorkerId: worker._id })
    .populate("buyerId", "name city")
    .populate("productId", "name")
    .sort("-createdAt");

  sendSuccess(res, 200, "Delivery worker fetched", { worker, orders });
});

// DELETE /api/delivery-workers/:id — admin
export const deleteWorker = asyncHandler(async (req, res) => {
  const worker = await DeliveryWorker.findById(req.params.id);
  if (!worker) throw new ApiError(404, "Delivery worker not found");

  const active = await Order.countDocuments({
    deliveryWorkerId: worker._id,
    orderStatus: { $nin: ["Delivered", "Cancelled"] },
  });
  if (active > 0) throw new ApiError(409, "Cannot delete: worker has active orders");

  await worker.deleteOne();
  sendSuccess(res, 200, "Delivery worker deleted successfully");
});
