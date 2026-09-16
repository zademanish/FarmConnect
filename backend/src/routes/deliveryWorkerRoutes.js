import express from "express";
import {
  getWorkers,
  createWorker,
  updateWorker,
  getWorkerById,
  deleteWorker,
} from "../controllers/deliveryWorkerController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Delivery worker management is admin-only
router.use(isAuthenticated, isAdmin);

router.get("/", getWorkers);
router.post("/", createWorker);
router.get("/:id", getWorkerById);
router.put("/:id", updateWorker);
router.delete("/:id", deleteWorker);

export default router;
