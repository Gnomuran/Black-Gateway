-- Forum tables

-- Boards table (forum categories)
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Threads table (discussion threads)
CREATE TABLE IF NOT EXISTS threads (
  id SERIAL PRIMARY KEY,
  board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(255),
  is_sticky BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table (replies to threads)
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Votes table (for threads and comments)
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE,
  comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  is_upvote BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT thread_or_comment CHECK (
    (thread_id IS NULL AND comment_id IS NOT NULL) OR
    (thread_id IS NOT NULL AND comment_id IS NULL)
  ),
  CONSTRAINT unique_thread_vote UNIQUE (user_id, thread_id),
  CONSTRAINT unique_comment_vote UNIQUE (user_id, comment_id)
);

-- Insert sample data for boards
INSERT INTO boards (name, description) VALUES
('Black Holes', 'Discussion about black holes, their formation, and properties'),
('Space Exploration', 'Topics related to space missions, satellites, and exploration'),
('Astronomy', 'General astronomy discussions, observations, and equipment'),
('Astrophysics', 'Theoretical discussions about the physics of space and celestial bodies'),
('Cosmology', 'Discussions about the origin and evolution of the universe')
ON CONFLICT DO NOTHING;
