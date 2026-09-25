// Package store holds the in-memory data used by the example admin API.
// Replace it with a real database layer in your project.
package store

import (
	"errors"
	"fmt"
	"slices"
	"strings"
	"sync"
	"time"
)

var (
	ErrNotFound   = errors.New("not found")
	ErrEmailTaken = errors.New("email already in use")
)

const (
	RoleAdmin  = "admin"
	RoleEditor = "editor"
	RoleViewer = "viewer"

	StatusActive   = "active"
	StatusDisabled = "disabled"
)

type User struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
}

// UserInput is the writable subset of User.
type UserInput struct {
	Name   string `json:"name"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	Status string `json:"status"`
}

// Validate normalizes the input and returns a field → message map for invalid fields.
func (in *UserInput) Validate() map[string]string {
	in.Name = strings.TrimSpace(in.Name)
	in.Email = strings.ToLower(strings.TrimSpace(in.Email))

	errs := map[string]string{}
	if in.Name == "" {
		errs["name"] = "Name is required."
	}
	if !strings.Contains(in.Email, "@") {
		errs["email"] = "Email is invalid."
	}
	if !slices.Contains([]string{RoleAdmin, RoleEditor, RoleViewer}, in.Role) {
		errs["role"] = "Role must be admin, editor or viewer."
	}
	if !slices.Contains([]string{StatusActive, StatusDisabled}, in.Status) {
		errs["status"] = "Status must be active or disabled."
	}
	return errs
}

type ListQuery struct {
	Search   string
	Role     string
	Status   string
	Page     int
	PageSize int
}

type ListResult struct {
	Items    []User `json:"items"`
	Total    int    `json:"total"`
	Page     int    `json:"page"`
	PageSize int    `json:"pageSize"`
}

type Stats struct {
	Total    int `json:"total"`
	Active   int `json:"active"`
	Disabled int `json:"disabled"`
	Admins   int `json:"admins"`
}

type Users struct {
	mu     sync.RWMutex
	users  []User
	nextID int64
}

// NewUsers returns a store seeded with example users, newest first.
func NewUsers() *Users {
	s := &Users{nextID: 1}
	names := []string{
		"Ada Lovelace", "Alan Turing", "Grace Hopper", "Linus Torvalds", "Ken Thompson",
		"Dennis Ritchie", "Barbara Liskov", "Donald Knuth", "Margaret Hamilton", "Rob Pike",
		"Robert Griesemer", "Russ Cox", "Edsger Dijkstra", "John McCarthy", "Frances Allen",
		"Tim Berners-Lee", "Bjarne Stroustrup", "Guido van Rossum", "James Gosling", "Anders Hejlsberg",
		"Leslie Lamport", "Radia Perlman", "Vint Cerf", "Hedy Lamarr",
	}
	roles := []string{RoleViewer, RoleEditor, RoleViewer, RoleAdmin}
	base := time.Date(2026, 1, 1, 9, 0, 0, 0, time.UTC)
	for i, name := range names {
		status := StatusActive
		if i%5 == 4 {
			status = StatusDisabled
		}
		first := strings.ToLower(strings.Fields(name)[0])
		s.users = append(s.users, User{
			ID:        s.nextID,
			Name:      name,
			Email:     fmt.Sprintf("%s@example.com", first),
			Role:      roles[i%len(roles)],
			Status:    status,
			CreatedAt: base.Add(time.Duration(i) * 36 * time.Hour),
		})
		s.nextID++
	}
	slices.Reverse(s.users)
	return s
}

func (s *Users) List(q ListQuery) ListResult {
	s.mu.RLock()
	defer s.mu.RUnlock()

	search := strings.ToLower(strings.TrimSpace(q.Search))
	matched := make([]User, 0, len(s.users))
	for _, u := range s.users {
		if search != "" && !strings.Contains(strings.ToLower(u.Name), search) &&
			!strings.Contains(u.Email, search) {
			continue
		}
		if q.Role != "" && u.Role != q.Role {
			continue
		}
		if q.Status != "" && u.Status != q.Status {
			continue
		}
		matched = append(matched, u)
	}

	page := max(q.Page, 1)
	pageSize := q.PageSize
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}
	start := min((page-1)*pageSize, len(matched))
	end := min(start+pageSize, len(matched))

	return ListResult{Items: matched[start:end], Total: len(matched), Page: page, PageSize: pageSize}
}

func (s *Users) Get(id int64) (User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if i := s.indexOf(id); i >= 0 {
		return s.users[i], nil
	}
	return User{}, ErrNotFound
}

func (s *Users) Create(in UserInput) (User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.emailTaken(in.Email, 0) {
		return User{}, ErrEmailTaken
	}
	u := User{
		ID:        s.nextID,
		Name:      in.Name,
		Email:     in.Email,
		Role:      in.Role,
		Status:    in.Status,
		CreatedAt: time.Now().UTC(),
	}
	s.nextID++
	s.users = slices.Insert(s.users, 0, u)
	return u, nil
}

func (s *Users) Update(id int64, in UserInput) (User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	i := s.indexOf(id)
	if i < 0 {
		return User{}, ErrNotFound
	}
	if s.emailTaken(in.Email, id) {
		return User{}, ErrEmailTaken
	}
	u := &s.users[i]
	u.Name, u.Email, u.Role, u.Status = in.Name, in.Email, in.Role, in.Status
	return *u, nil
}

func (s *Users) Delete(id int64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	i := s.indexOf(id)
	if i < 0 {
		return ErrNotFound
	}
	s.users = slices.Delete(s.users, i, i+1)
	return nil
}

func (s *Users) Stats() Stats {
	s.mu.RLock()
	defer s.mu.RUnlock()

	st := Stats{Total: len(s.users)}
	for _, u := range s.users {
		if u.Status == StatusActive {
			st.Active++
		} else {
			st.Disabled++
		}
		if u.Role == RoleAdmin {
			st.Admins++
		}
	}
	return st
}

func (s *Users) indexOf(id int64) int {
	return slices.IndexFunc(s.users, func(u User) bool { return u.ID == id })
}

func (s *Users) emailTaken(email string, exceptID int64) bool {
	return slices.ContainsFunc(s.users, func(u User) bool {
		return u.Email == email && u.ID != exceptID
	})
}
