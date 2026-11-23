# Logistics Transit Warehouse Operation and Maintenance System

Backend: **Java 25 + Spring Boot 4**, PostgreSQL, Flyway, Spring Security (JWT).
Frontend: **React + TypeScript + Vite** (to be implemented).

## Prerequisites

- Docker Desktop (Linux engine running)
- JDK 25 (for building the backend outside Docker)
- Node.js 20+ (for the frontend, later)

## Run the backend + database with Docker

Run these from the `warehouse-system/` directory (where `docker-compose.yml` lives):

```powershell
cd warehouse-system

# 1. (first time) create the env file
Copy-Item .env.example .env

# 2. build and start
docker compose up --build
```

- Backend API: http://localhost:8080
- Swagger UI:  http://localhost:8080/swagger-ui.html
- Database:    PostgreSQL on localhost:5432 (db `logistics_db`, user `postgres`)

Stop: `docker compose down` (keeps data) · `docker compose down -v` (drops the volume).

## First-time setup (registration)

There are **no pre-seeded user accounts**. The first person to register becomes the **Administrator**:

```powershell
# Register the first admin (only works while no admin exists)
Invoke-RestMethod http://localhost:8080/api/v1/auth/register `
  -Method Post -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123","displayName":"System Administrator"}'
```

Then log in with those credentials, and use the admin **Users** endpoints
(`POST /api/v1/users`) to create accounts for other roles
(WAREHOUSE_MANAGER, WAREHOUSE_EMPLOYEE, SHIPMENT_MANAGER, VIEWER_AUDITOR).

> Tip: to seed demo users for testing, start the backend with `app.seed.enabled=true`.

## Build / test the backend locally (outside Docker)

```powershell
$env:JAVA_HOME = "C:\Users\mouri\.jdks\jdk-25.0.5.1+2"
.\mvnw.cmd -Dmaven.test.skip=true package   # build, skip tests
.\mvnw.cmd test                            # run unit + integration tests
```
