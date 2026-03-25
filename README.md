# Nexus - Feature-First Project Management

Nexus is a modern, collaborative project management tool built with a focus on simplicity, security, and developer productivity. It follows a **Feature-First Architecture** to ensure the codebase remains clean, scalable, and easy to maintain.

Prod Link: https://swe-project-indol.vercel.app/dashboard OR https://swe-project-production.up.railway.app/portal
---

## 🚀 Core Features

### 1. Secure Authentication & Authorization
- **JWT Protection:** Secure sessions using JSON Web Tokens.
- **Password Hashing:** Industry-standard `bcryptjs` hashing for user passwords.
- **Route Protection:** Backend middleware ensures only authenticated users can access sensitive data.

### 2. Feature-First Architecture
- Organized by features (Auth, Tasks, Teams, Dashboard) rather than technical layers, making the codebase scalable and easy to navigate.

### 3. Advanced Task Management
- **Kanban Board:** Interactive task movement across columns (To Do, In Progress, Done).
- **Unified Task System:** Centralized task logic shared between list views and Kanban boards.
- **Smart Filtering:** Search and filter tasks by status, team, or priority.

### 4. Team Collaboration
- **Team Membership:** Link users to specific teams with dedicated roles (Owner, Admin, Member).
- **Collaborative Tasks:** Assign tasks to specific team members using robust foreign-key relationships.
- **Activity Logging:** Automatic tracking of key actions (logins, task creation, etc.) for transparency.

### 5. Interactive Dashboard
- **Real-time Stats:** Instant overview of task completion rates and team performance.
- **Activity Feed:** Live stream of recent team actions.
- **Quick Actions:** Create tasks and teams instantly from any view.

---

## 🛠️ Tech Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite, Lucide React.
- **Backend:** Node.js, Express, MySQL 8.
- **Security:** JWT, BcryptJS, Joi (Validation).
- **Testing:** Jest & Supertest (Backend), Vitest & React Testing Library (Frontend).
- **CI/CD:** GitHub Actions.

---

## 📋 Project Specifications & Requirements

### Functional Requirements
- **User Management:** Secure registration, login/logout, and password hashing.
- **Task Management:** Full CRUD operations for tasks with properties like Title, Description, Status, and Priority.
- **Kanban Board:** Visual drag-and-drop-style status updates for tasks.
- **Team Management:** Create teams, assign owners, and invite members via email.
- **Dashboard:** Display real-time task statistics and a live activity feed.

### Non-Functional Requirements
- **Security:** All private API endpoints are protected by JWT middleware.
- **Performance:** Dashboard statistics and task lists load in under 1 second.
- **Scalability:** Feature-First structure allows adding new modules without bloating existing folders.
- **Responsiveness:** Fully functional on both desktop and mobile web browsers.

---

## 📦 Feature-First Architecture
Our project organizes code by **features**, not by file types. This keeps related functionality together and reduces merge conflicts.

### Folder Structure
```text
swe-project/
├── backend/
│   └── src/
│       ├── portal/      # Authentication & User Management
│       ├── tasks/       # Task Logic & CRUD
│       ├── teams/       # Team & Membership Management
│       ├── dashboard/   # Stats & Activity Feed
│       └── middleware/  # Auth & Security Middlewares
├── frontend/
│   └── src/
│       ├── portal/      # Login, Register & Auth Context
│       ├── tasks/       # Task Lists & Modals
│       ├── kanban/      # Kanban Board UI
│       ├── teams/       # Team Management UI
│       └── dashboard/   # Dashboard Analytics
```

---

## 📥 Setup Instructions

### 1. Installation
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Running the Project
```bash
# Run Backend (from /backend)
npm run dev

# Run Frontend (from /frontend)
npm run dev
```

### 3. Running Tests
```bash
# Backend Tests
cd backend && npm test

# Frontend Tests
cd frontend && npm test
```

---

## 🚀 Deployment

Nexus is optimized for production deployment as a single unified service.

### 1. Unified Production Build
The project is configured so the Backend serves the Frontend. To build the entire project for production:
```bash
npm run build
```

### 2. Deployment Platforms

#### Railway (Backend)

#### Vercel (Frontend)
---

## 🧪 Testing

The project includes example tests demonstrating unit, integration, and system testing approaches:
- **Unit Tests**: Component functions, utilities, and validation schemas
- **Integration Tests**: API endpoints with mocked database
- **System Tests**: End-to-end user flows

To run tests:
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# All tests
npm run test
```

## 📚 Documentation

Comprehensive documentation is available in [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md), covering:
- Architecture overview and design patterns
- Complete API reference
- Database schema documentation
- Authentication and security details
- Development and deployment guides
- Troubleshooting and best practices
