CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS Users(
  id bigserial PRIMARY KEY,
  email citext UNIQUE NOT NULL,
  password bytea NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);