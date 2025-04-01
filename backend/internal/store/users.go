package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrDuplicateEmail    = errors.New("a user with that email already exists")
	ErrDuplicateUsername = errors.New("a user with that username already exists")
	ErrEmailDoesNotExist = errors.New("a user with that email does not exist")
)

type User struct {
	ID        int64    `json:"id"`
	Email     string   `json:"email"`
	Password  password `json:"-"` //makes sure we don't send password in responses
	CreatedAt string   `json:"created_at"`
	UpdatedAt string   `json:"updated_at"`
	GoogleID  string   `json:"google_id"`
	Name      string   `json:"name"`
}

type password struct {
	text *string
	hash []byte
}

func (p *password) Set(text string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(text), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	p.text = &text
	p.hash = hash

	return nil
}

func (p *password) Compare(text string) error {
	return bcrypt.CompareHashAndPassword(p.hash, []byte(text))
}

func (p *password) HasPassword() bool {
	return len(p.hash) > 0
}

type UserStore struct {
	db *sql.DB
}

func (s *UserStore) Create(ctx context.Context, user *User) error {
	query := `
		INSERT INTO users (email, password) VALUES 
    ($1, $2)
    RETURNING id, created_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRowContext(
		ctx,
		query,
		user.Email,
		user.Password.hash,
	).Scan(
		&user.ID,
		&user.CreatedAt,
	)
	if err != nil {
		switch {
		case err.Error() == `pq: duplicate key value violates unique constraint "users_email_key"`:
			return ErrDuplicateEmail
		default:
			return errors.New(err.Error())
		}
	}
	return nil
}

func (s *UserStore) GetByID(ctx context.Context, userID int64) (*User, error) {
	query := `
		SELECT users.id, email, password, created_at
		FROM users
		WHERE users.id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	user := &User{}
	err := s.db.QueryRowContext(
		ctx,
		query,
		userID,
	).Scan(
		&user.ID,
		&user.Email,
		&user.Password.hash,
		&user.CreatedAt,
	)
	if err != nil {
		switch err {
		case sql.ErrNoRows:
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return user, nil
}

func (s *UserStore) GetByEmail(ctx context.Context, email string) (*User, error) {
	query := `
		SELECT id, email, password, created_at, google_id FROM users
		WHERE email = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	user := &User{}
	err := s.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Password.hash,
		&user.CreatedAt,
		&user.GoogleID,
	)
	if err != nil {
		switch err {
		case sql.ErrNoRows:
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return user, nil
}

// CreateOrUpdateGoogleUser creates a new user from Google OAuth info or updates an existing one
func (s *UserStore) CreateOrUpdateGoogleUser(ctx context.Context, googleID, email, name string) (*User, bool, error) {
	var user *User
	var err error

	// Check if user exists by Google ID
	user, err = s.GetByGoogleID(ctx, googleID)
	if err == nil {
		return user, false, nil
	}

	// If user doesn't exist, check if email exists
	user, err = s.GetByEmail(ctx, email)
	if err == nil {
		// Update existing user with Google ID
		query := `
			UPDATE users 
			SET google_id = $1, updated_at = NOW()
			WHERE id = $2
			RETURNING id, email, name, google_id, created_at, updated_at`

		err = s.db.QueryRowContext(ctx, query, googleID, user.ID).Scan(
			&user.ID, &user.Email, &user.Name, &user.GoogleID, &user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			return nil, false, fmt.Errorf("failed to update user with Google ID: %v", err)
		}
		return user, false, nil
	}

	// Create new user
	query := `
		INSERT INTO users (email, name, google_id)
		VALUES ($1, $2, $3)
		RETURNING id, email, name, google_id, created_at, updated_at`

	user = &User{}
	err = s.db.QueryRowContext(ctx, query, email, name, googleID).Scan(
		&user.ID, &user.Email, &user.Name, &user.GoogleID, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, false, fmt.Errorf("failed to create user: %v", err)
	}

	return user, true, nil
}

// GetByGoogleID retrieves a user by their Google ID
func (s *UserStore) GetByGoogleID(ctx context.Context, googleID string) (*User, error) {
	query := `
		SELECT id, email, name, google_id, created_at, updated_at
		FROM users
		WHERE google_id = $1`

	var user User
	err := s.db.QueryRowContext(ctx, query, googleID).Scan(
		&user.ID, &user.Email, &user.Name, &user.GoogleID, &user.CreatedAt, &user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user by Google ID: %v", err)
	}

	return &user, nil
}
