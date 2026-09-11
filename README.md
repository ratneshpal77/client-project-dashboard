# Real-Time Client Project Dashboard

A full-stack internal client project management dashboard with role-based access control, task tracking, real-time activity feeds, notifications, and WebSocket presence.

## Tech Stack

### Frontend

* React
* TypeScript
* React Router
* Socket.IO Client

### Backend

* Node.js
* Express
* TypeScript
* Socket.IO
* Prisma

### Database

* PostgreSQL

### Background Jobs

* node-cron

## Architecture

```text
React + TypeScript
        |
        | REST API
        v
Express API
        |
        +---- Middleware
        |       |
        |       +---- JWT Authentication
        |       +---- Role Authorization
        |
        +---- Controllers
        |
        +---- Services
        |
        +---- Prisma
        |       |
        |       v
        |    PostgreSQL
        |
        +---- Socket.IO
                |
                +---- User Rooms
                +---- Project Rooms
                +---- Activity Events
                +---- Notification Events
                +---- Presence
```

## Roles

### Admin

* Full client access
* Full project access
* Full task access
* View global activity
* View online user count

### Project Manager

* Create and manage own projects
* Create and manage tasks in own projects
* Assign developers
* View activity from own projects

### Developer

* View assigned tasks
* Update assigned task status
* Cannot access another developer's tasks
* Cannot manage projects
* Cannot reassign or delete tasks

Authorization is enforced on the backend API. Frontend role hiding is not used as the security mechanism.

## Authentication

JWT authentication uses:

* Short-lived access token
* Long-lived refresh token
* Refresh token stored in an HttpOnly cookie

Access tokens are never used as the refresh-token storage mechanism.

## WebSocket Decision

Socket.IO was selected instead of native WebSocket because it provides connection management, room support, automatic reconnection, acknowledgements, and a simpler event-based API for this dashboard.

Project-specific rooms are used for activity events:

```text
project:<projectId>
```

User-specific rooms are used for notifications:

```text
user:<userId>
```

This makes it possible to send events only to authorized users.

## Real-Time Activity Flow

```text
User updates task
      |
      v
Task Service
      |
      +---- Update Task
      |
      +---- Create Activity in PostgreSQL
      |
      +---- Emit activity-created
                  |
                  v
          project:<projectId>
```

Activity records are persisted before being used for the historical feed.

When a user reconnects, the latest 20 authorized activities are fetched directly from PostgreSQL.

## Real-Time Notifications

When a task is assigned:

```text
Task assignment
      |
      +---- Notification stored in DB
      |
      +---- notification-created
      |
      +---- unread-count-updated
```

The same mechanism is used when a task moves to `IN_REVIEW`.

## Presence

Socket connections are tracked in memory using a map of:

```text
userId -> active socket IDs
```

This counts unique currently connected users.

The server broadcasts:

```text
presence-count
```

whenever a user connects or disconnects.

This in-memory presence is intended for the single-instance deployment used by this assessment. A distributed production deployment would use Redis or another shared presence store.

## Background Job

`node-cron` is used for overdue tasks because the requirement only needs a lightweight scheduled job.

The scheduler periodically finds tasks where:

```text
dueDate < current time
status != DONE
isOverdue = false
```

and marks them as:

```text
isOverdue = true
```

The overdue calculation therefore does not depend on page load.

## Database Design

Main tables:

```text
User
Client
Project
Task
Activity
Notification
RefreshToken
```

Relationships:

```text
Client
  |
  +---- Project
           |
           +---- Task
           |      |
           |      +---- Activity
           |      +---- Notification
           |
           +---- Activity

User
  |
  +---- Projects
  +---- Assigned Tasks
  +---- Activities
  +---- Notifications
  +---- Refresh Tokens
```

Foreign keys are enforced through Prisma relations.

## Indexing

Indexes are used on frequently queried fields:

* `Project.clientId`
* `Project.createdBy`
* `Project.managerId`
* `Task.projectId`
* `Task.assignedDeveloperId`
* `Task.status`
* `Task.priority`
* `Task.dueDate`
* `Task.isOverdue`
* Activity `(projectId, createdAt)`
* Activity `(taskId, createdAt)`
* Activity `(userId, createdAt)`
* Notification `(userId, isRead)`
* Notification `(userId, createdAt)`

These indexes support project filtering, developer task lookup, overdue jobs, activity feeds, and unread notification queries.

## Local Setup

### 1. Clone repository

```bash
git clone <repository-url>
cd client-project-dashboard
```

### 2. Start PostgreSQL

Docker is recommended.

```bash
docker compose up -d
```

### 3. Install backend dependencies

```bash
cd Backend
npm install
```

### 4. Configure environment variables

Create:

```text
.env
```

Required variables include:

```env
DATABASE_URL=your_postgresql_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

PORT=5000
```

Never commit `.env`.

### 5. Run Prisma migrations

```bash
npx prisma migrate dev
```

### 6. Generate Prisma client

```bash
npx prisma generate
```

### 7. Seed database

```bash
npm run seed
```

### 8. Start backend

```bash
npm run dev
```

### 9. Start frontend

```bash
npm install
npm run dev
```

## Seed Accounts

### Admin

```text
admin@agency.com
Admin@123
```

### Project Managers

```text
pm1@agency.com
Manager@123

pm2@agency.com
Manager@123
```

### Developers

```text
dev1@agency.com
dev2@agency.com
dev3@agency.com
dev4@agency.com
Developer@123
```

These credentials are development seed data only and must not be used in production.

## API Examples

### Projects

```text
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
```

### Tasks

```text
POST   /api/projects/:projectId/tasks
GET    /api/projects/:projectId/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

Task filtering:

```text
?status=IN_PROGRESS
?priority=HIGH
?fromDate=2026-09-01
?toDate=2026-09-30
```

### Activity

```text
GET /api/activities/recent
GET /api/projects/:projectId/activities
GET /api/tasks/:taskId/activities
```

### Notifications

```text
GET   /api/notifications
GET   /api/notifications/unread-count
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
```

### Dashboard

```text
GET /api/dashboard/admin
GET /api/dashboard/project-manager
GET /api/dashboard/developer
```

## Known Limitations

The current presence implementation is in-memory and therefore intended for a single backend instance. A horizontally scaled deployment should use a shared presence store such as Redis.

Socket.IO project rooms enforce authorization before joining a room.

Historical activity data is fetched from PostgreSQL, so reconnection does not depend on in-memory event history.

## Architectural Decisions

The application separates:

```text
Routes
Controllers
Services
Database
Socket Layer
Jobs
Validators
```

Business rules are placed in services rather than controllers.

All protected REST endpoints use backend authentication and role authorization.

All important state changes are persisted in PostgreSQL before being exposed through the real-time layer.
