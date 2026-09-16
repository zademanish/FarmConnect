import express from "express";
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
} from "../controllers/purchaseRequestController.js";
import { isAuthenticated, isBuyer } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);

router.post("/", isBuyer, createRequest);
router.get("/", getRequests);
router.get("/:id", getRequestById);
router.put("/:id", updateRequestStatus);

export default router;
