import express from "express";
import {
  getDashboardStats,
  getUsers,
  getUserDetails,
  toggleUserStatus,
  deleteUser,
  getAllProducts,
  updateProductApproval,
} from "../controllers/adminController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated, isAdmin);

router.get("/stats", getDashboardStats);
router.get("/users", getUsers);
router.get("/users/:id", getUserDetails);
router.put("/users/:id/status", toggleUserStatus);
router.delete("/users/:id", deleteUser);
router.get("/products", getAllProducts);
router.put("/products/:id/approval", updateProductApproval);

export default router;
