CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  category VARCHAR(60) NOT NULL,
  short_description VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  cultural_significance TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  preparation TEXT NOT NULL,
  region_origin VARCHAR(120) NOT NULL,
  nutrition VARCHAR(255) NOT NULL,
  storage VARCHAR(255) NOT NULL,
  shelf_life_days INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  price_unit VARCHAR(20) NOT NULL DEFAULT 'Per Piece',
  availability VARCHAR(40) NOT NULL,
  sizes VARCHAR(120) NOT NULL,
  image_url VARCHAR(600) NOT NULL,
  festival_tag VARCHAR(120) NOT NULL,
  popularity INT NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 50,
  manufacturing_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(600) NOT NULL,
  alt_text VARCHAR(180) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_name VARCHAR(120) NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  size VARCHAR(40),
  UNIQUE KEY unique_cart_item (user_id, product_id, size),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  UNIQUE KEY unique_wishlist_item (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_number VARCHAR(40) NOT NULL UNIQUE,
  status VARCHAR(40) NOT NULL DEFAULT 'Placed',
  payment_status VARCHAR(40) NOT NULL DEFAULT 'Pending',
  payment_provider VARCHAR(40) NOT NULL DEFAULT 'Razorpay',
  total DECIMAL(10,2) NOT NULL,
  coupon_code VARCHAR(40),
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(140) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  size VARCHAR(40),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS knowledge_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  excerpt VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(80) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT NOT NULL,
  message    TEXT NOT NULL,
  is_read    TINYINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coupons (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  code           VARCHAR(40) NOT NULL,
  description    VARCHAR(255) NOT NULL DEFAULT '',
  discount_type  ENUM('flat', 'percent') NOT NULL DEFAULT 'percent',
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_visible     TINYINT NOT NULL DEFAULT 0,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);