import express from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query } from '../../../boilerplate/db/index.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../public/uploads/forum');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (ext && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  },
});

// Get all boards
router.get(
  '/boards',
  asyncHandler(async (req, res) => {
    const { rows } = await query(`
      SELECT 
        b.id, 
        b.name, 
        b.description,
        COUNT(t.id) AS thread_count
      FROM boards b
      LEFT JOIN threads t ON b.id = t.board_id
      GROUP BY b.id, b.name, b.description
      ORDER BY b.id
    `);
    res.status(200).json(rows);
  }),
);

// Get a specific board with its threads
router.get(
  '/boards/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Get board details
    const boardResult = await query(
      'SELECT id, name, description FROM boards WHERE id = $1',
      [id],
    );
    
    if (boardResult.rows.length === 0) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    const board = boardResult.rows[0];
    
    // Get threads for this board
    const threadsResult = await query(`
      SELECT 
        t.id, 
        t.title, 
        t.content,
        t.created_at,
        t.is_sticky,
        u.username,
        (SELECT COUNT(*) FROM comments c WHERE c.thread_id = t.id) AS comment_count,
        COALESCE(
          (SELECT SUM(CASE WHEN is_upvote THEN 1 ELSE -1 END) 
           FROM votes 
           WHERE thread_id = t.id), 
          0
        ) AS votes
      FROM threads t
      JOIN users u ON t.user_id = u.id
      WHERE t.board_id = $1
      ORDER BY t.is_sticky DESC, t.created_at DESC
    `, [id]);
    
    board.threads = threadsResult.rows;
    
    res.status(200).json(board);
  }),
);

// Get threads for a specific board
router.get(
  '/boards/:id/threads',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const { rows } = await query(`
      SELECT 
        t.id, 
        t.title, 
        t.content,
        t.created_at,
        t.is_sticky,
        u.username,
        (SELECT COUNT(*) FROM comments c WHERE c.thread_id = t.id) AS comment_count,
        COALESCE(
          (SELECT SUM(CASE WHEN is_upvote THEN 1 ELSE -1 END) 
           FROM votes 
           WHERE thread_id = t.id), 
          0
        ) AS votes
      FROM threads t
      JOIN users u ON t.user_id = u.id
      WHERE t.board_id = $1
      ORDER BY t.is_sticky DESC, t.created_at DESC
    `, [id]);
    
    res.status(200).json(rows);
  }),
);

// Create a new thread
router.post(
  '/threads',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const { board_id, title, content } = req.body;
    
    // Get user ID from session
    const userId = req.session.userId || 1; // Default to user 1 for testing
    
    // Handle file upload if present
    const imageUrl = req.file 
      ? `/uploads/forum/${path.basename(req.file.path)}` 
      : null;
    
    const { rows } = await query(
      `INSERT INTO threads 
        (board_id, user_id, title, content, image_url) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [board_id, userId, title, content, imageUrl],
    );
    
    res.status(201).json({ id: rows[0].id, message: 'Thread created successfully' });
  }),
);

// Get a thread with its comments
router.get(
  '/threads/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Get thread details
    const threadResult = await query(`
      SELECT 
        t.id, 
        t.title, 
        t.content,
        t.created_at,
        t.image_url,
        t.is_sticky,
        t.board_id,
        u.username,
        b.name AS board_name,
        COALESCE(
          (SELECT SUM(CASE WHEN is_upvote THEN 1 ELSE -1 END) 
           FROM votes 
           WHERE thread_id = t.id), 
          0
        ) AS votes
      FROM threads t
      JOIN users u ON t.user_id = u.id
      JOIN boards b ON t.board_id = b.id
      WHERE t.id = $1
    `, [id]);
    
    if (threadResult.rows.length === 0) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    const thread = threadResult.rows[0];
    
    // Get comments for this thread
    const commentsResult = await query(`
      SELECT 
        c.id, 
        c.content,
        c.created_at,
        c.image_url,
        u.username,
        COALESCE(
          (SELECT SUM(CASE WHEN is_upvote THEN 1 ELSE -1 END) 
           FROM votes 
           WHERE comment_id = c.id), 
          0
        ) AS votes
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.thread_id = $1
      ORDER BY c.created_at ASC
    `, [id]);
    
    thread.comments = commentsResult.rows;
    
    res.status(200).json(thread);
  }),
);

// Add a comment to a thread
router.post(
  '/comments',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const { thread_id, content } = req.body;
    
    // Get user ID from session
    const userId = req.session.userId || 1; // Default to user 1 for testing
    
    // Handle file upload if present
    const imageUrl = req.file 
      ? `/uploads/forum/${path.basename(req.file.path)}` 
      : null;
    
    const { rows } = await query(
      `INSERT INTO comments 
        (thread_id, user_id, content, image_url) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      [thread_id, userId, content, imageUrl],
    );
    
    res.status(201).json({ id: rows[0].id, message: 'Comment added successfully' });
  }),
);

// Search threads and comments
router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const { query: searchQuery } = req.query;
    
    if (!searchQuery || searchQuery.trim().length < 3) {
      return res.status(400).json({ message: 'Search query must be at least 3 characters' });
    }
    
    const { rows } = await query(`
      SELECT 
        t.id, 
        t.title, 
        t.content,
        t.created_at,
        u.username,
        b.name AS board_name,
        (SELECT COUNT(*) FROM comments c WHERE c.thread_id = t.id) AS comment_count
      FROM threads t
      JOIN users u ON t.user_id = u.id
      JOIN boards b ON t.board_id = b.id
      WHERE 
        to_tsvector('english', t.title || ' ' || t.content) @@ plainto_tsquery('english', $1)
      ORDER BY t.created_at DESC
      LIMIT 20
    `, [searchQuery]);
    
    res.status(200).json(rows);
  }),
);

export default router;
