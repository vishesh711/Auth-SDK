# GitHub Actions Workflows

## CI Workflow (`ci.yml`)

Runs on every push and pull request:

- **Backend Linting**: Runs Ruff and Black checks
- **Backend Tests**: Runs pytest with PostgreSQL and Redis services
- **Frontend Linting**: Runs ESLint
- **Frontend Build**: Builds Next.js application
- **JavaScript SDK Build**: Builds and type-checks SDK
- **Python SDK Build**: Builds Python package
- **Docker Build**: Builds Docker images (no push)

## Release Workflow (`release.yml`)

Runs on version tags (e.g., `v1.0.0`):

- **Publish JavaScript SDK**: Publishes to npm
- **Publish Python SDK**: Publishes to PyPI
- **Docker Release**: Builds and pushes Docker images with version tags

## Docker Build Workflow (`docker-build.yml`)

Runs on pushes to main branch:

- Builds and pushes Docker images with commit SHA tags
- Also pushes `latest` tag for main branch

## Required Secrets

Configure these in GitHub repository settings:

- `JWT_PRIVATE_KEY`: Base64 encoded JWT private key (for tests)
- `JWT_PUBLIC_KEY`: Base64 encoded JWT public key (for tests)
- `APP_SECRET_ENCRYPTION_KEY`: Base64 encoded encryption key (for tests)
- `NPM_TOKEN`: npm authentication token
- `PYPI_TOKEN`: PyPI API token
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password or access token

