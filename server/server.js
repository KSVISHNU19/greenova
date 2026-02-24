const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // For local development

const Product = require("./models/Product");
const Order = require("./models/Order");

const app = express();

app.use(cors());
app.use(express.json());

/* ============================
   ENV VARIABLES
============================ */

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const SECRET_KEY = process.env.JWT_SECRET || "default_secret_key";

/* ============================
   CONNECT MONGODB
============================ */

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => {
    console.error("MongoDB Connection Error ❌", err);
    process.exit(1);
  });

/* ============================
   JWT MIDDLEWARE
============================ */

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ message: "Access Denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
}

/* ============================
   ROUTES
============================ */

// Health Check
app.get("/", (req, res) => {
  res.send("Greenova Backend Running 🌿");
});

/* ---------- PRODUCTS ---------- */

// Create Product
app.post("/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// Get Products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/* ---------- ORDERS ---------- */

// Create Order (Public)
app.post("/orders", async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Get Orders (Protected)
app.get("/orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Update Order Status (Protected)
app.put("/orders/:id", verifyToken, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

/* ---------- ANALYTICS (Protected) ---------- */

app.get("/analytics", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find();

    const totalOrders = orders.length;

    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    const totalProductsSold = orders.reduce((sum, order) => {
      return (
        sum +
        (order.items || []).reduce(
          (itemSum, item) => itemSum + (item.quantity || 0),
          0
        )
      );
    }, 0);

    res.json({
      totalOrders,
      totalRevenue,
      totalProductsSold,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/* ---------- ADMIN LOGIN ---------- */

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username: "admin" }, SECRET_KEY, {
    expiresIn: "1h",
  });

  res.json({ token });
});

/* ============================
   START SERVER
============================ */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});