package main

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

// **Test writeJSON**
func TestWriteJSON(t *testing.T) {
	rec := httptest.NewRecorder()

	data := map[string]string{"message": "Hello, World!"}
	err := writeJSON(rec, http.StatusOK, data)

	assert.NoError(t, err, "writeJSON should not return an error")
	assert.Equal(t, http.StatusOK, rec.Code, "Expected HTTP 200 OK")
	assert.JSONEq(t, `{"message":"Hello, World!"}`, rec.Body.String(), "Response JSON should match")
}

// **Test writeJSONError**
func TestWriteJSONError(t *testing.T) {
	rec := httptest.NewRecorder()

	err := writeJSONError(rec, http.StatusBadRequest, "Invalid request")

	assert.NoError(t, err, "writeJSONError should not return an error")
	assert.Equal(t, http.StatusBadRequest, rec.Code, "Expected HTTP 400 Bad Request")
	assert.JSONEq(t, `{"error":"Invalid request"}`, rec.Body.String(), "Error response JSON should match")
}

// **Test readJSON - Valid Input**
func TestReadJSON_ValidInput(t *testing.T) {
	requestBody := `{"name": "John Doe", "age": 30}`
	req := httptest.NewRequest("POST", "/", bytes.NewBufferString(requestBody))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	var data struct {
		Name string `json:"name"`
		Age  int    `json:"age"`
	}

	err := readJSON(rec, req, &data)

	assert.NoError(t, err, "readJSON should not return an error for valid JSON")
	assert.Equal(t, "John Doe", data.Name, "Expected correct name")
	assert.Equal(t, 30, data.Age, "Expected correct age")
}

// **Test readJSON - Invalid JSON (Unknown Field)**
func TestReadJSON_InvalidUnknownField(t *testing.T) {
	requestBody := `{"name": "John Doe", "age": 30, "extra": "field"}`
	req := httptest.NewRequest("POST", "/", bytes.NewBufferString(requestBody))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	var data struct {
		Name string `json:"name"`
		Age  int    `json:"age"`
	}

	err := readJSON(rec, req, &data)

	assert.Error(t, err, "readJSON should return an error for unknown fields")
	assert.Contains(t, err.Error(), "json: unknown field", "Error message should indicate unknown field")
}

// **Test readJSON - Invalid JSON (Malformed)**
func TestReadJSON_InvalidMalformedJSON(t *testing.T) {
	requestBody := `{"name": "John Doe", "age": 30`
	req := httptest.NewRequest("POST", "/", bytes.NewBufferString(requestBody))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	var data struct {
		Name string `json:"name"`
		Age  int    `json:"age"`
	}

	err := readJSON(rec, req, &data)

	assert.Error(t, err, "readJSON should return an error for malformed JSON")
}

// **Test readJSON - Exceeding Max Bytes**
func TestReadJSON_ExceedMaxBytes(t *testing.T) {
	requestBody := make([]byte, 2_000_000) // 2MB exceeds 1MB limit
	req := httptest.NewRequest("POST", "/", bytes.NewBuffer(requestBody))
	rec := httptest.NewRecorder()

	var data map[string]interface{}

	err := readJSON(rec, req, &data)

	assert.Error(t, err, "readJSON should return an error when exceeding max bytes limit")
}

// **Test jsonResponse**
func TestJsonResponse(t *testing.T) {
	app := &application{}
	rec := httptest.NewRecorder()

	data := map[string]string{"status": "success"}
	err := app.jsonResponse(rec, http.StatusOK, data)

	assert.NoError(t, err, "jsonResponse should not return an error")
	assert.Equal(t, http.StatusOK, rec.Code, "Expected HTTP 200 OK")
	assert.JSONEq(t, `{"data":{"status":"success"}}`, rec.Body.String(), "Response JSON should match")
}
