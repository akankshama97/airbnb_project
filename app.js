// Core Module
const path = require('path');
const fs = require('fs');

// Project root directory
const rootDir = require("./utils/pathUtil");

// Simple .env file loader for zero-dependency environment variables
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex).trim();
        let val = trimmed.substring(eqIndex + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  } catch (err) {
    console.log('Error reading .env file: ', err.message);
  }
}

// External Module
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const multer = require('multer');

// Environment Variables with sensible fallbacks
const PORT = process.env.PORT || 3012;
const DB_PATH = process.env.MONGODB_URI || "mongodb://akankshama97_db_user:Maurya9721@ac-n8xfrtj-shard-00-00.vbeekgg.mongodb.net:27017,ac-n8xfrtj-shard-00-01.vbeekgg.mongodb.net:27017,ac-n8xfrtj-shard-00-02.vbeekgg.mongodb.net:27017/airbnb?ssl=true&replicaSet=atlas-t9f0ym-shard-0&authSource=admin&appName=Cluster0";
const SESSION_SECRET = process.env.SESSION_SECRET || "Complete Coding Secret Key";

// Local Module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const errorsController = require("./controllers/errors");

const app = express();

// View Engine Setup (Absolute path to views ensures Vercel and local both work)
app.set('view engine', 'ejs');
app.set('views', path.join(rootDir, 'views'));

// Safe Uploads Directory (On Vercel, filesystem is read-only except /tmp)
const isVercel = Boolean(process.env.VERCEL);
const uploadsDir = isVercel
  ? path.join('/tmp', 'uploads')
  : path.join(rootDir, 'uploads');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  console.log('Uploads directory creation notice:', err.message);
}

// MongoDB Session Store with safe fallback
let store;
try {
  store = new MongoDBStore({
    uri: DB_PATH,
    collection: 'sessions'
  });
  store.on('error', function(error) {
    console.log('Session store warning: ', error.message);
  });
} catch (err) {
  console.log('Could not initialize MongoDB session store:', err.message);
}

const randomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${randomString(8)}-${sanitizedName}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/webp'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const multerOptions = {
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max limit
  }
};

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(multer(multerOptions).single('photo'));

// Static assets
app.use(express.static(path.join(rootDir, 'public')));
app.use('/uploads', express.static(uploadsDir));
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
// Compatibility fallback for nested routes
app.use('/host/uploads', express.static(uploadsDir));
app.use('/homes/uploads', express.static(uploadsDir));

// Express Session
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store || undefined,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// User & Login state for all views
app.use((req, res, next) => {
  req.isLoggedIn = Boolean(req.session && req.session.isLoggedIn);
  res.locals.isLoggedIn = req.isLoggedIn;
  res.locals.user = (req.session && req.session.user) ? req.session.user : null;
  next();
});

// Database connection helper (essential for Serverless like Vercel)
let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  try {
    await mongoose.connect(DB_PATH);
    isConnected = true;
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.log('MongoDB connection error:', err.message);
  }
};

// Initiate DB connection
connectDB();

// Ensure DB is connected before processing requests
app.use(async (req, res, next) => {
  if (!isConnected && mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  next();
});

// Routes
app.use(authRouter);
app.use(storeRouter);

// Host protection middleware
app.use('/host', (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
});
app.use('/host', hostRouter);

// 404 handler
app.use(errorsController.pageNotFound);

// Start server when run directly (not in Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });
}

// Export for Vercel Serverless Function
module.exports = app;
