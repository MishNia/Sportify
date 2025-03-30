package main

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/MishNia/Sportify.git/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/assert"
)

// Helper functions
func stringPtr(s string) *string {
	return &s
}

func intPtr(i int) *int {
	return &i
}

func TestCreateEventHandler(t *testing.T) {
	app := newTestApplication()

	tests := []struct {
		name           string
		payload        CreateEventPayload
		setupAuth      func(*http.Request)
		expectedStatus int
	}{
		{
			name: "valid event creation",
			payload: CreateEventPayload{
				Sport:        "Football",
				EventDate:    time.Now().Add(24 * time.Hour),
				MaxPlayers:   10,
				LocationName: "Central Park",
				Latitude:     40.7829,
				Longitude:    -73.9654,
				Description:  "Friendly football match",
				Title:        "Weekend Football",
			},
			setupAuth: func(r *http.Request) {
				r.Header.Set("Authorization", "Bearer test-token")
				// Add user to context
				user := &store.User{
					ID:    1,
					Email: "test@example.com",
				}
				ctx := context.WithValue(r.Context(), userCtx, user)
				*r = *r.WithContext(ctx)
			},
			expectedStatus: http.StatusCreated,
		},
		{
			name: "missing required fields",
			payload: CreateEventPayload{
				Sport:        "Football",
				EventDate:    time.Now().Add(24 * time.Hour),
				MaxPlayers:   0, // Invalid: must be greater than 0
				LocationName: "Central Park",
				Latitude:     40.7829,
				Longitude:    -73.9654,
			},
			setupAuth: func(r *http.Request) {
				r.Header.Set("Authorization", "Bearer test-token")
				// Add user to context
				user := &store.User{
					ID:    1,
					Email: "test@example.com",
				}
				ctx := context.WithValue(r.Context(), userCtx, user)
				*r = *r.WithContext(ctx)
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "unauthorized",
			payload: CreateEventPayload{
				Sport:        "Football",
				EventDate:    time.Now().Add(24 * time.Hour),
				MaxPlayers:   10,
				LocationName: "Central Park",
				Latitude:     40.7829,
				Longitude:    -73.9654,
			},
			setupAuth:      func(r *http.Request) {},
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Marshal the payload to JSON
			body, err := json.Marshal(tt.payload)
			assert.NoError(t, err)

			// Create the request with the JSON body
			req := httptest.NewRequest("POST", "/events", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			tt.setupAuth(req)

			// Setup chi router context
			rctx := chi.NewRouteContext()
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			app.createEventHandler(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			if tt.expectedStatus == http.StatusCreated {
				var response struct {
					Data store.Event `json:"data"`
				}
				err := json.NewDecoder(w.Body).Decode(&response)
				assert.NoError(t, err)
				assert.Equal(t, tt.payload.Sport, response.Data.Sport)
				assert.Equal(t, tt.payload.MaxPlayers, response.Data.MaxPlayers)
				assert.Equal(t, tt.payload.LocationName, response.Data.LocationName)
			}
		})
	}
}
