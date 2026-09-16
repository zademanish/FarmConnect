import Complaint from "../models/Complaint.js";
import { asyncHandler, ApiError, sendSuccess } from "../utils/helpers.js";

const POPULATE = [
  { path: "userId", select: "name email phone role" },
  { path: "orderId", select: "orderNumber totalAmount orderStatus" },
];

// POST /api/complaints — buyer or farmer raises a complaint
export const createComplaint = asyncHandler(async (req, res) => {
  const { orderId, subject, description } = req.body;
  if (!subject || !description) {
    throw new ApiError(400, "Subject and description are required");
  }

  const complaint = await Complaint.create({
    userId: req.user._id,
    orderId: orderId || null,
    subject,
    description,
  });

  sendSuccess(res, 201, "Complaint submitted successfully", complaint);
});

// GET /api/complaints — users see their own, admin sees all
export const getComplaints = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = req.user.role === "admin" ? {} : { userId: req.user._id };
  if (status) filter.status = status;

  const complaints = await Complaint.find(filter).populate(POPULATE).sort("-createdAt");
  sendSuccess(res, 200, "Complaints fetched", complaints);
});

// GET /api/complaints/:id
export const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id).populate(POPULATE);
  if (!complaint) throw new ApiError(404, "Complaint not found");

  const isOwner = complaint.userId._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "You cannot view this complaint");
  }

  sendSuccess(res, 200, "Complaint fetched", complaint);
});

// PUT /api/complaints/:id — admin responds and changes status
export const updateComplaint = asyncHandler(async (req, res) => {
  const { status, adminResponse } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new ApiError(404, "Complaint not found");

  if (status) complaint.status = status;
  if (adminResponse !== undefined) complaint.adminResponse = adminResponse;

  await complaint.save();
  sendSuccess(res, 200, "Complaint updated successfully", complaint);
});
