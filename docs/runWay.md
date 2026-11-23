# RunWay — How to Run the Project

This document explains how to run the Logistics Transit Warehouse
Operation and Maintenance System locally.

## 1. Prerequisites

- **Docker Desktop** (Linux engine running) — for PostgreSQL and the backend.
- **JDK 25** — only needed if you build the backend outside Docker.
- **Node.js 20+** — only needed for the frontend.

## 2. Run the backend + database with Docker

Open a terminal in the backend folder:

```powershell
cd "E:\Logistics Warehouse System\warehouse-project\warehouse-system"
```

### First time only

```powershell
# create your environment file (gitignored)
Copy-Item .env.example .env
```

### Build and start

```powershell
docker compose up -d --build
```

What happens automatically:

1. `db` (PostgreSQL 17) starts and waits until it is healthy.
2. `backend` builds (Maven + Temurin JDK 25) and starts.
3. **Flyway** runs migrations `V1`–`V6`, seeding roles and permissions
   (no user accounts — register the first admin, see below).

### Verify

```powershell
docker compose ps              # both services should be Up / healthy
docker compose logs -f backend # watch startup logs
```

| Service   | URL |
|-----------|-----|
| Backend API | http://localhost:8080 |
| Swagger UI  | http://localhost:8080/swagger-ui.html |
| Database    | localhost:5432 (db `logistics_db`, user `postgres`) |

### Register the first administrator

There are **no pre-seeded user accounts**. The first person to register
becomes the Administrator (this only works while no admin exists):

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/auth/register `
  -Method Post -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123","displayName":"System Administrator"}'
```

Then log in:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/auth/login `
  -Method Post -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'
```

The admin then creates accounts for the other roles via
`POST /api/v1/users` (WAREHOUSE_MANAGER, WAREHOUSE_EMPLOYEE,
SHIPMENT_MANAGER, VIEWER_AUDITOR).

> Tip: to seed demo users for testing, start the backend with
> `app.seed.enabled=true`.

## 4. Run the frontend (local, not Docker)

The frontend runs locally outside Docker and talks to the backend API.

```powershell
cd "E:\Logistics Warehouse System\warehouse-project\warehouse-system-frontend"

# first time
npm install

# start dev server
npm run dev
```

- Frontend: http://localhost:5173
- It calls the backend at `http://localhost:8080` (configured via
  `VITE_API_BASE_URL`).

## 5. Everyday commands

| Goal | Command |
|------|---------|
| Rebuild after code changes | `docker compose up -d --build` |
| Stop (keeps data) | `docker compose down` |
| Stop + wipe database | `docker compose down -v` |
| View backend logs | `docker compose logs -f backend` |
| Enter database shell | `docker compose exec db psql -U postgres -d logistics_db` |

## 6. Build / test the backend locally (outside Docker)

```powershell
cd "E:\Logistics Warehouse System\warehouse-project\warehouse-system"

$env:JAVA_HOME = "C:\Users\mouri\.jdks\jdk-25.0.5.1+2"

.\mvnw.cmd -Dmaven.test.skip=true package   # build, skip tests
.\mvnw.cmd test                            # run unit + integration tests
```
