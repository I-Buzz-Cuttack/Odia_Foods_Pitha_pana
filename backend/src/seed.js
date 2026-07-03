import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import fs from "fs/promises";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import { pool, query } from "./config/db.js";
import { knowledgePosts, products } from "./data/seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runStatements = async (sql) => {
  const bootstrapPool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 2
  });
  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  try {
    for (const statement of statements) {
      await bootstrapPool.query(statement);
    }
  } finally {
    await bootstrapPool.end();
  }
};

// Deletes ALL rows from every table so the database starts completely fresh
// before the seed data is inserted again. Triggered with: node seed.js --reset
const resetDatabase = async () => {
  console.log("Resetting database: deleting all existing data...");
  await query("SET FOREIGN_KEY_CHECKS = 0");
  const tables = [
    "order_items",
    "orders",
    "cart_items",
    "wishlist_items",
    "reviews",
    "product_images",
    "admin_notifications",
    "coupons",
    "knowledge_posts",
    "products",
    "users"
  ];
  for (const table of tables) {
    await query(`TRUNCATE TABLE ${table}`);
  }
  await query("SET FOREIGN_KEY_CHECKS = 1");
  console.log("All existing data deleted.");
};

const seed = async () => {
  const schema = await fs.readFile(path.join(__dirname, "schema.sql"), "utf8");
  await runStatements(schema);

  if (process.argv.includes("--reset")) {
    await resetDatabase();
  }

  const adminHash = await bcrypt.hash("Admin@123", 10);
  const userHash = await bcrypt.hash("Customer@123", 10);

  await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES (:name, :email, :password_hash, :role)
     ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role)`,
    { name: "Marketplace Admin", email: "admin@pitha.com", password_hash: adminHash, role: "admin" }
  );
  await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES (:name, :email, :password_hash, :role)
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    { name: "Demo Customer", email: "customer@pitha.com", password_hash: userHash, role: "customer" }
  );

  for (const [index, product] of products.entries()) {
    const manufacturingDate = new Date();
    manufacturingDate.setDate(manufacturingDate.getDate() - 1);
    const expiryDate = new Date(manufacturingDate);
    expiryDate.setDate(expiryDate.getDate() + product.shelf_life_days);

    await query(
      `INSERT INTO products
       (name, slug, category, short_description, description, cultural_significance, ingredients,
        preparation, region_origin, nutrition, storage, shelf_life_days, price, price_unit, availability, sizes,
        image_url, festival_tag, popularity, stock, manufacturing_date, expiry_date)
       VALUES
       (:name, :slug, :category, :short_description, :description, :cultural_significance, :ingredients,
        :preparation, :region_origin, :nutrition, :storage, :shelf_life_days, :price, :price_unit, :availability, :sizes,
        :image_url, :festival_tag, :popularity, :stock, :manufacturing_date, :expiry_date)
       ON DUPLICATE KEY UPDATE
        category = VALUES(category), short_description = VALUES(short_description), description = VALUES(description),
        cultural_significance = VALUES(cultural_significance), ingredients = VALUES(ingredients),
        preparation = VALUES(preparation), region_origin = VALUES(region_origin), nutrition = VALUES(nutrition),
        storage = VALUES(storage), shelf_life_days = VALUES(shelf_life_days), price = VALUES(price),
        price_unit = VALUES(price_unit),
        availability = VALUES(availability), sizes = VALUES(sizes), image_url = VALUES(image_url),
        festival_tag = VALUES(festival_tag), popularity = VALUES(popularity), stock = VALUES(stock),
        manufacturing_date = VALUES(manufacturing_date), expiry_date = VALUES(expiry_date)`,
      {
        ...product,
        price_unit: product.price_unit || "Per Piece",
        popularity: 100 - index * 5,
        stock: product.availability === "Seasonal" ? 20 : 60,
        manufacturing_date: manufacturingDate.toISOString().slice(0, 10),
        expiry_date: expiryDate.toISOString().slice(0, 10)
      }
    );

    const rows = await query("SELECT id FROM products WHERE slug = :slug", { slug: product.slug });
    const productId = rows[0].id;
    await query("DELETE FROM product_images WHERE product_id = :productId", { productId });
    await query(
      `INSERT INTO product_images (product_id, image_url, alt_text)
       VALUES (:productId, :image, :alt), (:productId, :image, :alt2), (:productId, :image, :alt3)`,
      {
        productId,
        image: product.image_url,
        alt: `${product.name} product photograph`,
        alt2: `${product.name} served in traditional Odisha style`,
        alt3: `${product.name} close-up texture`
      }
    );
    await query("DELETE FROM reviews WHERE product_id = :productId", { productId });
    await query(
      `INSERT INTO reviews (product_id, user_name, rating, comment)
       VALUES
       (:productId, 'Ananya Das', 5, 'Authentic taste and beautiful packaging.'),
       (:productId, 'Sambit Mishra', 4, 'Fresh, fragrant, and delivered carefully.')`,
      { productId }
    );
  }

  for (const post of knowledgePosts) {
    await query(
      `INSERT INTO knowledge_posts (title, slug, excerpt, content, category)
       VALUES (:title, :slug, :excerpt, :content, :category)
       ON DUPLICATE KEY UPDATE excerpt = VALUES(excerpt), content = VALUES(content), category = VALUES(category)`,
      post
    );
  }

  console.log("Database seeded successfully.");
  console.log("Admin login: admin@pitha.com / Admin@123");
  console.log("Customer login: customer@pitha.com / Customer@123");
  await pool.end();
};

seed().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});