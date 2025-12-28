# TeamFlow - Comprehensive Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Functional Requirements](#functional-requirements)
3. [Non-Functional Requirements](#non-functional-requirements)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Feature Documentation](#feature-documentation)
7. [API Reference](#api-reference)
8. [Database Schema](#database-schema)
9. [Authentication & Security](#authentication--security)
10. [Testing Strategy](#testing-strategy)
---

## Architecture Overview

TeamFlow follows a **Feature-First Architecture** pattern, organizing code by business features rather than technical layers. This approach provides:

- **Better Scalability**: New features can be added without modifying existing code
- **Reduced Merge Conflicts**: Features are isolated in their own directories
- **Improved Maintainability**: Related code stays together
- **Clearer Code Organization**: Easy to locate feature-specific code

### Architecture Layers

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│  - UI Components                        │
│  - State Management (Context API)       │
│  - Routing (React Router)              │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST API
┌─────────────────▼───────────────────────┐
│      Backend (Node.js + Express)        │
│  - API Routes                           │
│  - Business Logic                       │
│  - Authentication Middleware            │
└─────────────────┬───────────────────────┘
                  │ SQL Queries
┌─────────────────▼───────────────────────┐
│      Database (MySQL)                 │
│  - User Data                            │
│  - Tasks & Teams                        │
│  - Activity Logs                        │
└─────────────────────────────────────────┘
```

---

## Functional Requirements

Functional requirements define what the system must do - the specific behaviors and features that TeamFlow must provide.

### 1. User Management
- **Secure Registration**: Users must be able to register with name, email, and password
- **Secure Login/Logout**: Users must be able to authenticate and log out securely
- **Password Hashing**: All passwords must be hashed using industry-standard bcryptjs before storage
- **User Authentication**: System must validate user credentials and issue JWT tokens
- **Session Management**: System must maintain secure user sessions using JWT tokens

### 2. Task Management
- **Create Tasks**: Users must be able to create tasks with the following properties:
  - Title (required)
  - Description (optional)
  - Status (TODO, IN_PROGRESS, DONE)
  - Priority (LOW, MEDIUM, HIGH)
  - Team association (optional)
  - Assignee (optional)
  - Tags (optional)
  - Due date (optional)
- **Read Tasks**: Users must be able to view all their tasks and filter by:
  - Team
  - Status
  - Assignee
  - Priority
- **Update Tasks**: Users must be able to modify task properties including:
  - Title
  - Description
  - Status
  - Priority
  - Team assignment
  - Assignee
  - Tags
  - Due date
- **Delete Tasks**: Users must be able to delete their own tasks
- **Task Visibility**: Users must only see tasks from teams they belong to or tasks assigned to them

### 3. Kanban Board
- **Visual Board Display**: System must display tasks in a Kanban board format with three columns:
  - To Do
  - In Progress
  - Done
- **Status Updates**: Users must be able to update task status through the Kanban board interface
- **Task Movement**: System must support drag-and-drop-style movement of tasks between columns
- **Team Filtering**: Users must be able to filter Kanban board by team
- **Real-time Updates**: Task status changes must be reflected immediately in the board

### 4. Team Management
- **Create Teams**: Users must be able to create teams with:
  - Team name (required)
  - Description (optional)
  - Accent color (optional)
- **Assign Team Owners**: System must assign creator as team owner
- **Invite Members**: Team owners/admins must be able to invite members via email
- **Member Roles**: System must support three role types:
  - Owner: Full control, can delete team
  - Admin: Can add/remove members, cannot delete team
  - Member: View-only access
- **Remove Members**: Team owners/admins must be able to remove members from teams
- **Delete Teams**: Team owners must be able to delete teams

### 5. Dashboard
- **Real-time Statistics**: System must display:
  - Total task count
  - Tasks by status (To Do, In Progress, Done)
  - Task completion rates
- **Activity Feed**: System must show a live stream of recent team actions including:
  - User logins
  - Task creation
  - Task updates
  - Team member additions
- **Quick Actions**: Dashboard must provide quick access to:
  - Create new task
  - Create new team
  - Navigate to other features

---

## Non-Functional Requirements

Non-functional requirements define how the system performs and what constraints it must operate under.

### 1. Security
- **JWT Protection**: All private API endpoints must be protected by JWT middleware
- **Password Security**: 
  - Passwords must be hashed using bcryptjs with salt rounds of 10
  - Plain text passwords must never be stored
  - Password validation must enforce complexity requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character (@$!%*?&)
- **SQL Injection Prevention**: All database queries must use parameterized statements
- **Input Validation**: All user input must be validated using Joi schemas
- **CORS Configuration**: System must properly configure CORS for production environment
- **Token Expiration**: JWT tokens must expire after 7 days

### 2. Performance
- **Dashboard Load Time**: Dashboard statistics and task lists must load in under 1 second
- **API Response Time**: API endpoints must respond within acceptable time limits
- **Database Query Optimization**: Database queries must be optimized for performance
- **Frontend Build Optimization**: Production builds must be optimized for fast loading

### 3. Scalability
- **Feature-First Architecture**: Codebase structure must allow adding new modules without bloating existing folders
- **Modular Design**: Features must be isolated and independently maintainable
- **Database Scalability**: Database schema must support growth in users, teams, and tasks
- **Code Organization**: Related code must stay together to reduce merge conflicts

### 4. Responsiveness
- **Desktop Support**: System must be fully functional on desktop web browsers
- **Mobile Support**: System must be fully functional on mobile web browsers
- **Responsive Design**: UI must adapt to different screen sizes and orientations
- **Touch-Friendly**: Mobile interfaces must support touch interactions

### 5. Reliability
- **Error Handling**: System must gracefully handle errors and provide user-friendly error messages
- **Data Integrity**: Database foreign key constraints must ensure data integrity
- **Activity Logging**: System must log important user actions for audit purposes
- **Transaction Support**: Critical operations must support database transactions

### 6. Maintainability
- **Code Documentation**: Code must be well-documented
- **Consistent Code Style**: Code must follow consistent style guidelines
- **Testing Coverage**: System must include unit, integration, and system tests
- **Feature Isolation**: Features must be isolated to allow independent updates

### 7. Usability
- **Intuitive Interface**: UI must be intuitive and easy to navigate
- **In-Place Editing**: Tasks must support in-place editing for better user experience
- **Visual Feedback**: System must provide visual feedback for user actions
- **Error Messages**: Error messages must be clear and actionable

### 8. Compatibility
- **Browser Support**: System must support modern web browsers
- **API Compatibility**: API must follow RESTful principles
- **Database Compatibility**: System must work with MySQL 8+

---

## Technology Stack

### Frontend
- **React 19**: Modern UI library with hooks and context API
- **TypeScript**: Type-safe JavaScript for better development experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **React Router**: Client-side routing for single-page application
- **Lucide React**: Modern icon library
- **Recharts**: Charting library for dashboard visualizations
- **Vitest**: Fast unit testing framework

### Backend
- **Node.js**: JavaScript runtime environment
- **Express 5**: Web application framework
- **MySQL2**: MySQL database driver with promise support
- **JWT (jsonwebtoken)**: Secure token-based authentication
- **BcryptJS**: Password hashing library
- **Joi**: Schema validation library
- **Jest**: Testing framework for backend
- **Supertest**: HTTP assertion library for API testing

### Development Tools
- **ESLint**: Code linting and quality checks
- **TypeScript**: Static type checking
- **Nodemon**: Auto-restart development server
- **Concurrently**: Run multiple npm scripts simultaneously

---

## Project Structure

```
swe-project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.config.js          # Database connection configuration
│   │   ├── portal/                   # Authentication feature
│   │   │   ├── portal.controller.js  # Business logic
│   │   │   └── portal.routes.js      # API routes
│   │   ├── tasks/                    # Task management feature
│   │   │   ├── tasks.controller.js
│   │   │   └── tasks.routes.js
│   │   ├── kanban/                   # Kanban board feature
│   │   │   └── kanban.routes.js
│   │   ├── teams/                    # Team management feature
│   │   │   ├── teams.controller.js
│   │   │   └── teams.routes.js
│   │   ├── dashboard/                # Dashboard feature
│   │   │   ├── dashboard.controller.js
│   │   │   └── dashboard.routes.js
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT authentication middleware
│   │   ├── utils/
│   │   │   └── activityLogger.js     # Activity logging utility
│   │   ├── tests/                    # Backend tests
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── system/
│   │   ├── index.js                  # Express app setup
│   │   └── server.js                 # Server entry point
│   ├── DB/
│   │   └── schema.sql                 # Database schema
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── portal/                   # Authentication UI
│   │   │   ├── portal.tsx            # Login/Register component
│   │   │   └── Context/
│   │   │       └── AuthContext.tsx   # Auth state management
│   │   ├── dashboard/                # Dashboard UI
│   │   │   ├── Dashboard.tsx
│   │   │   └── components/
│   │   ├── tasks/                    # Task list UI
│   │   │   ├── TaskList.tsx
│   │   │   └── TaskModal.tsx
│   │   ├── kanban/                   # Kanban board UI
│   │   │   └── Kanban.tsx
│   │   ├── teams/                    # Teams UI
│   │   │   └── Teams.tsx
│   │   ├── sidebar/                  # Navigation sidebar
│   │   │   └── sidebar.tsx
│   │   ├── context/
│   │   │   └── ThemeContext.tsx      # Dark/Light mode
│   │   ├── config/
│   │   │   └── api.ts                # API configuration
│   │   ├── test/                     # Frontend tests
│   │   │   ├── unit/
│   │   │   └── integration/
│   │   ├── app.tsx                   # Root component
│   │   └── main.tsx                  # Entry point
│   ├── public/
│   ├── dist/                         # Production build output
│   └── package.json
│
├── docs/
│   └── DOCUMENTATION.md              # This file
│
├── nixpacks.toml                    # Railway deployment config
├── vercel.json                       # Vercel deployment config
├── railway.json                      # Railway project config
└── README.md                         # Quick start guide
```

---

## Feature Documentation

### 1. Authentication System

#### Overview
TeamFlow uses JWT (JSON Web Tokens) for secure, stateless authentication. Users can register, login, and access protected resources using tokens.

#### Registration Flow
1. User submits registration form with name, email, and password
2. Backend validates input using Joi schema
3. Password is hashed using bcryptjs
4. User record is created in database
5. JWT token is generated and returned
6. Token is stored in localStorage on frontend

#### Login Flow
1. User submits email and password
2. Backend finds user by email
3. Password is verified against stored hash
4. JWT token is generated and returned
5. Token is stored in localStorage

#### Protected Routes
All API endpoints except `/api/portal/login` and `/api/portal/register` require authentication:
- Token must be sent in `Authorization` header: `Bearer <token>`
- Middleware validates token and extracts user information
- Invalid or missing tokens return 401 Unauthorized

#### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### 2. Task Management

#### Task Properties
- **Title**: Required, max 255 characters
- **Description**: Optional, max 1000 characters
- **Status**: TODO, IN_PROGRESS, or DONE
- **Priority**: LOW, MEDIUM, or HIGH
- **Team**: Optional association with a team
- **Assignee**: Optional user assignment
- **Tags**: Array of string tags
- **Due Date**: Optional date field

#### Task Operations
- **Create**: POST `/api/tasks` with task data
- **Read**: GET `/api/tasks` (all) or GET `/api/tasks/:id` (single)
- **Update**: PUT `/api/tasks/:id` with updated fields
- **Delete**: DELETE `/api/tasks/:id`

#### In-Place Editing
Tasks support in-place editing on both Task List and Kanban views:
- Click on title, description, status, or priority to edit
- Changes are saved automatically on blur or Enter key
- Dropdown menus for status and priority selection

### 3. Kanban Board

#### Overview
Visual board with three columns representing task statuses:
- **To Do**: Newly created tasks
- **In Progress**: Tasks currently being worked on
- **Done**: Completed tasks

#### Features
- Drag-and-drop style movement via arrow buttons
- Real-time status updates
- Team filtering support
- Task cards display priority, assignee, and tags
- In-place title editing

#### API Endpoints
- GET `/api/kanban/tasks` - Fetch all tasks for board
- GET `/api/kanban/tasks?team_id=X` - Filter by team
- PUT `/api/kanban/tasks/:id` - Update task status

### 4. Team Management

#### Team Properties
- **Title**: Required team name
- **Description**: Optional team description
- **Color**: Visual color identifier
- **Members**: Array of user memberships
- **Roles**: Owner, Admin, or Member

#### Team Operations
- **Create Team**: POST `/api/teams`
- **List Teams**: GET `/api/teams`
- **Add Member**: POST `/api/teams/:id/members`
- **Remove Member**: DELETE `/api/teams/:id/members/:userId`
- **Delete Team**: DELETE `/api/teams/:id` (Owner/Admin only)

#### Permissions
- **Owner**: Full control, can delete team
- **Admin**: Can add/remove members, cannot delete team
- **Member**: View-only access

### 5. Dashboard

#### Statistics
Real-time metrics displayed:
- Total Tasks: Count of all user's tasks
- To Do: Tasks with TODO status
- In Progress: Tasks with IN_PROGRESS status
- Completed: Tasks with DONE status

#### Activity Feed
Recent activity log showing:
- User actions (login, task creation, etc.)
- Timestamp information
- User attribution

#### Quick Actions
- Create new task
- Create new team
- Direct navigation to features

---

## API Reference

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: Set via `VITE_API_URL` environment variable

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Authentication (`/api/portal`)

**POST `/api/portal/register`**
- Register a new user
- Body: `{ name, email, password }`
- Returns: `{ user, token }`

**POST `/api/portal/login`**
- Authenticate existing user
- Body: `{ email, password }`
- Returns: `{ user, token }`

**POST `/api/portal/logout`**
- Logout user (logs activity)
- Requires: Authentication
- Body: `{ userId, email }`

#### Tasks (`/api/tasks`)

**GET `/api/tasks`**
- Fetch all tasks for authenticated user
- Query params: `?team_id=X` (optional filter)
- Returns: Array of task objects

**GET `/api/tasks/:id`**
- Fetch single task by ID
- Returns: Task object

**POST `/api/tasks`**
- Create new task
- Body: `{ title, description?, status?, priority?, team_id?, assignee_id?, tags?, due_date? }`
- Returns: `{ taskId }`

**PUT `/api/tasks/:id`**
- Update existing task
- Body: Partial task object with fields to update
- Returns: Success message

**DELETE `/api/tasks/:id`**
- Delete task
- Returns: Success message

#### Kanban (`/api/kanban`)

**GET `/api/kanban/tasks`**
- Fetch tasks for Kanban board
- Query params: `?team_id=X` (optional filter)
- Returns: Array of task objects

**PUT `/api/kanban/tasks/:id`**
- Update task status (for Kanban movement)
- Body: `{ status }` or `{ title }` or `{ priority }`
- Returns: Success message

#### Teams (`/api/teams`)

**GET `/api/teams`**
- Fetch all teams user is member of
- Returns: Array of team objects with member roles

**GET `/api/teams/:id`**
- Fetch single team details
- Returns: Team object with members

**POST `/api/teams`**
- Create new team
- Body: `{ title, description?, color? }`
- Returns: Team object

**POST `/api/teams/:id/members`**
- Add member to team
- Body: `{ email, role }`
- Returns: Success message

**DELETE `/api/teams/:id/members/:userId`**
- Remove member from team
- Returns: Success message

**DELETE `/api/teams/:id`**
- Delete team (Owner/Admin only)
- Returns: Success message

#### Dashboard (`/api/dashboard`)

**GET `/api/dashboard/stats`**
- Fetch dashboard statistics
- Returns: `{ totalTasks, todo, inProgress, completed, chartData? }`

**GET `/api/dashboard/activity`**
- Fetch recent activity feed
- Returns: Array of activity objects

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('TODO', 'IN_PROGRESS', 'DONE') DEFAULT 'TODO',
  priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
  team_id INT,
  assignee_id INT,
  tags JSON,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### Teams Table
```sql
CREATE TABLE teams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Team Members Table
```sql
CREATE TABLE team_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner', 'admin', 'member') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_membership (team_id, user_id)
);
```

### Activity Log Table
```sql
CREATE TABLE activity_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

---

## Authentication & Security

### JWT Token Structure
```json
{
  "id": 1,
  "name": "User Name",
  "email": "user@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Token Expiration
- Tokens expire after 7 days
- Frontend handles token refresh on app initialization
- Expired tokens result in 401 response and automatic logout

### Password Security
- Passwords are hashed using bcryptjs with salt rounds of 10
- Plain text passwords are never stored
- Password validation enforces complexity requirements

### CORS Configuration
- Development: Allows all origins
- Production: Configured via `FRONTEND_URL` environment variable
- Credentials are enabled for cookie support

### SQL Injection Prevention
- All database queries use parameterized statements
- User input is validated using Joi schemas
- No raw SQL string concatenation

---


## Testing Strategy

### Test Types

#### Unit Tests
- Test individual functions/components in isolation
- Mock external dependencies
- Fast execution
- Examples: Utility functions, React components, validation schemas

#### Integration Tests
- Test API endpoints with mocked database
- Verify request/response flow
- Test middleware integration
- Examples: API routes, database queries, authentication flow

#### System Tests
- Test complete user flows end-to-end
- Multiple API calls in sequence
- Real-world scenarios
- Examples: Registration → Login → Create Task → Delete Task

### Running Tests

**All Tests (Frontend + Backend)**
```bash
# From root directory
npm run test
```

**Frontend Tests Only**
```bash
# From root directory
npm run test:frontend

# OR from frontend directory
cd frontend
npm test
```

**Backend Tests Only**
```bash
# From root directory
npm run test:backend

# OR from backend directory
cd backend
npm test
```

**Watch Mode (Frontend - for development)**
```bash
cd frontend
npx vitest
```

**Run Specific Test Files**

Frontend:
```bash
cd frontend
npx vitest run src/test/unit/api.test.ts
npx vitest run src/test/integration/TaskFlow.test.tsx
```

Backend:
```bash
cd backend
npx jest src/tests/unit/validation.test.js
npx jest src/tests/integration/teams.test.js
npx jest src/tests/system/auth-flow.test.js
```

### Test Coverage Goals
- Unit tests: Core utilities and components
- Integration tests: All API endpoints
- System tests: Critical user flows

---

### Project-Specific Notes
- Feature-first architecture allows easy feature addition
- All API responses follow consistent JSON format
- Error messages are user-friendly and informative
- Activity logging tracks important user actions

---


