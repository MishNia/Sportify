package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

// **Test Health Check Handler**
func TestHealthCheck_Handler(t *testing.T) {
	// Create an instance of `application` (mock if necessary)
	app := &application{}

	// Create a test HTTP request
	req, err := http.NewRequest("GET", "/health", nil)
	assert.NoError(t, err)

	// Create a response recorder
	rec := httptest.NewRecorder()

	// Call the handler
	app.healthCheckHandler(rec, req)

	// Assertions
	assert.Equal(t, http.StatusOK, rec.Code, "Expected HTTP 200 OK")
	assert.Equal(t, "OK", rec.Body.String(), "Expected response body 'OK'")
}
