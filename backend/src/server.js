import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Razorpay from "razorpay";
import { adminOnly, auth } from "./middleware/auth.js";
import { query } from "./config/db.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { products, knowledgePosts } from "./data/seedData.js";

console.log("SERVER FILE LOADED:", import.meta.url);

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

const signToken = (user) =>
  jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "7d"
  });

const mapProductFilters = (req) => {
  const where = [];
  const params = {};

  if (req.query.search) {
    where.push("(name LIKE :search OR short_description LIKE :search OR festival_tag LIKE :search)");
    params.search = `%${req.query.search}%`;
  }
  if (req.query.category) {
    where.push("category = :category");
    params.category = req.query.category;
  }
  if (req.query.availability) {
    where.push("availability = :availability");
    params.availability = req.query.availability;
  }
  if (req.query.festival) {
    where.push("festival_tag LIKE :festival");
    params.festival = `%${req.query.festival}%`;
  }
  if (req.query.maxShelfLife) {
    where.push("shelf_life_days <= :maxShelfLife");
    params.maxShelfLife = Number(req.query.maxShelfLife);
  }
  if (req.query.minPrice) {
    where.push("price >= :minPrice");
    params.minPrice = Number(req.query.minPrice);
  }
  if (req.query.maxPrice) {
    where.push("price <= :maxPrice");
    params.maxPrice = Number(req.query.maxPrice);
  }

  return { clause: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
};

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Odisha Pitha Marketplace API" });
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: "Name, valid email, and 6+ character password are required" });
    }
    const password_hash = await bcrypt.hash(password, 10);
    await query("INSERT INTO users (name, email, password_hash) VALUES (:name, :email, :password_hash)", {
      name,
      email,
      password_hash
    });
    const users = await query("SELECT id, name, email, role FROM users WHERE email = :email", { email });
    res.status(201).json({ user: users[0], token: signToken(users[0]) });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Email already registered" });
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const users = await query("SELECT * FROM users WHERE email = :email", { email });
    const user = users[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.json({ user: safeUser, token: signToken(safeUser) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    const { clause, params } = mapProductFilters(req);
    const sortMap = {
      price_low: "price ASC",
      price_high: "price DESC",
      popularity: "popularity DESC",
      shelf_life: "shelf_life_days DESC"
    };
    const orderBy = sortMap[req.query.sort] || "created_at DESC";
    const products = await query(`SELECT * FROM products ${clause} ORDER BY ${orderBy}`, params);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

app.get("/api/products/featured", async (_req, res, next) => {
  try {
    res.json(await query("SELECT * FROM products ORDER BY popularity DESC LIMIT 8"));
  } catch (error) {
    next(error);
  }
});

app.get("/api/products/:slug", async (req, res, next) => {
  try {
    const rows = await query("SELECT * FROM products WHERE slug = :slug", { slug: req.params.slug });
    const product = rows[0];
    if (!product) return res.status(404).json({ message: "Product not found" });
    const images = await query("SELECT * FROM product_images WHERE product_id = :id", { id: product.id });
    const reviews = await query("SELECT * FROM reviews WHERE product_id = :id ORDER BY created_at DESC", { id: product.id });
    const related = await query(
      "SELECT * FROM products WHERE category = :category AND id <> :id ORDER BY popularity DESC LIMIT 4",
      { category: product.category, id: product.id }
    );
    res.json({ ...product, images, reviews, related });
  } catch (error) {
    next(error);
  }
});

app.post("/api/products/:id/reviews", auth, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    await query(
      "INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (:product_id, :user_name, :rating, :comment)",
      { product_id: req.params.id, user_name: req.user.name, rating, comment }
    );
    res.status(201).json({ message: "Review added" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/knowledge", async (_req, res, next) => {
  try {
    res.json(await query("SELECT * FROM knowledge_posts ORDER BY created_at DESC"));
  } catch (error) {
    next(error);
  }
});

app.get("/api/cart", auth, async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT c.id AS cart_id, c.quantity, c.size, p.*
       FROM cart_items c JOIN products p ON p.id = c.product_id
       WHERE c.user_id = :userId ORDER BY c.id DESC`,
      { userId: req.user.id }
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/cart", auth, async (req, res, next) => {
  try {
    const { productId, quantity = 1, size = null } = req.body;
    await query(
      `INSERT INTO cart_items (user_id, product_id, quantity, size)
       VALUES (:userId, :productId, :quantity, :size)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      { userId: req.user.id, productId, quantity, size }
    );
    res.status(201).json({ message: "Added to cart" });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/cart/:id", auth, async (req, res, next) => {
  try {
    await query("UPDATE cart_items SET quantity = :quantity WHERE id = :id AND user_id = :userId", {
      quantity: Math.max(1, Number(req.body.quantity || 1)),
      id: req.params.id,
      userId: req.user.id
    });
    res.json({ message: "Cart updated" });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/cart/:id", auth, async (req, res, next) => {
  try {
    await query("DELETE FROM cart_items WHERE id = :id AND user_id = :userId", { id: req.params.id, userId: req.user.id });
    res.json({ message: "Cart item removed" });
  } catch (error) {
    next(error);
  }
});

app.post("/api/wishlist/:productId", auth, async (req, res, next) => {
  try {
    await query(
      "INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (:userId, :productId)",
      { userId: req.user.id, productId: req.params.productId }
    );
    res.status(201).json({ message: "Added to wishlist" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/wishlist", auth, async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT w.id AS wishlist_id, p.*
       FROM wishlist_items w JOIN products p ON p.id = w.product_id
       WHERE w.user_id = :userId
       ORDER BY w.id DESC`,
      { userId: req.user.id }
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/wishlist/:productId", auth, async (req, res, next) => {
  try {
    await query("DELETE FROM wishlist_items WHERE user_id = :userId AND product_id = :productId", {
      userId: req.user.id,
      productId: req.params.productId
    });
    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    next(error);
  }
});

app.post("/api/payments/razorpay-order", auth, async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.json({ provider: "demo", amount, currency: "INR", message: "Razorpay keys not set. Demo checkout enabled." });
    }
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    const order = await razorpay.orders.create({ amount: Math.round(Number(amount) * 100), currency: "INR" });
    res.json({ provider: "razorpay", key: process.env.RAZORPAY_KEY_ID, order });
  } catch (error) {
    next(error);
  }
});

app.post("/api/orders", auth, async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentStatus = "Paid", couponCode = null } = req.body;
    if (!items?.length) return res.status(400).json({ message: "Order needs at least one item" });
    const itemsTotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

    // Re-validate the coupon server-side rather than trusting a client-sent discount amount
    let discount = 0;
    let appliedCouponCode = null;
    if (couponCode) {
      const rows = await query(
        "SELECT * FROM coupons WHERE is_visible = 1 AND LOWER(code) = LOWER(:code) LIMIT 1",
        { code: String(couponCode).trim() }
      );
      const coupon = rows[0];
      if (coupon) {
        discount = coupon.discount_type === "percent"
          ? (itemsTotal * Number(coupon.discount_value)) / 100
          : Number(coupon.discount_value);
        discount = Math.max(0, Math.min(discount, itemsTotal));
        discount = Math.round(discount * 100) / 100;
        appliedCouponCode = coupon.code;
      }
    }
    const total = Math.max(0, itemsTotal - discount);

    const orderNumber = `ODP-${Date.now()}`;
    const result = await query(
      `INSERT INTO orders (user_id, order_number, payment_status, total, coupon_code, discount, shipping_address)
       VALUES (:userId, :orderNumber, :paymentStatus, :total, :couponCode, :discount, :shippingAddress)`,
      { userId: req.user.id, orderNumber, paymentStatus, total, couponCode: appliedCouponCode, discount, shippingAddress }
    );
    const orderId = result.insertId;
    for (const item of items) {
      await query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, size)
         VALUES (:orderId, :product_id, :product_name, :price, :quantity, :size)`,
        {
          orderId,
          product_id: item.id || item.product_id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || null
        }
      );
    }
    await query("DELETE FROM cart_items WHERE user_id = :userId", { userId: req.user.id });

    const itemSummary = items.map(i => `${i.name} x${i.quantity} @ ₹${i.price}`).join(" | ");
    const notifMsg = `New order ${orderNumber} from ${req.user.name} (${req.user.email}) | Items: ${itemSummary} | Total: ₹${total} | Ship to: ${shippingAddress}`;
    await query(
      "INSERT INTO admin_notifications (order_id, message) VALUES (:orderId, :notifMsg)",
      { orderId, notifMsg }
    );
    res.status(201).json({ id: orderId, orderNumber, total });
  } catch (error) {
    next(error);
  }
});

app.get("/api/orders", auth, async (req, res, next) => {
  try {
    const rows = await query("SELECT * FROM orders WHERE user_id = :userId ORDER BY created_at DESC", { userId: req.user.id });
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/orders/:id/invoice", auth, async (req, res, next) => {
  try {
    const orders = await query("SELECT * FROM orders WHERE id = :id AND user_id = :userId", { id: req.params.id, userId: req.user.id });
    if (!orders[0]) return res.status(404).json({ message: "Order not found" });
    const items = await query("SELECT * FROM order_items WHERE order_id = :id", { id: req.params.id });
    res.json({ invoiceNumber: `INV-${orders[0].order_number}`, order: orders[0], items });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/stats", auth, adminOnly, async (_req, res, next) => {
  try {
    const [sales] = await query("SELECT COALESCE(SUM(total), 0) AS totalSales, COUNT(*) AS orders FROM orders");
    const [users] = await query("SELECT COUNT(*) AS users FROM users");
    const [products] = await query("SELECT COUNT(*) AS products FROM products");
    const recentOrders = await query(
      `SELECT o.id, o.order_number, o.total, o.shipping_address, o.created_at,
          u.name AS customer_name
   FROM orders o
   JOIN users u ON u.id = o.user_id
   ORDER BY o.created_at DESC LIMIT 6`
    );
    for (const order of recentOrders) {
      order.items = await query(
        `SELECT product_name, quantity, price, size FROM order_items WHERE order_id = :id`,
        { id: order.id }
      );
    }
    res.json({ ...sales, ...users, ...products, recentOrders });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/products", auth, adminOnly, async (req, res, next) => {
  try {
    const result = await query(
      `INSERT INTO products
       (name, slug, category, short_description, description, cultural_significance, ingredients, preparation,
        region_origin, nutrition, storage, shelf_life_days, price, price_unit, availability, sizes, image_url, festival_tag,
        stock, manufacturing_date, expiry_date)
       VALUES
       (:name, :slug, :category, :short_description, :description, :cultural_significance, :ingredients, :preparation,
        :region_origin, :nutrition, :storage, :shelf_life_days, :price, :price_unit, :availability, :sizes, :image_url, :festival_tag,
        :stock, :manufacturing_date, :expiry_date)`,
      req.body
    );
    await query("INSERT INTO product_images (product_id, image_url, alt_text) VALUES (:productId, :imageUrl, :altText)", {
      productId: result.insertId,
      imageUrl: req.body.image_url,
      altText: `${req.body.name} product photograph`
    });
    res.status(201).json({ message: "Product created", id: result.insertId });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/products", auth, adminOnly, async (_req, res, next) => {
  try {
    const rows = await query("SELECT * FROM products ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/products/:id", auth, adminOnly, async (req, res, next) => {
  try {
    await query(
      `UPDATE products
       SET name = :name, slug = :slug, category = :category, short_description = :short_description,
           description = :description, cultural_significance = :cultural_significance, ingredients = :ingredients,
           preparation = :preparation, region_origin = :region_origin, nutrition = :nutrition, storage = :storage,
           shelf_life_days = :shelf_life_days, price = :price, price_unit = :price_unit, availability = :availability,
           sizes = :sizes, image_url = :image_url, festival_tag = :festival_tag, stock = :stock,
           manufacturing_date = :manufacturing_date, expiry_date = :expiry_date
       WHERE id = :id`,
      { ...req.body, id: req.params.id }
    );
    res.json({ message: "Product updated" });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/products/:id", auth, adminOnly, async (req, res, next) => {
  try {
    await query("DELETE FROM products WHERE id = :id", { id: req.params.id });
    res.json({ message: "Product deleted" });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_ROW_IS_REFERENCED") {
      return res.status(409).json({
        message: "This product has existing orders and can't be deleted. Set availability to 'Out of Stock' instead."
      });
    }
    next(error);
  }
});

app.get("/api/admin/notifications", auth, adminOnly, async (_req, res, next) => {
  try {
    const rows = await query("SELECT * FROM admin_notifications WHERE is_read = 0 ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) { next(error); }
});

app.get("/api/admin/sales-chart", auth, adminOnly, async (req, res, next) => {
  console.log("SALES CHART ROUTE HIT");
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 7, 1), 30);
    const rows = await query(
      `SELECT DATE(created_at) AS date, COALESCE(SUM(total), 0) AS sales, COUNT(*) AS orders
       FROM orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      { days }
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/orders-by-date", auth, adminOnly, async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });
    const orders = await query(
      `SELECT o.id, o.order_number, o.total, o.created_at,
              u.name AS customer_name, u.email AS customer_email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE DATE(o.created_at) = :date
       ORDER BY o.created_at DESC`,
      { date }
    );
    for (const order of orders) {
      order.items = await query(
        `SELECT product_name, quantity, price, size FROM order_items WHERE order_id = :id`,
        { id: order.id }
      );
    }
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/admin/notifications/:id/read", auth, adminOnly, async (req, res, next) => {
  try {
    await query("UPDATE admin_notifications SET is_read = 1 WHERE id = :id", { id: req.params.id });
    res.json({ message: "Marked as read" });
  } catch (error) { next(error); }
});

// Public: anyone (including logged-out) can hit this, but data only returns if admin made it visible
// Public: anyone (including logged-out) can hit this; returns all coupons the admin has made visible
app.get("/api/coupons", async (_req, res, next) => {
  try {
    const rows = await query(
      "SELECT id, code, description, discount_type, discount_value FROM coupons WHERE is_visible = 1 ORDER BY id DESC"
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// Admin: list every coupon (visible or hidden)
app.get("/api/admin/coupons", auth, adminOnly, async (_req, res, next) => {
  try {
    const rows = await query("SELECT * FROM coupons ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// Admin: create a new coupon
app.post("/api/admin/coupons", auth, adminOnly, async (req, res, next) => {
  try {
    const { code, description = "", visible = false, discountType = "percent", discountValue = 0 } = req.body;
    if (!code) return res.status(400).json({ message: "Coupon code is required" });
    if (!["flat", "percent"].includes(discountType)) {
      return res.status(400).json({ message: "discountType must be 'flat' or 'percent'" });
    }
    const result = await query(
      "INSERT INTO coupons (code, description, discount_type, discount_value, is_visible) VALUES (:code, :description, :discountType, :discountValue, :visible)",
      { code, description, discountType, discountValue, visible: visible ? 1 : 0 }
    );
    res.status(201).json({ message: "Coupon created", id: result.insertId });
  } catch (error) {
    next(error);
  }
});

// Admin: update an existing coupon
app.put("/api/admin/coupons/:id", auth, adminOnly, async (req, res, next) => {
  try {
    const { code, description = "", visible = false, discountType = "percent", discountValue = 0 } = req.body;
    if (!code) return res.status(400).json({ message: "Coupon code is required" });
    if (!["flat", "percent"].includes(discountType)) {
      return res.status(400).json({ message: "discountType must be 'flat' or 'percent'" });
    }
    await query(
      "UPDATE coupons SET code = :code, description = :description, discount_type = :discountType, discount_value = :discountValue, is_visible = :visible WHERE id = :id",
      { code, description, discountType, discountValue, visible: visible ? 1 : 0, id: req.params.id }
    );
    res.json({ message: "Coupon updated" });
  } catch (error) {
    next(error);
  }
});

// Admin: delete a coupon
app.delete("/api/admin/coupons/:id", auth, adminOnly, async (req, res, next) => {
  try {
    await query("DELETE FROM coupons WHERE id = :id", { id: req.params.id });
    res.json({ message: "Coupon deleted" });
  } catch (error) {
    next(error);
  }
});

// Admin: toggle visibility for one coupon
app.patch("/api/admin/coupons/:id/visibility", auth, adminOnly, async (req, res, next) => {
  try {
    const existing = await query("SELECT * FROM coupons WHERE id = :id", { id: req.params.id });
    if (!existing[0]) return res.status(404).json({ message: "Coupon not found" });
    const next_visible = existing[0].is_visible ? 0 : 1;
    await query("UPDATE coupons SET is_visible = :v WHERE id = :id", { v: next_visible, id: req.params.id });
    res.json({ message: "Visibility toggled", is_visible: next_visible });
  } catch (error) {
    next(error);
  }
});

// Public: validate a coupon code entered at checkout and return the discount to apply
app.post("/api/coupon/apply", async (req, res, next) => {
  try {
    const { code = "", amount = 0 } = req.body;
    if (!code.trim()) return res.status(400).json({ message: "Enter a coupon code" });

    const rows = await query(
      "SELECT * FROM coupons WHERE is_visible = 1 AND LOWER(code) = LOWER(:code) LIMIT 1",
      { code: code.trim() }
    );
    const coupon = rows[0];
    if (!coupon) {
      return res.status(404).json({ message: "Invalid or expired coupon code" });
    }

    const baseAmount = Number(amount) || 0;
    let discount = coupon.discount_type === "percent"
      ? (baseAmount * Number(coupon.discount_value)) / 100
      : Number(coupon.discount_value);
    discount = Math.max(0, Math.min(discount, baseAmount));

    res.json({
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: Number(coupon.discount_value),
      discount: Math.round(discount * 100) / 100
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Server error", detail: process.env.NODE_ENV === "production" ? undefined : error.message });
});

// app.get("/api/products", async (req, res, next) => {
//   try {
//     const products = await query("SELECT * FROM products");
//     res.json(products);
//   } catch (error) {
//     next(error); // sends error here
//   }
// });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/api/setup-db", async (req, res) => {
  try {
    const schema = await fs.readFile(
      path.join(__dirname, "schema.sql"),
      "utf8"
    );

    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await query(statement);
    }

    res.json({
      success: true,
      message: "Database tables created"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
      sqlMessage: error.sqlMessage
    });
  }
});

app.get("/api/seed-data", async (req, res) => {
  try {
    // Create admin
    const adminHash = await bcrypt.hash("Admin@123", 10);

    await query(
      `INSERT IGNORE INTO users (name,email,password_hash,role)
       VALUES ('Marketplace Admin','admin@pitha.com',:password,'admin')`,
      { password: adminHash }
    );

    const customerHash = await bcrypt.hash("Customer@123", 10);

    await query(
      `INSERT IGNORE INTO users (name,email,password_hash,role)
   VALUES ('Demo Customer','customer@pitha.com',:password,'customer')`,
      { password: customerHash }
    );

    // Insert products
    for (const product of products) {
      await query(
        `INSERT IGNORE INTO products
      (
        name,slug,category,short_description,description,
        cultural_significance,ingredients,preparation,
        region_origin,nutrition,storage,shelf_life_days,
        price,price_unit,availability,sizes,image_url,festival_tag,
        popularity,stock,manufacturing_date,expiry_date
      )
      VALUES
      (
        :name,:slug,:category,:short_description,:description,
        :cultural_significance,:ingredients,:preparation,
        :region_origin,:nutrition,:storage,:shelf_life_days,
        :price,:price_unit,:availability,:sizes,:image_url,:festival_tag,
        100,50,CURDATE(),
        DATE_ADD(CURDATE(), INTERVAL :shelf_life_days DAY)
      )`,
        { price_unit: "Per Piece", ...product }
      );
    }

    // Insert knowledge posts
    for (const post of knowledgePosts) {
      await query(
        `INSERT IGNORE INTO knowledge_posts
        (title,slug,excerpt,content,category)
        VALUES
        (:title,:slug,:excerpt,:content,:category)`,
        post
      );
    }

    res.json({
      success: true,
      message: "Seed data inserted"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Odia Foods Pitha API is running 🚀"
  });
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
