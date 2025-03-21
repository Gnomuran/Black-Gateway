import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import debug from 'debug';
import session from 'express-session';

// Importiere deine Routen
import testRoute from './api/routes/test.js';
import usersRoute from './api/routes/users.js';

// 🔹 .env Datei laden
dotenv.config();
debug.enable(process.env.DEBUG); // DEBUG aus .env aktivieren

const dirname = path.resolve(); // Alternative zu __dirname in ES-Modulen
const app = express();

// 🔹 Middleware-Stack
app.use(morgan('dev')); // Logger für Requests
app.use(cors({
  origin: 'http://localhost:8080', // Frontend-URL
  credentials: true, // Cookies mit Requests senden
}));

app.use(express.json()); // JSON-Parsing aktivieren
app.use(express.urlencoded({ extended: true })); // URL-encoded Formulardaten erlauben

// 🔹 Session-Handling (MUSS VOR DEN ROUTEN STEHEN!)
app.use(session({
  secret: process.env.SESSION_SECRET || '10YearsInTheJoint', // 🔹 .env oder Fallback
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // 🔹 Bei HTTPS auf true setzen
}));

// 🔹 Statische Dateien bereitstellen (Optional)
app.use(express.static(path.join(dirname, '/public')));

// 🔹 API-Routen registrieren
app.use('/test', testRoute);
app.use('/users', usersRoute);

// 🔹 Starte den Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));

export default app;
