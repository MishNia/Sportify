CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_owner INT REFERENCES users(id) ON DELETE CASCADE,
    sport TEXT NOT NULL,
    event_datetime TIMESTAMP NOT NULL,
    max_players INT NOT NULL CHECK (max_players > 0),
    location_name TEXT NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    description TEXT,
    title TEXT,
    is_full BOOLEAN, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);