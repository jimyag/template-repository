package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"

	"github.com/jimyag/template-repository/internal/web/store"
)

func do(t *testing.T, router *gin.Engine, method, path, token string, body any) *httptest.ResponseRecorder {
	t.Helper()

	var buf bytes.Buffer
	if body != nil {
		if err := json.NewEncoder(&buf).Encode(body); err != nil {
			t.Fatalf("encode body: %v", err)
		}
	}
	req := httptest.NewRequest(method, path, &buf)
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	return rec
}

func decode[T any](t *testing.T, rec *httptest.ResponseRecorder) T {
	t.Helper()

	var v T
	if err := json.Unmarshal(rec.Body.Bytes(), &v); err != nil {
		t.Fatalf("decode response %q: %v", rec.Body.String(), err)
	}
	return v
}

func login(t *testing.T, router *gin.Engine) string {
	t.Helper()

	rec := do(t, router, http.MethodPost, "/api/auth/login", "", loginRequest{Username: "admin", Password: "admin123"})
	if rec.Code != http.StatusOK {
		t.Fatalf("login status = %d, want %d", rec.Code, http.StatusOK)
	}
	return decode[struct{ Token string }](t, rec).Token
}

func TestLoginRejectsWrongPassword(t *testing.T) {
	router := NewRouter()

	rec := do(t, router, http.MethodPost, "/api/auth/login", "", loginRequest{Username: "admin", Password: "nope"})
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusUnauthorized)
	}
}

func TestProtectedRoutesRequireToken(t *testing.T) {
	router := NewRouter()

	for _, path := range []string{"/api/auth/me", "/api/users", "/api/dashboard"} {
		if rec := do(t, router, http.MethodGet, path, "", nil); rec.Code != http.StatusUnauthorized {
			t.Errorf("GET %s status = %d, want %d", path, rec.Code, http.StatusUnauthorized)
		}
	}
}

func TestLogoutRevokesToken(t *testing.T) {
	router := NewRouter()
	token := login(t, router)

	if rec := do(t, router, http.MethodGet, "/api/auth/me", token, nil); rec.Code != http.StatusOK {
		t.Fatalf("me status = %d, want %d", rec.Code, http.StatusOK)
	}
	do(t, router, http.MethodPost, "/api/auth/logout", token, nil)
	if rec := do(t, router, http.MethodGet, "/api/auth/me", token, nil); rec.Code != http.StatusUnauthorized {
		t.Fatalf("me after logout status = %d, want %d", rec.Code, http.StatusUnauthorized)
	}
}

func TestListUsersFiltersAndPaginates(t *testing.T) {
	router := NewRouter()
	token := login(t, router)

	rec := do(t, router, http.MethodGet, "/api/users?page=2&pageSize=5&status=active", token, nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
	}
	res := decode[store.ListResult](t, rec)
	if res.Page != 2 || res.PageSize != 5 || len(res.Items) != 5 {
		t.Fatalf("page=%d pageSize=%d len=%d, want 2/5/5", res.Page, res.PageSize, len(res.Items))
	}
	for _, u := range res.Items {
		if u.Status != store.StatusActive {
			t.Fatalf("user %d status = %q, want active", u.ID, u.Status)
		}
	}

	res = decode[store.ListResult](t, do(t, router, http.MethodGet, "/api/users?q=turing", token, nil))
	if res.Total != 1 || res.Items[0].Name != "Alan Turing" {
		t.Fatalf("search result = %+v, want only Alan Turing", res)
	}
}

func TestUserCRUD(t *testing.T) {
	router := NewRouter()
	token := login(t, router)

	in := store.UserInput{Name: "New User", Email: "new@example.com", Role: "editor", Status: "active"}
	rec := do(t, router, http.MethodPost, "/api/users", token, in)
	if rec.Code != http.StatusCreated {
		t.Fatalf("create status = %d, want %d", rec.Code, http.StatusCreated)
	}
	created := decode[store.User](t, rec)

	if rec := do(t, router, http.MethodPost, "/api/users", token, in); rec.Code != http.StatusConflict {
		t.Fatalf("duplicate email status = %d, want %d", rec.Code, http.StatusConflict)
	}

	path := "/api/users/" + strconv.FormatInt(created.ID, 10)
	in.Name = "Renamed"
	rec = do(t, router, http.MethodPut, path, token, in)
	if rec.Code != http.StatusOK || decode[store.User](t, rec).Name != "Renamed" {
		t.Fatalf("update status = %d body = %s", rec.Code, rec.Body.String())
	}

	if rec := do(t, router, http.MethodDelete, path, token, nil); rec.Code != http.StatusNoContent {
		t.Fatalf("delete status = %d, want %d", rec.Code, http.StatusNoContent)
	}
	if rec := do(t, router, http.MethodGet, path, token, nil); rec.Code != http.StatusNotFound {
		t.Fatalf("get after delete status = %d, want %d", rec.Code, http.StatusNotFound)
	}
}

func TestCreateUserValidatesInput(t *testing.T) {
	router := NewRouter()
	token := login(t, router)

	rec := do(t, router, http.MethodPost, "/api/users", token, store.UserInput{Email: "bad", Role: "root"})
	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusUnprocessableEntity)
	}
	fields := decode[struct{ Fields map[string]string }](t, rec).Fields
	for _, key := range []string{"name", "email", "role", "status"} {
		if fields[key] == "" {
			t.Errorf("missing validation error for %q", key)
		}
	}
}

func TestNewRouterFallsBackToSPA(t *testing.T) {
	router := NewRouter()

	rec := do(t, router, http.MethodGet, "/users/1", "", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
	}
	if !strings.Contains(rec.Body.String(), `<div id="root"></div>`) {
		t.Fatalf("body = %q, want SPA index content", rec.Body.String())
	}
}

func TestNewRouterDoesNotFallbackForUnknownAPIPath(t *testing.T) {
	router := NewRouter()

	if rec := do(t, router, http.MethodGet, "/api/does-not-exist", "", nil); rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusNotFound)
	}
}
