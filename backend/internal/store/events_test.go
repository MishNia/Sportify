package store

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupTestDB(t *testing.T) *sql.DB {
	// Use the same database configuration as the main application
	db, err := sql.Open("postgres", "postgres://admin:adminpassword@localhost/testdb?sslmode=disable")
	require.NoError(t, err)
	require.NoError(t, db.Ping())

	// Clean up tables before each test
	_, err = db.Exec(`
		TRUNCATE TABLE event_participants CASCADE;
		TRUNCATE TABLE events CASCADE;
		TRUNCATE TABLE profile CASCADE;
		TRUNCATE TABLE users CASCADE;
	`)
	require.NoError(t, err)

	return db
}

func TestEventStore_Create(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	store := NewEventStore(db)
	ctx := context.Background()

	// Create a test user first
	_, err := db.ExecContext(ctx, `
		INSERT INTO users (id, email, password) VALUES (1, 'test@example.com', 'testpassword');
		INSERT INTO profile (email, first_name, last_name, age, gender, sport_preference) VALUES ('test@example.com', 'Test', 'User', 25, 'Male', ARRAY['Football']);
	`)
	require.NoError(t, err)

	tests := []struct {
		name    string
		event   *Event
		wantErr bool
	}{
		{
			name: "valid event",
			event: &Event{
				EventOwner:    1,
				Sport:         "Football",
				EventDateTime: time.Now().Add(24 * time.Hour),
				MaxPlayers:    10,
				LocationName:  "Central Park",
				Latitude:      40.7829,
				Longitude:     -73.9654,
				Description:   "Test event",
				Title:         "Test Event",
			},
			wantErr: false,
		},
		{
			name: "missing required fields",
			event: &Event{
				EventOwner: 1,
				Sport:      "Football",
				// Missing EventDateTime, MaxPlayers, LocationName, etc.
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := store.Create(ctx, tt.event)
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.NotZero(t, tt.event.ID)
			assert.NotZero(t, tt.event.CreatedAt)
			assert.NotZero(t, tt.event.UpdatedAt)
			assert.False(t, tt.event.IsFull)
		})
	}
}

func TestEventStore_GetByID(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	store := NewEventStore(db)
	ctx := context.Background()

	// Create a test user first
	_, err := db.ExecContext(ctx, `
		INSERT INTO users (id, email, password) VALUES (1, 'test@example.com', 'testpassword');
		INSERT INTO profile (email, first_name, last_name, age, gender, sport_preference) VALUES ('test@example.com', 'Test', 'User', 25, 'Male', ARRAY['Football']);
	`)
	require.NoError(t, err)

	// Create a test event
	event := &Event{
		EventOwner:    1,
		Sport:         "Football",
		EventDateTime: time.Now().Add(24 * time.Hour),
		MaxPlayers:    10,
		LocationName:  "Central Park",
		Latitude:      40.7829,
		Longitude:     -73.9654,
		Description:   "Test event",
		Title:         "Test Event",
	}

	err = store.Create(ctx, event)
	require.NoError(t, err)

	tests := []struct {
		name    string
		id      int64
		wantErr bool
	}{
		{
			name:    "existing event",
			id:      event.ID,
			wantErr: false,
		},
		{
			name:    "non-existent event",
			id:      999,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := store.GetByID(ctx, tt.id)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Equal(t, ErrEventNotFound, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, event.ID, got.ID)
			assert.Equal(t, event.Sport, got.Sport)
			assert.Equal(t, event.MaxPlayers, got.MaxPlayers)
			assert.Equal(t, event.LocationName, got.LocationName)
			assert.Equal(t, 0, got.RegisteredCount)
			assert.Empty(t, got.Participants)
		})
	}
}

func TestEventStore_Delete(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	store := NewEventStore(db)
	ctx := context.Background()

	// Create a test user first
	_, err := db.ExecContext(ctx, `
		INSERT INTO users (id, email, password) VALUES (1, 'test@example.com', 'testpassword');
		INSERT INTO profile (email, first_name, last_name, age, gender, sport_preference) VALUES ('test@example.com', 'Test', 'User', 25, 'Male', ARRAY['Football']);
	`)
	require.NoError(t, err)

	// Create a test event
	event := &Event{
		EventOwner:    1,
		Sport:         "Football",
		EventDateTime: time.Now().Add(24 * time.Hour),
		MaxPlayers:    10,
		LocationName:  "Central Park",
		Latitude:      40.7829,
		Longitude:     -73.9654,
		Description:   "Test event",
		Title:         "Test Event",
	}

	err = store.Create(ctx, event)
	require.NoError(t, err)

	tests := []struct {
		name    string
		id      int64
		wantErr bool
	}{
		{
			name:    "existing event",
			id:      event.ID,
			wantErr: false,
		},
		{
			name:    "non-existent event",
			id:      999,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := store.Delete(ctx, tt.id)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Equal(t, ErrEventNotFound, err)
				return
			}
			assert.NoError(t, err)

			// Verify the event is deleted
			_, err = store.GetByID(ctx, tt.id)
			assert.Error(t, err)
			assert.Equal(t, ErrEventNotFound, err)
		})
	}
}

func TestEventStore_Join(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	store := NewEventStore(db)
	ctx := context.Background()

	// Create both users (event owner and participant)
	_, err := db.ExecContext(ctx, `
		INSERT INTO users (id, email, password) VALUES 
			(1, 'owner@example.com', 'testpassword'),
			(2, 'test@example.com', 'testpassword');
		INSERT INTO profile (email, first_name, last_name, age, gender, sport_preference) VALUES 
			('owner@example.com', 'Owner', 'User', 30, 'Male', ARRAY['Football']),
			('test@example.com', 'Test', 'User', 25, 'Male', ARRAY['Football']);
	`)
	require.NoError(t, err)

	// Create a test event
	event := &Event{
		EventOwner:    1,
		Sport:         "Football",
		EventDateTime: time.Now().Add(24 * time.Hour),
		MaxPlayers:    10,
		LocationName:  "Central Park",
		Latitude:      40.7829,
		Longitude:     -73.9654,
		Description:   "Test event",
		Title:         "Test Event",
	}

	err = store.Create(ctx, event)
	require.NoError(t, err)

	tests := []struct {
		name    string
		eventID int64
		userID  int64
		wantErr bool
	}{
		{
			name:    "valid join",
			eventID: event.ID,
			userID:  2,
			wantErr: false,
		},
		{
			name:    "already joined",
			eventID: event.ID,
			userID:  2, // Same user as above
			wantErr: true,
		},
		{
			name:    "non-existent event",
			eventID: 999,
			userID:  2,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := store.Join(ctx, tt.eventID, tt.userID)
			if tt.wantErr {
				assert.Error(t, err)
				if tt.name == "already joined" {
					assert.Equal(t, ErrAlreadyJoined, err)
				}
				return
			}
			assert.NoError(t, err)

			// Verify the join
			got, err := store.GetByID(ctx, tt.eventID)
			assert.NoError(t, err)
			assert.Equal(t, 1, got.RegisteredCount)
			assert.Len(t, got.Participants, 1)
			assert.Equal(t, tt.userID, got.Participants[0].UserID)
		})
	}
}
