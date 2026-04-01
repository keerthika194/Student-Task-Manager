const Database = require('better-sqlite3');
const db = new Database('taskmanager.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    avatar TEXT DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    due_date TEXT,
    user_id INTEGER,
    assigned_by INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(assigned_by) REFERENCES users(id)
  );
`);

// Add columns if they don't exist (for existing DBs)
try { db.exec(`ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT NULL`); } catch {}
try { db.exec(`ALTER TABLE tasks ADD COLUMN assigned_by INTEGER`); } catch {}

module.exports = db;