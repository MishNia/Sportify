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
	ErrNotJoined     = errors.New("user is not a participant of this event")
	ErrForbidden     = errors.New("user is not the event owner")
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

func (s *EventStore) Update(ctx context.Context, event *Event) error {
	query := `
		UPDATE events
		SET
			sport = $1,
			event_datetime = $2,
			max_players = $3,
			location_name = $4,
			latitude = $5,
			longitude = $6,
			description = $7,
			title = $8,
			is_full = $9,
			updated_at = $10
		WHERE id = $11
		RETURNING updated_at`

	// update event fields
	if len(event.Participants) >= event.MaxPlayers {
		event.IsFull = true
	} else {
		event.IsFull = false
	}
	args := []interface{}{
		event.Sport,
		event.EventDateTime,
		event.MaxPlayers,
		event.LocationName,
		event.Latitude,
		event.Longitude,
		event.Description,
		event.Title,
		event.IsFull,
		event.UpdatedAt,
		event.ID,
	}

	err := s.db.QueryRowContext(ctx, query, args...).Scan(&event.UpdatedAt)
	if err == sql.ErrNoRows {
		return ErrEventNotFound
	}
	if err != nil {
		return err
	}

	return nil
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

func (s *EventStore) Delete(ctx context.Context, eventID int64) error {
	// Start transaction
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Delete participants first (due to FK constraints)
	_, err = tx.ExecContext(ctx, `DELETE FROM event_participants WHERE event_id = $1`, eventID)
	if err != nil {
		return err
	}

	// Delete event
	res, err := tx.ExecContext(ctx, `DELETE FROM events WHERE id = $1`, eventID)
	if err != nil {
		return err
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return ErrEventNotFound // Just in case event disappeared during operation
	}

	return tx.Commit()
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

func (s *EventStore) Leave(ctx context.Context, eventID, userID int64) error {
	// Start transaction
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Check if event exists
	var exists bool
	err = tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM events WHERE id = $1)`, eventID).Scan(&exists)
	if err != nil {
		return err
	}
	if !exists {
		return ErrEventNotFound
	}

	// Check if user is a participant
	err = tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM event_participants WHERE event_id = $1 AND user_id = $2)`, eventID, userID).Scan(&exists)
	if err != nil {
		return err
	}
	if !exists {
		return ErrNotJoined
	}

	// Delete participant record
	res, err := tx.ExecContext(ctx, `DELETE FROM event_participants WHERE event_id = $1 AND user_id = $2`, eventID, userID)
	if err != nil {
		return err
	}
	if affected, _ := res.RowsAffected(); affected == 0 {
		return ErrNotJoined // fallback safeguard
	}

	// Recalculate is_full
	_, err = tx.ExecContext(ctx, `
		UPDATE events
		SET is_full = (
			SELECT COUNT(*) >= max_players
			FROM event_participants
			WHERE event_id = $1
		),
		updated_at = $2
		WHERE id = $1`, eventID, time.Now())
	if err != nil {
		return err
	}

	// Commit the transaction
	return tx.Commit()
}
