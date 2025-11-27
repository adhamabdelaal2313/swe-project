🌿 Git Branching Guide

For TeamFlow Development

This guide explains how our team should create, use, and merge branches.
Following this keeps our GitHub history clean and makes Phase 1/2 grading easier.

📌 1. Branch Naming Rules

Always name branches like this:

feature/<name>
bugfix/<name>
hotfix/<name>
refactor/<name>
docs/<name>
page/<name>

Examples:
feature/auth-login
feature/tasks-api
bugfix/fix-sidebar
docs/update-readme

📌 2. How to Create a Branch
Create AND switch to new branch:
git checkout -b feature/your-branch-name

📌 3. How to Switch Between Branches
git checkout branch-name


Example:

git checkout main

📌 4. How to Update Your Branch With Latest Changes

Before you start working each day, run:

git checkout main
git pull origin main
git checkout feature/your-branch
git merge main


This prevents conflicts later.

📌 5. How to Commit Properly
Save changes:
git add .

Commit with a descriptive message:
git commit -m "Add task list UI component"


Bad commit messages:
❌ “fix”
❌ “update”
❌ “stuff”

Good commit messages:
✔ “Implement login validation”
✔ “Refactor taskTable into reusable component”
✔ “Fix null error in tasksAPI”

📌 6. Push Your Branch to GitHub
git push -u origin feature/your-branch