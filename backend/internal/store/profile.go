package store

import (
	"context"
	"database/sql"
	"log"

	"github.com/lib/pq"
)

type Profile struct {
	FirstName       string         `json:"first_name"`
	LastName        string         `json:"last_name"`
	Email           string         `json:"email"`
	Age             int            `json:"age"`
	Gender          string         `json:"gender"`
	SportPreference pq.StringArray `json:"sport_preference"`
	CreatedAt       string         `json:"created_at"`
	UpdatedAt       string         `json:"updated_at"`
}

type ProfileStore struct {
	db *sql.DB
}

func (s *ProfileStore) Create(ctx context.Context, profile *Profile) error {
	log.Println("Creating profile")
	query := `
		INSERT INTO profile (email, first_name, last_name, age, gender, sport_preference) VALUES 
    ($1, $2, $3, $4, $5, $6)
    RETURNING created_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRowContext(
		ctx,
		query,
		profile.Email,
		profile.FirstName,
		profile.LastName,
		profile.Age,
		profile.Gender,
		pq.Array(profile.SportPreference),
	).Scan(
		&profile.CreatedAt,
	)

	if err != nil {
		switch {
		case err.Error() == `pq: duplicate key value violates unique constraint "email"`:
			return ErrDuplicateEmail
		default:
			log.Println(err.Error())
			return err
		}
	}

	log.Println("Successfully added user profile")

	return nil
}

func (s *ProfileStore) GetByEmail(ctx context.Context, email string) (*Profile, error) {
	query := `
		SELECT email, first_name, last_name, age, gender, sport_preference FROM profile
		WHERE email = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	profile := &Profile{}
	err := s.db.QueryRowContext(ctx, query, email).Scan(
		&profile.Email,
		&profile.FirstName,
		&profile.LastName,
		&profile.Age,
		&profile.Gender,
		&profile.SportPreference,
	)
	if err != nil {
		switch err {
		case sql.ErrNoRows:
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return profile, nil
}

func (s *ProfileStore) Update(ctx context.Context, profile *Profile) error {
	log.Println("Updating profile")
	query := `
		UPDATE profile
		SET 
			first_name = COALESCE($2, first_name),
			last_name = COALESCE($3, last_name),
			age = COALESCE($4, age),
			gender = COALESCE($5, gender),
			sport_preference = COALESCE($6, sport_preference),
			updated_at = NOW()
		WHERE email = $1
		RETURNING updated_at;
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRowContext(
		ctx,
		query,
		profile.Email,
		profile.FirstName,
		profile.LastName,
		profile.Age,
		profile.Gender,
		pq.Array(profile.SportPreference),
	).Scan(
		&profile.CreatedAt,
	)

	if err != nil {
		switch {
		case err.Error() == `pq: key value for constraint "email" does not exist`:
			return ErrEmailDoesNotExist
		default:
			log.Println(err.Error())
			return err
		}
	}

	log.Println("Successfully updated user profile")

	return nil
}
