import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { asyncHandler, ApiError, sendSuccess } from "../utils/helpers.js";
import { toPublicPath, removeFile } from "../middleware/upload.js";

// GET /api/categories — public sees active only, admin sees all
export const getCategories = asyncHandler(async (req, res) => {
  const filter = req.user?.role === "admin" ? {} : { status: "active" };
  const categories = await Category.find(filter).sort("name");

  // Attach product counts so the categories page can show them
  const withCounts = await Promise.all(
    categories.map(async (cat) => ({
      ...cat.toObject(),
      productCount: await Product.countDocuments({
        categoryId: cat._id,
        approvalStatus: "Approved",
      }),
    }))
  );

  sendSuccess(res, 200, "Categories fetched", withCounts);
});

// POST /api/categories — admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  if (!name) throw new ApiError(400, "Category name is required");

  const exists = await Category.findOne({ name: new RegExp(`^${name}$`, "i") });
  if (exists) throw new ApiError(409, "Category already exists");

  const category = await Category.create({
    name,
    description,
    status: status || "active",
    image: req.file ? toPublicPath(req.file) : "",
  });

  sendSuccess(res, 201, "Category created successfully", category);
});

// PUT /api/categories/:id — admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const { name, description, status } = req.body;
  if (name) category.name = name;
  if (description !== undefined) category.description = description;
  if (status) category.status = status;

  if (req.file) {
    removeFile(category.image);
    category.image = toPublicPath(req.file);
  }

  await category.save();
  sendSuccess(res, 200, "Category updated successfully", category);
});

// DELETE /api/categories/:id — admin, blocked if products still use it
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const inUse = await Product.countDocuments({ categoryId: category._id });
  if (inUse > 0) {
    throw new ApiError(409, `Cannot delete: ${inUse} product(s) use this category`);
  }

  removeFile(category.image);
  await category.deleteOne();
  sendSuccess(res, 200, "Category deleted successfully");
});
