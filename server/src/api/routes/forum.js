/* eslint-disable camelcase */
// server/src/api/forum.js
import express from 'express';
import pkg from 'pg';
import axios from 'axios';
import multer from 'multer';

const { Pool } = pkg;
const router = express.Router();

// Database connection
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'bh_db',
  password: process.env.PGPASSWORD || '599121',
  port: process.env.PGPORT || 5432,
});

// Multer configuration for memory storage (store in memory, then save to DB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|mov/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and videos are allowed'));
  },
});

// Utility function to generate random usernames
const generateRandomUsername = () => {
  const adjectives = ['Quantum', 'Cosmic', 'Stellar', 'Galactic', 'Nebular', 'Photon', 'Gravitational', 'Relativistic'];
  const nouns = ['Physicist', 'Observer', 'Theorist', 'Researcher', 'Explorer', 'Scholar', 'Astronomer', 'Scientist'];
  const randomNum = Math.floor(Math.random() * 9999) + 1;

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adjective}${noun}${randomNum}`;
};

// Add middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  console.log('Session check:', req.session);
  
  if (!req.session.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to perform this action'
    });
  }
  
  // Add user info to request for easy access
  req.currentUser = req.session.user;
  next();
};

// Helper function to get user info (fallback to random username for testing)
const getUserInfo = (req) => {
  if (req.session && req.session.user) {
    return {
      id: req.session.user.id,
      username: req.session.user.username
    };
  }
  
  // Fallback for testing when not authenticated
  console.warn('No authenticated user found, using fallback');
  return {
    id: null,
    username: generateRandomUsername()
  };
};

// GET all topics
router.get('/topics', async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT t.*, 
                   COUNT(p.id) as post_count,
                   MAX(p.created_at) as last_post_date
            FROM forum_topics t
            LEFT JOIN forum_posts p ON t.id = p.topic_id
            GROUP BY t.id
            ORDER BY t.created_at ASC
        `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// GET posts by topic
router.get('/topics/:topicId/posts', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { page = 1, limit = 20, sort = 'newest' } = req.query;
    const offset = (page - 1) * limit;

    let orderBy = 'p.created_at DESC';
    if (sort === 'oldest') orderBy = 'p.created_at ASC';
    else if (sort === 'popular') orderBy = 'p.likes_count DESC, p.created_at DESC';

    const result = await pool.query(`
            SELECT p.id, p.topic_id, p.title, p.content, p.author_name, p.user_id, p.post_type, 
                   p.media_type, p.media_filename, p.likes_count, p.replies_count,
                   p.is_pinned, p.created_at, p.updated_at,
                   COUNT(r.id) as actual_replies_count,
                   t.title as topic_title
            FROM forum_posts p
            LEFT JOIN forum_replies r ON p.id = r.post_id
            LEFT JOIN forum_topics t ON p.topic_id = t.id
            WHERE p.topic_id = $1
            GROUP BY p.id, t.title
            ORDER BY p.is_pinned DESC, ${orderBy.replace('p.', 'p.')}
            LIMIT $2 OFFSET $3
        `, [topicId, limit, offset]);

    // Add media URLs and permission flags
    const currentUserId = getUserInfo(req).id;
    const postsWithMedia = result.rows.map((post) => ({
      ...post,
      media_url: post.media_filename ? `/forum/media/${post.id}` : null,
      can_edit: currentUserId && post.user_id === currentUserId,
      can_delete: currentUserId && post.user_id === currentUserId,
    }));

    res.json(postsWithMedia);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET single post with replies
router.get('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    // Get post details
    const postResult = await pool.query(`
            SELECT p.id, p.topic_id, p.title, p.content, p.author_name, p.user_id, p.post_type,
                   p.media_type, p.media_filename, p.likes_count, p.replies_count,
                   p.is_pinned, p.created_at, p.updated_at,
                   t.title as topic_title, t.id as topic_id
            FROM forum_posts p
            LEFT JOIN forum_topics t ON p.topic_id = t.id
            WHERE p.id = $1
        `, [postId]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get replies
    const repliesResult = await pool.query(`
            SELECT * FROM forum_replies 
            WHERE post_id = $1 
            ORDER BY created_at ASC
        `, [postId]);

    const currentUserId = getUserInfo(req).id;
    const post = postResult.rows[0];
    
    // Add permission flags and media URL to post
    post.media_url = post.media_filename ? `/forum/media/${post.id}` : null;
    post.can_edit = currentUserId && post.user_id === currentUserId;
    post.can_delete = currentUserId && post.user_id === currentUserId;
    
    // Add permission flags to replies
    post.replies = repliesResult.rows.map(reply => ({
      ...reply,
      can_edit: currentUserId && reply.user_id === currentUserId,
      can_delete: currentUserId && reply.user_id === currentUserId,
    }));

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// TEST route for GIF upload debugging
router.post('/test-gif-upload', upload.single('media'), async (req, res) => {
  try {
    console.log('TEST GIF UPLOAD:');
    console.log('Body:', req.body);
    console.log('File info:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer?.length,
    } : 'No file');

    if (req.file) {
      // Try to examine the first few bytes of the file
      const firstBytes = req.file.buffer.slice(0, 10);
      console.log('First 10 bytes:', Array.from(firstBytes).map((b) => b.toString(16).padStart(2, '0')).join(' '));

      // GIF files should start with 'GIF87a' or 'GIF89a'
      const header = req.file.buffer.slice(0, 6).toString();
      console.log('File header:', header);
      console.log('Is valid GIF:', header.startsWith('GIF'));
    }

    res.json({
      message: 'Test upload received',
      hasFile: !!req.file,
      fileInfo: req.file ? {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
      } : null,
    });
  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// TEST route to check media serving
router.get('/test-media/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    console.log('TEST: Checking media for post ID:', postId);

    const result = await pool.query(`
            SELECT id, title, post_type, media_type, media_filename,
                   CASE WHEN media_data IS NULL THEN 0 ELSE length(media_data) END as media_size
            FROM forum_posts 
            WHERE id = $1
        `, [postId]);

    if (result.rows.length === 0) {
      return res.json({ error: 'Post not found' });
    }

    const post = result.rows[0];
    res.json({
      post_info: post,
      media_url_would_be: `/forum/media/${postId}`,
      full_media_url: `http://localhost:5000/forum/media/${postId}`,
    });
  } catch (error) {
    console.error('Error in test-media:', error);
    res.status(500).json({ error: error.message });
  }
});

// SERVE media from database
router.get('/media/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    console.log('GET /media/:postId received for postId:', postId);

    const result = await pool.query(`
            SELECT media_data, media_type, media_filename
            FROM forum_posts 
            WHERE id = $1 AND media_data IS NOT NULL
        `, [postId]);

    console.log('Media query result:', {
      found: result.rows.length > 0,
      postId,
      hasMediaData: result.rows[0]?.media_data ? 'Yes' : 'No',
      mediaType: result.rows[0]?.media_type,
      filename: result.rows[0]?.media_filename,
    });

    if (result.rows.length === 0) {
      console.log('No media found for post ID:', postId);
      return res.status(404).json({ error: 'Media not found' });
    }

    const { media_data, media_type, media_filename } = result.rows[0];

    if (!media_data) {
      console.log('Post found but no media data for post ID:', postId);
      return res.status(404).json({ error: 'No media data found' });
    }

    console.log('Serving media:', {
      type: media_type,
      filename: media_filename,
      size: media_data.length,
      isGif: media_type === 'image/gif',
    });

    // Set appropriate headers for different media types
    const headers = {
      'Content-Type': media_type,
      'Content-Length': media_data.length,
      'Content-Disposition': `inline; filename="${media_filename}"`,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'Access-Control-Allow-Origin': '*', // Allow CORS for media
    };

    // Special handling for GIFs
    if (media_type === 'image/gif') {
      headers['Content-Type'] = 'image/gif';
      // Ensure proper GIF headers
      console.log('Serving GIF with special headers');
    }

    res.set(headers);

    res.send(media_data);
  } catch (error) {
    console.error('Error serving media:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to serve media' });
  }
});

// CREATE new post
router.post('/posts', upload.single('media'), async (req, res) => {
  try {
    console.log('POST /posts received');
    console.log('Body:', req.body);
    console.log('Session:', req.session);
    console.log('File:', req.file ? { name: req.file.originalname, size: req.file.size, type: req.file.mimetype } : 'No file');

    const { topic_id, title, content, post_type = 'text' } = req.body;

    // Parse topic_id as integer
    const parsedTopicId = parseInt(topic_id);

    // Validate required fields
    if (!parsedTopicId || isNaN(parsedTopicId) || !title || !content) {
      console.log('Missing or invalid required fields');
      return res.status(400).json({
        error: 'Missing or invalid required fields',
        details: {
          topic_id: !parsedTopicId || isNaN(parsedTopicId) ? 'Required (must be a valid number)' : 'OK',
          title: !title ? 'Required' : 'OK',
          content: !content ? 'Required' : 'OK',
        },
      });
    }

    // Get user info (authenticated or fallback)
    const userInfo = getUserInfo(req);
    const author_name = userInfo.username;
    const user_id = userInfo.id;

    console.log('User info:', userInfo);

    let media_data = null;
    let media_type = null;
    let media_filename = null;

    if (req.file) {
      media_data = req.file.buffer;
      media_type = req.file.mimetype;
      media_filename = req.file.originalname;

      console.log('Processing media file:', {
        filename: media_filename,
        type: media_type,
        size: req.file.size,
        bufferLength: req.file.buffer.length,
      });
    }

    console.log('Inserting into database...');
    const result = await pool.query(`
            INSERT INTO forum_posts (topic_id, title, content, author_name, user_id, post_type, media_data, media_type, media_filename)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, topic_id, title, content, author_name, user_id, post_type, media_type, media_filename, likes_count, replies_count, is_pinned, created_at, updated_at
        `, [parsedTopicId, title, content, author_name, user_id, post_type, media_data, media_type, media_filename]);

    const post = result.rows[0];
    post.media_url = media_filename ? `/forum/media/${post.id}` : null;
    post.can_edit = user_id && post.user_id === user_id; // Add edit permission flag
    post.can_delete = user_id && post.user_id === user_id; // Add delete permission flag

    console.log('Post created successfully:', {
      id: post.id,
      title: post.title,
      user_id: post.user_id,
      author_name: post.author_name,
    });
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      error: 'Failed to create post',
      details: error.message,
    });
  }
});

// UPDATE post
router.put('/posts/:postId', upload.single('media'), async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, post_type } = req.body;

    let updateQuery = `
            UPDATE forum_posts 
            SET title = $1, content = $2, post_type = $3, updated_at = CURRENT_TIMESTAMP
        `;
    const queryParams = [title, content, post_type];

    if (req.file) {
      updateQuery += `, media_data = $${queryParams.length + 1}, media_type = $${queryParams.length + 2}, media_filename = $${queryParams.length + 3}`;
      queryParams.push(req.file.buffer, req.file.mimetype, req.file.originalname);
    }

    updateQuery += ` WHERE id = $${queryParams.length + 1} RETURNING id, topic_id, title, content, author_name, post_type, media_type, media_filename, likes_count, replies_count, is_pinned, created_at, updated_at`;
    queryParams.push(postId);

    const result = await pool.query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = result.rows[0];
    post.media_url = post.media_filename ? `/forum/media/${post.id}` : null;

    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE post
router.delete('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUserId = getUserInfo(req).id;

    // Check if post exists and user has permission
    const postCheck = await pool.query('SELECT user_id, title FROM forum_posts WHERE id = $1', [postId]);
    
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postCheck.rows[0];
    
    // Only allow deletion if user owns the post (or is admin - implement later)
    if (currentUserId && post.user_id !== currentUserId) {
      return res.status(403).json({ error: 'You do not have permission to delete this post' });
    }

    const result = await pool.query('DELETE FROM forum_posts WHERE id = $1 RETURNING *', [postId]);

    res.json({ message: 'Post deleted successfully', post: result.rows[0] });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// CREATE reply
router.post('/posts/:postId/replies', async (req, res) => {
  try {
    console.log('POST /posts/:postId/replies received');
    console.log('Post ID:', req.params.postId);
    console.log('Body:', req.body);

    const { postId } = req.params;
    const { content, parent_reply_id = null } = req.body;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      console.log('Missing or empty content');
      return res.status(400).json({
        error: 'Content is required and cannot be empty',
      });
    }

    const author_name = generateRandomUsername();
    console.log('Generated author name:', author_name);

    console.log('Inserting reply into database...');
    const result = await pool.query(`
            INSERT INTO forum_replies (post_id, parent_reply_id, content, author_name, likes_count)
            VALUES ($1, $2, $3, $4, 0)
            RETURNING *
        `, [postId, parent_reply_id, content.trim(), author_name]);

    const newReply = result.rows[0];
    console.log('Reply created:', newReply);

    // Update replies count in the post
    console.log('Updating replies count...');
    await pool.query(`
            UPDATE forum_posts 
            SET replies_count = (SELECT COUNT(*) FROM forum_replies WHERE post_id = $1)
            WHERE id = $1
        `, [postId]);

    // Get updated post replies count
    const postResult = await pool.query(`
            SELECT replies_count FROM forum_posts WHERE id = $1
        `, [postId]);

    console.log('Reply creation successful');
    res.status(201).json({
      ...newReply,
      post_replies_count: postResult.rows[0]?.replies_count || 0
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to create reply',
      details: error.message,
    });
  }
});

// UPDATE reply
router.put('/replies/:replyId', async (req, res) => {
  try {
    const { replyId } = req.params;
    const { content } = req.body;

    const result = await pool.query(`
            UPDATE forum_replies 
            SET content = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `, [content, replyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({ error: 'Failed to update reply' });
  }
});

// DELETE reply
router.delete('/replies/:replyId', async (req, res) => {
  try {
    const { replyId } = req.params;
    const currentUserId = getUserInfo(req).id;

    // Check if reply exists and user has permission
    const replyCheck = await pool.query('SELECT user_id FROM forum_replies WHERE id = $1', [replyId]);
    
    if (replyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    const reply = replyCheck.rows[0];
    
    // Only allow deletion if user owns the reply
    if (currentUserId && reply.user_id !== currentUserId) {
      return res.status(403).json({ error: 'You do not have permission to delete this reply' });
    }

    const result = await pool.query('DELETE FROM forum_replies WHERE id = $1 RETURNING *', [replyId]);

    res.json({ message: 'Reply deleted successfully', reply: result.rows[0] });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});

// LIKE/UNLIKE post
router.post('/posts/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { action } = req.body; // 'like' or 'unlike'

    const increment = action === 'like' ? 1 : -1;

    const result = await pool.query(`
            UPDATE forum_posts 
            SET likes_count = GREATEST(0, likes_count + $1)
            WHERE id = $2
            RETURNING likes_count
        `, [increment, postId]);

    res.json({ likes_count: result.rows[0].likes_count });
  } catch (error) {
    console.error('Error updating likes:', error);
    res.status(500).json({ error: 'Failed to update likes' });
  }
});

// LIKE/UNLIKE reply
router.post('/replies/:replyId/like', async (req, res) => {
  try {
    const { replyId } = req.params;
    const { action } = req.body; // 'like' or 'unlike'

    console.log('Reply like request:', { replyId, action });

    const increment = action === 'like' ? 1 : -1;

    const result = await pool.query(`
            UPDATE forum_replies 
            SET likes_count = GREATEST(0, likes_count + $1)
            WHERE id = $2
            RETURNING likes_count
        `, [increment, replyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    console.log('Reply likes updated:', result.rows[0]);
    res.json({ likes_count: result.rows[0].likes_count });
  } catch (error) {
    console.error('Error updating reply likes:', error);
    res.status(500).json({ error: 'Failed to update reply likes' });
  }
});

// Search GIFs using Tenor API
router.get('/gifs/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    const apiKey = process.env.TENOR_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Tenor API key not configured' });
    }

    const response = await axios.get('https://tenor.googleapis.com/v2/search', {
      params: {
        q,
        key: apiKey,
        limit,
        media_filter: 'gif',
        contentfilter: 'high',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error searching GIFs:', error);
    res.status(500).json({ error: 'Failed to search GIFs' });
  }
});

// Get trending GIFs
router.get('/gifs/trending', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const apiKey = process.env.TENOR_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Tenor API key not configured' });
    }

    const response = await axios.get('https://tenor.googleapis.com/v2/featured', {
      params: {
        key: apiKey,
        limit,
        media_filter: 'gif',
        contentfilter: 'high',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching trending GIFs:', error);
    res.status(500).json({ error: 'Failed to fetch trending GIFs' });
  }
});

export default router;
