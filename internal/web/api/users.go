package api

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/jimyag/template-repository/internal/web/store"
)

func (s *server) listUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.Query("page"))
	pageSize, _ := strconv.Atoi(c.Query("pageSize"))

	c.JSON(http.StatusOK, s.users.List(store.ListQuery{
		Search:   c.Query("q"),
		Role:     c.Query("role"),
		Status:   c.Query("status"),
		Page:     page,
		PageSize: pageSize,
	}))
}

func (s *server) getUser(c *gin.Context) {
	id, ok := userID(c)
	if !ok {
		return
	}
	user, err := s.users.Get(id)
	if err != nil {
		writeStoreError(c, err)
		return
	}
	c.JSON(http.StatusOK, user)
}

func (s *server) createUser(c *gin.Context) {
	in, ok := bindUserInput(c)
	if !ok {
		return
	}
	user, err := s.users.Create(in)
	if err != nil {
		writeStoreError(c, err)
		return
	}
	c.JSON(http.StatusCreated, user)
}

func (s *server) updateUser(c *gin.Context) {
	id, ok := userID(c)
	if !ok {
		return
	}
	in, ok := bindUserInput(c)
	if !ok {
		return
	}
	user, err := s.users.Update(id, in)
	if err != nil {
		writeStoreError(c, err)
		return
	}
	c.JSON(http.StatusOK, user)
}

func (s *server) deleteUser(c *gin.Context) {
	id, ok := userID(c)
	if !ok {
		return
	}
	if err := s.users.Delete(id); err != nil {
		writeStoreError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

func (s *server) dashboard(c *gin.Context) {
	recent := s.users.List(store.ListQuery{PageSize: 5})
	c.JSON(http.StatusOK, gin.H{"stats": s.users.Stats(), "recentUsers": recent.Items})
}

func userID(c *gin.Context) (int64, bool) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return 0, false
	}
	return id, true
}

func bindUserInput(c *gin.Context) (store.UserInput, bool) {
	var in store.UserInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return in, false
	}
	if fields := in.Validate(); len(fields) > 0 {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "validation failed", "fields": fields})
		return in, false
	}
	return in, true
}

func writeStoreError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, store.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
	case errors.Is(err, store.ErrEmailTaken):
		c.JSON(http.StatusConflict, gin.H{"error": err.Error(), "fields": gin.H{"email": "Email already in use."}})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
	}
}
