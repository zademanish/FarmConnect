import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    name: { type: String, required: [true, "Product name is required"], trim: true },
    description: { type: String, default: "" },
    images: [{ type: String }],
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    unit: {
      type: String,
      enum: ["KG", "Quintal", "Ton", "Litre", "Dozen", "Piece"],
      default: "KG",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be greater than 0"],
    },
    location: { type: String, required: [true, "Location is required"] },
    availableFrom: { type: Date, default: Date.now },
    availabilityStatus: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available",
    },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    rejectionReason: { type: String, default: "" },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index so buyers can search by product name / description
productSchema.index({ name: "text", description: "text" });

export default mongoose.model("Product", productSchema);
