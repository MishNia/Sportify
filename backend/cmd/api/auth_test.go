package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/MishNia/Sportify.git/internal/auth"
	"github.com/stretchr/testify/assert"
)

func TestGoogleCallbackHandler(t *testing.T) {
	// Save the original function and restore it after the test
	originalGetGoogleUserInfo := auth.GetGoogleUserInfo
	defer func() { auth.GetGoogleUserInfo = originalGetGoogleUserInfo }()

	// Mock the Google OAuth service
	auth.GetGoogleUserInfo = func(code string) (*auth.GoogleUserInfo, error) {
		if code == "" {
			return nil, auth.ErrInvalidCode
		}
		return &auth.GoogleUserInfo{
			ID:    "google123",
			Email: "test@example.com",
			Name:  "Test User",
		}, nil
	}

	app := newTestApplication()
	router := app.mount()

	tests := []struct {
		name           string
		code           string
		expectedStatus int
		expectedURL    string
	}{
		{
			name:           "new user",
			code:           "valid_code",
			expectedStatus: http.StatusTemporaryRedirect,
			expectedURL:    "http://localhost:3000/auth/google/callback",
		},
		{
			name:           "existing user",
			code:           "valid_code",
			expectedStatus: http.StatusTemporaryRedirect,
			expectedURL:    "http://localhost:3000/auth/google/callback",
		},
		{
			name:           "missing code",
			code:           "",
			expectedStatus: http.StatusBadRequest,
			expectedURL:    "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create request
			req := httptest.NewRequest("GET", "/v1/auth/google/callback?code="+tt.code, nil)
			rec := httptest.NewRecorder()

			// Call the handler
			router.ServeHTTP(rec, req)

			// Check status code
			assert.Equal(t, tt.expectedStatus, rec.Code)

			if tt.expectedStatus == http.StatusTemporaryRedirect {
				// Check redirect URL
				location := rec.Header().Get("Location")
				assert.Contains(t, location, tt.expectedURL)
				
				// Verify that the URL contains token and isNewUser parameters
				assert.Contains(t, location, "token=")
				assert.Contains(t, location, "isNewUser=")
			}
		})
	}
} 