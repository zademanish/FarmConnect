import express from "express";
import {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getHomeProducts,
} from "../controllers/productController.js";
import { isAuthenticated, isFarmer, optionalAuth } from "../middleware/auth.js";
import { uploadProductImages } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/home/featured", getHomeProducts);
router.get("/farmer/my-products", isAuthenticated, isFarmer, getMyProducts);
router.get("/:id", optionalAuth, getProductById);

router.post("/", isAuthenticated, isFarmer, uploadProductImages, createProduct);
router.put("/:id", isAuthenticated, uploadProductImages, updateProduct);
router.delete("/:id", isAuthenticated, deleteProduct);

export default router;
