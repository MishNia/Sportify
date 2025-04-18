ALTER TABLE users
ALTER COLUMN password DROP NOT NULL;

ALTER TABLE users
ADD CONSTRAINT users_password_or_google_id_check
CHECK (
    passworpassword IS NOT NULL OR google_id IS NOT NULL
);