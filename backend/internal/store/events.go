package store

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

var (
	ErrEventNotFound = errors.New("event not found")
	ErrAlreadyJoined = errors.New("user has already joined this event")
)

type EventParticipant struct {
	ID        int64     `json:"id"`
	EventID   int64     `json:"event_id"`
	UserID    int64     `json:"user_id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	JoinedAt  time.Time `json:"joined_at"`
}

type Event struct {
	ID              int64              `json:"id"`
	EventOwner      int64              `json:"event_owner"`
	Sport           string             `json:"sport"`
	EventDateTime   time.Time          `json:"event_datetime"`
	MaxPlayers      int                `json:"max_players"`
	LocationName    string             `json:"location_name"`
	Latitude        float64            `json:"latitude"`
	Longitude       float64            `json:"longitude"`
	Description     string             `json:"description"`
	Title           string             `json:"title"`
	IsFull          bool               `json:"is_full"`
	CreatedAt       time.Time          `json:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at"`
	RegisteredCount int                `json:"registered_count"`
	Participants    []EventParticipant `json:"participants"`
}

type EventStore struct {
	db *sql.DB
}

func NewEventStore(db *sql.DB) *EventStore {
	return &EventStore{db: db}
}

func (s *EventStore) Create(ctx context.Context, event *Event) error {
	query := `
		INSERT INTO events (
			event_owner, sport, event_datetime, max_players, 
			location_name, latitude, longitude, description, 
			title, is_full, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at, updated_at`

	args := []interface{}{
		event.EventOwner,
		event.Sport,
		event.EventDateTime,
		event.MaxPlayers,
		event.LocationName,
		event.Latitude,
		event.Longitude,
		event.Description,
		event.Title,
		false, // is_full starts as false
		time.Now(),
		time.Now(),
	}

	return s.db.QueryRowContext(ctx, query, args...).Scan(
		&event.ID,
		&event.CreatedAt,
		&event.UpdatedAt,
	)
}

func (s *EventStore) GetByID(ctx context.Context, id int64) (*Event, error) {
	query := `
		SELECT id, event_owner, sport, event_datetime, max_players,
		       location_name, latitude, longitude, description, title,
		       is_full, created_at, updated_at
		FROM events
		WHERE id = $1`

	event := &Event{}
	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&event.ID,
		&event.EventOwner,
		&event.Sport,
		&event.EventDateTime,
		&event.MaxPlayers,
		&event.LocationName,
		&event.Latitude,
		&event.Longitude,
		&event.Description,
		&event.Title,
		&event.IsFull,
		&event.CreatedAt,
		&event.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, ErrEventNotFound
	}
	if err != nil {
		return nil, err
	}

	countQuery := `SELECT COUNT(*) FROM event_participants WHERE event_id = $1`
	err = s.db.QueryRowContext(ctx, countQuery, id).Scan(&event.RegisteredCount)
	if err != nil {
		return nil, err
	}

	participantsQuery := `
		SELECT ep.id, ep.event_id, ep.user_id, p.first_name, p.last_name, ep.joined_at
		FROM event_participants ep
		JOIN users u ON ep.user_id = u.id
		JOIN profile p ON u.email = p.email
		WHERE ep.event_id = $1
		ORDER BY ep.joined_at ASC`

	rows, err := s.db.QueryContext(ctx, participantsQuery, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var p EventParticipant
		err := rows.Scan(&p.ID, &p.EventID, &p.UserID, &p.FirstName, &p.LastName, &p.JoinedAt)
		if err != nil {
			return nil, err
		}
		event.Participants = append(event.Participants, p)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return event, nil
}

func (s *EventStore) Join(ctx context.Context, eventID, userID int64) error {
	// Check if user has already joined
	query := `SELECT EXISTS(SELECT 1 FROM event_participants WHERE event_id = $1 AND user_id = $2)`
	var exists bool
	if err := s.db.QueryRowContext(ctx, query, eventID, userID).Scan(&exists); err != nil {
		return err
	}
	if exists {
		return ErrAlreadyJoined
	}

	// Start transaction
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert participant
	_, err = tx.ExecContext(ctx, `INSERT INTO event_participants (event_id, user_id) VALUES ($1, $2)`, eventID, userID)
	if err != nil {
		return err
	}

	// Update is_full status if needed
	_, err = tx.ExecContext(ctx, `
		UPDATE events 
		SET is_full = (
			SELECT COUNT(*) >= max_players 
			FROM event_participants 
			WHERE event_id = $1
		)
		WHERE id = $1`, eventID)
	if err != nil {
		return err
	}

	return tx.Commit()
}
