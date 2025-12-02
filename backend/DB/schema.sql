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