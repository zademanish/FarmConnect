import mongoose from "mongoose";

const deliveryWorkerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
    },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Available", "Busy", "Inactive"],
      default: "Available",
    },
  },
  { timestamps: true }
);

export default mongoose.model("DeliveryWorker", deliveryWorkerSchema);
