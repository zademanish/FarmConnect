import express from "express";
import {
  updateProfile,
  changePassword,
  getFarmerPublicProfile,
} from "../controllers/userController.js";
import {
  getFarmerDashboard,
  getBuyerDashboard,
} from "../controllers/dashboardController.js";
import { isAuthenticated, isFarmer, isBuyer } from "../middleware/auth.js";
import { uploadProfileImage } from "../middleware/upload.js";

const router = express.Router();

router.get("/farmers/:id", getFarmerPublicProfile);
router.get("/farmer/dashboard", isAuthenticated, isFarmer, getFarmerDashboard);
router.get("/buyer/dashboard", isAuthenticated, isBuyer, getBuyerDashboard);
router.put("/profile", isAuthenticated, uploadProfileImage, updateProfile);
router.put("/change-password", isAuthenticated, changePassword);

export default router;
