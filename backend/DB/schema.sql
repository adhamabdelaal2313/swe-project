-- Active: 1764506551927@@shortline.proxy.rlwy.net@25116@teamflow_project
USE teamflow_project;

-- Drop tables if they exist
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS teams;

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
  
-- Create tasks table
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

-- Create activities table
CREATE TABLE activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  user_id INT,
  user_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE teams (
    team_id INT PRIMARY KEY AUTO_INCREMENT,
    team_name VARCHAR(100) NOT NULL,
    description VARCHAR(255), -- The text below the title (e.g., "Building beautiful...")
    accent_color VARCHAR(7) DEFAULT '#FFFFFF', -- Stores the hex code for the vertical bar (e.g., Cyan, Purple)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo users
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@teamflow.com', 'admin123', 'admin'),
('Adham', 'A.ahmad2313@nu.edu.eg', 'adhoma2026', 'user');