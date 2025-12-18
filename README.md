# TeamFlow - Feature-First Project Management

TeamFlow is a modern, collaborative project management tool built with a focus on simplicity, security, and developer productivity. It follows a **Feature-First Architecture** to ensure the codebase remains clean, scalable, and easy to maintain.

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

### 2. Database Configuration
1. Import `backend/DB/schema.sql` into your MySQL server.
2. Create a `.env` file in the `backend` folder:
   ```env
   DATABASE_URL=mysql://root:password@localhost:3306/teamflow_project
   JWT_SECRET=your_super_secret_key
   PORT=5000
   ```

### 3. Running the Project
```bash
# Run Backend (from /backend)
npm run dev

# Run Frontend (from /frontend)
npm run dev
```

### 4. Running Tests
```bash
# Backend Tests
cd backend && npm test

# Frontend Tests
cd frontend && npm test
```

---

## 🚀 Deployment

TeamFlow is optimized for production deployment as a single unified service.

### 1. Unified Production Build
The project is configured so the Backend serves the Frontend. To build the entire project for production:
```bash
npm run build
```

### 2. Deployment Platforms (Railway, Render, etc.)
- **Railway:** Connect your GitHub repo. Railway will automatically detect the root `package.json`, run the build, and start the server.
- **Render:** Create a new **Web Service**, connect your repo, and use `npm run build` as the build command and `npm start` as the start command.

### 3. Required Environment Variables
Ensure the following are set in your production environment:
- `DATABASE_URL`: Your MySQL connection string (e.g., `mysql://user:pass@host:port/db`).
- `JWT_SECRET`: A long, random string for securing sessions.
- `PORT`: Usually provided automatically by the platform (defaults to 3000).

---

## 🧪 Testing Strategy

The project includes a comprehensive suite of tests to ensure stability:
- **Backend (Jest/Supertest):** Tests API endpoints, database interactions, and authentication middleware.
- **Frontend (Vitest/RTL):** Tests component rendering, user interactions, and state management.

To run all tests: `npm run test` (from root).
