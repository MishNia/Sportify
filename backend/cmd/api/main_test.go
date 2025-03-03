package main

import (
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/MishNia/Sportify.git/internal/auth"
	"github.com/MishNia/Sportify.git/internal/db"
	"github.com/MishNia/Sportify.git/internal/env"
	"github.com/MishNia/Sportify.git/internal/store"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.uber.org/zap"
)

// **Mock DB Layer**
type mockDB struct {
	mock.Mock
}

func (m *mockDB) Close() error {
	return nil
}

// **Test Configuration Loading**
func TestConfigLoading(t *testing.T) {
	// Mock environment variables
	envVars := map[string]string{
		"ADDR":              ":8080",
		"EXTERNAL_URL":      "localhost:8080",
		"DB_ADDR":           "postgres://admin:adminpassword@localhost/testdb?sslmode=disable",
		"DB_MAX_OPEN_CONNS": "30",
		"DB_MAX_IDLE_CONNS": "30",
		"DB_MAX_IDLE_TIME":  "15m",
		"AUTH_TOKEN_SECRET": "example",
	}

	// Set environment variables for testing
	for key, value := range envVars {
		t.Setenv(key, value)
	}

	cfg := config{
		addr:   env.GetString("ADDR", ":8080"),
		apiURL: env.GetString("EXTERNAL_URL", "localhost:8080"),
		db: dbConfig{
			addr:         env.GetString("DB_ADDR", ""),
			maxOpenConns: env.GetInt("DB_MAX_OPEN_CONNS", 0),
			maxIdleConns: env.GetInt("DB_MAX_IDLE_CONNS", 0),
			maxIdleTime:  env.GetString("DB_MAX_IDLE_TIME", ""),
		},
		auth: authConfig{
			token: tokenConfig{
				secret: env.GetString("AUTH_TOKEN_SECRET", ""),
				exp:    time.Hour * 24 * 3,
				iss:    "sportify",
			},
		},
	}

	assert.Equal(t, ":8080", cfg.addr)
	assert.Equal(t, "localhost:8080", cfg.apiURL)
	assert.Equal(t, "postgres://admin:adminpassword@localhost/testdb?sslmode=disable", cfg.db.addr)
	assert.Equal(t, 30, cfg.db.maxOpenConns)
	assert.Equal(t, 30, cfg.db.maxIdleConns)
	assert.Equal(t, "15m", cfg.db.maxIdleTime)
	assert.Equal(t, "example", cfg.auth.token.secret)
}

// **Test Database Initialization with sqlmock**
func TestDatabaseInitialization(t *testing.T) {
	// Create a mock DB
	db, mock, err := sqlmock.New()
	assert.NoError(t, err, "sqlmock.New() should not return an error")
	defer db.Close()

	// Expect no specific queries (we are only testing db connection)
	mock.ExpectClose()

	assert.NotNil(t, db, "Database should be initialized")
}

// **Test Database Initialization with Error Handling**
func TestDatabaseInitialization_Fail(t *testing.T) {
	_, err := db.New("", 10, 5, "10m") // Simulate a failure

	assert.Error(t, err, "Expected error due to empty database address")
}

// **Test Logger Initialization**
func TestLoggerInitialization(t *testing.T) {
	logger := zap.Must(zap.NewProduction()).Sugar()
	defer logger.Sync()

	assert.NotNil(t, logger, "Logger should be initialized")
}

// **Test Storage Initialization (Using sqlmock)**
func TestStorageInitialization(t *testing.T) {
	// Create a mock DB
	db, _, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	// Initialize the storage with mock DB
	store := store.NewStorage(db)

	assert.NotNil(t, store, "Storage should be initialized")
}

// **Test JWT Authenticator Initialization**
func TestAuthenticatorInitialization(t *testing.T) {
	authenticator := auth.NewJWTAuthenticator("test_secret", "sportify", "sportify")

	assert.NotNil(t, authenticator, "Authenticator should be initialized")
}

// **Test Application Initialization (Using sqlmock)**
func TestApplicationInitialization(t *testing.T) {
	// Create a mock DB
	db, _, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	cfg := config{
		addr:   ":8080",
		apiURL: "localhost:8080",
		db: dbConfig{
			addr:         "postgres://admin:adminpassword@localhost/testdb?sslmode=disable",
			maxOpenConns: 30,
			maxIdleConns: 30,
			maxIdleTime:  "15m",
		},
		auth: authConfig{
			token: tokenConfig{
				secret: "example",
				exp:    time.Hour * 24 * 3,
				iss:    "sportify",
			},
		},
	}

	logger := zap.Must(zap.NewProduction()).Sugar()
	defer logger.Sync()

	// Initialize store with mock DB
	store := store.NewStorage(db)

	// Initialize mock JWT authenticator
	jwtAuthenticator := auth.NewJWTAuthenticator(cfg.auth.token.secret, cfg.auth.token.iss, cfg.auth.token.iss)

	app := &application{
		config:        cfg,
		store:         store,
		logger:        logger,
		authenticator: jwtAuthenticator,
	}

	assert.NotNil(t, app, "Application should be initialized")
}
