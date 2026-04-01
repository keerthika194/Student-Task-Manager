const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const SECRET = 'your_secret_key';

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/', auth, (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(req.user.id);
  res.json(tasks);
});

router.get('/all', auth, (req, res) => {
  const tasks = db.prepare(`
    SELECT tasks.*, users.name as user_name 
    FROM tasks JOIN users ON tasks.user_id = users.id
  `).all();
  res.json(tasks);
});

router.post('/', auth, (req, res) => {
  const { title, description, priority, due_date, assigned_to } = req.body;
  const targetUser = req.user.role === 'admin' && assigned_to ? assigned_to : req.user.id;
  const stmt = db.prepare('INSERT INTO tasks (title, description, priority, due_date, user_id, assigned_by) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run(title, description, priority, due_date, targetUser, req.user.id);
  res.json({ message: 'Task created' });
});

router.put('/:id', auth, (req, res) => {
  const { title, description, priority, due_date, status } = req.body;
  if (req.user.role === 'admin') {
    db.prepare('UPDATE tasks SET title=?, description=?, priority=?, due_date=?, status=? WHERE id=?')
      .run(title, description, priority, due_date, status, req.params.id);
  } else {
    db.prepare('UPDATE tasks SET title=?, description=?, priority=?, due_date=?, status=? WHERE id=? AND user_id=?')
      .run(title, description, priority, due_date, status, req.params.id, req.user.id);
  }
  res.json({ message: 'Task updated' });
});

router.delete('/:id', auth, (req, res) => {
  if (req.user.role === 'admin') {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  } else {
    db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  }
  res.json({ message: 'Task deleted' });
});

module.exports = router;