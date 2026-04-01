import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import $ from 'jquery';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!token || user?.role !== 'admin') return navigate('/dashboard');
    fetchUsers();
    fetchTasks();
    setTimeout(() => {
      $('.admin-stat').each(function (i) {
        $(this).delay(i * 120).animate({ opacity: 1 }, 400);
      });
      $('.data-row').each(function (i) {
        $(this).delay(i * 60).fadeIn(250);
      });
    }, 300);
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:5000/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(res.data);
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('authToken');
    Cookies.remove('userRole');
    localStorage.clear();
    navigate('/');
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const studentUsers = users.filter(u => u.role === 'student').length;

  return (
    <>
      <style>{`
        .admin-wrap { min-height: 100vh; background: #0a0a0f; }
        .bg-mesh {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse at 20% 20%, rgba(255,77,109,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(124,106,247,0.06) 0%, transparent 50%);
        }
        .dark-nav {
          background: rgba(10,10,15,0.95); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 1rem 2rem; position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-brand {
          font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 800;
          background: linear-gradient(135deg, #ff4d6d, #f5a623);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .nav-actions { display: flex; gap: 0.6rem; align-items: center; }
        .nav-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: #8888aa; padding: 0.45rem 1rem; border-radius: 8px;
          cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
          transition: all 0.2s;
        }
        .nav-btn:hover { color: #f0f0f8; border-color: #7c6af7; background: rgba(124,106,247,0.1); }
        .nav-btn.danger { color: #ff4d6d; border-color: rgba(255,77,109,0.2); }
        .nav-btn.danger:hover { background: rgba(255,77,109,0.1); }
        .content { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; }
        .admin-header { margin-bottom: 2rem; animation: fadeInUp 0.4s ease; }
        .admin-title { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; color: #f0f0f8; }
        .admin-sub { color: #8888aa; font-size: 0.9rem; margin-top: 0.25rem; }
        .admin-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(255,77,109,0.1); border: 1px solid rgba(255,77,109,0.25);
          color: #ff4d6d; padding: 4px 12px; border-radius: 20px;
          font-size: 0.78rem; font-weight: 600; margin-left: 0.75rem;
        }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .admin-stat {
          background: #16161f; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.4rem; opacity: 0; transition: all 0.3s;
        }
        .admin-stat:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .stat-icon { font-size: 1.6rem; margin-bottom: 0.6rem; display: block; }
        .stat-number { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; }
        .stat-label { color: #8888aa; font-size: 0.8rem; margin-top: 0.2rem; text-transform: uppercase; letter-spacing: 0.04em; }
        .tab-bar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
        .tab-btn {
          padding: 0.55rem 1.4rem; border-radius: 10px; font-size: 0.875rem;
          cursor: pointer; border: 1px solid rgba(255,255,255,0.08);
          background: transparent; color: #8888aa; transition: all 0.2s;
          font-family: 'Syne', sans-serif; font-weight: 600;
        }
        .tab-btn:hover { color: #f0f0f8; border-color: #7c6af7; }
        .tab-btn.active { background: rgba(124,106,247,0.15); border-color: #7c6af7; color: #a78bfa; }
        .dark-card { background: #16161f; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.5rem; }
        .card-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #f0f0f8; margin-bottom: 1.2rem; }
        .dark-table { width: 100%; border-collapse: collapse; }
        .dark-table th { color: #8888aa; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.07); text-align: left; }
        .dark-table td { padding: 0.9rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #f0f0f8; font-size: 0.875rem; vertical-align: middle; }
        .dark-table tr:last-child td { border-bottom: none; }
        .data-row { display: none; }
        .dark-table tr.data-row:hover td { background: rgba(255,255,255,0.02); }
        .badge { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 500; }
        .badge-high { background: rgba(255,77,109,0.12); color: #ff4d6d; border: 1px solid rgba(255,77,109,0.25); }
        .badge-medium { background: rgba(245,166,35,0.12); color: #f5a623; border: 1px solid rgba(245,166,35,0.25); }
        .badge-low { background: rgba(34,201,122,0.12); color: #22c97a; border: 1px solid rgba(34,201,122,0.25); }
        .badge-completed { background: rgba(34,201,122,0.12); color: #22c97a; border: 1px solid rgba(34,201,122,0.25); }
        .badge-pending { background: rgba(136,136,170,0.12); color: #8888aa; border: 1px solid rgba(136,136,170,0.2); }
        .badge-admin { background: rgba(255,77,109,0.12); color: #ff4d6d; border: 1px solid rgba(255,77,109,0.25); }
        .badge-student { background: rgba(124,106,247,0.12); color: #a78bfa; border: 1px solid rgba(124,106,247,0.25); }
        .avatar-sm {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #7c6af7, #a78bfa);
          display: inline-flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700;
          color: white; margin-right: 0.6rem; vertical-align: middle;
        }
        .empty-state { text-align: center; padding: 3rem; color: #8888aa; }
        .empty-icon { font-size: 3rem; display: block; margin-bottom: 0.75rem; }
        .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.07); border-top-color: #7c6af7; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 4rem auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <div className="admin-wrap">
        <div className="bg-mesh" />
        <nav className="dark-nav">
          <div className="nav-brand">⚡ Admin Panel</div>
          <div className="nav-actions">
            <span className="nav-btn" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span className="nav-btn" onClick={() => navigate('/tasks')}>My Tasks</span>
            <span className="nav-btn" onClick={() => navigate('/profile')}>Profile</span>
            <span className="nav-btn danger" onClick={handleLogout}>Logout</span>
          </div>
        </nav>

        <div className="content">
          <div className="admin-header">
            <div className="admin-title">
              Admin Panel
              <span className="admin-badge">🛡️ {user?.name}</span>
            </div>
            <div className="admin-sub">Manage all users and tasks across the platform</div>
          </div>

          <div className="stats-grid">
            <div className="admin-stat">
              <span className="stat-icon">👥</span>
              <div className="stat-number" style={{ color: '#7c6af7' }}>{users.length}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="admin-stat">
              <span className="stat-icon">🎓</span>
              <div className="stat-number" style={{ color: '#a78bfa' }}>{studentUsers}</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="admin-stat">
              <span className="stat-icon">📋</span>
              <div className="stat-number" style={{ color: '#f5a623' }}>{tasks.length}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="admin-stat">
              <span className="stat-icon">✅</span>
              <div className="stat-number" style={{ color: '#22c97a' }}>{completedTasks}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          <div className="tab-bar">
            <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}>
              👥 Users ({users.length})
            </button>
            <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}>
              📋 All Tasks ({tasks.length})
            </button>
          </div>

          {loading ? <div className="spinner" /> : (
            <div className="dark-card">
              {activeTab === 'users' ? (
                <>
                  <div className="card-title">All Registered Users</div>
                  {users.length === 0 ? (
                    <div className="empty-state"><span className="empty-icon">👥</span><p>No users found.</p></div>
                  ) : (
                    <table className="dark-table">
                      <thead>
                        <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th></tr>
                      </thead>
                      <tbody>
                        {users.map((u, i) => (
                          <tr key={u.id} className="data-row">
                            <td style={{ color: '#8888aa' }}>{i + 1}</td>
                            <td>
                              <span className="avatar-sm">{u.name.charAt(0).toUpperCase()}</span>
                              {u.name}
                            </td>
                            <td style={{ color: '#8888aa' }}>{u.email}</td>
                            <td><span className={`badge badge-${u.role}`}>{u.role === 'admin' ? '🛡️ Admin' : '🎓 Student'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              ) : (
                <>
                  <div className="card-title">All Tasks</div>
                  {tasks.length === 0 ? (
                    <div className="empty-state"><span className="empty-icon">📭</span><p>No tasks found.</p></div>
                  ) : (
                    <table className="dark-table">
                      <thead>
                        <tr><th>Title</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>Due Date</th></tr>
                      </thead>
                      <tbody>
                        {tasks.map(t => (
                          <tr key={t.id} className="data-row">
                            <td style={{ fontWeight: 500 }}>{t.title}</td>
                            <td>
                              <span className="avatar-sm">{t.user_name?.charAt(0).toUpperCase()}</span>
                              {t.user_name}
                            </td>
                            <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                            <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                            <td style={{ color: '#8888aa' }}>{t.due_date || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}