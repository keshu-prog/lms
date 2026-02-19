# Mini LMS Module (CRM Integrated)

## Overview

This project is a simplified Learning Management System (LMS) developed as a module inside a larger CRM ecosystem.

The system demonstrates:

- Clean backend architecture
- Scalable relational database design
- API-first approach
- JWT-based authentication
- Role-based access control (RBAC)
- Video progress tracking
- Reporting and analytics

The API is designed to serve multiple portals:
- Admin CRM
- Student Portal
- Future Mobile Applications

---

# Tech Stack

## Backend
- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma ORM

## Frontend
- React (Admin + Student Portal)

## Security
- JWT Authentication
- bcrypt password hashing
- Role-based access control

---

# Project Structure

```
aaft/
│
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── adminUserseed.ts
│   │   ├── logs/
│   │   ├── src/
│   │   │   ├── core/
│   │   │   │   ├── config.ts
│   │   │   │   ├── db.ts
│   │   │   │   └── logger.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── rbac.ts
│   │   │   │   └── error.ts
│   │   │   ├── controllers/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── students.ts
│   │   │   │   ├── courses.ts
│   │   │   │   ├── lessons.ts
│   │   │   │   ├── enrollments.ts
│   │   │   │   ├── progress.ts
│   │   │   │   └── reports.ts
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── admin.routes.ts
│   │   │   │   └── student.routes.ts
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma.config.ts
│   │   └── .env
│   │
│   ├── frontend/
│   │   └── src/
│   │       ├── components/
│   │       │   ├── Sidebar.jsx
│   │       │   ├── Header.jsx
│   │       │   └── Modal.jsx
│   │       │
│   │       ├── layouts/
│   │       │   └── DashboardLayout.jsx
│   │       │
│   │       ├── pages/
│   │       │   ├── Landing.jsx
│   │       │   ├── AdminLogin.jsx
│   │       │   ├── StudentLogin.jsx
│   │       │   ├── Dashboard.jsx
│   │       │   ├── Students.jsx
│   │       │   ├── admin/
│   │       │   │   ├── Courses.jsx
│   │       │   │   └── Reports.jsx
│   │       │   └── student/
│   │       │       ├── Dashboard.jsx
│   │       │       └── MyCourses.jsx
│   │       │
│   │       ├── api.js
│   │       ├── App.jsx
│   │       ├── config.js
│   │       └── ProtectedRoute.jsx
│   │   ├── .env
│   │   └── package.json
│   └── package.json
│
└── README.md
```


# Installation Guide

## 1. Clone Repository

git clone https://github.com/keshu-prog/lms.git
cd lms

## 2. Backend Setup

cd apps/api
npm install

Run database migration:
npx prisma migrate dev --name init

For Admin users seeder
npx prisma db seed

npx prisma generate
npm run dev

## 3. Frontend Setup
cd apps/frontend
npm install
npm start


# Environment Variables
Backend:
Create `.env` inside `apps/api`:


Add : 


DATABASE_URL="postgresql://postgres:admin@localhost:5432/aaft_lms_crm"
JWT_SECRET=supersecret
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
PRISMA_CLI_QUERY_ENGINE_TYPE=binary

Frontend:
Create `.env` inside `apps/frontend`:

Add:
REACT_APP_BACKEND_URL=http://localhost:5000/api

# Architecture Decisions

## 1. Controller Structure

The backend follows a controller structure:

- Auth
- Users
- Courses
- Lessons
- Enrollments
- Progress
- Reports

Each module follows:

Controller → Data Access (Prisma)

This ensures separation of concerns and maintainability.

## 2. Authentication Strategy

JWT-based authentication was implemented because:

- Stateless architecture
- Suitable for scaling
- Works across multiple portals
- Easy integration with mobile apps

Separate login endpoints exist for:
- Admin
- Student


## 3. Role-Based Access Control

RBAC middleware ensures:

- Only Admins can access `/admin/*`
- Only Students can access `/student/*`

Role is embedded inside JWT payload.


## 4. Scalability Considerations

- Indexed frequently queried columns
- Avoided N+1 queries using Prisma include
- Pagination-ready endpoints
- Stateless authentication
- Clean API-first design


# Database Schema

## Tables

- users
- courses
- lessons
- enrollments
- videoprogress


# Entity Relationships

```
User
├── Enrollment ── Course ── Lesson
└── VideoProgress ── Lesson
```

# ER Diagram (Logical View)

```
+-----------+
|   User    |
+-----------+
      |
      | 1..*
      |
+-------------+
| Enrollment  |
+-------------+
      |
      | *..1
      |
+-----------+
|  Course   |
+-----------+
      |
      | 1..*
      |
+-----------+
|  Lesson   |
+-----------+
      |
      | 1..*
      |
+---------------+
| VideoProgress |
+---------------+
```

## User
Represents both:
    Admin
    Student

Key Fields:
    id
    name
    email
    password
    role (ADMIN / STUDENT)


Relationship
    User 1 → * Enrollment

Meaning:
    One user can enroll in multiple courses.
Example:
    Student A → enrolled in Course 1, Course 2
    Admin → manages system (no enrollment)



## Enrollment (Bridge Table)
This is a junction table between User and Course.
A student can enroll in many courses
A course can have many students

This is called a Many-to-Many relationship.
Instead of direct connection, we use Enrollment table.

Fields:
    id
    userId (FK → User)
    courseId (FK → Course)

Relationship:
    User 1 → * Enrollment
    Course 1 → * Enrollment


One User → many enrollments
One Course → many enrollments


## Course
Represents a learning course.

Fields:
    id
    name
    description


Relationship:
    Course 1 → * Lesson

One course contains multiple lessons.
Example:
    Course: "Node.js Mastery"
    Lessons:
    Intro
    Express
    Prisma
    Deployment



## Lesson
Represents individual video content inside a course.

Fields:
    id
    title
    videoUrl
    duration
    courseId

Relationship:
    Lesson 1 → * VideoProgress

Meaning:
    Each lesson can have multiple progress records (one per student).

## VideoProgress
Tracks student progress for each lesson.

Fields:
    userId
    lessonId
    timestamp
    percentage
    completed

Relationship:
    User 1 → * VideoProgress
    Lesson 1 → * VideoProgress

This allows:
    Resume from last timestamp
    Track completion %
    Mark complete at 90%


## Complete Relationship Flow
Student enrolls in a course
User → Enrollment → Course

Course contains lessons
Course → Lesson

Student watches lesson
User → VideoProgress → Lesson


# Security Implementation

- Password hashing using bcrypt
- JWT token expiration
- Role-based middleware
- Input validation
- SQL injection prevention (Prisma)
- HTTP security headers (Helmet)


# Reporting Capabilities

Admin can view:

- Student completion percentage
- Course-wise completion
- Videos completed
- Time spent analytics
