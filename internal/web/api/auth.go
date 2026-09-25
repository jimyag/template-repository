package api

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"net/http"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
)

// Demo credentials. Replace this file with real authentication in your project.
const (
	demoUsername = "admin"
	demoPassword = "admin123"
)

type Account struct {
	Username string `json:"username"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

var demoAccount = Account{
	Username: demoUsername,
	Name:     "Administrator",
	Email:    "admin@example.com",
	Role:     "admin",
}

type sessions struct {
	mu     sync.RWMutex
	tokens map[string]Account
}

func newSessions() *sessions {
	return &sessions{tokens: map[string]Account{}}
}

func (s *sessions) create(a Account) string {
	buf := make([]byte, 32)
	_, _ = rand.Read(buf)
	token := hex.EncodeToString(buf)

	s.mu.Lock()
	s.tokens[token] = a
	s.mu.Unlock()
	return token
}

func (s *sessions) lookup(token string) (Account, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	a, ok := s.tokens[token]
	return a, ok
}

func (s *sessions) revoke(token string) {
	s.mu.Lock()
	delete(s.tokens, token)
	s.mu.Unlock()
}

const accountKey = "account"

func bearerToken(c *gin.Context) string {
	token, ok := strings.CutPrefix(c.GetHeader("Authorization"), "Bearer ")
	if !ok {
		return ""
	}
	return token
}

func (s *server) requireAuth(c *gin.Context) {
	account, ok := s.sessions.lookup(bearerToken(c))
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	c.Set(accountKey, account)
	c.Next()
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (s *server) login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	userOK := subtle.ConstantTimeCompare([]byte(req.Username), []byte(demoUsername)) == 1
	passOK := subtle.ConstantTimeCompare([]byte(req.Password), []byte(demoPassword)) == 1
	if !userOK || !passOK {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": s.sessions.create(demoAccount), "account": demoAccount})
}

func (s *server) logout(c *gin.Context) {
	s.sessions.revoke(bearerToken(c))
	c.Status(http.StatusNoContent)
}

func (s *server) me(c *gin.Context) {
	c.JSON(http.StatusOK, c.MustGet(accountKey))
}
