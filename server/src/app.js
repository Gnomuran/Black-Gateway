/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import debug from 'debug';
import session from 'express-session';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import testRoute from './api/routes/test.js';
import usersRoute from './api/routes/users.js';
import kurseRoute from './api/routes/kurse.js';
import forumRoute from './api/routes/forum.js';
import aiAssistantRoute from './api/routes/ai-assistant.js'; // 🆕 NEW: AI Assistant route

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Create multer instance
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos only
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// 🔹 .env Datei laden
dotenv.config();
debug.enable(process.env.DEBUG); // DEBUG aus .env aktivieren

// Get current directory path (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 🔹 Middleware-Stack
app.use(morgan('dev')); // Logger für Requests
app.use(cors({
  origin: 'http://localhost:8080', // Frontend-URL
  credentials: true,
}));

app.use(express.json()); // JSON-Parsing aktivieren
app.use(express.urlencoded({ extended: true })); // URL-encoded Formulardaten erlauben

// 🔹 Session-Handling (MUSS VOR DEN ROUTEN STEHEN!)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Für localhost development
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24h
  },
}));

// 🔹 Statische Dateien bereitstellen
console.log('Serving static files from:', path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public')));

// Explicitly serve the uploads directory
const uploadsPath = path.join(__dirname, 'public', 'uploads');
console.log('Serving uploads from:', uploadsPath);

// Create uploads directory if it doesn't exist
try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('Created uploads directory');
  }
} catch (err) {
  console.error('Error setting up uploads directory:', err);
}

app.use('/uploads', express.static(uploadsPath));

// Debug route to check if static files are being served
app.get('/check-static', (req, res) => {
  res.json({
    message: 'Static file configuration',
    publicPath: path.join(__dirname, 'public'),
    uploadsPath,
    exists: fs.existsSync(uploadsPath),
  });
});

// 🔹 API-Routen registrieren
app.use('/test', testRoute);
app.use('/users', usersRoute);
app.use('/info', kurseRoute);
app.use('/forum', forumRoute);
app.use('/uploads', express.static('public/uploads'));
app.use('/ai-assistant', aiAssistantRoute); // 🆕 NEW: AI Assistant API routes

// 🔹 Error handler for file uploads
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large' });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: 'Unexpected file upload' });
  }

  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// 🔹 Starte den Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));

export default app;
