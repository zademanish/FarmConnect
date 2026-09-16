import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    subject: { type: String, required: [true, "Subject is required"], trim: true },
    description: { type: String, required: [true, "Description is required"] },
    adminResponse: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Rejected"],
      default: "Open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
