import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Database Setup
const db = new Database(process.env.DB_PATH || 'database.sqlite');
db.pragma('journal_mode = WAL');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    thumbnail TEXT,
    file_url TEXT,
    demo_url TEXT,
    author_name TEXT DEFAULT 'DigiForest',
    category_id INTEGER,
    sales_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );
`);

// Migration: Add missing columns to products table if they don't exist
const tableInfo = db.prepare("PRAGMA table_info(products)").all() as any[];
const columnNames = tableInfo.map(c => c.name);

if (!columnNames.includes('demo_url')) {
  db.prepare("ALTER TABLE products ADD COLUMN demo_url TEXT").run();
}
if (!columnNames.includes('author_name')) {
  db.prepare("ALTER TABLE products ADD COLUMN author_name TEXT DEFAULT 'DigiForest'").run();
}
if (!columnNames.includes('category_id')) {
  db.prepare("ALTER TABLE products ADD COLUMN category_id INTEGER").run();
}

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'manual' or 'auto'
    account_number TEXT,
    instructions TEXT,
    api_key TEXT,
    api_secret TEXT,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    transaction_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    rating INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    link TEXT,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Admin if not exists
const adminUser = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@digiforest.com');
if (!adminUser) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Admin',
    'admin@digiforest.com',
    hashedPassword,
    'admin'
  );
  console.log('Admin user seeded: admin@digiforest.com / admin123');
}

// Seed Settings if empty
const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as any;
if (settingsCount.count === 0) {
  const defaultSettings = [
    { key: 'site_logo', value: '' },
    { key: 'site_favicon', value: '' },
    { key: 'payment_mode', value: 'manual' }, // manual or auto
    { key: 'manual_payment_details', value: 'Send payment to: BKash 017XXXXXXXX' },
    { key: 'currency', value: 'BDT' },
    { key: 'currency_symbol', value: '৳' },
  ];
  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  defaultSettings.forEach(s => insertSetting.run(s.key, s.value));
}

// Seed default categories
const categoriesCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as any;
if (categoriesCount.count === 0) {
  const defaultCategories = [
    { name: 'Themes', slug: 'themes' },
    { name: 'Scripts', slug: 'scripts' },
    { name: 'Assets', slug: 'assets' },
    { name: 'Graphics', slug: 'graphics' },
    { name: 'Plugins', slug: 'plugins' }
  ];
  const insertCat = db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)");
  defaultCategories.forEach(cat => insertCat.run(cat.name, cat.slug));
}

// Seed default payment methods
const pmCount = db.prepare("SELECT COUNT(*) as count FROM payment_methods").get() as any;
if (pmCount.count === 0) {
  const defaultPMs = [
    { id: 'bkash', name: 'bKash', type: 'manual', account_number: '01700000000', instructions: 'Send money to this personal number and provide transaction ID.' },
    { id: 'nagad', name: 'Nagad', type: 'manual', account_number: '01800000000', instructions: 'Send money to this personal number and provide transaction ID.' },
    { id: 'rocket', name: 'Rocket', type: 'manual', account_number: '01900000000', instructions: 'Send money to this personal number and provide transaction ID.' }
  ];
  const insertPM = db.prepare("INSERT INTO payment_methods (id, name, type, account_number, instructions) VALUES (?, ?, ?, ?, ?)");
  defaultPMs.forEach(pm => insertPM.run(pm.id, pm.name, pm.type, pm.account_number, pm.instructions));
}

// Seed Banners if empty
const bannerCount = db.prepare('SELECT COUNT(*) as count FROM banners').get() as any;
if (bannerCount.count === 0) {
  db.prepare('INSERT INTO banners (image_url, title, subtitle, link) VALUES (?, ?, ?, ?)').run(
    'https://picsum.photos/seed/banner1/1920/600',
    'Welcome to DigiForest',
    'The ultimate digital marketplace for themes and scripts.',
    '/'
  );
}
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
if (productCount.count === 0) {
  const seedProducts = [
    {
      title: 'Modern E-commerce React Template',
      description: 'A fully responsive e-commerce template built with React, Tailwind CSS, and Framer Motion. Includes 20+ pages and dark mode support.',
      price: 49.00,
      thumbnail: 'https://picsum.photos/seed/shop/800/600',
      file_url: 'https://example.com/download/react-shop.zip',
      category: 'Themes'
    },
    {
      title: 'Ultimate PHP Admin Dashboard',
      description: 'Powerful admin dashboard script with user management, analytics, and role-based access control. Built with PHP 8.2 and MySQL.',
      price: 29.00,
      thumbnail: 'https://picsum.photos/seed/admin/800/600',
      file_url: 'https://example.com/download/php-admin.zip',
      category: 'Scripts'
    },
    {
      title: 'Abstract 3D Icon Pack',
      description: '50+ high-resolution 3D abstract icons for your next design project. Available in PNG, FIG, and BLEND formats.',
      price: 15.00,
      thumbnail: 'https://picsum.photos/seed/icons/800/600',
      file_url: 'https://example.com/download/3d-icons.zip',
      category: 'Graphics'
    },
    {
      title: 'SaaS Landing Page Kit',
      description: 'High-converting landing page templates for SaaS startups. Clean code, SEO optimized, and easy to customize.',
      price: 35.00,
      thumbnail: 'https://picsum.photos/seed/saas/800/600',
      file_url: 'https://example.com/download/saas-kit.zip',
      category: 'Themes'
    }
  ];

  const insertProduct = db.prepare('INSERT INTO products (title, description, price, thumbnail, file_url, category) VALUES (?, ?, ?, ?, ?, ?)');
  seedProducts.forEach(p => insertProduct.run(p.title, p.description, p.price, p.thumbnail, p.file_url, p.category));
}

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
};

// --- API Routes ---

// Auth
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashedPassword);
    const user = { id: result.lastInsertRowid, name, email, role: 'user' };
    const token = jwt.sign(user, process.env.JWT_SECRET || 'secret');
    res.json({ user, token });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret');
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
});

// File Upload
app.post('/api/upload', authenticate, isAdmin, upload.single('file'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Settings
app.get('/api/settings', (req, res) => {
  const settings = db.prepare('SELECT * FROM settings').all();
  const settingsObj = settings.reduce((acc: any, s: any) => {
    acc[s.key] = s.value;
    return acc;
  }, {});
  res.json(settingsObj);
});

app.put('/api/admin/settings', authenticate, isAdmin, (req, res) => {
  const settings = req.body;
  const updateSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  Object.entries(settings).forEach(([key, value]) => {
    updateSetting.run(key, String(value));
  });
  res.json({ success: true });
});

// Banners
app.get('/api/banners', (req, res) => {
  const banners = db.prepare('SELECT * FROM banners WHERE active = 1 ORDER BY created_at DESC').all();
  res.json(banners);
});

app.get('/api/admin/banners', authenticate, isAdmin, (req, res) => {
  const banners = db.prepare('SELECT * FROM banners ORDER BY created_at DESC').all();
  res.json(banners);
});

app.post('/api/admin/banners', authenticate, isAdmin, (req, res) => {
  const { image_url, title, subtitle, link } = req.body;
  const result = db.prepare('INSERT INTO banners (image_url, title, subtitle, link) VALUES (?, ?, ?, ?)').run(
    image_url, title, subtitle, link
  );
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/admin/banners/:id', authenticate, isAdmin, (req, res) => {
  const { image_url, title, subtitle, link, active } = req.body;
  db.prepare('UPDATE banners SET image_url = ?, title = ?, subtitle = ?, link = ?, active = ? WHERE id = ?').run(
    image_url, title, subtitle, link, active, req.params.id
  );
  res.json({ success: true });
});

app.delete('/api/admin/banners/:id', authenticate, isAdmin, (req, res) => {
  db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Categories API
app.get('/api/categories', (req, res) => {
  const categories = db.prepare("SELECT * FROM categories").all();
  res.json(categories);
});

app.post('/api/admin/categories', authenticate, isAdmin, (req, res) => {
  const { name, slug, icon } = req.body;
  try {
    const result = db.prepare("INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)").run(name, slug, icon);
    res.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/admin/categories/:id', authenticate, isAdmin, (req, res) => {
  const { name, slug, icon } = req.body;
  const { id } = req.params;
  try {
    db.prepare("UPDATE categories SET name = ?, slug = ?, icon = ? WHERE id = ?").run(name, slug, icon, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/admin/categories/:id', authenticate, isAdmin, (req, res) => {
  const { id } = req.params;
  try {
    db.prepare("DELETE FROM categories WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Payment Methods API
app.get('/api/payment-methods', (req, res) => {
  const methods = db.prepare("SELECT id, name, type, account_number, instructions, active FROM payment_methods WHERE active = 1").all();
  res.json(methods);
});

app.get('/api/admin/payment-methods', authenticate, isAdmin, (req, res) => {
  const methods = db.prepare("SELECT * FROM payment_methods").all();
  res.json(methods);
});

app.put('/api/admin/payment-methods/:id', authenticate, isAdmin, (req, res) => {
  const { name, type, account_number, instructions, api_key, api_secret, active } = req.body;
  const { id } = req.params;
  try {
    db.prepare(`
      UPDATE payment_methods 
      SET name = ?, type = ?, account_number = ?, instructions = ?, api_key = ?, api_secret = ?, active = ? 
      WHERE id = ?
    `).run(name, type, account_number, instructions, api_key, api_secret, active ? 1 : 0, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Products
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  let query = `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
  `;
  const params: any[] = [];
  
  if (category) {
    query += " WHERE c.name = ?";
    params.push(category);
  }
  
  query += " ORDER BY p.created_at DESC";
  
  const products = db.prepare(query).all(...params);
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.id = ?
  `).get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', authenticate, isAdmin, (req, res) => {
  const { title, description, price, thumbnail, file_url, demo_url, author_name, category_id } = req.body;
  const result = db.prepare('INSERT INTO products (title, description, price, thumbnail, file_url, demo_url, author_name, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    title, description, price, thumbnail, file_url, demo_url, author_name, category_id
  );
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/products/:id', authenticate, isAdmin, (req, res) => {
  const { title, description, price, thumbnail, file_url, demo_url, author_name, category_id } = req.body;
  db.prepare('UPDATE products SET title = ?, description = ?, price = ?, thumbnail = ?, file_url = ?, demo_url = ?, author_name = ?, category_id = ? WHERE id = ?').run(
    title, description, price, thumbnail, file_url, demo_url, author_name, category_id, req.params.id
  );
  res.json({ success: true });
});

app.delete('/api/products/:id', authenticate, isAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Orders & Checkout
app.post('/api/checkout', authenticate, (req: any, res) => {
  const { productId, paymentMethod, transactionId } = req.body;
  const product: any = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // In a real app, verify payment here
  const result = db.prepare('INSERT INTO orders (user_id, product_id, amount, status, payment_method, transaction_id) VALUES (?, ?, ?, ?, ?, ?)').run(
    req.user.id, productId, product.price, 'completed', paymentMethod, transactionId
  );
  
  // Update sales count
  db.prepare('UPDATE products SET sales_count = sales_count + 1 WHERE id = ?').run(productId);

  res.json({ orderId: result.lastInsertRowid, downloadUrl: product.file_url });
});

app.get('/api/user/orders', authenticate, (req: any, res) => {
  const orders = db.prepare(`
    SELECT orders.*, products.title, products.thumbnail, products.file_url 
    FROM orders 
    JOIN products ON orders.product_id = products.id 
    WHERE orders.user_id = ?
    ORDER BY orders.created_at DESC
  `).all(req.user.id);
  res.json(orders);
});

// Admin Stats
app.get('/api/admin/orders', authenticate, isAdmin, (req, res) => {
  const orders = db.prepare(`
    SELECT orders.*, users.name as user_name, users.email as user_email, products.title as product_title
    FROM orders
    JOIN users ON orders.user_id = users.id
    JOIN products ON orders.product_id = products.id
    ORDER BY orders.created_at DESC
  `).all();
  res.json(orders);
});

app.put('/api/admin/orders/:id/status', authenticate, isAdmin, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

app.get('/api/admin/stats', authenticate, isAdmin, (req, res) => {
  try {
    const totalSales = db.prepare("SELECT SUM(amount) as total FROM orders WHERE status = 'completed'").get() as any;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get() as any;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
    
    const recentOrders = db.prepare(`
      SELECT orders.*, users.name as user_name, products.title as product_title
      FROM orders
      JOIN users ON orders.user_id = users.id
      JOIN products ON orders.product_id = products.id
      ORDER BY orders.created_at DESC
      LIMIT 10
    `).all();

    const salesTrend = db.prepare(`
      SELECT strftime('%Y-%m-%d', created_at) as date, SUM(amount) as total
      FROM orders
      WHERE status = 'completed' AND created_at >= date('now', '-30 days')
      GROUP BY date
      ORDER BY date ASC
    `).all();

    const recentUsers = db.prepare(`
      SELECT id, name, email, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    const categoryDistribution = db.prepare(`
      SELECT category as name, COUNT(*) as value
      FROM products
      GROUP BY category
    `).all();

    const topProducts = db.prepare(`
      SELECT title, sales_count
      FROM products
      ORDER BY sales_count DESC
      LIMIT 5
    `).all();

    res.json({
      revenue: (totalSales && totalSales.total) ? totalSales.total : 0,
      orders: (totalOrders && totalOrders.count) ? totalOrders.count : 0,
      users: (totalUsers && totalUsers.count) ? totalUsers.count : 0,
      products: (totalProducts && totalProducts.count) ? totalProducts.count : 0,
      recentOrders: recentOrders || [],
      salesTrend: salesTrend || [],
      recentUsers: recentUsers || [],
      categoryDistribution: categoryDistribution || [],
      topProducts: topProducts || []
    });
  } catch (error: any) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats: ' + error.message });
  }
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
