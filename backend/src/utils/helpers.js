import jwt from "jsonwebtoken";

export const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Wraps async controllers so thrown errors reach the central error handler
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Throw this for expected failures (not found, forbidden, bad input)
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const sendSuccess = (res, status, message, data = undefined) =>
  res.status(status).json({ success: true, message, ...(data !== undefined && { data }) });

export const generateOrderNumber = () =>
  `FC${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;

// Strips the password field before sending a user back to the client
export const publicUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};
