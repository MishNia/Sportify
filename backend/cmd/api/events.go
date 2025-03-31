package main

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/MishNia/Sportify.git/internal/store"
	"github.com/go-chi/chi/v5"
)

// getEventHandler godoc
//
//	@Summary		Get event details
//	@Description	Get details of a specific event including participants
//	@Tags			events
//	@Accept			json
//	@Produce		json
//	@Param			id	path		int	true	"Event ID"
//	@Success		200	{object}	store.Event
//	@Failure		400	{object}	error
//	@Failure		401	{object}	error
//	@Failure		404	{object}	error
//	@Failure		500	{object}	error
//	@Security		ApiKeyAuth
//	@Router			/events/{id} [get]
func (app *application) getEventHandler(w http.ResponseWriter, r *http.Request) {
	// Get event ID from URL
	eventID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
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

// createEventHandler godoc
//
//	@Summary		Create a new event
//	@Description	Creates a new sports event with the provided details
//	@Tags			events
//	@Accept			json
//	@Produce		json
//	@Param			payload	body		CreateEventPayload	true	"Event details"
//	@Success		201		{object}	store.Event
//	@Failure		400		{object}	error
//	@Failure		401		{object}	error
//	@Failure		500		{object}	error
//	@Security		ApiKeyAuth
//	@Router			/events [post]
func (app *application) createEventHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateEventPayload

	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
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

type UpdateEventPayload struct {
	Sport        *string    `json:"sport"`
	EventDate    *time.Time `json:"event_date"`
	MaxPlayers   *int       `json:"max_players" validate:"gt=0"`
	LocationName *string    `json:"location_name"`
	Latitude     *float64   `json:"latitude"`
	Longitude    *float64   `json:"longitude"`
	Description  *string    `json:"description"`
	Title        *string    `json:"title"`
}

// updateEventHandler godoc
//
//	@Summary		Update an event
//	@Description	Update event details (partial or full). Only owner can update.
//	@Tags			events
//	@Accept			json
//	@Produce		json
//	@Param			id		path		int					true	"Event ID"
//	@Param			payload	body		UpdateEventPayload	true	"Fields to update"
//	@Success		200		{object}	store.Event
//	@Failure		400		{object}	error
//	@Failure		401		{object}	error
//	@Failure		403		{object}	error
//	@Failure		404		{object}	error
//	@Failure		500		{object}	error
//	@Security		ApiKeyAuth
//	@Router			/events/{id} [put]
func (app *application) updateEventHandler(w http.ResponseWriter, r *http.Request) {
	// Get event ID from URL
	eventID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	// Handle payload
	var payload UpdateEventPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	// Validate payload
	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()
	event, err := app.store.Events.GetByID(ctx, eventID)
	if err != nil {
		if err == store.ErrNotFound {
			app.notFoundResponse(w, r, err)
		} else {
			app.internalServerError(w, r, err)
		}
		return
	}

	// Get the authenticated user
	user := getUserFromContext(r)
	if user.ID != event.EventOwner {
		app.forbiddenResponse(w, r)
		return
	}

	// Optional updates
	if payload.Sport != nil {
		event.Sport = *payload.Sport
	}
	if payload.EventDate != nil {
		event.EventDateTime = *payload.EventDate
	}
	if payload.MaxPlayers != nil {
		event.MaxPlayers = *payload.MaxPlayers
	}
	if payload.LocationName != nil {
		event.LocationName = *payload.LocationName
	}
	if payload.Latitude != nil {
		event.Latitude = *payload.Latitude
	}
	if payload.Longitude != nil {
		event.Longitude = *payload.Longitude
	}
	if payload.Title != nil {
		event.Title = *payload.Title
	}
	if payload.Description != nil {
		event.Description = *payload.Description
	}
	event.UpdatedAt = time.Now()

	if err := app.store.Events.Update(ctx, event); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, event); err != nil {
		app.internalServerError(w, r, err)
	}
}

// deleteEventHandler godoc
//
//	@Summary		Delete an event
//	@Description	Event owner deletes their event (including all participants)
//	@Tags			events
//	@Accept			json
//	@Produce		json
//	@Param			id	path		int	true	"Event ID"
//	@Success		200	{object}	map[string]string
//	@Failure		400	{object}	error	"Invalid ID"
//	@Failure		401	{object}	error	"Unauthorized"
//	@Failure		403	{object}	error	"User is not the event owner"
//	@Failure		404	{object}	error	"Event not found"
//	@Failure		500	{object}	error	"Internal server error"
//	@Security		ApiKeyAuth
//	@Router			/events/{id} [delete]
func (app *application) deleteEventHandler(w http.ResponseWriter, r *http.Request) {
	eventID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	event, err := app.store.Events.GetByID(r.Context(), eventID)
	if err != nil {
		if err == store.ErrNotFound {
			app.notFoundResponse(w, r, err)
		} else {
			app.internalServerError(w, r, err)
		}
		return
	}

	user := getUserFromContext(r)
	if user.ID != event.EventOwner {
		app.forbiddenResponse(w, r)
		return
	}

	err = app.store.Events.Delete(r.Context(), eventID)
	if err != nil {
		if err == store.ErrEventNotFound {
			app.notFoundResponse(w, r, err)
		} else {
			app.internalServerError(w, r, err)
		}
		return
	}

	response := map[string]string{"message": "You have successfully deleted the event!"}
	if err := app.jsonResponse(w, http.StatusOK, response); err != nil {
		app.internalServerError(w, r, err)
	}
}

// joinEventHandler godoc
//
//	@Summary		Join an event
//	@Description	Allows a user to join an existing event
//	@Tags			events
//	@Accept			json
//	@Produce		json
//	@Param			id	path		int	true	"Event ID"
//	@Success		200	{object}	map[string]string
//	@Failure		400	{object}	error
//	@Failure		401	{object}	error
//	@Failure		404	{object}	error
//	@Failure		409	{object}	error
//	@Failure		500	{object}	error
//	@Security		ApiKeyAuth
//	@Router			/events/{id}/join [post]
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

// leaveEventHandler godoc
//
//	@Summary		leave an event
//	@Description	Allows a user to leave from an existing event
//	@Tags			events
//	@Accept			json
//	@Produce		json
//	@Param			id	path		int	true	"Event ID"
//	@Success		200	{object}	map[string]string
//	@Failure		400	{object}	error
//	@Failure		401	{object}	error
//	@Failure		403	{object}	error
//	@Failure		404	{object}	error
//	@Failure		500	{object}	error
//	@Security		ApiKeyAuth
//	@Router			/events/{id}/leave [delete]
func (app *application) leaveEventHandler(w http.ResponseWriter, r *http.Request) {
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

	// leave the event
	if err := app.store.Events.Leave(r.Context(), eventID, user.ID); err != nil {
		if err == store.ErrEventNotFound {
			app.notFoundResponse(w, r, err)
		} else if err == store.ErrNotJoined {
			app.forbiddenResponse(w, r)
		} else {
			app.internalServerError(w, r, err)
		}
		return
	}

	// Return success response
	response := map[string]string{
		"message": "You have successfully left the event!",
	}
	if err := app.jsonResponse(w, http.StatusOK, response); err != nil {
		app.internalServerError(w, r, err)
	}
}

type EventFilterPayload struct {
	ID           *int64   `json:"id"`
	Sports       []string `json:"sports"`
	MaxPlayers   *int     `json:"max_players"`
	EventOwner   *int64   `json:"event_owner"`
	IsFull       *bool    `json:"is_full"`
	AfterDate    *string  `json:"after_date"`  // RFC3339 string
	BeforeDate   *string  `json:"before_date"` // RFC3339 string
	LocationName *string  `json:"location_name"`
	SortBy       *string  `json:"sort_by"` // event_datetime, created_at, etc.
	Order        *string  `json:"order"`   // asc, desc
}

// getAllEventsHandler godoc
//
//	@Summary		Get all events with filters
//	@Description	Returns a list of events filtered by criteria provided in the request body
//	@Tags			events
//	@Accept			json
//	@Produce		json
//	@Param			filter	body		EventFilterPayload	true	"Event filtering criteria"
//	@Success		200		{array}		store.Event
//	@Failure		400		{object}	error
//	@Failure		500		{object}	error
//	@Security		ApiKeyAuth
//	@Router			/events [get]
func (app *application) getAllEventsHandler(w http.ResponseWriter, r *http.Request) {
	var payload EventFilterPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	filter := &store.EventFilter{
		ID:           payload.ID,
		Sports:       payload.Sports,
		MaxPlayers:   payload.MaxPlayers,
		EventOwner:   payload.EventOwner,
		IsFull:       payload.IsFull,
		LocationName: payload.LocationName,
	}

	// Parse and convert dates
	if payload.AfterDate != nil {
		t, err := time.Parse(time.RFC3339, *payload.AfterDate)
		if err != nil {
			app.badRequestResponse(w, r, errors.New("invalid after_date"))
			return
		}
		filter.AfterDate = &t
	}

	if payload.BeforeDate != nil {
		t, err := time.Parse(time.RFC3339, *payload.BeforeDate)
		if err != nil {
			app.badRequestResponse(w, r, errors.New("invalid before_date"))
			return
		}
		filter.BeforeDate = &t
	}

	// Validate sort options
	if payload.SortBy != nil {
		switch *payload.SortBy {
		case "event_datetime", "created_at", "registered_count":
			filter.SortBy = *payload.SortBy
		}
	}
	if payload.Order != nil {
		order := strings.ToLower(*payload.Order)
		if order == "desc" || order == "asc" {
			filter.Order = order
		}
	}

	// Apply defaults
	if filter.SortBy == "" {
		filter.SortBy = "created_at"
	}
	if filter.Order == "" {
		filter.Order = "asc"
	}

	// Fetch events
	events, err := app.store.Events.GetAllWithFilter(r.Context(), filter)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, events); err != nil {
		app.internalServerError(w, r, err)
	}
}
