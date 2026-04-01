const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const SECRET = 'your_secret_key';

router.get('/', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).send('Unauthorized');
  try {
    const user = jwt.verify(token, SECRET);
    const userData = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(user.id);
    const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(user.id);
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const high = tasks.filter(t => t.priority === 'high').length;
    res.render('report', { user: userData, tasks, completed, pending, high, date: new Date().toLocaleDateString() });
  } catch {
    res.status(401).send('Invalid token');
  }
});

module.exports = router;