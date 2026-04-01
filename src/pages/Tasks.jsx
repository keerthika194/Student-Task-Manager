import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import $ from 'jquery';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [charCount, setCharCount] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!token) return navigate('/');
    fetchTasks();
    if (isAdmin) fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const url = isAdmin
        ? 'http://localhost:5000/api/tasks/all'
        : 'http://localhost:5000/api/tasks';
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(res.data);
      setTimeout(() => {
        $('.task-row').each(function(i) {
          $(this).delay(i * 60).fadeIn(250);
        });
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:5000/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(res.data.filter(u => u.role === 'student'));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Task title is required';
    else if (form.title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (isAdmin && !editId && !form.assigned_to) newErrors.assigned_to = 'Please assign to a student';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      $('.task-form-card').addClass('shake');
      setTimeout(() => $('.task-form-card').removeClass('shake'), 500);
      return;
    }
    try {
      if (editId) {
        await axios.put(
          `http://localhost:5000/api/tasks/${editId}`,
          { ...form, status: 'pending' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditId(null);
      } else {
        await axios.post(
          'http://localhost:5000/api/tasks',
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });
      setErrors({});
      setCharCount(0);
      fetchTasks();
    } catch {
      setErrors({ title: 'Something went wrong. Try again.' });
    }
  };

  const handleDelete = async (id) => {
    $(`#task-${id}`).fadeOut(250, async () => {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    });
  };

  const handleComplete = async (task) => {
    await axios.put(
      `http://localhost:5000/api/tasks/${task.id}`,
      { ...task, status: task.status === 'completed' ? 'pending' : 'completed' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchTasks();
  };

  const handleEdit = (task) => {
    setEditId(task.id);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date || '',
      assigned_to: task.user_id || ''
    });
    setCharCount((task.description || '').length);
    $('html, body').animate({ scrollTop: 0 }, 400);
  };

  const handleLogout = () => {
    Cookies.remove('authToken');
    Cookies.remove('userRole');
    localStorage.clear();
    navigate('/');
  };

  const handleSearch = (e) => {
    const val = e.target.value.toLowerCase();
    $('.task-row').each(function() {
      const text = $(this).text().toLowerCase();
      if (text.includes(val)) $(this).fadeIn(150);
      else $(this).fadeOut(150);
    });
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'high') return t.priority === 'high';
    return true;
  });

  return (
    <>
      <style>{`
        .tasks-wrap { min-height: 100vh; background: #0a0a0f; }
        .bg-mesh {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse at 80% 20%, rgba(124,106,247,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 80%, rgba(167,139,250,0.05) 0%, transparent 50%);
        }
        .dark-nav {
          background: rgba(10,10,15,0.95); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 1rem 2rem; position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-brand { font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 800; background: linear-gradient(135deg, #7c6af7, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .nav-actions { display: flex; gap: 0.6rem; align-items: center; }
        .nav-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #8888aa; padding: 0.45rem 1rem; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; transition: all 0.2s; }
        .nav-btn:hover { color: #f0f0f8; border-color: #7c6af7; background: rgba(124,106,247,0.1); }
        .nav-btn.active { color: #a78bfa; border-color: #7c6af7; background: rgba(124,106,247,0.12); }
        .nav-btn.danger { color: #ff4d6d; border-color: rgba(255,77,109,0.2); }
        .nav-btn.danger:hover { background: rgba(255,77,109,0.1); }
        .nav-btn.admin-btn { color: #f5a623; border-color: rgba(245,166,35,0.3); background: rgba(245,166,35,0.08); }
        .content { position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 2rem 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .page-title { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; color: #f0f0f8; }
        .admin-tag { background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.3); color: #f5a623; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
        .task-form-card { background: #16161f; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; transition: border-color 0.3s; }
        .form-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #f0f0f8; margin-bottom: 1.2rem; }
        .form-grid { display: grid; grid-template-columns: 2fr 2fr 1fr 1fr; gap: 0.75rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
        .dark-label { color: #8888aa; font-size: 0.8rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
        .dark-input { background: #111118; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; color: #f0f0f8; padding: 0.65rem 0.9rem; width: 100%; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; transition: border-color 0.2s, box-shadow 0.2s; outline: none; }
        .dark-input:focus { border-color: #7c6af7; box-shadow: 0 0 0 3px rgba(124,106,247,0.2); }
        .dark-input::placeholder { color: #8888aa; }
        .dark-input option { background: #16161f; }
        .dark-input.input-error { border-color: rgba(255,77,109,0.5); }
        .field-error { color: #ff4d6d; font-size: 0.75rem; }
        .form-actions { display: flex; gap: 0.6rem; margin-top: 1rem; }
        .btn-accent { background: linear-gradient(135deg, #7c6af7, #a78bfa); color: white; border: none; padding: 0.65rem 1.4rem; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; }
        .btn-accent:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,106,247,0.35); }
        .btn-cancel { background: transparent; color: #8888aa; border: 1px solid rgba(255,255,255,0.08); padding: 0.65rem 1.2rem; border-radius: 10px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; font-size: 0.9rem; }
        .btn-cancel:hover { color: #f0f0f8; border-color: #7c6af7; }
        .report-btn { background: rgba(34,201,122,0.1); border: 1px solid rgba(34,201,122,0.25); color: #22c97a; padding: 0.45rem 1rem; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; transition: all 0.2s; text-decoration: none; display: inline-block; }
        .report-btn:hover { background: rgba(34,201,122,0.2); color: #22c97a; }
        .dark-card { background: #16161f; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .toolbar { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; align-items: center; }
        .search-input { background: #111118; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; color: #f0f0f8; padding: 0.5rem 1rem; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; outline: none; transition: border-color 0.2s; width: 220px; }
        .search-input:focus { border-color: #7c6af7; }
        .search-input::placeholder { color: #8888aa; }
        .filter-btn { padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.82rem; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: #8888aa; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .filter-btn:hover { color: #f0f0f8; border-color: #7c6af7; }
        .filter-btn.active { background: rgba(124,106,247,0.15); border-color: #7c6af7; color: #a78bfa; }
        .dark-table { width: 100%; border-collapse: collapse; }
        .dark-table th { color: #8888aa; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.07); text-align: left; }
        .dark-table td { padding: 0.9rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #f0f0f8; font-size: 0.875rem; vertical-align: middle; }
        .dark-table tr:last-child td { border-bottom: none; }
        .task-row { display: none; }
        .dark-table tr.task-row:hover td { background: rgba(255,255,255,0.02); }
        .badge { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 500; }
        .badge-high { background: rgba(255,77,109,0.12); color: #ff4d6d; border: 1px solid rgba(255,77,109,0.25); }
        .badge-medium { background: rgba(245,166,35,0.12); color: #f5a623; border: 1px solid rgba(245,166,35,0.25); }
        .badge-low { background: rgba(34,201,122,0.12); color: #22c97a; border: 1px solid rgba(34,201,122,0.25); }
        .badge-completed { background: rgba(34,201,122,0.12); color: #22c97a; border: 1px solid rgba(34,201,122,0.25); }
        .badge-pending { background: rgba(136,136,170,0.12); color: #8888aa; border: 1px solid rgba(136,136,170,0.2); }
        .action-btn { width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
        .action-btn.complete { background: rgba(34,201,122,0.12); color: #22c97a; }
        .action-btn.complete:hover { background: rgba(34,201,122,0.25); transform: scale(1.1); }
        .action-btn.edit { background: rgba(124,106,247,0.12); color: #a78bfa; }
        .action-btn.edit:hover { background: rgba(124,106,247,0.25); transform: scale(1.1); }
        .action-btn.delete { background: rgba(255,77,109,0.12); color: #ff4d6d; }
        .action-btn.delete:hover { background: rgba(255,77,109,0.25); transform: scale(1.1); }
        .actions-cell { display: flex; gap: 0.4rem; }
        .empty-state { text-align: center; padding: 3rem; color: #8888aa; }
        .empty-icon { font-size: 3rem; display: block; margin-bottom: 0.75rem; }
        .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.07); border-top-color: #7c6af7; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 4rem auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } }
        .shake { animation: shake 0.4s ease; }
        @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="tasks-wrap">
        <div className="bg-mesh" />
        <nav className="dark-nav">
          <div className="nav-brand">Task Manager</div>
          <div className="nav-actions">
            <span className="nav-btn" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span className="nav-btn active">Tasks</span>
            <span className="nav-btn" onClick={() => navigate('/profile')}>Profile</span>
            {isAdmin && <span className="nav-btn admin-btn" onClick={() => navigate('/admin')}>Admin</span>}
            <span className="nav-btn danger" onClick={handleLogout}>Logout</span>
          </div>
        </nav>

        <div className="content">
          <div className="page-header">
            <div className="page-title">{isAdmin ? 'Manage Tasks' : 'My Tasks'}</div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              {!isAdmin && (
                <a href={`http://localhost:5000/report?token=${token}`} target="_blank" rel="noreferrer" className="report-btn">
                  Export Report
                </a>
              )}
              {isAdmin && <span className="admin-tag">Admin View</span>}
            </div>
          </div>

          <div className="task-form-card">
            <div className="form-title">
              {editId ? 'Edit Task' : isAdmin ? 'Assign Task to Student' : 'Add New Task'}
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group">
                  <label className="dark-label">Title</label>
                  <input
                    className={`dark-input ${errors.title ? 'input-error' : ''}`}
                    placeholder="Task title..."
                    value={form.title}
                    onChange={e => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: '' }); }}
                  />
                  {errors.title && <span className="field-error">{errors.title}</span>}
                </div>
                <div className="form-group">
                  <label className="dark-label">Description ({charCount}/200)</label>
                  <input
                    className="dark-input"
                    placeholder="Optional..."
                    maxLength={200}
                    value={form.description}
                    onChange={e => {
                      setForm({ ...form, description: e.target.value });
                      setCharCount(e.target.value.length);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="dark-label">Priority</label>
                  <select className="dark-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="dark-label">Due Date</label>
                  <input type="date" className="dark-input" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
              </div>

              {isAdmin && !editId && (
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="dark-label">Assign to Student</label>
                  <select
                    className={`dark-input ${errors.assigned_to ? 'input-error' : ''}`}
                    value={form.assigned_to}
                    onChange={e => { setForm({ ...form, assigned_to: e.target.value }); setErrors({ ...errors, assigned_to: '' }); }}
                  >
                    <option value="">Select a student</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                  {errors.assigned_to && <span className="field-error">{errors.assigned_to}</span>}
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-accent">
                  {editId ? 'Update Task' : isAdmin ? 'Assign Task' : 'Add Task'}
                </button>
                {editId && (
                  <button type="button" className="btn-cancel" onClick={() => {
                    setEditId(null);
                    setForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });
                    setErrors({});
                    setCharCount(0);
                  }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="dark-card">
            <div className="toolbar">
              <input className="search-input" placeholder="Search tasks..." onChange={handleSearch} />
              {['all', 'pending', 'completed', 'high'].map(f => (
                <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : f === 'completed' ? 'Completed' : 'High Priority'}
                  {' '}({f === 'all' ? tasks.length : tasks.filter(t =>
                    f === 'pending' ? t.status === 'pending' :
                    f === 'completed' ? t.status === 'completed' :
                    t.priority === 'high'
                  ).length})
                </button>
              ))}
            </div>

            {loading ? <div className="spinner" /> : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>No tasks found.</p>
              </div>
            ) : (
              <table className="dark-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    {isAdmin && <th>Assigned To</th>}
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(t => (
                    <tr key={t.id} id={`task-${t.id}`} className="task-row">
                      <td style={{ fontWeight: 500 }}>{t.title}</td>
                      {isAdmin && <td style={{ color: '#8888aa' }}>{t.user_name}</td>}
                      <td style={{ color: '#8888aa' }}>{t.description || '—'}</td>
                      <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                      <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                      <td style={{ color: '#8888aa' }}>{t.due_date || '—'}</td>
                      <td>
                        <div className="actions-cell">
                          {!isAdmin && (
                            <button className="action-btn complete" onClick={() => handleComplete(t)}>✓</button>
                          )}
                          <button className="action-btn edit" onClick={() => handleEdit(t)}>✏️</button>
                          <button className="action-btn delete" onClick={() => handleDelete(t.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}