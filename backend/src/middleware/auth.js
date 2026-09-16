import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }
    if (user.status === "inactive") {
      return res
        .status(403)
        .json({ success: false, message: "Your account has been deactivated" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};

// For public routes that behave differently when a user happens to be logged in
// (e.g. a farmer previewing their own pending product). Never rejects the request.
export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (header.startsWith("Bearer ")) {
      const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch {
    req.user = null;
  }
  next();
};

// Role guard factory — keeps isFarmer/isBuyer/isAdmin from repeating the same body
const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ success: false, message: "You do not have permission to perform this action" });
  }
  next();
};

export const isFarmer = allowRoles("farmer");
export const isBuyer = allowRoles("buyer");
export const isAdmin = allowRoles("admin");
export const isFarmerOrAdmin = allowRoles("farmer", "admin");
