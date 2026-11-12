// Core Module
const path = require('path');
const fs = require('fs');

// Simple .env file loader for zero-dependency environment variables
const envPath = path.join(__dirname, '.env');
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
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

// Ensure uploads folder exists so multer doesn't fail
const uploadsDir = path.join(rootDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// MongoDB Session Store
const store = new MongoDBStore({
  uri: DB_PATH,
  collection: 'sessions'
});

store.on('error', function(error) {
  console.log('Session store error: ', error);
});

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
// Compatibility fallback for nested routes
app.use('/host/uploads', express.static(uploadsDir));
app.use('/homes/uploads', express.static(uploadsDir));

// Express Session
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
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

// Database connection & Server start
mongoose.connect(DB_PATH)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`Server running on address http://localhost:${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.log('Error while connecting to Mongo: ', err);
  });

module.exports = app;

