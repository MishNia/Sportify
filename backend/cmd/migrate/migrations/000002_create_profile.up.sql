CREATE TABLE IF NOT EXISTS Profile (
  id bigserial PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email citext UNIQUE NOT NULL REFERENCES Users(email) ON DELETE CASCADE,
  age INT CHECK (age >= 0),
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  sport_preference TEXT[] NOT NULL,
  created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW()
);