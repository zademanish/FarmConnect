import express from "express";
import {
  createReview,
  getReviews,
  getProductReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { isAuthenticated, isBuyer } from "../middleware/auth.js";

const router = express.Router();

router.get("/product/:productId", getProductReviews);

router.post("/", isAuthenticated, isBuyer, createReview);
router.get("/", isAuthenticated, getReviews);
router.put("/:id", isAuthenticated, updateReview);
router.delete("/:id", isAuthenticated, deleteReview);

export default router;
