import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseRequest" },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    phone: { type: String, default: "" },
    deliveryWorkerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryWorker",
      default: null,
    },
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Ready for Delivery",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Cash on Delivery", "Paid"],
      default: "Cash on Delivery",
    },
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
