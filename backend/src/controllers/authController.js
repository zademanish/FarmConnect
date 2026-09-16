import User from "../models/User.js";
import FarmerProfile from "../models/FarmerProfile.js";
import { asyncHandler, ApiError, generateToken, sendSuccess, publicUser } from "../utils/helpers.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, confirmPassword, address, city, state, pincode, role } =
    req.body;

  if (!name || !email || !phone || !password) {
    throw new ApiError(400, "Name, email, phone and password are required");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }
  // Admin accounts are created only through the seed script
  if (role && !["farmer", "buyer"].includes(role)) {
    throw new ApiError(400, "Role must be either farmer or buyer");
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, "An account with this email already exists");

  const user = await User.create({
    name,
    email,
    phone,
    password,
    address,
    city,
    state,
    pincode,
    role: role || "buyer",
  });

  // Every farmer gets an empty profile they can fill in later
  if (user.role === "farmer") {
    await FarmerProfile.create({ userId: user._id });
  }

  sendSuccess(res, 201, "Registration successful", {
    user: publicUser(user),
    token: generateToken(user._id),
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required");

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (user.status === "inactive") {
    throw new ApiError(403, "Your account has been deactivated. Contact admin.");
  }

  sendSuccess(res, 200, "Login successful", {
    user: publicUser(user),
    token: generateToken(user._id),
  });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const data = { user: publicUser(req.user) };
  if (req.user.role === "farmer") {
    data.farmerProfile = await FarmerProfile.findOne({ userId: req.user._id });
  }
  sendSuccess(res, 200, "Profile fetched", data);
});

// POST /api/auth/logout — token is cleared client side; endpoint kept for completeness
export const logout = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Logged out successfully");
});
