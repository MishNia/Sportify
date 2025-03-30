package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/MishNia/Sportify.git/docs"
	"github.com/MishNia/Sportify.git/internal/auth"
	"github.com/MishNia/Sportify.git/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-playground/validator/v10"
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

	// A good base middleware stack
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	r.Route("/v1", func(r chi.Router) {
		r.Get("/health", app.healthCheckHandler)

		docsURL := fmt.Sprintf("%s/swagger/doc.json", app.config.addr)
		r.Get("/swagger/*", httpSwagger.Handler(
			httpSwagger.URL(docsURL), //The url pointing to API definition
		))

		r.Route("/auth", func(r chi.Router) {
			r.Post("/signup", app.registerUserHandler)
			r.Post("/login", app.userLoginHandler)
		})

		r.Route("/profile", func(r chi.Router) {
			r.Use(app.AuthTokenMiddleware)

			r.Get("/{userID}", app.getUserProfileHandler)
			r.Post("/", app.createUserProfileHandler)
			r.Put("/", app.updateUserProfileHandler)
		})

		r.Route("/events", func(r chi.Router) {
			r.Use(app.AuthTokenMiddleware)

			r.Post("/", app.createEventHandler)
			r.Put("/{id}", app.updateEventHandler)
			r.Get("/{id}", app.getEventHandler)
			r.Delete("/{id}", app.deleteEventHandler)
			r.Post("/{id}/join", app.joinEventHandler)
			r.Delete("/{id}/leave", app.leaveEventHandler)
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
