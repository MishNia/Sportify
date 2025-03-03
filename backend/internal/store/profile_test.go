package store

import (
	"context"
	"database/sql"
	"log"
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

func TestProfileStore_GetByEmail(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	store := &ProfileStore{db: db}
	email := "john.doe@example.com"

	query := `SELECT email, first_name, last_name, age, gender, sport_preference FROM profile WHERE email = \$1`
	rows := sqlmock.NewRows([]string{"email", "first_name", "last_name", "age", "gender", "sport_preference"}).
		AddRow(email, "John", "Doe", 30, "Male", pq.StringArray{"Basketball", "Tennis"})
	mock.ExpectQuery(query).WithArgs(email).WillReturnRows(rows)

	profile, err := store.GetByEmail(context.Background(), email)
	assert.NoError(t, err)
	assert.NotNil(t, profile)
	assert.Equal(t, "John", profile.FirstName)
	assert.Equal(t, "Doe", profile.LastName)
	assert.Equal(t, email, profile.Email)
}

func TestProfileStore_Update(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	store := &ProfileStore{db: db}
	profile := &Profile{
		FirstName:       "John",
		LastName:        "Doe",
		Email:           "john.doe@example.com",
		Age:             31,
		Gender:          "Male",
		SportPreference: pq.StringArray{"Basketball", "Tennis"},
	}

	query := `(?i)UPDATE profile SET first_name = COALESCE\(\$2, first_name\), 
                                   last_name = COALESCE\(\$3, last_name\), 
                                   age = COALESCE\(\$4, age\), 
                                   gender = COALESCE\(\$5, gender\), 
                                   sport_preference = COALESCE\(\$6, sport_preference\), 
                                   updated_at = NOW\(\) 
                   WHERE email = \$1 
                   RETURNING updated_at;
	`

	mock.ExpectQuery(query).
		WithArgs(profile.Email, profile.FirstName, profile.LastName, profile.Age, profile.Gender, profile.SportPreference).
		WillReturnRows(sqlmock.NewRows([]string{"updated_at"}).AddRow("2025-03-02"))

	err := store.Update(context.Background(), profile)
	log.Println("Updated At Value:", profile.UpdatedAt) // Debug line

	assert.NoError(t, err)
	assert.Equal(t, "2025-03-02", profile.UpdatedAt)
}
