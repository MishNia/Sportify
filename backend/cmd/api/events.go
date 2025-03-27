package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/MishNia/Sportify.git/internal/store"
	"github.com/go-chi/chi/v5"
)

// getEventHandler godoc
// @Summary      Get event details
// @Description  Get details of a specific event including participants
// @Tags         events
// @Accept       json
// @Produce      json
// @Param        id path int true "Event ID"
// @Success      200 {object} store.Event
// @Failure      400 {object} error
// @Failure      401 {object} error
// @Failure      404 {object} error
// @Failure      500 {object} error
// @Security     ApiKeyAuth
// @Router       /v1/events/{id} [get]
func (app *application) getEventHandler(w http.ResponseWriter, r *http.Request) {
	// Get event ID from URL
	eventID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	// Get authenticated user
	user := getUserFromContext(r)
	if user == nil {
		app.unauthorizedResponse(w, r)
		return
	}

	// Get event details
	event, err := app.store.Events.GetByID(r.Context(), eventID)
	if err != nil {
		if err == store.ErrEventNotFound {
			app.notFoundResponse(w, r, err)
		} else {
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, event); err != nil {
		app.internalServerError(w, r, err)
	}
}

type EventsPayload struct {
	FirstName       string   `json:"first_name" validate:"required"`
	LastName        string   `json:"last_name" validate:"required"`
	Email           string   `json:"email" validate:"required,email"`
	Age             int      `json:"age" validate:"required"`
	Gender          string   `json:"gender" validate:"required"`
	SportPreference []string `json:"sport_preference" validate:"required"`
}

// createEventHandler godoc
// @Summary      Create a new event
// @Description  Creates a new sports event with the provided details
// @Tags         events
// @Accept       json
// @Produce      json
// @Param        payload body CreateEventPayload true "Event details"
// @Success      201 {object} store.Event
// @Failure      400 {object} error
// @Failure      401 {object} error
// @Failure      500 {object} error
// @Security     ApiKeyAuth
// @Router       /v1/events [post]
func (app *application) createEventHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateEventPayload

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := app.validator.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	// Get the authenticated user
	user := getUserFromContext(r)
	if user == nil {
		app.unauthorizedResponse(w, r)
		return
	}

	event := &store.Event{
		EventOwner:    user.ID,
		Sport:         payload.Sport,
		EventDateTime: payload.EventDate,
		MaxPlayers:    payload.MaxPlayers,
		LocationName:  payload.LocationName,
		Latitude:      payload.Latitude,
		Longitude:     payload.Longitude,
		Description:   payload.Description,
		Title:         payload.Title,
		IsFull:        false,
	}

	if err := app.store.Events.Create(r.Context(), event); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	// Get the created event with registered count
	createdEvent, err := app.store.Events.GetByID(r.Context(), event.ID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, createdEvent); err != nil {
		app.internalServerError(w, r, err)
	}
}

type CreateEventPayload struct {
	Sport        string    `json:"sport" validate:"required"`
	EventDate    time.Time `json:"event_date" validate:"required"`
	MaxPlayers   int       `json:"max_players" validate:"required,gt=0"`
	LocationName string    `json:"location_name" validate:"required"`
	Latitude     float64   `json:"latitude" validate:"required"`
	Longitude    float64   `json:"longitude" validate:"required"`
	Description  string    `json:"description"`
	Title        string    `json:"title"`
}

// joinEventHandler godoc
// @Summary      Join an event
// @Description  Allows a user to join an existing event
// @Tags         events
// @Accept       json
// @Produce      json
// @Param        id path int true "Event ID"
// @Success      200 {object} map[string]string
// @Failure      400 {object} error
// @Failure      401 {object} error
// @Failure      404 {object} error
// @Failure      409 {object} error
// @Failure      500 {object} error
// @Security     ApiKeyAuth
// @Router       /v1/events/{id}/join [post]
func (app *application) joinEventHandler(w http.ResponseWriter, r *http.Request) {
	// Get event ID from URL
	eventID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	// Get authenticated user
	user := getUserFromContext(r)
	if user == nil {
		app.unauthorizedResponse(w, r)
		return
	}

	// Get event details
	event, err := app.store.Events.GetByID(r.Context(), eventID)
	if err != nil {
		if err == store.ErrEventNotFound {
			app.notFoundResponse(w, r, err)
		} else {
			app.internalServerError(w, r, err)
		}
		return
	}

	// Check if event is full
	if event.IsFull {
		app.conflictResponse(w, r, errors.New("event is already full"))
		return
	}

	// Join the event
	if err := app.store.Events.Join(r.Context(), eventID, user.ID); err != nil {
		if err == store.ErrAlreadyJoined {
			app.conflictResponse(w, r, err)
		} else {
			app.internalServerError(w, r, err)
		}
		return
	}

	// Return success response
	response := map[string]string{
		"message": "You have successfully joined the event!",
	}
	if err := app.jsonResponse(w, http.StatusOK, response); err != nil {
		app.internalServerError(w, r, err)
	}
}
