import express from 'express';
import asyncHandler from 'express-async-handler';
import { query } from '../../../boilerplate/db/index.js';

const router = express.Router();

// 🔹 Test-Route: Prüft, ob die Info-API funktioniert
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await query("SELECT 'Info API is working' AS message");
    res.status(200).json(rows);
  }),
);

// 🔹 Alle Informationen abrufen (inkl. Kategorie & Unterkategorie)
router.get(
  '/all',
  asyncHandler(async (req, res) => {
    const { rows } = await query(`
      SELECT 
        i.id,
        i.title,
        i.content,
        s.name AS subcategory,
        c.name AS category
      FROM info i
      JOIN subcategories s ON i.subcategory_id = s.id
      JOIN categories c ON s.category_id = c.id
      ORDER BY c.name, s.name, i.title;
    `);
    res.status(200).json(rows);
  }),
);

// 🔹 Einzelne Infos einer bestimmten Unterkategorie abrufen
router.get(
  '/subcategory/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rows } = await query(
      'SELECT id, title, content, image_url FROM info WHERE subcategory_id = $1',
      [id],
    );
    res.status(200).json(rows);
  }),
);

// 🔹 Subkategorie als "fertig" markieren (für eingeloggten User)
router.post(
  '/complete',
  asyncHandler(async (req, res) => {
    const userId = req.session?.user?.id;
    const { subcategoryId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Nicht eingeloggt' });
    }

    const check = await query(
      'SELECT 1 FROM user_completed_subcategories WHERE user_id = $1 AND subcategory_id = $2',
      [userId, subcategoryId],
    );

    if (check.rows.length > 0) {
      return res.status(409).json({ message: 'Schon als fertig markiert' });
    }

    await query(
      'INSERT INTO user_completed_subcategories (user_id, subcategory_id) VALUES ($1, $2)',
      [userId, subcategoryId],
    );

    return res.status(200).json({ message: 'Erfolg: Subkategorie als fertig markiert.' });
  }),
);

// 🔹 Alle "fertigen Themen" für eingeloggten User abrufen
router.get(
  '/completed',
  asyncHandler(async (req, res) => {
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Nicht eingeloggt' });
    }

    const { rows } = await query(
      `
      SELECT 
        s.id AS subcategoryId,
        s.name AS subcategory,
        c.name AS category,
        ucs.completed_at AS completedAt
      FROM user_completed_subcategories ucs
      JOIN subcategories s ON ucs.subcategory_id = s.id
      JOIN categories c ON s.category_id = c.id
      WHERE ucs.user_id = $1
      ORDER BY ucs.completed_at DESC
      `,
      [userId],
    );

    return res.status(200).json(rows);
  }),
);

// 🔹 Alle Subkategorien abrufen
router.get(
  '/subcategories',
  asyncHandler(async (req, res) => {
    const { rows } = await query(`
      SELECT 
        s.id,
        s.name,
        c.name AS category_name,
        c.id AS category_id
      FROM subcategories s
      JOIN categories c ON s.category_id = c.id
      ORDER BY c.name, s.name;
    `);
    res.status(200).json(rows);
  }),
);

export default router;
