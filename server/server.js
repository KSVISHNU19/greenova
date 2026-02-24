const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const Product = require("./models/Product");
const Order = require("./models/Order");

const app = express();

app.use(cors());
app.use(express.json());

const SECRET_KEY = "greenova_secret_key";

/* ---------- CONNECT MONGODB ---------- */

mongoose
  .connect(
    "mongodb+srv://greenova:Greenova123@cluster0.h3rkoxl.mongodb.net/greenova?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error:", err));

/* ---------- JWT MIDDLEWARE ---------- */

function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({ message: "Access Denied" });
  }

  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid Token" });
  }
}

/* -------------------- ROUTES -------------------- */

// Test Route
app.get("/", (req, res) => {
  res.send("Greenova Backend Running 🌿");
});

/* ---------- PRODUCTS ---------- */

app.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/* ---------- ORDERS (PROTECTED) ---------- */

app.post("/orders", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.get("/orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.put("/orders/:id", verifyToken, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order" });
  }
});

/* ---------- ANALYTICS (PROTECTED) ---------- */

app.get("/analytics", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find();

    const totalOrders = orders.length;

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const totalProductsSold = orders.reduce((sum, order) => {
      return (
        sum +
        order.items.reduce((itemSum, item) => {
          return itemSum + item.quantity;
        }, 0)
      );
    }, 0);

    res.json({
      totalOrders,
      totalRevenue,
      totalProductsSold,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/* ---------- ADMIN LOGIN (JWT) ---------- */

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username !== "admin" || password !== "greenova123") {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { username: "admin" },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

/* ---------- SAMPLE PRODUCTS ---------- */

mongoose.connection.once("open", async () => {
  const count = await Product.countDocuments();

  if (count === 0) {
    await Product.insertMany([
      {
        name: "Snake Plant",
        price: 299,
        image:
          "https://images.unsplash.com/photo-1587502536263-3f5e1bdb6b29",
        description: "Low maintenance indoor plant.",
        category: "Indoor",
      },
      {
        name: "Aloe Vera",
        price: 199,
        image:
          "https://images.unsplash.com/photo-1598880940945-3e6b4f4c8c64",
        description: "Medicinal and air purifying plant.",
        category: "Medicinal",
      },
      {
        name: "Peace Lily",
        price: 399,
        image:
          "https://images.unsplash.com/photo-1605027990121-cbae9e3e8a0d",
        description: "Beautiful flowering indoor plant.",
        category: "Flowering",
      },
    ]);

    console.log("Sample products added 🌿");
  }
});

/* ---------- START SERVER ---------- */

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});