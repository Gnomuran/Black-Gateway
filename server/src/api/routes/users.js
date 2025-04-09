import express from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { query } from '../../../boilerplate/db/index.js';

const router = express.Router();

// 🔹 Test-Route: Prüft, ob die DB-Verbindung funktioniert
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await query("SELECT 'User API is working' AS message");
    res.status(200).json(rows);
  }),
);

// 🔹 Alle Benutzer abrufen
router.get(
  '/all',
  asyncHandler(async (req, res) => {
    const { rows } = await query('SELECT * FROM users');
    res.status(200).json(rows);
  }),
);

// 🔹 Neuen Benutzer erstellen
router.post(
  '/create',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Passwort hashen
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { rows } = await query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, hashedPassword],
    );

    res.status(201).json(rows[0]);
  }),
);

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  console.log('Login Request:', req.body);

  const { rows } = await query('SELECT * FROM users WHERE username = $1', [username]);

  if (rows.length === 0) {
    return res.status(401).json({ message: 'Benutzername oder Passwort ist falsch' });
  }

  const user = rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Benutzername oder Passwort ist falsch' });
  }

  req.session.user = { id: user.id, username: user.username }; // Session erstellen

  return res.status(200).json({ message: 'Login erfolgreich' });
}));

router.get('/me', asyncHandler(async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Nicht eingeloggt' });
  }
  return res.status(200).json(req.session.user);
}));
// api/routes/users.js (am Ende der Datei, vor dem export)
router.post('/logout', asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session-Zerstörung fehlgeschlagen:', err);
      return res.status(500).json({ message: 'Logout fehlgeschlagen' });
    }
    res.clearCookie('connect.sid'); // Cookie löschen
    return res.status(200).json({ message: 'Logout erfolgreich' });
  });
}));

export default router;
