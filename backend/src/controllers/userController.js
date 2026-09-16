import User from "../models/User.js";
import FarmerProfile from "../models/FarmerProfile.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import { asyncHandler, ApiError, sendSuccess, publicUser } from "../utils/helpers.js";
import { toPublicPath, removeFile } from "../middleware/upload.js";

// PUT /api/users/profile — update own profile (any logged-in role)
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone, address, city, state, pincode } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (city !== undefined) user.city = city;
  if (state !== undefined) user.state = state;
  if (pincode !== undefined) user.pincode = pincode;

  if (req.file) {
    removeFile(user.profileImage); // delete the old image from disk
    user.profileImage = toPublicPath(req.file);
  }

  await user.save();

  // Farmers can update their farm details in the same request
  let farmerProfile = null;
  if (user.role === "farmer") {
    const { farmName, farmLocation, about, totalLand } = req.body;
    farmerProfile = await FarmerProfile.findOneAndUpdate(
      { userId: user._id },
      {
        ...(farmName !== undefined && { farmName }),
        ...(farmLocation !== undefined && { farmLocation }),
        ...(about !== undefined && { about }),
        ...(totalLand !== undefined && { totalLand }),
      },
      { new: true, upsert: true }
    );
  }

  sendSuccess(res, 200, "Profile updated successfully", {
    user: publicUser(user),
    farmerProfile,
  });
});

// PUT /api/users/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new password are required");
  }
  if (newPassword.length < 6) throw new ApiError(400, "Password must be at least 6 characters");

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();
  sendSuccess(res, 200, "Password changed successfully");
});

// GET /api/users/farmers/:id — public farmer detail page
export const getFarmerPublicProfile = asyncHandler(async (req, res) => {
  const farmer = await User.findOne({ _id: req.params.id, role: "farmer" });
  if (!farmer) throw new ApiError(404, "Farmer not found");

  const [profile, products, reviews] = await Promise.all([
    FarmerProfile.findOne({ userId: farmer._id }),
    Product.find({ farmerId: farmer._id, approvalStatus: "Approved" })
      .populate("categoryId", "name")
      .sort("-createdAt"),
    Review.find({ farmerId: farmer._id, status: "visible" })
      .populate("buyerId", "name profileImage")
      .populate("productId", "name")
      .sort("-createdAt"),
  ]);

  const avgRating = reviews.length
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
    : 0;

  sendSuccess(res, 200, "Farmer profile fetched", {
    farmer: publicUser(farmer),
    profile,
    products,
    reviews,
    avgRating,
    totalReviews: reviews.length,
  });
});
