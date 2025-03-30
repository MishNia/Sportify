package main

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/MishNia/Sportify.git/internal/auth"
	"github.com/MishNia/Sportify.git/internal/store"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.uber.org/zap"
)

type mockUserStore struct {
	mock.Mock
}

func (m *mockUserStore) Create(ctx context.Context, user *store.User) error {
	// Mock user creation success
	user.ID = 1
	user.CreatedAt = time.Now().Format(time.RFC3339)
	return nil
}

func (m *mockUserStore) GetByEmail(ctx context.Context, email string) (*store.User, error) {
	// Mock user not found
	return nil, store.ErrNotFound
}

func (m *mockUserStore) GetByID(ctx context.Context, userID int64) (*store.User, error) {
	// Mock getting a user by ID
	return &store.User{
		ID:        userID,
		Email:     "test@example.com",
		CreatedAt: time.Now().Format(time.RFC3339),
	}, nil
}

type mockProfileStore struct {
	mock.Mock
}

func (m *mockProfileStore) GetByEmail(ctx context.Context, email string) (*store.Profile, error) {
	// Mock profile retrieval
	return &store.Profile{
		FirstName: "Test",
		LastName:  "User",
		Email:     email,
		Age:       25,
		Gender:    "Other",
	}, nil
}

func (m *mockProfileStore) Create(ctx context.Context, profile *store.Profile) error {
	// Mock profile creation success
	profile.CreatedAt = time.Now().Format(time.RFC3339)
	return nil
}

func (m *mockProfileStore) Update(ctx context.Context, profile *store.Profile) error {
	// Mock profile update success
	profile.UpdatedAt = time.Now().Format(time.RFC3339)
	return nil
}

type mockEventStore struct {
	mock.Mock
}

func (m *mockEventStore) Create(ctx context.Context, event *store.Event) error {
	// Mock event creation success
	event.ID = 1
	event.CreatedAt = time.Now()
	event.UpdatedAt = time.Now()
	// Don't modify other fields, keep the input values
	return nil
}

func (m *mockEventStore) GetByID(ctx context.Context, id int64) (*store.Event, error) {
	// Mock getting an event by ID
	event := &store.Event{
		ID:            id,
		EventOwner:    1,
		Sport:         "Football",
		EventDateTime: time.Now().Add(24 * time.Hour),
		MaxPlayers:    10,
		LocationName:  "Central Park",
		Latitude:      40.7829,
		Longitude:     -73.9654,
		Description:   "Test event",
		Title:         "Test Event",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
		IsFull:        false,
	}
	return event, nil
}

func (m *mockEventStore) Update(ctx context.Context, event *store.Event) error {
	// Mock event update success
	event.UpdatedAt = time.Now()
	return nil
}

func (m *mockEventStore) Delete(ctx context.Context, id int64) error {
	// Mock event deletion success
	return nil
}

func (m *mockEventStore) Join(ctx context.Context, eventID, userID int64) error {
	// Mock joining an event
	return nil
}

func (m *mockEventStore) Leave(ctx context.Context, eventID, userID int64) error {
	// Mock leaving an event
	return nil
}

// Mock Dependencies
func newTestApplication() *application {
	logger, _ := zap.NewProduction()
	defer logger.Sync()
	sugar := logger.Sugar()

	mockStore := store.Storage{
		Users:   &mockUserStore{},    // Mock user store
		Profile: &mockProfileStore{}, // Mock profile store
		Events:  &mockEventStore{},   // Mock events store
	}

	return &application{
		config: config{
			addr: ":8080",
			db: dbConfig{
				addr:         "mock_db",
				maxOpenConns: 10,
				maxIdleConns: 5,
				maxIdleTime:  "10m",
			},
			auth: authConfig{
				token: tokenConfig{
					secret: "test_secret",
					exp:    time.Hour,
					iss:    "test_issuer",
				},
			},
			apiURL: "http://localhost:8080",
		},
		store:         mockStore,
		logger:        sugar,
		authenticator: auth.NewJWTAuthenticator("test_secret", "test_audience", "test_issuer"),
	}
}

// **Test /health Route**
func TestHealthCheckHandler(t *testing.T) {
	app := newTestApplication()
	router := app.mount()

	req, _ := http.NewRequest("GET", "/v1/health", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code, "Health check should return 200 OK")
}

// **Test /auth/signup Route**
func TestRegisterUserHandler(t *testing.T) {
	app := newTestApplication()
	router := app.mount()

	requestBody := `{"email": "test@example.com", "password": "securepassword"}`
	req, _ := http.NewRequest("POST", "/v1/auth/signup", strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json") // Ensure correct content type

	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusCreated, rec.Code, "Signup should return 201 OK")
}

// **Test Application Run Method**
func TestRunMethod(t *testing.T) {
	app := newTestApplication()
	router := app.mount()

	server := httptest.NewServer(router)
	defer server.Close()

	resp, err := http.Get(server.URL + "/v1/health")
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "Server should respond with 200")
}
