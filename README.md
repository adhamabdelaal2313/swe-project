🚀 Day 1 — Environment Setup (No Coding Today)

Before we start development, every collaborator must have the following installed.

🛠 1. Install Node.js

Node.js is required to run React, TypeScript, and tooling.

Download (LTS version):
https://nodejs.org

Verify installation:

node -v
npm -v

🧩 2. Install Git

Required for version control and collaboration.

Download:
https://git-scm.com/downloads

Verify:

git --version

⚛️ 3. Install React + TypeScript Environment

We will develop the frontend with Vite + React + TypeScript.

Install Vite globally:

npm install -g vite


Install TypeScript globally:

npm install -g typescript
npm install -g ts-node


Verify:

tsc -v

🎨 4. Install SCSS (Sass)

We will use SCSS for styling.

Install Sass:

npm install -g sass


Verify:

sass --version

🧰 5. Install MySQL

MySQL will be used for storing tasks, users, and project data.

Windows installer (includes Workbench):
https://dev.mysql.com/downloads/installer/

Verify installation:

mysql --version

🖥️ 6. Install VS Code (Recommended)

Download:
https://code.visualstudio.com/

Recommended Extensions

Prettier — Code Formatter

ES7+ React Snippets

GitLens

TypeScript + JavaScript Essentials

SCSS IntelliSense

🌿 7. Clone the Repository

After accepting your GitHub invitation:

git clone https://github.com/adhamabdelaal2313/swe-project.git
cd swe-project


No coding today — only preparing the environment.

🔀 Branching Strategy (Starting Day 2)

To keep the project clean and professional:

Never push directly to main.

Create branches like:

feature/frontend-setup
feature/task-list
feature/database-setup
bugfix/navbar-crash


Push your work:

git push origin feature/your-branch-name


Submit a Pull Request and request review.

📦 Project Structure (Will Be Added as We Build)

Planned structure:

/backend
  /src
    controllers/
    routes/
    models/
    config/
  package.json

/frontend
  /src
    components/
    pages/
    features/
    styles/
  vite.config.ts
  package.json

/database
  schema.sql