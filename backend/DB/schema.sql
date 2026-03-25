-- Drop tables in correct order to avoid FK errors
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create teams table
CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    accent_color VARCHAR(7) DEFAULT '#FFFFFF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create team_members table (Link table)
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INT,
    user_id INT,
    role VARCHAR(50) DEFAULT 'member', -- 'owner', 'admin', 'member'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (team_id, user_id)
);

-- Create tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'TODO',     -- 'TODO', 'IN_PROGRESS', 'DONE'
  priority VARCHAR(10) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
  team_id INT DEFAULT NULL,
  assignee_id INT DEFAULT NULL,
  tags VARCHAR(255),                     -- comma-separated tags
  due_date VARCHAR(20),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE SET NULL,
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create activities table
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  user_id INT,
  user_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert demo users (passwords are bcrypt hashed)
-- Admin: admin@nexus.com / admin123
-- Adham: A.ahmad2313@nu.edu.eg / (user's password)
-- Visitor: visitor@nexus.com / visitor123
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@nexus.com', '$2b$10$QW.peD.8B3yY0/l5MdFg5umfNWCAbjZBuZGA.YI.AB4CBbw.u0K.C', 'admin'),
('Adham', 'A.ahmad2313@nu.edu.eg', '$2b$10$q239TN7mKiT8UbZZmEXYBu26lPdiqkuNGeBAhs85Hz69sXRScqDIe', 'user'),
('Portfolio Visitor', 'visitor@nexus.com', '$2b$10$1PEDzv2M.W2o2WxsDIOY5uh5d/cugU1Bq.ho9uuEEUucFQs.Bob2W', 'user');

-- Insert demo teams
INSERT INTO teams (team_name, description, accent_color) VALUES
('Development', 'Core product development team', '#06b6d4'),
('Design', 'UI/UX and branding team', '#ec4899'),
('Marketing', 'Growth and outreach', '#f59e0b');

-- Assign members to teams
INSERT INTO team_members (team_id, user_id, role) VALUES 
(1, 2, 'member'),  -- Adham in Dev
(1, 3, 'member'),  -- Visitor in Dev
(2, 3, 'owner');   -- Visitor owns Design team

-- Insert demo tasks
INSERT INTO tasks (title, description, status, priority, team_id, assignee_id, tags, due_date) VALUES
('Migrate to Supabase', 'Move the database from Railway MySQL to Supabase PostgreSQL', 'DONE', 'HIGH', 1, 2, 'database,migration', '2024-03-25'),
('Setup Vercel Deployment', 'Configure vercel.json for monorepo support', 'DONE', 'HIGH', 1, 3, 'devops,vercel', '2024-03-25'),
('UI Theme Overhaul', 'Implement new brand colors and premium aesthetic', 'IN_PROGRESS', 'MEDIUM', 2, 3, 'frontend,design', '2024-04-01'),
('Task Analytics Dashboard', 'Create charts for task completion rates', 'TODO', 'LOW', 1, 3, 'frontend,analytics', '2024-04-10'),
('API Documentation', 'Write Swagger/OpenAPI docs for the backend', 'TODO', 'MEDIUM', 1, 2, 'backend,docs', '2024-04-15');

-- Insert initial activities
INSERT INTO activities (action, user_id, user_name) VALUES
('completed task "Migrate to Supabase"', 2, 'Adham'),
('joined team "Development"', 3, 'Portfolio Visitor'),
('created team "Design"', 3, 'Portfolio Visitor'),
('started working on "UI Theme Overhaul"', 3, 'Portfolio Visitor');
