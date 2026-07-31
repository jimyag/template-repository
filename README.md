# template-repository

A Go project template with a CLI and a web service that embeds a React frontend into a single binary. It includes Task-based local commands, golangci-lint, tests with coverage, GoReleaser, and optional multi-architecture container images.

[![Go Report Card](https://goreportcard.com/badge/github.com/jimyag/template-repository)](https://goreportcard.com/report/github.com/jimyag/template-repository)
[![codecov](https://codecov.io/gh/jimyag/template-repository/branch/main/graph/badge.svg)](https://codecov.io/gh/jimyag/template-repository)
[![License](https://img.shields.io/github/license/jimyag/template-repository)](LICENSE)
[![Release](https://img.shields.io/github/v/release/jimyag/template-repository)](https://github.com/jimyag/template-repository/releases)

## Installation

### From release

Download a standalone binary and `checksums.txt` from [Releases](https://github.com/jimyag/template-repository/releases). Release assets use these names:

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

## Usage

### CLI example

```bash
template-repository
```

### Web example

Run the Go web server:

```bash
go run ./cmd/web
```

The server listens on `:8080` by default. Override it with:

```bash
WEB_LISTEN_ADDR=:3000 go run ./cmd/web
```

The embedded frontend includes these example routes:

- `/`: home page
- `/dynamic`: list/detail/nested route example
- `/state`: Zustand shared state example
- `/api-demo`: axios request/loading/error/cancel example
- `/form`: controlled form and validation example

API endpoints exposed by the Go server:

- `GET /api/items`
- `GET /api/items/:id`

## Development

### Requirements

- Go `1.26+`
- Latest stable [Bun](https://bun.sh/)
- `task` for the convenience commands below

### Frontend development

Start the Go API server:

```bash
go run ./cmd/web
```

In another terminal, start the Vite dev server:

```bash
cd web-vite
bun install
bun run dev
```

Vite proxies `/api` to `http://localhost:8080`.

### Common commands

```bash
task deps
task lint
task test
task build
task release-snapshot
```

`task lint` runs golangci-lint for static analysis, import ordering, and formatting. `task build` installs frontend dependencies, builds the frontend, and writes both Go binaries to `bin/`.

## Release

Push a `v*` tag to run release verification and publish standalone Linux, macOS, and Windows binaries, checksums, and the configured container images:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Remove `dockers_v2` from `.goreleaser.yml` and the Docker setup/login steps from the release workflow for projects that do not publish container images.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[Apache 2.0](LICENSE)
