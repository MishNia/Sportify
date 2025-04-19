package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/MishNia/Sportify.git/docs"
	"github.com/MishNia/Sportify.git/internal/auth"
	"github.com/MishNia/Sportify.git/internal/store"
	"github.com/MishNia/Sportify.git/internal/websocket"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	gorilla "github.com/gorilla/websocket"
	httpSwagger "github.com/swaggo/http-swagger"
	"go.uber.org/zap"
)

type application struct {
	config        config
	store         store.Storage
	logger        *zap.SugaredLogger
	authenticator auth.Authenticator
	validator     *validator.Validate
}

type config struct {
	addr   string
	db     dbConfig
	auth   authConfig
	apiURL string
}

type authConfig struct {
	token tokenConfig
}

type tokenConfig struct {
	secret string
	exp    time.Duration
	iss    string
}

type dbConfig struct {
	addr         string
	maxOpenConns int
	maxIdleConns int
	maxIdleTime  string
}

func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	// CORS middleware
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:3005", "http://localhost:3006", "http://localhost:3003", "http://localhost:3004"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// A good base middleware stack
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	// Create WebSocket hub
	hub := websocket.NewHub()
	go hub.Run()

	r.Route("/v1", func(r chi.Router) {
		r.Get("/health", app.healthCheckHandler)

		docsURL := fmt.Sprintf("%s/swagger/doc.json", app.config.addr)
		r.Get("/swagger/*", httpSwagger.Handler(
			httpSwagger.URL(docsURL), //The url pointing to API definition
		))

		r.Route("/auth", func(r chi.Router) {
			r.Post("/signup", app.registerUserHandler)
			r.Post("/login", app.userLoginHandler)
			r.Get("/google", app.googleAuthHandler)
			r.Get("/google/callback", app.googleCallbackHandler)
		})

		r.Route("/profile", func(r chi.Router) {
			r.Use(app.AuthTokenMiddleware)

			r.Get("/{userID}", app.getUserProfileHandler)
			r.Post("/", app.createUserProfileHandler)
			r.Put("/", app.updateUserProfileHandler)
		})

		r.Route("/events", func(r chi.Router) {
			// New endpoint for getting all events

			// Group protected endpoints
			r.Group(func(r chi.Router) {
				r.Use(app.AuthTokenMiddleware)
				r.Post("/", app.createEventHandler)
				r.Put("/{id}", app.updateEventHandler)
				r.Get("/{id}", app.getEventHandler)
				r.Delete("/{id}", app.deleteEventHandler)
				r.Post("/{id}/join", app.joinEventHandler)
				r.Delete("/{id}/leave", app.leaveEventHandler)
				r.Get("/all", app.getAllEventsSimpleHandler)
				// Existing filtered endpoint
				r.Get("/", app.getAllEventsHandler)
			})

			// WebSocket endpoint for event chat - no auth middleware
			r.Get("/{id}/chat", func(w http.ResponseWriter, r *http.Request) {
				// Get token from query parameter
				token := r.URL.Query().Get("token")
				if token == "" {
					app.logger.Warnw("No token provided in websocket connection")
					app.forbiddenResponse(w, r)
					return
				}

				// Validate token
				jwtToken, err := app.authenticator.ValidateToken(token)
				if err != nil {
					app.logger.Warnw("Invalid token in websocket connection", "error", err)
					app.forbiddenResponse(w, r)
					return
				}

				// Add claims to context
				claims := jwtToken.Claims.(jwt.MapClaims)
				userIDFloat := claims["sub"].(float64) // sub claim is a float64
				userIDStr := strconv.FormatInt(int64(userIDFloat), 10)

				// Convert userID to int64
				userID := int64(userIDFloat)

				// Get user's email from the Users store
				user, err := app.store.Users.GetByID(r.Context(), userID)
				if err != nil {
					app.logger.Errorw("Failed to get user", "error", err)
					app.internalServerError(w, r, err)
					return
				}

				ctx := context.WithValue(r.Context(), "userID", userIDStr)
				ctx = context.WithValue(ctx, "userEmail", user.Email)
				r = r.WithContext(ctx)

				app.logger.Infow("WebSocket connection attempt",
					"eventID", chi.URLParam(r, "id"),
					"userID", r.Context().Value("userID"),
					"userEmail", r.Context().Value("userEmail"),
				)

				eventID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
				if err != nil {
					app.logger.Errorw("Failed to parse event ID", "error", err)
					app.badRequestResponse(w, r, err)
					return
				}

				// Verify user is a participant
				event, err := app.store.Events.GetByID(r.Context(), eventID)
				if err != nil {
					app.logger.Errorw("Failed to get event", "error", err)
					app.internalServerError(w, r, err)
					return
				}
				isParticipant := false
				for _, p := range event.Participants {
					if p.UserID == userID {
						isParticipant = true
						break
					}
				}
				if !isParticipant {
					app.logger.Warnw("User is not a participant", "userID", userID, "eventID", eventID)
					app.forbiddenResponse(w, r)
					return
				}

				// Get username from profile
				profile, err := app.store.Profile.GetByEmail(r.Context(), user.Email)
				if err != nil {
					app.logger.Errorw("Failed to get profile", "error", err)
					app.internalServerError(w, r, err)
					return
				}

				upgrader := gorilla.Upgrader{
					ReadBufferSize:  1024,
					WriteBufferSize: 1024,
					CheckOrigin: func(r *http.Request) bool {
						origin := r.Header.Get("Origin")
						app.logger.Infow("Checking origin", "origin", origin)
						return true // Allow all origins for development
					},
				}
				conn, err := upgrader.Upgrade(w, r, nil)
				if err != nil {
					app.logger.Errorw("Failed to upgrade connection", "error", err)
					app.internalServerError(w, r, err)
					return
				}

				app.logger.Infow("WebSocket connection established",
					"eventID", eventID,
					"userID", userID,
					"username", profile.FirstName+" "+profile.LastName,
				)

				hub.HandleWebSocket(conn, eventID, userID, profile.FirstName+" "+profile.LastName)
			})
		})
	})

	return r
}

func (app *application) run(mux http.Handler) error {
	// Docs
	docs.SwaggerInfo.Version = version
	docs.SwaggerInfo.Host = app.config.apiURL
	docs.SwaggerInfo.BasePath = "/v1"

	srv := &http.Server{
		Addr:         app.config.addr,
		Handler:      mux,
		WriteTimeout: time.Second * 30,
		ReadTimeout:  time.Second * 10,
		IdleTimeout:  time.Minute,
	}

	log.Printf("Server has started at %s", app.config.addr)
	return srv.ListenAndServe()
}
