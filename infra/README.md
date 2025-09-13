# Infrastructure Documentation

## Architecture Overview

This apartments monorepo consists of:

- **Backend**: Node.js/TypeScript + Express + TypeORM + PostgreSQL (Port 4000)
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS (Port 3000)
- **Database**: PostgreSQL 16 (Port 5432)

## Quick Start

### Development Environment

```bash
# Clone the repository
git clone <repo-url>
cd apartments-monorepo

# Start development environment
docker compose --profile dev up --build

# Access the applications
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# Backend Health: http://localhost:4000/health
# PostgreSQL: localhost:5432
```

### Production Environment

```bash
# Start production environment
docker compose --profile prod up --build -d

# Check status
docker compose --profile prod ps

# View logs
docker compose --profile prod logs -f
```

## Service Details

### PostgreSQL Database
- **Image**: postgres:16-alpine
- **Container**: apartments-postgres
- **Port**: 5432
- **Database**: apartments
- **User**: user
- **Password**: password
- **Volume**: postgres_data (persistent)

### Backend Service
- **Development**:
  - Container: apartments-backend
  - Dockerfile: Dockerfile.dev
  - Hot reload: Enabled via volume mounts
  - Port: 4000

- **Production**:
  - Container: apartments-backend-prod
  - Dockerfile: Dockerfile (multi-stage)
  - Optimized build with minimal runtime

### Frontend Service
- **Development**:
  - Container: apartments-frontend
  - Dockerfile: Dockerfile.dev
  - Hot reload: Enabled with CHOKIDAR_USEPOLLING
  - Port: 3000

- **Production**:
  - Container: apartments-frontend-prod
  - Dockerfile: Dockerfile (multi-stage)
  - Next.js SSR server

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@postgres:5432/apartments
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NODE_ENV=development
```

## Networking

All services communicate through the `apartments-network` bridge network:
- Frontend calls Backend via service names in production
- External access via mapped ports (3000, 4000, 5432)

## Healthchecks

- **PostgreSQL**: `pg_isready` check every 10s
- **Backend**: HTTP check on `/health` endpoint every 30s
- **Frontend**: HTTP check on root path every 30s

## Data Persistence

- PostgreSQL data persisted in `postgres_data` volume
- Development: Source code mounted for hot reload
- Production: No volume mounts for security

## Common Commands

```bash
# Start development
docker compose --profile dev up --build

# Start production (detached)
docker compose --profile prod up --build -d

# Stop all services
docker compose down

# View logs
docker compose logs -f [service-name]

# Rebuild specific service
docker compose build [service-name]

# Access database
docker exec -it apartments-postgres psql -U user -d apartments

# Clean up everything (including volumes)
docker compose down -v
docker system prune -a
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 4000, 5432 are available
2. **Permission issues**: Check Docker daemon permissions
3. **Hot reload not working**: Verify `CHOKIDAR_USEPOLLING=1` is set
4. **Database connection**: Wait for PostgreSQL healthcheck to pass

### Checking Service Health

```bash
# Check all containers
docker compose ps

# Check specific service logs
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# Check backend health endpoint
curl http://localhost:4000/health

# Check frontend accessibility
curl http://localhost:3000
```

### Database Operations

```bash
# Connect to database
docker exec -it apartments-postgres psql -U user -d apartments

# View tables
\dt

# Check apartment data
SELECT * FROM apartment;
```

## Development Workflow

1. Make code changes in `backend/` or `frontend/`
2. Changes automatically reload in development containers
3. Database schema changes sync automatically (TypeORM synchronize: true)
4. Test endpoints via frontend or direct API calls

## Production Deployment

For production deployment:

1. Set appropriate environment variables
2. Use production profile: `docker compose --profile prod up -d`
3. Monitor logs and health endpoints
4. Set up reverse proxy (Nginx) if needed
5. Configure proper secrets management
6. Set up monitoring and alerting

## Next Steps

- **Security**: Implement proper secrets management
- **Monitoring**: Add Prometheus/Grafana monitoring
- **CI/CD**: Set up GitHub Actions for automated builds
- **Multi-arch**: Enable buildx for ARM64 support
- **Scaling**: Add horizontal scaling with load balancers