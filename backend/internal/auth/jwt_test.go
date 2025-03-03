package auth

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

const (
	testSecret = "test_secret"
	testAud    = "test_audience"
	testIss    = "test_issuer"
)

func TestNewJWTAuthenticator(t *testing.T) {
	auth := NewJWTAuthenticator(testSecret, testAud, testIss)

	assert.NotNil(t, auth)
	assert.Equal(t, testSecret, auth.secret)
	assert.Equal(t, testAud, auth.aud)
	assert.Equal(t, testIss, auth.iss)
}

func TestJWTAuthenticator_GenerateToken(t *testing.T) {
	auth := NewJWTAuthenticator(testSecret, testAud, testIss)

	claims := jwt.MapClaims{
		"sub": "1234567890",
		"exp": time.Now().Add(time.Hour * 1).Unix(),
		"aud": testAud,
		"iss": testIss,
	}

	token, err := auth.GenarateToken(claims)
	assert.NoError(t, err)
	assert.NotEmpty(t, token)
}

func TestJWTAuthenticator_ValidateToken_Success(t *testing.T) {
	auth := NewJWTAuthenticator(testSecret, testAud, testIss)

	claims := jwt.MapClaims{
		"sub": "1234567890",
		"exp": time.Now().Add(time.Hour * 1).Unix(),
		"aud": testAud,
		"iss": testIss,
	}

	tokenString, err := auth.GenarateToken(claims)
	assert.NoError(t, err)

	token, err := auth.ValidateToken(tokenString)
	assert.NoError(t, err)
	assert.NotNil(t, token)
	assert.True(t, token.Valid)

	// Extract claims
	parsedClaims, ok := token.Claims.(jwt.MapClaims)
	assert.True(t, ok)
	assert.Equal(t, "1234567890", parsedClaims["sub"])
	assert.Equal(t, testAud, parsedClaims["aud"])
	assert.Equal(t, testIss, parsedClaims["iss"])
}

func TestJWTAuthenticator_ValidateToken_InvalidToken(t *testing.T) {
	auth := NewJWTAuthenticator(testSecret, testAud, testIss)

	// Use an invalid token
	invalidToken := "invalid.token.here"

	token, err := auth.ValidateToken(invalidToken)

	// Ensure an error is returned
	assert.Error(t, err, "Expected an error for an invalid token")

	// Ensure the token is marked as invalid
	assert.False(t, token.Valid, "Token should be invalid")
	assert.False(t, token.Valid, "Token should be invalid when using the wrong secret")

}

func TestJWTAuthenticator_ValidateToken_WrongSecret(t *testing.T) {
	auth := NewJWTAuthenticator(testSecret, testAud, testIss)

	claims := jwt.MapClaims{
		"sub": "1234567890",
		"exp": time.Now().Add(time.Hour * 1).Unix(),
		"aud": testAud,
		"iss": testIss,
	}

	tokenString, err := auth.GenarateToken(claims)
	assert.NoError(t, err)

	// Create a new authenticator with a different secret
	wrongAuth := NewJWTAuthenticator("wrong_secret", testAud, testIss)

	token, err := wrongAuth.ValidateToken(tokenString)
	assert.Error(t, err)
	assert.False(t, token.Valid, "Token should be invalid when using the wrong secret")
}
