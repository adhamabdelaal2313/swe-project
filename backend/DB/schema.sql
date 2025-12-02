-- Active: 1764506551927@@shortline.proxy.rlwy.net@25116
USE teamflow_project;

DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'TODO',     -- Stores: 'TODO', 'IN_PROGRESS', 'DONE'
  priority VARCHAR(10) DEFAULT 'MEDIUM', -- Stores: 'LOW', 'MEDIUM', 'HIGH'
  team VARCHAR(50) DEFAULT 'General',
  assignee VARCHAR(50) DEFAULT 'Unassigned',
  tags VARCHAR(255),                     -- Stores tags like 'Dev,API'
  due_date VARCHAR(20),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Add the 'teams' table definition (required for POST /team)
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fix 2: Define the 'activities' table (for logging)
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);