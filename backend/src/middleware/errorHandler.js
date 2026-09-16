// 404 for unmatched routes
export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

// Centralized error handler — converts common Mongoose/Multer errors into clean responses
export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue).join(", ")} already exists`;
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    status = 400;
    message = "File too large. Maximum size is 2MB";
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    status = 400;
    message = "Too many files or unexpected field name";
  }

  console.error("Error:", err.message);
  res.status(status).json({ success: false, message });
};
