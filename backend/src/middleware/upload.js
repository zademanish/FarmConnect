import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const ALLOWED = /jpeg|jpg|png|webp/;
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

// Store images on local disk only — no cloud storage for this project.
// Each route picks a subfolder: products / profiles / categories
const makeStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(UPLOAD_ROOT, folder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      // Unique filename: field-timestamp-random.ext
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${file.fieldname}-${unique}${ext}`);
    },
  });

const fileFilter = (req, file, cb) => {
  const extOk = ALLOWED.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = ALLOWED.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error("Only JPG, JPEG, PNG and WebP images are allowed"));
};

const buildUploader = (folder) =>
  multer({ storage: makeStorage(folder), fileFilter, limits: { fileSize: MAX_SIZE } });

export const uploadProductImages = buildUploader("products").array("images", 5);
export const uploadProfileImage = buildUploader("profiles").single("profileImage");
export const uploadCategoryImage = buildUploader("categories").single("image");

// Turns a stored file into the public path saved in MongoDB, e.g. /uploads/products/x.jpg
export const toPublicPath = (file) =>
  `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`;

// Remove an image file from disk when its record is deleted/replaced
export const removeFile = (publicPath) => {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;
  const full = path.join(process.cwd(), publicPath);
  fs.promises.unlink(full).catch(() => {});
};
