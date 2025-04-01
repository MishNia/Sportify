package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/MishNia/Sportify.git/internal/store"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestGoogleCallbackHandler(t *testing.T) {
	app := newTestApplication()
	router := app.mount()

	tests := []struct {
		name           string
		code           string
		setupMock      func(*mockUserStore)
		expectedStatus int
		expectedBody   map[string]interface{}
	}{
		{
			name: "new user",
			code: "valid_code",
			setupMock: func(m *mockUserStore) {
				m.On("CreateOrUpdateGoogleUser", mock.Anything, "google123", "test@example.com", "Test User").
					Return(&store.User{
						ID:        1,
						Email:     "test@example.com",
						Name:      "Test User",
						GoogleID:  "google123",
						CreatedAt: time.Now().Format(time.RFC3339),
						UpdatedAt: time.Now().Format(time.RFC3339),
					}, true, nil)
			},
			expectedStatus: http.StatusOK,
			expectedBody: map[string]interface{}{
				"token":     mock.AnythingOfType("string"),
				"isNewUser": true,
			},
		},
		{
			name: "existing user",
			code: "valid_code",
			setupMock: func(m *mockUserStore) {
				m.On("CreateOrUpdateGoogleUser", mock.Anything, "google123", "test@example.com", "Test User").
					Return(&store.User{
						ID:        1,
						Email:     "test@example.com",
						Name:      "Test User",
						GoogleID:  "google123",
						CreatedAt: time.Now().Format(time.RFC3339),
						UpdatedAt: time.Now().Format(time.RFC3339),
					}, false, nil)
			},
			expectedStatus: http.StatusOK,
			expectedBody: map[string]interface{}{
				"token":     mock.AnythingOfType("string"),
				"isNewUser": false,
			},
		},
		{
			name:           "missing code",
			code:           "",
			setupMock:      func(m *mockUserStore) {},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Reset mock expectations
			mockStore := app.store.Users.(*mockUserStore)
			mockStore.ExpectedCalls = nil
			mockStore.Calls = nil

			// Setup mock expectations
			tt.setupMock(mockStore)

			// Create request
			req := httptest.NewRequest("GET", "/auth/google/callback?code="+tt.code, nil)
			rec := httptest.NewRecorder()

			// Call the handler
			router.ServeHTTP(rec, req)

			// Check status code
			assert.Equal(t, tt.expectedStatus, rec.Code)

			if tt.expectedStatus == http.StatusOK {
				// Parse response
				var response map[string]interface{}
				err := json.NewDecoder(rec.Body).Decode(&response)
				assert.NoError(t, err)

				// Check response structure
				assert.Contains(t, response, "token")
				assert.Contains(t, response, "isNewUser")
				assert.IsType(t, "", response["token"])
				assert.IsType(t, bool(false), response["isNewUser"])

				// Check specific values
				assert.Equal(t, tt.expectedBody["isNewUser"], response["isNewUser"])
			}

			// Verify mock expectations
			mockStore.AssertExpectations(t)
		})
	}
}
