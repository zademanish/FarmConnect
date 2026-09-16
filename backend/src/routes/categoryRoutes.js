import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { isAuthenticated, isAdmin, optionalAuth } from "../middleware/auth.js";
import { uploadCategoryImage } from "../middleware/upload.js";

const router = express.Router();

router.get("/", optionalAuth, getCategories);
router.post("/", isAuthenticated, isAdmin, uploadCategoryImage, createCategory);
router.put("/:id", isAuthenticated, isAdmin, uploadCategoryImage, updateCategory);
router.delete("/:id", isAuthenticated, isAdmin, deleteCategory);

export default router;
