import express from "express";
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
} from "../controllers/complaintController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);

router.post("/", createComplaint);
router.get("/", getComplaints);
router.get("/:id", getComplaintById);
router.put("/:id", isAdmin, updateComplaint);

export default router;
