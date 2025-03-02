package store

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

// Test NewStorage function
func TestNewStorage(t *testing.T) {
	db, _ := setupMockDB(t)
	defer db.Close()

	storage := NewStorage(db)

	assert.NotNil(t, storage.Users, "Users storage should be initialized")
	assert.NotNil(t, storage.Profile, "Profile storage should be initialized")
}

// Test withTx for successful transaction
func TestWithTx_Success(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	mock.ExpectBegin()
	mock.ExpectCommit()

	err := withTx(db, context.Background(), func(tx *sql.Tx) error {
		// Simulate transaction operations (No error means success)
		return nil
	})

	assert.NoError(t, err, "Transaction should commit successfully")
	assert.NoError(t, mock.ExpectationsWereMet(), "Expected queries were not met")
}

// Test withTx when rollback happens due to function error
func TestWithTx_Rollback(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	mock.ExpectBegin()
	mock.ExpectRollback()

	expectedErr := errors.New("transaction failed")

	err := withTx(db, context.Background(), func(tx *sql.Tx) error {
		return expectedErr
	})

	assert.Equal(t, expectedErr, err, "Transaction should return an expected error")
	assert.NoError(t, mock.ExpectationsWereMet(), "Expected queries were not met")
}

// Test withTx when transaction start fails
func TestWithTx_BeginTxFailure(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	mock.ExpectBegin().WillReturnError(errors.New("failed to start transaction"))

	err := withTx(db, context.Background(), func(tx *sql.Tx) error {
		return nil
	})

	assert.Error(t, err, "Transaction should fail to start")
	assert.Equal(t, "failed to start transaction", err.Error())
	assert.NoError(t, mock.ExpectationsWereMet(), "Expected queries were not met")
}
