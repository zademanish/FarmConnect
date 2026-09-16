import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.join(process.cwd(), ".env") });

import connectDB from "../config/db.js";
import User from "../models/User.js";
import FarmerProfile from "../models/FarmerProfile.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import PurchaseRequest from "../models/PurchaseRequest.js";
import Order from "../models/Order.js";
import DeliveryWorker from "../models/DeliveryWorker.js";
import Review from "../models/Review.js";
import Complaint from "../models/Complaint.js";
import { generateOrderNumber } from "./helpers.js";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const CITIES = [
  ["Pune", "Maharashtra", "411001"],
  ["Nashik", "Maharashtra", "422001"],
  ["Nagpur", "Maharashtra", "440001"],
  ["Kolhapur", "Maharashtra", "416001"],
  ["Indore", "Madhya Pradesh", "452001"],
  ["Ludhiana", "Punjab", "141001"],
];

const CATEGORIES = [
  ["Vegetables", "Fresh farm vegetables harvested daily"],
  ["Fruits", "Seasonal and organic fruits"],
  ["Grains", "Cereals and food grains"],
  ["Pulses", "Lentils, beans and pulses"],
  ["Rice", "Basmati and regional rice varieties"],
  ["Wheat", "Premium quality wheat"],
  ["Spices", "Farm-fresh Indian spices"],
  ["Dairy Products", "Milk, ghee and dairy items"],
];

// [name, category, price, unit, description, seed image key]
const PRODUCTS = [
  ["Fresh Tomato", "Vegetables", 30, "KG", "Vine-ripened tomatoes picked this morning.", "tomato"],
  ["Organic Potato", "Vegetables", 25, "KG", "Chemical-free potatoes grown in black soil.", "potato"],
  ["Green Chilli", "Vegetables", 60, "KG", "Spicy green chillies, freshly harvested.", "chilli"],
  ["Onion", "Vegetables", 28, "KG", "Premium Nashik red onions.", "onion"],
  ["Cauliflower", "Vegetables", 35, "KG", "Crisp white cauliflower heads.", "cauli"],
  ["Alphonso Mango", "Fruits", 450, "Dozen", "Authentic Ratnagiri Alphonso mangoes.", "mango"],
  ["Banana", "Fruits", 45, "Dozen", "Naturally ripened bananas.", "banana"],
  ["Pomegranate", "Fruits", 120, "KG", "Sweet and juicy Bhagwa pomegranates.", "pome"],
  ["Grapes", "Fruits", 80, "KG", "Seedless green grapes from Nashik.", "grape"],
  ["Basmati Rice", "Rice", 95, "KG", "Long grain aged basmati rice.", "rice"],
  ["Sona Masoori Rice", "Rice", 55, "KG", "Lightweight everyday rice.", "rice"],
  ["Sharbati Wheat", "Wheat", 32, "KG", "Premium MP Sharbati wheat.", "wheat"],
  ["Bajra", "Grains", 38, "KG", "Nutritious pearl millet.", "millet"],
  ["Jowar", "Grains", 40, "KG", "Organic sorghum grain.", "millet"],
  ["Toor Dal", "Pulses", 140, "KG", "Unpolished pigeon pea lentils.", "dal"],
  ["Chana Dal", "Pulses", 95, "KG", "Split bengal gram.", "dal"],
  ["Moong Dal", "Pulses", 110, "KG", "Green gram, farm cleaned.", "green"],
  ["Turmeric Powder", "Spices", 220, "KG", "Sun-dried turmeric, stone ground.", "turmeric"],
  ["Red Chilli Powder", "Spices", 280, "KG", "Pure Guntur chilli powder.", "chilli"],
  ["Pure Cow Ghee", "Dairy Products", 650, "Litre", "Traditional bilona method ghee.", "ghee"],
];

// Copies a seed image into uploads/products with a unique name, exactly like
// a real Multer upload would, and returns the public path to store in MongoDB.
const copySeedImage = (key, index) => {
  const source = path.join(process.cwd(), "uploads", "seed", `${key}.png`);
  if (!fs.existsSync(source)) return null;
  const filename = `images-seed-${index}-${Date.now()}${Math.floor(Math.random() * 1000)}.png`;
  const destDir = path.join(process.cwd(), "uploads", "products");
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(source, path.join(destDir, filename));
  return `/uploads/products/${filename}`;
};

const FARMERS = [
  ["Ramesh Patil", "Patil Organic Farms", "Owns 12 acres of irrigated farmland near Pune."],
  ["Suresh Deshmukh", "Deshmukh Agro", "Third-generation farmer specialising in grains."],
  ["Anita Jadhav", "Green Valley Farm", "Certified organic producer of vegetables."],
  ["Vikram Shinde", "Shinde Fruit Orchards", "Mango and pomegranate orchard owner."],
  ["Kavita Pawar", "Pawar Dairy & Farm", "Runs a mixed dairy and crop farm."],
];

const BUYERS = [
  "Amit Sharma", "Priya Nair", "Rahul Verma", "Sneha Kulkarni", "Imran Khan",
  "Divya Menon", "Arjun Reddy", "Neha Gupta", "Karan Malhotra", "Pooja Singh",
];

const WORKERS = [
  ["Sandeep Kumar", "Pune"], ["Mahesh Yadav", "Nashik"], ["Rohit Jain", "Nagpur"],
  ["Ajay Thakur", "Indore"], ["Sunil More", "Kolhapur"],
];

const seed = async () => {
  await connectDB();
  console.log("Clearing existing data...");

  await Promise.all([
    User.deleteMany({}), FarmerProfile.deleteMany({}), Category.deleteMany({}),
    Product.deleteMany({}), PurchaseRequest.deleteMany({}), Order.deleteMany({}),
    DeliveryWorker.deleteMany({}), Review.deleteMany({}), Complaint.deleteMany({}),
  ]);

  // Clear previously uploaded images so re-seeding doesn't leave orphan files
  for (const folder of ["products", "profiles", "categories"]) {
    const dir = path.join(process.cwd(), "uploads", folder);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) fs.unlinkSync(path.join(dir, file));
  }

  // --- Admin ---
  const admin = await User.create({
    name: "Farm Connect Admin",
    email: "admin@farmconnect.com",
    phone: "9000000001",
    password: "admin123",
    role: "admin",
    address: "Farm Connect HQ",
    city: "Pune", state: "Maharashtra", pincode: "411001",
  });

  // --- Categories ---
  const categories = await Category.create(
    CATEGORIES.map(([name, description]) => ({ name, description, status: "active" }))
  );
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c._id]));

  // --- Farmers ---
  const farmers = [];
  for (let i = 0; i < FARMERS.length; i++) {
    const [name, farmName, about] = FARMERS[i];
    const [city, state, pincode] = CITIES[i % CITIES.length];
    const farmer = await User.create({
      name,
      email: `farmer${i + 1}@farmconnect.com`,
      phone: `90000001${String(i + 10).slice(-2)}`,
      password: "farmer123",
      role: "farmer",
      address: `Survey No. ${rand(10, 99)}, ${city} Rural`,
      city, state, pincode,
    });
    await FarmerProfile.create({
      userId: farmer._id,
      farmName,
      farmLocation: `${city}, ${state}`,
      about,
      totalLand: `${rand(3, 20)} Acres`,
    });
    farmers.push(farmer);
  }

  // --- Buyers ---
  const buyers = [];
  for (let i = 0; i < BUYERS.length; i++) {
    const [city, state, pincode] = CITIES[i % CITIES.length];
    buyers.push(
      await User.create({
        name: BUYERS[i],
        email: `buyer${i + 1}@farmconnect.com`,
        phone: `90000002${String(i + 10).slice(-2)}`,
        password: "buyer123",
        role: "buyer",
        address: `Flat ${rand(101, 909)}, ${city}`,
        city, state, pincode,
      })
    );
  }

  // --- Delivery workers ---
  const workers = await DeliveryWorker.create(
    WORKERS.map(([name, city], i) => ({
      name,
      email: `worker${i + 1}@farmconnect.com`,
      phone: `90000003${String(i + 10).slice(-2)}`,
      address: `${city} Depot`,
      city,
      status: "Available",
    }))
  );

  // --- Products (most approved, a few pending/rejected to demo the workflow) ---
  const products = [];
  for (let i = 0; i < PRODUCTS.length; i++) {
    const [name, category, price, unit, description, imageKey] = PRODUCTS[i];
    const farmer = farmers[i % farmers.length];
    // Leave the last 4 unapproved so admin has something to review
    const approvalStatus = i < 16 ? "Approved" : i < 19 ? "Pending" : "Rejected";
    const image = copySeedImage(imageKey, i);
    products.push(
      await Product.create({
        farmerId: farmer._id,
        categoryId: catByName[category],
        name,
        description,
        images: image ? [image] : [],
        quantity: rand(50, 900),
        unit,
        price,
        location: `${farmer.city}, ${farmer.state}`,
        availabilityStatus: "Available",
        approvalStatus,
        rejectionReason:
          approvalStatus === "Rejected" ? "Product images and quality details are missing." : "",
      })
    );
  }

  const approved = products.filter((p) => p.approvalStatus === "Approved");

  // --- Purchase requests, orders, reviews ---
  const orders = [];
  for (let i = 0; i < 12; i++) {
    const product = approved[i % approved.length];
    const buyer = buyers[i % buyers.length];
    const quantity = rand(5, 40);
    const totalAmount = quantity * product.price;

    // First 8 accepted (become orders), then rejected / pending / cancelled
    const status = i < 8 ? "Accepted" : i < 10 ? "Pending" : i === 10 ? "Rejected" : "Cancelled";

    const request = await PurchaseRequest.create({
      buyerId: buyer._id,
      farmerId: product.farmerId,
      productId: product._id,
      quantity,
      price: product.price,
      totalAmount,
      message: "Please confirm availability and expected delivery date.",
      deliveryAddress: `${buyer.address}, ${buyer.city}, ${buyer.state} - ${buyer.pincode}`,
      phone: buyer.phone,
      status,
    });

    if (status !== "Accepted") continue;

    // Accepted requests reserve stock, exactly like the live flow does
    product.quantity -= quantity;
    if (product.quantity <= 0) {
      product.quantity = 0;
      product.availabilityStatus = "Unavailable";
    }
    await product.save();

    // Spread orders across the delivery pipeline for a realistic demo
    const orderStatus = pick([
      "Confirmed", "Processing", "Ready for Delivery",
      "Out for Delivery", "Delivered", "Delivered",
    ]);
    const needsWorker = ["Out for Delivery", "Delivered"].includes(orderStatus);
    const worker = needsWorker ? workers[i % workers.length] : null;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      requestId: request._id,
      buyerId: buyer._id,
      farmerId: product.farmerId,
      productId: product._id,
      quantity,
      price: product.price,
      totalAmount,
      deliveryAddress: request.deliveryAddress,
      phone: buyer.phone,
      deliveryWorkerId: worker?._id || null,
      orderStatus,
      paymentStatus: orderStatus === "Delivered" ? "Paid" : "Cash on Delivery",
    });

    if (worker && orderStatus === "Out for Delivery") {
      await DeliveryWorker.findByIdAndUpdate(worker._id, { status: "Busy" });
    }
    orders.push(order);
  }

  // --- Reviews on delivered orders ---
  const delivered = orders.filter((o) => o.orderStatus === "Delivered");
  const COMMENTS = [
    "Excellent quality, exactly as described. Will order again.",
    "Fresh produce and quick delivery. Very satisfied.",
    "Good quality overall, packaging could be better.",
    "Directly from the farm — the freshness really shows.",
    "Fair price and honest weight. Recommended seller.",
  ];

  for (const order of delivered) {
    await Review.create({
      buyerId: order.buyerId,
      farmerId: order.farmerId,
      productId: order.productId,
      orderId: order._id,
      rating: rand(3, 5),
      comment: pick(COMMENTS),
    });
    await Order.findByIdAndUpdate(order._id, { isReviewed: true });
  }

  // Recompute product ratings from the seeded reviews
  for (const product of products) {
    const reviews = await Review.find({ productId: product._id, status: "visible" });
    if (!reviews.length) continue;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    await Product.findByIdAndUpdate(product._id, {
      avgRating: Number((total / reviews.length).toFixed(1)),
      totalReviews: reviews.length,
    });
  }

  // --- Complaints ---
  const COMPLAINTS = [
    ["Delivery delayed by two days", "The order was marked out for delivery but arrived late.", "Open"],
    ["Quantity received was short", "Received 18 KG instead of the ordered 20 KG.", "In Progress"],
    ["Damaged packaging", "Outer packaging was torn although the produce was fine.", "Resolved"],
    ["Payment status not updated", "Paid on delivery but the order still shows pending.", "Open"],
  ];

  for (let i = 0; i < COMPLAINTS.length; i++) {
    const [subject, description, status] = COMPLAINTS[i];
    await Complaint.create({
      userId: buyers[i]._id,
      orderId: orders[i]?._id || null,
      subject,
      description,
      status,
      adminResponse:
        status === "Resolved" ? "We have addressed this with the farmer. Apologies for the trouble." : "",
    });
  }

  console.log(`
Seed completed successfully.

  Admin    : ${admin.email} / admin123
  Farmers  : farmer1@farmconnect.com ... farmer5@farmconnect.com / farmer123
  Buyers   : buyer1@farmconnect.com ... buyer10@farmconnect.com / buyer123

  Categories: ${categories.length}
  Products  : ${products.length} (${approved.length} approved)
  Requests  : 12
  Orders    : ${orders.length}
  Workers   : ${workers.length}
  Reviews   : ${delivered.length}
  Complaints: ${COMPLAINTS.length}
`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  await mongoose.connection.close();
  process.exit(1);
});
