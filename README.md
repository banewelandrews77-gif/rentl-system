# HostelConnect GH

Hostel marketplace platform for Ghana student housing. Connects students with verified landlords and rental agents.

## Stack

- **Backend:** Java 17, Spring Boot 3.x, PostgreSQL, Redis, JWT, Flyway
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS

## Prerequisites

- JDK 17+
- Node.js 18+
- **PostgreSQL 15+** and **Redis 7+** (see below — with or without Docker)
- Maven 3.8+

## Quick start

### 1. Start database and Redis

**Option A — Using Docker (recommended)**

If you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed, use:

```powershell
docker compose up -d
```

(On older setups the command may be `docker-compose up -d`.)

**Option B — Without Docker: PostgreSQL only (easiest)**

You can run the backend with **only PostgreSQL**; Redis is optional. OTP and login lockout will use an in-memory store (resets when the app restarts).

1. **PostgreSQL**
   - Download: https://www.postgresql.org/download/windows/
   - Install (remember the password for user `postgres`).
   - Create the database (in pgAdmin or `psql`):
     ```sql
     CREATE DATABASE hostelconnect;
     ```
2. **Start the backend with the `no-redis` profile** (no Redis required):
   ```powershell
   cd backend
   $env:DATABASE_PASSWORD="your_postgres_password"
   mvn spring-boot:run "-Dspring-boot.run.profiles=no-redis"
   ```

**Option C — Without Docker: PostgreSQL + Redis**

If you want Redis (e.g. for OTP/lockout that survive restarts), install PostgreSQL as above and install Redis (e.g. [Memurai](https://www.memurai.com/) on Windows, or Redis in WSL). Then start the backend without the `no-redis` profile and set `REDIS_HOST`/`REDIS_PORT` if needed.

### 2. Backend

Use the **Maven Wrapper** (`mvnw.cmd`) so you don’t need Maven on PATH (avoids conflicts with Python’s `mvn` script):

```powershell
cd backend
# If you don't have Redis (no Docker): set profile first
$env:SPRING_PROFILES_ACTIVE = "no-redis"
# If your PostgreSQL password is not "postgres":
# $env:DATABASE_PASSWORD = "your_password"

.\mvnw.cmd spring-boot:run
```

First run may download the Maven wrapper and Maven itself. Ensure **JAVA_HOME** is set to a JDK 17+ (e.g. `$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"`).

- API: http://localhost:8080  
- Swagger UI: http://localhost:8080/swagger-ui.html  
- Default admin (created on first run): **admin@hostelconnect.gh** / **Admin@123**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:3000

### 4. Environment (optional)

**Backend** (`backend/` or env vars):

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/hostelconnect` | PostgreSQL URL |
| `DATABASE_USERNAME` | `postgres` | DB user |
| `DATABASE_PASSWORD` | `postgres` | DB password |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `JWT_SECRET` | (dev default) | Min 256-bit secret in production |
| `ADMIN_EMAIL` | `admin@hostelconnect.gh` | Seed admin email |
| `SENDGRID_API_KEY` | (empty) | Email (OTP); leave empty for no email |

**Frontend** (`frontend/.env.local`):

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` | Backend API base URL |

## Phase 1 (current)

- Customer and agent registration with email verification (OTP)
- Login with JWT; role-based redirect (Customer / Agent / Admin)
- Forgot password and reset password (OTP)
- Account lockout after 5 failed logins (15 min)
- Protected dashboards: Customer, Agent, Admin shells
- Admin seeded on first run

## Testing Phase 1

1. **Customer:** Register → verify email (check console/logs if mail not configured) → login → Customer dashboard.
2. **Agent:** Register as agent → verify email → login → Agent dashboard (UNVERIFIED).
3. **Admin:** Login with admin@hostelconnect.gh / Admin@123 → Admin panel.
4. **Lockout:** Fail login 5 times → 6th attempt shows lockout message.

## Next phases

- **Phase 2:** Agent ID verification (upload, admin review, approve/reject)
- **Phase 3:** Hostel listing CRUD and photos
- **Phase 4:** Public browse, search, map
- **Phase 5:** Interest/inquiry and contact reveal
- **Phase 6:** Admin dashboard and user/listing management
- **Phase 7:** Security, rate limiting, deployment

See the Product Requirements Document (PRD) for full scope.
