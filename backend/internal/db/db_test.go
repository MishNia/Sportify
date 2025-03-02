package db

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

// Test failure when invalid address is provided
func TestNew_InvalidAddress(t *testing.T) {
	_, err := New("invalid_connection_string", 10, 5, "10m")
	assert.Error(t, err, "Expected an error for invalid database address")
}

// Test failure due to incorrect duration format
func TestNew_InvalidIdleTime(t *testing.T) {
	_, err := New("mock_addr", 10, 5, "invalid_duration")
	assert.Error(t, err, "Expected an error for incorrect duration format")
}
