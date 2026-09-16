import express from "express";
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  assignDeliveryWorker,
} from "../controllers/orderController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", updateOrderStatus);
router.put("/:id/assign-worker", isAdmin, assignDeliveryWorker);

export default router;
