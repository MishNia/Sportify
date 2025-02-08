package main

import (
	"log"
	"net/http"

	"github.com/MishNia/Sportify.git/internal/store"
	"golang.org/x/crypto/bcrypt"
)

type RegisterUserPayload struct {
	Username string `json:"username" validate:"required,max=100"`
	Email    string `json:"email" validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=3,max=72"`
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
//	@Success		201		{object}	UserWithToken		"User registered"
//	@Failure		400		{object}	error
//	@Failure		500		{object}	error
//	@Router			/authentication/user [post]
func (app *application) registerUserHandler(w http.ResponseWriter, r *http.Request) {
	var payload RegisterUserPayload

	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	log.Println("Received user create request")

	log.Println("Hashing Password")

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(payload.Password), bcrypt.DefaultCost)

	user := &store.User{
		Email:    payload.Email,
		Password: string(hashedPassword),
	}

	ctx := r.Context()

	// plainToken := uuid.New().String()

	// // hash the token for storage but keep the plain token for email
	// hash := sha256.Sum256([]byte(plainToken))
	// hashToken := hex.EncodeToString(hash[:])

	err = app.store.Users.Create(ctx, user)
	if err != nil {
		switch err {
		case store.ErrDuplicateEmail:
			app.badRequestResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	log.Println("Successfully created new user")

	if err := app.jsonResponse(w, http.StatusCreated, map[string]string{"message": "Success"}); err != nil {
		app.internalServerError(w, r, err)
	}
}
