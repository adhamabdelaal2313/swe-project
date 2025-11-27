📦 Feature-First Architecture
How we structure the TeamFlow project

Our project uses a Feature-First Architecture, which means we organize the code by features, not by file types.

This keeps the project clean, scalable, and easy for multiple developers to work on simultaneously.

❌ What We Are NOT Doing (Layer-Based Structure)

This structure scatters files across folders based on type, which makes it harder to find related functionality:

src/
  components/
  pages/
  hooks/
  services/
  utils/
  styles/


In this structure, one feature (e.g., Tasks) might have files spread across 6+ folders.

✅ What We ARE Doing (Feature-First Structure)

All the files belonging to a specific feature are grouped together in one place:

src/
  features/
    auth/
      components/
      pages/
      api/
      types/
      styles/
    tasks/
      components/
      pages/
      api/
      types/
      styles/
    teams/
      components/
      pages/
      api/
      types/
      styles/
  shared/
    components/
    utils/
    hooks/
    styles/

🎯 Why This Architecture Is Better
✔ Easier teamwork

Each teammate can take a feature folder and work independently.

✔ Fewer merge conflicts

Feature isolation means fewer overlapping files during development.

✔ Cleaner and more scalable

Adding a new feature = adding a new folder.
No need to modify 6 different directories.

✔ Easier to explain in final project defense

“Our architecture is feature-based, which keeps each feature modular and self-contained.”

This is exactly what TAs want to hear.

📁 Example: TeamFlow Folder Structure
src/
  features/
    auth/
      LoginPage.tsx
      RegisterPage.tsx
      authAPI.ts
      authTypes.ts
      AuthStyles.scss

    tasks/
      TaskList.tsx
      TaskDetails.tsx
      tasksAPI.ts
      taskTypes.ts
      TaskStyles.scss

    teams/
      MembersPage.tsx
      InviteMembers.tsx
      teamsAPI.ts
      teamTypes.ts
      TeamStyles.scss

  shared/
    components/
      Navbar.tsx
      Sidebar.tsx

    styles/
      variables.scss

    utils/
      fetcher.ts

📌 Development Rule

▶ Every new feature = its own folder inside src/features/
▶ Every bug fix or feature must be done in its own branch
▶ Shared components must go in src/shared/

This keeps the project consistent for everyone.