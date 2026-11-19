# Smart Workout Tracker

A full-stack workout and fitness tracking application for members, trainers, and administrators. Users can follow workout plans, record completed sessions, and review their fitness activity; trainers and administrators have tools for managing members and plans.

**Repository:** [Gagan-kc-10/Smart-Workout-Tracker](https://github.com/Gagan-kc-10/Smart-Workout-Tracker)

## Contents

- [Features](#features)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Database setup](#database-setup)
- [Run the application](#run-the-application)
- [API overview](#api-overview)
- [Useful commands](#useful-commands)
- [Security notes](#security-notes)

## Features

### Member

- Register, sign in, and manage a profile
- View a dashboard, workout plans, and fitness goals
- Start a workout, log exercises, and complete a session
- Review workout history and activity summaries

### Trainer

- View assigned members and their fitness information
- Review member workout history and progress
- Create and manage member workout plans

### Administrator

- View user and trainer summaries
- Create trainer accounts
- Review and manage workout plans and workout sessions

## Technology

- **Frontend:** React, Vite, React Router, Axios, Recharts
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Workout session/cache data:** Redis-compatible service (configured for `127.0.0.1:6379`)
- **Authentication:** JSON Web Tokens (JWT) and bcrypt password hashing

## Project structure

```text
Smart_Workout_Tracker/
├── backend/
│   ├── config/                 # MySQL and Redis connections
│   ├── middleware/             # Authentication and role checks
│   ├── routes/                 # Auth, workout, dashboard, and admin APIs
│   ├── scripts/                # Local account setup scripts
│   └── server.js               # Express API server
├── Database/
│   ├── MySQL/smart_workout_tracker/  # MySQL table, seed, and routine dumps
│   └── Reddis/                       # Redis data dump
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
├── package.json                # Backend dependencies
└── README.md
```

## Prerequisites

- Node.js and npm
- MySQL 8.0 or a compatible MySQL server
- A Redis-compatible service running locally on port `6379` (for example, Memurai on Windows)

## Getting started

### 1. Install dependencies

From the repository root:

```bash
npm install
cd frontend
npm install
cd ..
```

### 2. Configure the backend

Create `backend/.env` (this file is ignored by Git) and set your local database credentials and a private JWT signing secret:

```dotenv
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_workout_tracker
DB_PORT=3306
JWT_SECRET=replace_with_a_long_random_secret
```

The API currently uses a fixed local Redis address (`127.0.0.1:6379`); start your Redis-compatible service before starting the backend.

### 3. Set up MySQL

Create the `smart_workout_tracker` database, then import the SQL files as described in [Database setup](#database-setup).

### 4. Start the services

Open separate terminals from the repository root.

**Backend**

```bash
node backend/server.js
```

The API listens at `http://localhost:5000`.

**Frontend**

```bash
cd frontend
npm run dev
```

Vite prints the local frontend URL (normally `http://localhost:5173`). The frontend API client currently targets `http://localhost:5000/api`.

## Database setup

The SQL dumps are in `Database/MySQL/smart_workout_tracker/`. Create the database first:

```sql
CREATE DATABASE smart_workout_tracker;
```

In MySQL Workbench, select `smart_workout_tracker` as the active schema and run the following files in order so referenced tables exist before dependent tables:

1. `smart_workout_tracker_role.sql`
2. `smart_workout_tracker_user.sql`
3. `smart_workout_tracker_exercise.sql`
4. `smart_workout_tracker_workout_plan.sql`
5. `smart_workout_tracker_fitness_goal.sql`
6. `smart_workout_tracker_fitness_progress.sql`
7. `smart_workout_tracker_trainer_application.sql`
8. `smart_workout_tracker_trainer_assignment.sql`
9. `smart_workout_tracker_plan_exercise.sql`
10. `smart_workout_tracker_workout_session.sql`
11. `smart_workout_tracker_session_exercise.sql`
12. `smart_workout_tracker_routines.sql`

**Important:** The table dump files include `DROP TABLE` statements and sample-data inserts. Importing them can replace existing tables and data. Back up any database you need to keep before running them. The routines dump defines a function and a stored procedure after the tables are created.

## Run the application

1. Start MySQL and the Redis-compatible service.
2. Start the backend with `node backend/server.js`.
3. Start the frontend with `npm run dev` from `frontend/`.
4. Open the Vite URL and register a member account, or sign in with an account already present in your database.

To create an administrator locally, configure `ADMIN_PASSWORD` in your environment and run the script from the `backend` directory:

```powershell
cd backend
$env:ADMIN_PASSWORD = "<use-a-unique-strong-password>"
node scripts/createAdmin.js
Remove-Item Env:ADMIN_PASSWORD
cd ..
```

The script creates `admin@smartworkout.com` if that address does not already exist. Its password must be at least eight characters and include an uppercase letter, a lowercase letter, a number, and one of `@$!%*?&`.

## API overview

All API routes are served from `http://localhost:5000`.

| Area | Base path | Examples |
| --- | --- | --- |
| Authentication and profile | `/api/auth` | `POST /register`, `POST /login`, `GET /profile`, `PUT /profile`, `PUT /change-password` |
| Dashboard | `/api/dashboard` | `GET /:userId`, `GET /:userId/history`, `GET /:userId/goals` |
| Workouts | `/api/workouts` | Plans, starting and completing sessions, exercise logging, active sessions, and workout history |
| Administrator | `/api/admin` | User and trainer management; workout routes are under `/api/admin/workouts` |

Most account and management routes require a JWT bearer token, and administrative or trainer actions are role-restricted.

## Useful commands

Run these from the appropriate directory:

```bash
# Frontend production build
cd frontend
npm run build

# Frontend lint
npm run lint
```

## Security notes

- Never commit `.env` files, database credentials, production tokens, or real user data.
- Use a unique, strong `JWT_SECRET` and a strong administrator password.
- The SQL dumps contain sample records; review the data before using them outside a local development environment.
- The frontend API URL and Redis address are currently configured for local development and need configuration changes for a different deployment environment.
