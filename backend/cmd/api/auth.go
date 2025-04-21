package main

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/MishNia/Sportify.git/internal/auth"
	"github.com/MishNia/Sportify.git/internal/store"
	"github.com/golang-jwt/jwt/v5"
)

type userKey string

const userCtx userKey = "user"

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
)

type RegisterUserPayload struct {
	Email    string `json:"email" validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=8,max=72"`
}

type UserWithToken struct {
	*store.User
	Token string `json:"token"`
}

// registerUserHandler godoc
//
//	@Summary		Registers a user
//	@Description	Registers a user
//	@Tags			authentication
//	@Accept			json
//	@Produce		json
//	@Param			payload	body		RegisterUserPayload	true	"User credentials"
//	@Success		201		{string}	string				"Token"
//	@Failure		400		{object}	error
//	@Failure		500		{object}	error
//	@Router			/auth/signup [post]
func (app *application) registerUserHandler(w http.ResponseWriter, r *http.Request) {
	var payload RegisterUserPayload

	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	app.logger.Infow("Received user create request")
	app.logger.Infow("Hashing Password")

	user := &store.User{
		Email: payload.Email,
	}

	if err := user.Password.Set(payload.Password); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()

	// plainToken := uuid.New().String()

	// // hash the token for storage but keep the plain token for email
	// hash := sha256.Sum256([]byte(plainToken))
	// hashToken := hex.EncodeToString(hash[:])

	err := app.store.Users.Create(ctx, user)
	if err != nil {
		switch err {
		case store.ErrDuplicateEmail:
			app.badRequestResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	app.logger.Infow("Successfully created new user")

	// Genarate a jwt token
	token, err := app.createJwtToken(user.ID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, token); err != nil {
		app.internalServerError(w, r, err)
	}
}

type LoginPayload struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// userLoginHandler godoc
//
//	@Summary		user login
//	@Description	Logs in a user
//	@Tags			authentication
//	@Accept			json
//	@Produce		json
//	@Param			payload	body		LoginPayload	true	"User credentials"
//	@Success		200		{string}	string			"Token"
//	@Failure		400		{object}	error
//	@Failure		500		{object}	error
//	@Router			/auth/login [post]
func (app *application) userLoginHandler(w http.ResponseWriter, r *http.Request) {
	var payload LoginPayload

	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()
	user, err := app.store.Users.GetByEmail(ctx, payload.Email)
	if err != nil {
		if err == store.ErrNotFound {
			app.badRequestResponse(w, r, ErrInvalidCredentials)
		} else {
			app.internalServerError(w, r, err)
		}
		return
	}

	// If user has a Google ID but no password, they should use Google Sign-In
	if user.GoogleID != "" && !user.Password.HasPassword() {
		app.badRequestResponse(w, r, errors.New("this account is linked to Google. Please use Google Sign-In"))
		return
	}

	// verify password of the user
	if err := user.Password.Compare(payload.Password); err != nil {
		app.unauthorizedErrorResponse(w, r, err)
		return
	}

	// Generate a jwt token
	token, err := app.createJwtToken(user.ID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, token); err != nil {
		app.internalServerError(w, r, err)
	}
}

func (app *application) createJwtToken(userID int64) (string, error) {
	// genarate the token -> add claims
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(app.config.auth.token.exp).Unix(),
		"iat": time.Now().Unix(),
		"nbf": time.Now().Unix(),
		"iss": app.config.auth.token.iss,
		"aud": app.config.auth.token.iss,
	}
	token, err := app.authenticator.GenerateToken(claims)
	if err != nil {
		return "", err
	}

	return token, nil
}

func getUserFromContext(r *http.Request) *store.User {
	user, _ := r.Context().Value(userCtx).(*store.User)
	return user
}

func (app *application) googleAuthHandler(w http.ResponseWriter, r *http.Request) {
	url := auth.GetGoogleAuthURL()
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (app *application) googleCallbackHandler(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		app.badRequestResponse(w, r, errors.New("code is required"))
		return
	}

	app.logger.Infow("Received Google OAuth callback", "code", code)

	userInfo, err := auth.GetGoogleUserInfo(code)
	if err != nil {
		app.logger.Errorw("Failed to get Google user info", "error", err)
		app.badRequestResponse(w, r, fmt.Errorf("invalid or expired code"))
		return
	}

	app.logger.Infow("Got Google user info", "email", userInfo.Email, "name", userInfo.Name)

	// Create or update user in our database
	user, isNewUser, err := app.store.Users.CreateOrUpdateGoogleUser(r.Context(), userInfo.ID, userInfo.Email, userInfo.Name)
	if err != nil {
		app.logger.Errorw("Failed to create/update Google user", "error", err)
		app.internalServerError(w, r, err)
		return
	}

	app.logger.Infow("Created/updated user", "user_id", user.ID, "is_new", isNewUser)

	// Generate JWT token
	token, err := app.createJwtToken(user.ID)
	if err != nil {
		app.logger.Errorw("Failed to create JWT token", "error", err)
		app.internalServerError(w, r, err)
		return
	}

	// Redirect back to frontend with token and isNewUser flag
	frontendURL := "http://localhost:3000/auth/google/callback"
	redirectURL := fmt.Sprintf("%s?token=%s&isNewUser=%v", frontendURL, token, isNewUser)
	app.logger.Infow("Redirecting to frontend", "url", redirectURL)
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}
