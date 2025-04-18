ALTER TABLE users
ADD COLUMN google_id VARCHAR(255),
ADD COLUMN name VARCHAR(255),
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE users
ADD CONSTRAINT users_google_id_unique UNIQUE (google_id);


UPDATE users
SET updated_at = created_at
WHERE updated_at IS NULL;