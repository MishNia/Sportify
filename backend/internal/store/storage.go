package store

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

var (
	ErrNotFound          = errors.New("resource not found")
	ErrConflict          = errors.New("resource already exists")
	QueryTimeoutDuration = time.Second * 5
)

type Storage struct {
	Users interface {
		GetByID(context.Context, int64) (*User, error)
		GetByEmail(context.Context, string) (*User, error)
		Create(context.Context, *User) error
		CreateOrUpdateGoogleUser(ctx context.Context, googleID, email, name string) (*User, bool, error)
	}
	Profile interface {
		GetByEmail(context.Context, string) (*Profile, error)
		Create(context.Context, *Profile) error
		Update(context.Context, *Profile) error
	}
	Events interface {
		Create(context.Context, *Event) error
		GetByID(context.Context, int64) (*Event, error)
		Update(context.Context, *Event) error
		Delete(context.Context, int64) error
		Join(context.Context, int64, int64) error
		Leave(context.Context, int64, int64) error
		GetAllWithFilter(context.Context, *EventFilter) ([]*Event, error)
	}
}

func NewStorage(db *sql.DB) Storage {
	return Storage{
		Users:   &UserStore{db},
		Profile: &ProfileStore{db},
		Events:  &EventStore{db},
	}
}

func withTx(db *sql.DB, ctx context.Context, fn func(*sql.Tx) error) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	if err := fn(tx); err != nil {
		_ = tx.Rollback()
		return err
	}

	return tx.Commit()
}
