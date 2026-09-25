<h1 align="center">template-repository</h1>

<p align="center">
  <strong>A Go project template for a CLI and a web service with an embedded React frontend.</strong>
</p>

<p align="center">
  <a href="https://github.com/jimyag/template-repository/actions/workflows/check.yaml"><img src="https://github.com/jimyag/template-repository/actions/workflows/check.yaml/badge.svg" alt="Check"></a>
  <a href="https://github.com/jimyag/template-repository/actions/workflows/release.yaml"><img src="https://github.com/jimyag/template-repository/actions/workflows/release.yaml/badge.svg" alt="Release"></a>
  <a href="https://codecov.io/gh/jimyag/template-repository"><img src="https://codecov.io/gh/jimyag/template-repository/branch/main/graph/badge.svg" alt="Codecov"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/jimyag/template-repository" alt="License"></a>
  <a href="https://github.com/jimyag/template-repository/releases"><img src="https://img.shields.io/github/v/release/jimyag/template-repository" alt="Latest Release"></a>
</p>

<p align="center">
  <a href="#whats-included">What's Included</a> ·
  <a href="#installation">Installation</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#development">Development</a> ·
  <a href="#release">Release</a>
</p>

---

template-repository is a starting point for Go projects that need both a command-line program and a web service. The web binary embeds a Vite-built React application, so the backend API and frontend can be distributed as a single executable.

The repository includes local development tasks, linting, tests with coverage, GitHub Actions, GoReleaser, and optional multi-architecture container images.

## What's Included

- **Two Go binaries**: a minimal CLI in `cmd/template-repository` and a Gin web service in `cmd/web`.
- **Embedded frontend**: React, React Router, Zustand, and Axios examples built with Vite and Bun, styled with shadcn/ui and Tailwind CSS.
- **Single-binary web delivery**: the production frontend is embedded into the Go web binary with `go:embed`.
- **Project checks**: golangci-lint, race-enabled Go tests, coverage upload, and build verification.
- **Release automation**: raw Linux, macOS, and Windows binaries, checksums, and optional amd64/arm64 container images.
- **Repository defaults**: issue templates, a pull request template, contribution guidance, a security policy, and Conventional Commits configuration.

## Installation

### From a release

Download a standalone binary and `checksums.txt` from [GitHub Releases](https://github.com/jimyag/template-repository/releases/latest). Release assets use these names:

```text
template-repository_<os>_<arch>
web_<os>_<arch>
```

### From source

```bash
go install github.com/jimyag/template-repository/cmd/template-repository@latest
go install github.com/jimyag/template-repository/cmd/web@latest
```

### Docker

```bash
docker pull ghcr.io/jimyag/template-repository:latest
docker pull ghcr.io/jimyag/template-repository-web:latest
```

## Quick Start

Requirements:

- Go `1.27+`
- The latest stable [Bun](https://bun.sh/)
- [Task](https://taskfile.dev/)

Install the development tools and build both binaries:

```bash
task deps
task build
```

Run the CLI example:

```bash
./bin/template-repository
```

Run the web example:

```bash
./bin/web
```

The server listens on `:8080` by default. Set `WEB_LISTEN_ADDR` to use another address:

```bash
WEB_LISTEN_ADDR=:3000 ./bin/web
```

The embedded frontend includes examples for dynamic and nested routes, shared Zustand state, Axios request states and cancellation, and controlled form validation. The Go server exposes:

- `GET /api/items`
- `GET /api/items/:id`

## Development

Start the Go API server:

```bash
go run ./cmd/web
```

In another terminal, start the Vite development server:

```bash
cd web-vite
bun install
bun run dev
```

Vite proxies `/api` requests to `http://localhost:8080`.

### Frontend UI conventions

Every frontend built from this template uses the same stack so projects look and behave alike:

- **Components**: [shadcn/ui](https://ui.shadcn.com/) (`new-york` style, Radix primitives), vendored in `web-vite/src/components/ui/`.
- **Styling**: Tailwind CSS v4. No per-project CSS files; compose utilities and the shared components.
- **Colors**: shadcn/ui `neutral` base color. The theme tokens live in `web-vite/src/index.css`; keep them identical across projects.
- **Icons**: [lucide-react](https://lucide.dev/).
- **Dark mode**: `.dark` class driven by `ThemeProvider` (light / dark / system), toggled by `ModeToggle`.

`web-vite/components.json` holds the shadcn/ui configuration. Add more components with:

```bash
cd web-vite
bunx shadcn@latest add dialog dropdown-menu table
```

Common tasks:

```bash
task deps
task lint
task test
task build
task release-snapshot
```

`task lint` runs golangci-lint. `task test` runs Go tests with the race detector and writes `coverage.txt`. `task build` builds the frontend and writes both Go binaries to `bin/`.

## Release

Push a `v*` tag to verify the project and publish raw Linux, macOS, and Windows binaries, `checksums.txt`, and the configured container images:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Run `task release-snapshot` before publishing to validate the GoReleaser configuration and local artifacts.

Projects that do not publish container images can remove `dockers_v2` from `.goreleaser.yml` and the Docker setup and login steps from `.github/workflows/release.yaml`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under the [Apache License 2.0](LICENSE).
