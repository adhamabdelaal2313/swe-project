# Project Design Diagrams

This document contains the design diagrams for TeamFlow. You can view these diagrams using a Mermaid-enabled Markdown viewer (like VS Code with Mermaid extension or GitHub).

## 1. UML Class Diagram
Shows the relationships between the core data entities.

```mermaid
classDiagram
    class User {
        +int id
        +string name
        +string email
        +string password
        +string role
        +datetime created_at
    }

    class Team {
        +int team_id
        +string team_name
        +string description
        +string accent_color
    }

    class TeamMember {
        +int id
        +int team_id
        +int user_id
        +string role
    }

    class Task {
        +int id
        +string title
        +string description
        +string status
        +string priority
        +int team_id
        +int assignee_id
        +string tags
        +date due_date
    }

    class Activity {
        +int id
        +string action
        +int user_id
        +string user_name
        +datetime created_at
    }

    User "1" --o "0..*" TeamMember : has
    Team "1" --o "0..*" TeamMember : contains
    Team "1" --o "0..*" Task : owns
    User "1" --o "0..*" Task : assigned_to
    User "1" --o "0..*" Activity : performs
```

## 2. Use-Case Diagram
Shows the interactions between different users and the system.

```mermaid
useCaseDiagram
    actor "Registered User" as U
    actor "Admin User" as A

    package TeamFlow {
        usecase "Login / Register" as UC1
        usecase "Create Task" as UC2
        usecase "Manage Kanban Board" as UC3
        usecase "Create Team" as UC4
        usecase "Add Team Members" as UC5
        usecase "View Analytics" as UC6
        usecase "Delete Any Task" as UC7
    }

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6

    A --> UC7
    A --|> U
```

## 3. Sequence Diagram: Authentication Flow
Shows the steps for a user to log in and receive a JWT.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Enters Email/Password
    Frontend->>Backend: POST /api/portal/login
    Backend->>Database: SELECT user WHERE email=?
    Database-->>Backend: User Data (Hashed Password)
    Backend->>Backend: bcrypt.compare(Password, Hash)
    
    alt Success
        Backend->>Backend: Generate JWT Token
        Backend-->>Frontend: 200 OK (JWT + User Info)
        Frontend->>Frontend: Store Token in LocalStorage
        Frontend-->>User: Redirect to Dashboard
    else Failure
        Backend-->>Frontend: 401 Unauthorized
        Frontend-->>User: Show Error Message
    end
```

## 4. Sequence Diagram: Task Creation
Shows how a task is created and logged.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthMiddleware
    participant TaskController
    participant Database
    participant ActivityLogger

    User->>Frontend: Clicks "Create Task"
    Frontend->>Backend: POST /api/tasks (JWT Header)
    Backend->>AuthMiddleware: Verify Token
    AuthMiddleware-->>Backend: Token Valid (req.user)
    Backend->>TaskController: createTask(body)
    TaskController->>Database: INSERT INTO tasks
    Database-->>TaskController: Task ID
    TaskController->>ActivityLogger: logActivity("Created Task")
    ActivityLogger->>Database: INSERT INTO activities
    TaskController-->>Frontend: 201 Created
    Frontend-->>User: Show Success & Update UI
```

