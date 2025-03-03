package env

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetString(t *testing.T) {
	// Set environment variable
	key := "TEST_STRING"
	value := "HelloWorld"
	os.Setenv(key, value)
	defer os.Unsetenv(key)

	// Test when env variable is set
	result := GetString(key, "fallback")
	assert.Equal(t, value, result, "Expected the environment variable value")

	// Test when env variable is not set
	result = GetString("NON_EXISTENT_KEY", "fallback")
	assert.Equal(t, "fallback", result, "Expected the fallback value")
}

func TestGetInt(t *testing.T) {
	// Set environment variable with integer value
	key := "TEST_INT"
	os.Setenv(key, "42")
	defer os.Unsetenv(key)

	// Test when env variable is set
	result := GetInt(key, 10)
	assert.Equal(t, 42, result, "Expected the integer value from environment variable")

	// Test when env variable is not set
	result = GetInt("NON_EXISTENT_KEY", 10)
	assert.Equal(t, 10, result, "Expected the fallback value")

	// Test when env variable contains a non-integer value
	keyInvalid := "TEST_INVALID_INT"
	os.Setenv(keyInvalid, "invalid_number")
	defer os.Unsetenv(keyInvalid)

	result = GetInt(keyInvalid, 10)
	assert.Equal(t, 10, result, "Expected the fallback value when conversion fails")
}
