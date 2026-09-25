package api

import (
	"github.com/gin-gonic/gin"

	"github.com/jimyag/template-repository/internal/web/store"
)

type server struct {
	users    *store.Users
	sessions *sessions
}

func NewRouter() *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())

	s := &server{users: store.NewUsers(), sessions: newSessions()}
	registerRoutes(router, s)

	return router
}
