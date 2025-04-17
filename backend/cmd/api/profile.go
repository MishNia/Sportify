package main

import (
	"log"
	"net/http"
	"strconv"

	"github.com/MishNia/Sportify.git/internal/store"
	"github.com/go-chi/chi/v5"
)

// GetProfile godoc
//
//	@Summary		Fetches a profile
//	@Description	Fetches a post by userID, if no userID is provided, fetches the profile of the authenticated user
//	@Tags			profile
//	@Accept			json
//	@Produce		json
//	@Param			id	path		int	false	"user Id" default(0)
//	@Success		200	{object}	store.Profile
//	@Failure		404	{object}	error
//	@Failure		500	{object}	error
//	@Security		ApiKeyAuth
//	@Router			/profile/{id} [get]
func (app *application) getUserProfileHandler(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "userID")
	var userID int64
	if idParam != "" && idParam != "0" {
		var err error
		userID, err = strconv.ParseInt(idParam, 10, 64)
		if err != nil {
			app.internalServerError(w, r, err)
			return
		}
	} else {
		userID = 0
	}
	user := &store.User{}
	log.Println("idparam", userID)
	// if no id is provided, get the profile of authenticated user
	// else get the profile of the user with the provided id
	if userID == 0 {
		user = getUserFromContext(r)
	} else {
		ctx := r.Context()
		var err error
		user, err = app.store.Users.GetByID(ctx, userID)
		if err != nil {
			if err == store.ErrNotFound {
				app.notFoundResponse(w, r, err)
			} else {
				app.internalServerError(w, r, err)
			}
			return
		}
	}

	ctx := r.Context()
	profile, err := app.store.Profile.GetByEmail(ctx, user.Email)
	if err != nil {
		if err == store.ErrNotFound {
			app.notFoundResponse(w, r, err)
		} else {
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, profile); err != nil {
		app.internalServerError(w, r, err)
	}
}

type ProfilePayload struct {
	FirstName       string   `json:"first_name" validate:"required"`
	LastName        string   `json:"last_name" validate:"required"`
	Age             int      `json:"age" validate:"required"`
	Gender          string   `json:"gender" validate:"required"`
	SportPreference []string `json:"sport_preference" validate:"required"`
}

// createUserProfileHandler godoc
//
//	@Summary		creates a user profile
//	@Description	creates a user profile
//	@Tags			profile
//	@Accept			json
//	@Produce		json
//	@Param			payload	body		ProfilePayload	true	"User profile"
//	@Success		201		{object}	store.Profile
//	@Failure		400		{object}	error
//	@Failure		401		{object}	error
//	@Failure		403		{object}	error
//	@Failure		500		{object}	error
//	@Security		ApiKeyAuth
//	@Router			/profile [put]
func (app *application) createUserProfileHandler(w http.ResponseWriter, r *http.Request) {
	var payload ProfilePayload

	if err := readJSON(w, r, &payload); err != nil {
		log.Println(err.Error())
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		log.Println(err.Error())
		app.badRequestResponse(w, r, err)
		return
	}

	log.Println("Received profile create request")
	user := getUserFromContext(r)
	if user.Email == "" {
		log.Printf("User %s is not authorized to create profile", user.Email)
		app.forbiddenResponse(w, r)
		return
	}

	profile := &store.Profile{
		Email:           user.Email,
		FirstName:       payload.FirstName,
		LastName:        payload.LastName,
		Age:             payload.Age,
		Gender:          payload.Gender,
		SportPreference: payload.SportPreference,
	}

	ctx := r.Context()
	errCreate := app.store.Profile.Create(ctx, profile)
	if errCreate != nil {
		log.Println(errCreate.Error())
		app.internalServerError(w, r, errCreate)
		return
	}

	if errCreate := app.jsonResponse(w, http.StatusCreated, profile); errCreate != nil {
		app.internalServerError(w, r, errCreate)
	}
}

// updateUserProfileHandler godoc
//
//	@Summary		updates a user profile
//	@Description	updates a user profile
//	@Tags			profile
//	@Accept			json
//	@Produce		json
//	@Param			payload	body		ProfilePayload	true	"User profile"
//	@Success		201		{object}	store.Profile
//	@Failure		400		{object}	error
//	@Failure		401		{object}	error
//	@Failure		403		{object}	error
//	@Failure		500		{object}	error
//	@Security		ApiKeyAuth
//	@Router			/profile [post]
func (app *application) updateUserProfileHandler(w http.ResponseWriter, r *http.Request) {
	var payload ProfilePayload

	if err := readJSON(w, r, &payload); err != nil {
		log.Println(err.Error())
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		log.Println(err.Error())
		app.badRequestResponse(w, r, err)
		return
	}

	log.Println("Received profile update request")
	user := getUserFromContext(r)
	if user.Email == "" {
		log.Printf("User %s is not authorized to update profile", user.Email)
		app.forbiddenResponse(w, r)
		return
	}

	ctx := r.Context()

	// Fetch existing profile
	profile, err := app.store.Profile.GetByEmail(ctx, user.Email)
	if err != nil {
		if err == store.ErrNotFound {
			log.Printf("Profile for user %s not found", user.Email)
			app.notFoundResponse(w, r, err)
		} else {
			app.internalServerError(w, r, err)
		}
		return
	}

	// Update only fields that are provided
	if payload.FirstName != "" {
		profile.FirstName = payload.FirstName
	}
	if payload.LastName != "" {
		profile.LastName = payload.LastName
	}
	if payload.Age != 0 {
		profile.Age = payload.Age
	}
	if payload.Gender != "" {
		profile.Gender = payload.Gender
	}
	if len(payload.SportPreference) > 0 {
		profile.SportPreference = payload.SportPreference
	}

	// Save the updated profile
	errUpdate := app.store.Profile.Update(ctx, profile)
	if errUpdate != nil {
		log.Println(errUpdate.Error())
		app.internalServerError(w, r, errUpdate)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, profile); err != nil {
		app.internalServerError(w, r, err)
	}
}
