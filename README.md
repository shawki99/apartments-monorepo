# Apartments Monorepo

A full-stack apartment listing application built with modern technologies and containerized for seamless development and deployment.

## 🏗️ Architecture Overview

```
apartments-monorepo/
├── backend/          # Node.js + TypeScript + Express API
├── frontend/         # Next.js + React + TypeScript Web App
├── infra/            # Infrastructure documentation
└── docker-compose.yml # Multi-environment orchestration
```

### Tech Stack

**Backend:**
- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js with async/await patterns
- **Database**: PostgreSQL 16 with TypeORM
- **Validation**: Zod schemas for type-safe validation
- **Logging**: Pino with HTTP request logging
- **Security**: CORS, Rate limiting, Input validation

**Frontend:**
- **Framework**: Next.js 15 with App Router (SSR)
- **UI Library**: React 19 + TypeScript
- **Styling**: Tailwind CSS + styled-jsx
- **Build Tool**: Turbopack for fast development

**Infrastructure:**
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL 16 with persistent volumes
- **Networking**: Bridge network with health checks
- **Development**: Hot reload with file watching

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd apartments-monorepo

# Start development stack
docker compose --profile dev up --build

# Access the applications
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# Health Check: http://localhost:4000/health
```

### Production Environment

```bash
# Start production stack
docker compose --profile prod up --build -d

# Monitor logs
docker compose --profile prod logs -f
```

## 📊 API Documentation

### Base URL
- **Development**: `http://localhost:4000`
- **Production**: Configure via `NEXT_PUBLIC_API_URL`

### Authentication
Currently no authentication required (rate-limited endpoints available).

### Endpoints

#### 🏠 **GET /api/apartments**
Retrieve paginated list of apartments with search and filtering capabilities.

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 12, max: 100) - Items per page
- `q` (string, optional) - Search across unitName, unitNumber, project
- `unitName` (string, optional) - Filter by unit name
- `unitNumber` (string, optional) - Filter by unit number
- `project` (string, optional) - Filter by project name

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-string",
      "unitName": "Nile View Deluxe",
      "unitNumber": "A-101",
      "project": "Palm Heights",
      "price": "2500000.00",
      "city": "Cairo",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "page": 1,
  "limit": 12,
  "total": 25,
  "hasMore": true
}
```

#### 🏠 **GET /api/apartments/:id**
Retrieve details of a specific apartment.

**Parameters:**
- `id` (string, required) - Apartment UUID

**Response:**
```json
{
  "id": "uuid-string",
  "unitName": "Nile View Deluxe",
  "unitNumber": "A-101",
  "project": "Palm Heights",
  "price": "2500000.00",
  "city": "Cairo",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### 🏠 **POST /api/apartments**
Create a new apartment listing.

**Rate Limited**: 10 requests per minute per IP

**Request Body:**
```json
{
  "unitName": "Garden Residence",
  "unitNumber": "B-204",
  "project": "Green Park",
  "price": "1850000.00",
  "city": "Giza"
}
```

**Validation Rules:**
- `unitName`: 1-120 characters, required
- `unitNumber`: 1-60 characters, required
- `project`: 1-120 characters, required
- `price`: Numeric value, supports string/number input
- `city`: 1-80 characters, defaults to "Cairo"

**Response (201 Created):**
```json
{
  "id": "new-uuid-string",
  "unitName": "Garden Residence",
  "unitNumber": "B-204",
  "project": "Green Park",
  "price": "1850000.00",
  "city": "Giza",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Error Responses

**400 Bad Request** - Validation errors:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "unitName",
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

**404 Not Found:**
```json
{
  "error": "Apartment not found"
}
```

**429 Too Many Requests:**
```json
{
  "error": "Rate limit exceeded"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## 🔧 Environment Configuration

### Backend Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@postgres:5432/apartments

# Server Configuration
PORT=4000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Node Environment
NODE_ENV=development

# Optional: Pagination
PAGINATION_DEFAULT_LIMIT=12
```

### Frontend Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# Next.js Configuration
NODE_ENV=development
```

## 🐳 Infrastructure

### Docker Architecture

**Multi-Stage Builds:**
- **Development**: Hot reload, source mounting, faster builds
- **Production**: Optimized builds, multi-stage, security-hardened

**Services:**
- **PostgreSQL**: Persistent data with health checks
- **Backend**: Express API with TypeScript compilation
- **Frontend**: Next.js SSR server with static optimization

**Networking:**
- Bridge network for inter-service communication
- Port mapping for external access
- Health checks for dependency management

### Key Features

- 🔄 **Hot Reload**: File changes trigger automatic restarts
- 📦 **Multi-Stage Builds**: Optimized production images
- 🏥 **Health Checks**: Service dependency management
- 📁 **Volume Persistence**: Database data survives restarts
- 🔒 **Security**: Non-root users, minimal attack surface
- 📊 **Logging**: Structured JSON logs with request tracing



## 🛠️ Development Workflow

### Local Development

```bash
# Start development environment
docker compose --profile dev up --build

# View logs
docker compose --profile dev logs -f [service-name]

# Access database
docker exec -it apartments-postgres psql -U user -d apartments

# Clean restart
docker compose down -v && docker compose --profile dev up --build
```

### Database Operations

```sql
-- View all apartments
SELECT * FROM apartments ORDER BY "createdAt" DESC;

-- Search apartments
SELECT * FROM apartments
WHERE "unitName" ILIKE '%deluxe%'
   OR "project" ILIKE '%palm%';
```

### Troubleshooting

**Common Issues:**
- **Port conflicts**: Check ports 3000, 4000, 5432 availability
- **Permission issues**: Verify Docker daemon access
- **Hot reload not working**: Ensure `CHOKIDAR_USEPOLLING=1`
- **Database connection**: Wait for PostgreSQL health check

**Health Check Commands:**
```bash
# Backend health
curl http://localhost:4000/health

# API functionality
curl http://localhost:4000/api/apartments

# Frontend accessibility
curl http://localhost:3000
```

## 📚 Additional Documentation

- **Infrastructure Guide**: [infra/README.md](./infra/README.md)
- **API Rate Limits**: 10 POST requests/minute, 100 GET requests/minute
- **Database Schema**: See [backend/src/entities/Apartment.ts](./backend/src/entities/Apartment.ts)

## 🎯 Next Steps

- **Authentication**: Add user management and JWT tokens
- **Validation**: Enhance frontend form validation
- **Testing**: Add unit and integration tests
- **Monitoring**: Implement Prometheus/Grafana
- **CI/CD**: Set up automated deployment pipeline
- **Performance**: Add caching and query optimization

---

**License**: MIT | **Maintainer**: Development Team