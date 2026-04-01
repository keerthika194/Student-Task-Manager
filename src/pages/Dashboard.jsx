import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import $ from 'jquery';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!u || !token) return navigate('/');
    setUser(u);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchTasks(token);

    // jQuery stagger animation on stat cards
    setTimeout(() => {
      $('.stat-card').each(function (i) {
        $(this).delay(i * 120).animate({ opacity: 1 }, 400);
      });
      $('.task-row').each(function (i) {
        $(this).delay(i * 80).fadeIn(300);
      });
    }, 300);
  }, []);

  const fetchTasks = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', {
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

  const pending = tasks.filter(t => t.status === 'pending').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const high = tasks.filter(t => t.priority === 'high').length;
  const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <>
      <style>{`
        .dash-wrap { min-height: 100vh; background: #0a0a0f; }
        .bg-mesh {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse at 10% 10%, rgba(124,106,247,0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 90%, rgba(167,139,250,0.06) 0%, transparent 50%);
        }
        .dark-nav {
          background: rgba(10,10,15,0.95); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 1rem 2rem; position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-brand {
          font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 800;
          background: linear-gradient(135deg, #7c6af7, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .nav-actions { display: flex; gap: 0.6rem; align-items: center; }
        .nav-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: #8888aa; padding: 0.45rem 1rem; border-radius: 8px;
          cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
          transition: all 0.2s; text-decoration: none; display: inline-block;
        }
        .nav-btn:hover { color: #f0f0f8; border-color: #7c6af7; background: rgba(124,106,247,0.1); }
        .nav-btn.active { color: #a78bfa; border-color: #7c6af7; background: rgba(124,106,247,0.12); }
        .nav-btn.danger { color: #ff4d6d; border-color: rgba(255,77,109,0.2); }
        .nav-btn.danger:hover { background: rgba(255,77,109,0.1); }
        .nav-btn.admin-btn { color: #f5a623; border-color: rgba(245,166,35,0.3); background: rgba(245,166,35,0.08); }
        .content { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; }
        .greeting-section { margin-bottom: 2rem; animation: fadeInUp 0.5s ease; }
        .greeting-text { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; color: #f0f0f8; }
        .greeting-sub { color: #8888aa; font-size: 0.95rem; margin-top: 0.25rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat-card {
          background: #16161f; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.5rem; opacity: 0;
          transition: all 0.3s; cursor: default;
        }
        .stat-card:hover { transform: translateY(-4px); border-color: #7c6af7; box-shadow: 0 8px 32px rgba(124,106,247,0.2); }
        .stat-icon { font-size: 1.8rem; margin-bottom: 0.75rem; display: block; }
        .stat-number { font-family: 'Syne', sans-serif; font-size: 2.2rem; font-weight: 800; color: #f0f0f8; line-height: 1; }
        .stat-label { color: #8888aa; font-size: 0.82rem; margin-top: 0.3rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-accent { color: #7c6af7; }
        .stat-success { color: #22c97a; }
        .stat-warning { color: #f5a623; }
        .stat-danger { color: #ff4d6d; }
        .progress-bar-bg { height: 4px; background: rgba(255,255,255,0.07); border-radius: 2px; margin-top: 0.75rem; overflow: hidden; }
        .progress-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #7c6af7, #22c97a); transition: width 1s ease; }
        .grid-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
        .dark-card { background: #16161f; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.5rem; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; }
        .card-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #f0f0f8; }
        .card-action { font-size: 0.8rem; color: #7c6af7; cursor: pointer; text-decoration: none; }
        .card-action:hover { color: #a78bfa; }
        .dark-table { width: 100%; border-collapse: collapse; }
        .dark-table th { color: #8888aa; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.07); text-align: left; }
        .dark-table td { padding: 0.85rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #f0f0f8; font-size: 0.875rem; vertical-align: middle; }
        .dark-table tr:last-child td { border-bottom: none; }
        .task-row { display: none; }
        .dark-table tr.task-row:hover td { background: rgba(255,255,255,0.02); }
        .badge { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 500; }
        .badge-high { background: rgba(255,77,109,0.12); color: #ff4d6d; border: 1px solid rgba(255,77,109,0.25); }
        .badge-medium { background: rgba(245,166,35,0.12); color: #f5a623; border: 1px solid rgba(245,166,35,0.25); }
        .badge-low { background: rgba(34,201,122,0.12); color: #22c97a; border: 1px solid rgba(34,201,122,0.25); }
        .badge-completed { background: rgba(34,201,122,0.12); color: #22c97a; border: 1px solid rgba(34,201,122,0.25); }
        .badge-pending { background: rgba(136,136,170,0.12); color: #8888aa; border: 1px solid rgba(136,136,170,0.2); }
        .empty-state { text-align: center; padding: 2rem; color: #8888aa; }
        .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }
        .empty-link { color: #7c6af7; cursor: pointer; }
        .empty-link:hover { color: #a78bfa; }
        .activity-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .activity-item { display: flex; gap: 0.75rem; align-items: flex-start; }
        .activity-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 0.35rem; flex-shrink: 0; }
        .activity-dot.purple { background: #7c6af7; }
        .activity-dot.green { background: #22c97a; }
        .activity-dot.orange { background: #f5a623; }
        .activity-text { font-size: 0.85rem; color: #8888aa; line-height: 1.4; }
        .activity-text strong { color: #f0f0f8; }
        .cookie-info { background: rgba(124,106,247,0.06); border: 1px solid rgba(124,106,247,0.15); border-radius: 12px; padding: 1rem 1.2rem; margin-top: 1rem; font-size: 0.8rem; color: #8888aa; }
        .cookie-info strong { color: #a78bfa; }
        .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.07); border-top-color: #7c6af7; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 4rem auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dash-wrap">
        <div className="bg-mesh" />
        <nav className="dark-nav">
          <div className="nav-brand">📚 Task Manager</div>
          <div className="nav-actions">
            <span className="nav-btn active">Dashboard</span>
            <span className="nav-btn" onClick={() => navigate('/tasks')}>My Tasks</span>
            <span className="nav-btn" onClick={() => navigate('/profile')}>Profile</span>
            {user?.role === 'admin' && (
              <span className="nav-btn admin-btn" onClick={() => navigate('/admin')}>⚡ Admin</span>
            )}
            <span className="nav-btn danger" onClick={handleLogout}>Logout</span>
          </div>
        </nav>

        <div className="content">
          {loading ? <div className="spinner" /> : (
            <>
              <div className="greeting-section">
                <div className="greeting-text">{greeting}, {user?.name?.split(' ')[0]} 👋</div>
                <div className="greeting-sub">
                  {tasks.length === 0
                    ? "You have no tasks yet. Start by adding one!"
                    : `You have ${pending} pending task${pending !== 1 ? 's' : ''} to complete.`}
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon">📋</span>
                  <div className="stat-number stat-accent">{tasks.length}</div>
                  <div className="stat-label">Total Tasks</div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">⏳</span>
                  <div className="stat-number stat-warning">{pending}</div>
                  <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">✅</span>
                  <div className="stat-number stat-success">{completed}</div>
                  <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🔥</span>
                  <div className="stat-number stat-danger">{high}</div>
                  <div className="stat-label">High Priority</div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${completionRate}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid-2">
                <div className="dark-card">
                  <div className="card-header">
                    <div className="card-title">Recent Tasks</div>
                    <span className="card-action" onClick={() => navigate('/tasks')}>View all →</span>
                  </div>
                  {tasks.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">📭</span>
                      <p>No tasks yet. <span className="empty-link" onClick={() => navigate('/tasks')}>Add your first task!</span></p>
                    </div>
                  ) : (
                    <table className="dark-table">
                      <thead>
                        <tr>
                          <th>Task</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.slice(0, 6).map(t => (
                          <tr key={t.id} className="task-row">
                            <td>{t.title}</td>
                            <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                            <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                            <td style={{ color: '#8888aa' }}>{t.due_date || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div>
                  <div className="dark-card" style={{ marginBottom: '1rem' }}>
                    <div className="card-title" style={{ marginBottom: '1rem' }}>📊 Progress</div>
                    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '3rem', fontWeight: 800, color: '#7c6af7' }}>{completionRate}%</div>
                      <div style={{ color: '#8888aa', fontSize: '0.85rem' }}>Completion Rate</div>
                      <div className="progress-bar-bg" style={{ marginTop: '1rem' }}>
                        <div className="progress-bar-fill" style={{ width: `${completionRate}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="dark-card">
                    <div className="card-title" style={{ marginBottom: '1rem' }}>🕐 Activity</div>
                    <div className="activity-list">
                      <div className="activity-item">
                        <div className="activity-dot purple" />
                        <div className="activity-text">Logged in as <strong>{user?.role}</strong></div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-dot green" />
                        <div className="activity-text"><strong>{completed}</strong> tasks completed</div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-dot orange" />
                        <div className="activity-text"><strong>{high}</strong> high priority tasks</div>
                      </div>
                    </div>
                    <div className="cookie-info">
                      🍪 <strong>Session active</strong> — Auth token stored in cookies &amp; localStorage
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}