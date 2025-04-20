package store

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
)

// Test Create User
func TestUserStore_Create(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	store := &UserStore{db: db}

	user := &User{
		Email: "test@example.com",
	}

	// Set user password
	err := user.Password.Set("securepassword")
	assert.NoError(t, err)

	// Mock DB response
	query := `INSERT INTO users \(email, password\) VALUES \(\$1, \$2\) RETURNING id, created_at`
	mock.ExpectQuery(query).
		WithArgs(user.Email, user.Password.hash).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at"}).
			AddRow(1, "2025-03-01"))

	err = store.Create(context.Background(), user)
	assert.NoError(t, err)
	assert.Equal(t, int64(1), user.ID)
	assert.Equal(t, "2025-03-01", user.CreatedAt)

	assert.NoError(t, mock.ExpectationsWereMet())
}

// Test Create User with Duplicate Email
func TestUserStore_Create_DuplicateEmail(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	store := &UserStore{db: db}
	user := &User{
		Email: "test@example.com",
	}

	// Set user password
	err := user.Password.Set("securepassword")
	assert.NoError(t, err)

	mock.ExpectQuery(`INSERT INTO users \(email, password\) VALUES \(\$1, \$2\) RETURNING id, created_at`).
		WithArgs(user.Email, user.Password.hash).
		WillReturnError(errors.New(`pq: duplicate key value violates unique constraint "users_email_key"`))

	err = store.Create(context.Background(), user)
	assert.ErrorIs(t, err, ErrDuplicateEmail)
}

// Test Get User by ID
func TestUserStore_GetByID(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	store := &UserStore{db: db}
	userID := int64(1)

	query := `SELECT users.id, email, password, created_at FROM users WHERE users.id = \$1`
	mock.ExpectQuery(query).
		WithArgs(userID).
		WillReturnRows(sqlmock.NewRows([]string{"id", "email", "password", "created_at"}).
			AddRow(1, "test@example.com", []byte("hashedpassword"), "2025-03-01"))

	user, err := store.GetByID(context.Background(), userID)
	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, int64(1), user.ID)
	assert.Equal(t, "test@example.com", user.Email)
	assert.Equal(t, "2025-03-01", user.CreatedAt)

	assert.NoError(t, mock.ExpectationsWereMet())
}

// Test Get User by ID - Not Found
func TestUserStore_GetByID_NotFound(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	store := &UserStore{db: db}
	userID := int64(99)

	mock.ExpectQuery(`SELECT users.id, email, password, created_at FROM users WHERE users.id = \$1`).
		WithArgs(userID).
		WillReturnError(sql.ErrNoRows)

	user, err := store.GetByID(context.Background(), userID)
	assert.Nil(t, user)
	assert.ErrorIs(t, err, ErrNotFound)
}

// Test Get User by Email
func TestUserStore_GetByEmail(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	store := &UserStore{db: db}
	email := "test@example.com"

	query := `SELECT id, email, password, created_at, COALESCE\(google_id, ''\) FROM users WHERE email = \$1`
	mock.ExpectQuery(query).
		WithArgs(email).
		WillReturnRows(sqlmock.NewRows([]string{"id", "email", "password", "created_at", "google_id"}).
			AddRow(1, email, []byte("hashedpassword"), "2025-03-01", ""))

	user, err := store.GetByEmail(context.Background(), email)
	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, int64(1), user.ID)
	assert.Equal(t, email, user.Email)
	assert.Equal(t, "2025-03-01", user.CreatedAt)
	assert.Equal(t, "", user.GoogleID)

	assert.NoError(t, mock.ExpectationsWereMet())
}

// Test Get User by Email - Not Found
func TestUserStore_GetByEmail_NotFound(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	store := &UserStore{db: db}
	email := "notfound@example.com"

	mock.ExpectQuery(`SELECT id, email, password, created_at, COALESCE\(google_id, ''\) FROM users WHERE email = \$1`).
		WithArgs(email).
		WillReturnError(sql.ErrNoRows)

	user, err := store.GetByEmail(context.Background(), email)
	assert.Nil(t, user)
	assert.ErrorIs(t, err, ErrNotFound)
}
