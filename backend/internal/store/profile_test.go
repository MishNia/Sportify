package store

import (
	"context"
	"database/sql"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/lib/pq"
	"github.com/stretchr/testify/assert"
)

func setupMockDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to open mock sql db, %v", err)
	}
	return db, mock
}

func TestProfileStore_Create(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	store := &ProfileStore{db: db}
	profile := &Profile{
		FirstName:       "John",
		LastName:        "Doe",
		Email:           "john.doe@example.com",
		Age:             30,
		Gender:          "Male",
		SportPreference: pq.StringArray{"Basketball", "Tennis"},
	}

	query := `INSERT INTO profile \(email, first_name, last_name, age, gender, sport_preference\) VALUES \(\$1, \$2, \$3, \$4, \$5, \$6\) RETURNING created_at`
	mock.ExpectQuery(query).
		WithArgs(profile.Email, profile.FirstName, profile.LastName, profile.Age, profile.Gender, profile.SportPreference).
		WillReturnRows(sqlmock.NewRows([]string{"created_at"}).AddRow("2025-03-01"))

	err := store.Create(context.Background(), profile)
	assert.NoError(t, err)
	assert.Equal(t, "2025-03-01", profile.CreatedAt)
}
