-- Create a table to track large objects
CREATE TABLE media_objects (
  id SERIAL PRIMARY KEY,
  lo_oid OID NOT NULL,
  filename TEXT,
  media_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Modify forum_posts table to reference media_objects instead of file paths
ALTER TABLE forum_posts 
  ADD COLUMN media_object_id INTEGER REFERENCES media_objects(id),
  ADD COLUMN original_filename TEXT;

-- Keep media_url and media_type for backward compatibility during migration
-- These can be removed after migration is complete