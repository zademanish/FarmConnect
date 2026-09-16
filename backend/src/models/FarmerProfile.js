import mongoose from "mongoose";

const farmerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    farmName: { type: String, default: "" },
    farmLocation: { type: String, default: "" },
    about: { type: String, default: "" },
    totalLand: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("FarmerProfile", farmerProfileSchema);
