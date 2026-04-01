import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import $ from 'jquery';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileRef = useRef();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return navigate('/');
    fetchProfile();
    fetchTasks();
    setTimeout(() => {
      $('.profile-card').hide().fadeIn(600);
      $('.stat-pill').each(function(i) {
        $(this).delay(i * 150).animate({ opacity: 1 }, 400);
      });
    }, 100);
  }, []);

  const fetchProfile = async () => {
    const res = await axios.get('http://localhost:5000/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUser(res.data);
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setUploading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/users/avatar', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setUser(prev => ({ ...prev, avatar: res.data.avatar }));
      const storedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...storedUser, avatar: res.data.avatar }));
      setUploadMsg('Profile picture updated!');
      setTimeout(() => setUploadMsg(''), 3000);
    } catch {
      setUploadMsg('Upload failed. Max 2MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('authToken');
    Cookies.remove('userRole');
    Cookies.remove('rememberedEmail');
    localStorage.clear();
    navigate('/');
  };

  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const high = tasks.filter(t => t.priority === 'high').length;
  const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  const cookieToken = Cookies.get('authToken');
  const cookieRole = Cookies.get('userRole');

  return (
    <>
      <style>{`
        .profile-wrap { min-height: 100vh; background: #0a0a0f; }
        .bg-mesh {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse at 30% 20%, rgba(124,106,247,0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(167,139,250,0.06) 0%, transparent 50%);
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
          cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; transition: all 0.2s;
        }
        .nav-btn:hover { color: #f0f0f8; border-color: #7c6af7; background: rgba(124,106,247,0.1); }
        .nav-btn.active { color: #a78bfa; border-color: #7c6af7; background: rgba(124,106,247,0.12); }
        .nav-btn.danger { color: #ff4d6d; border-color: rgba(255,77,109,0.2); }
        .nav-btn.danger:hover { background: rgba(255,77,109,0.1); }
        .content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; padding: 2rem 1.5rem; }
        .page-title { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; color: #f0f0f8; margin-bottom: 1.5rem; }
        .profile-card { background: #16161f; border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; overflow: hidden; margin-bottom: 1.5rem; box-shadow: 0 16px 48px rgba(0,0,0,0.4); }
        .profile-banner { height: 100px; background: linear-gradient(135deg, #7c6af7 0%, #a78bfa 50%, #c4b5fd 100%); position: relative; }
        .profile-banner-pattern { position: absolute; inset: 0; opacity: 0.3; background-image: radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px); background-size: 30px 30px; }
        .profile-body { padding: 0 2rem 2rem; }
        .avatar-wrap { margin-top: -40px; margin-bottom: 1rem; display: flex; align-items: flex-end; gap: 1rem; }
        .avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #7c6af7, #a78bfa); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; color: white; border: 3px solid #0a0a0f; box-shadow: 0 0 30px rgba(124,106,247,0.4); overflow: hidden; cursor: pointer; flex-shrink: 0; }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-upload-btn { background: rgba(124,106,247,0.1); border: 1px solid rgba(124,106,247,0.3); color: #a78bfa; padding: 0.4rem 0.9rem; border-radius: 8px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; margin-bottom: 0.2rem; display: inline-block; }
        .avatar-upload-btn:hover { background: rgba(124,106,247,0.2); }
        .upload-msg { font-size: 0.78rem; color: #22c97a; margin-top: 0.2rem; }
        .profile-name { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800; color: #f0f0f8; }
        .profile-email { color: #8888aa; font-size: 0.9rem; margin-top: 0.2rem; }
        .role-badge { display: inline-block; margin-top: 0.6rem; padding: 4px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
        .role-admin { background: rgba(255,77,109,0.12); color: #ff4d6d; border: 1px solid rgba(255,77,109,0.3); }
        .role-student { background: rgba(124,106,247,0.12); color: #a78bfa; border: 1px solid rgba(124,106,247,0.3); }
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 1.5rem; }
        .stat-pill { background: #111118; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 1rem; text-align: center; opacity: 0; transition: all 0.2s; }
        .stat-pill:hover { border-color: #7c6af7; transform: translateY(-2px); }
        .stat-pill-number { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; }
        .stat-pill-label { color: #8888aa; font-size: 0.75rem; margin-top: 0.2rem; text-transform: uppercase; letter-spacing: 0.04em; }
        .dark-card { background: #16161f; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .card-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #f0f0f8; margin-bottom: 1.2rem; }
        .progress-wrap { margin-bottom: 1rem; }
        .progress-label { display: flex; justify-content: space-between; color: #8888aa; font-size: 0.82rem; margin-bottom: 0.4rem; }
        .progress-label span:last-child { color: #a78bfa; font-weight: 600; }
        .progress-bg { height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #7c6af7, #22c97a); transition: width 1s ease; }
        .report-link { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(34,201,122,0.08); border: 1px solid rgba(34,201,122,0.2); color: #22c97a; padding: 0.6rem 1.2rem; border-radius: 10px; text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; margin-top: 0.5rem; }
        .report-link:hover { background: rgba(34,201,122,0.15); color: #22c97a; }
        .cookie-panel { background: #111118; border: 1px solid rgba(124,106,247,0.2); border-radius: 12px; padding: 1.2rem; }
        .cookie-title { font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700; color: #a78bfa; margin-bottom: 0.75rem; }
        .cookie-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.82rem; }
        .cookie-row:last-child { border-bottom: none; }
        .cookie-key { color: #8888aa; }
        .cookie-val { color: #f0f0f8; font-family: monospace; font-size: 0.78rem; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 6px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.07); border-top-color: #7c6af7; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 4rem auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <div className="profile-wrap">
        <div className="bg-mesh" />
        <nav className="dark-nav">
          <div className="nav-brand">Task Manager</div>
          <div className="nav-actions">
            <span className="nav-btn" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span className="nav-btn" onClick={() => navigate('/tasks')}>Tasks</span>
            <span className="nav-btn active">Profile</span>
            <span className="nav-btn danger" onClick={handleLogout}>Logout</span>
          </div>
        </nav>

        <div className="content">
          <div className="page-title">My Profile</div>
          {loading ? <div className="spinner" /> : (
            <>
              <div className="profile-card">
                <div className="profile-banner">
                  <div className="profile-banner-pattern" />
                </div>
                <div className="profile-body">
                  <div className="avatar-wrap">
                    <div className="avatar" onClick={() => fileRef.current.click()}>
                      {user?.avatar
                        ? <img src={`http://localhost:5000${user.avatar}`} alt="avatar" />
                        : user?.name?.charAt(0).toUpperCase()
                      }
                    </div>
                    <div>
                      <div className="avatar-upload-btn" onClick={() => fileRef.current.click()}>
                        {uploading ? 'Uploading...' : 'Change Photo'}
                      </div>
                      {uploadMsg && <div className="upload-msg">{uploadMsg}</div>}
                    </div>
                    <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} />
                  </div>
                  <div className="profile-name">{user?.name}</div>
                  <div className="profile-email">{user?.email}</div>
                  <span className={`role-badge ${user?.role === 'admin' ? 'role-admin' : 'role-student'}`}>
                    {user?.role === 'admin' ? 'Admin' : 'Student'}
                  </span>
                  <div className="stats-row">
                    <div className="stat-pill">
                      <div className="stat-pill-number" style={{ color: '#7c6af7' }}>{tasks.length}</div>
                      <div className="stat-pill-label">Total</div>
                    </div>
                    <div className="stat-pill">
                      <div className="stat-pill-number" style={{ color: '#22c97a' }}>{completed}</div>
                      <div className="stat-pill-label">Done</div>
                    </div>
                    <div className="stat-pill">
                      <div className="stat-pill-number" style={{ color: '#f5a623' }}>{pending}</div>
                      <div className="stat-pill-label">Pending</div>
                    </div>
                    <div className="stat-pill">
                      <div className="stat-pill-number" style={{ color: '#ff4d6d' }}>{high}</div>
                      <div className="stat-pill-label">High</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dark-card">
                <div className="card-title">Task Progress</div>
                <div className="progress-wrap">
                  <div className="progress-label"><span>Completion Rate</span><span>{completionRate}%</span></div>
                  <div className="progress-bg"><div className="progress-fill" style={{ width: `${completionRate}%` }} /></div>
                </div>
                <div className="progress-wrap">
                  <div className="progress-label">
                    <span>High Priority</span>
                    <span>{tasks.length > 0 ? Math.round((high / tasks.length) * 100) : 0}%</span>
                  </div>
                  <div className="progress-bg">
                    <div className="progress-fill" style={{ width: `${tasks.length > 0 ? Math.round((high / tasks.length) * 100) : 0}%`, background: 'linear-gradient(90deg, #ff4d6d, #f5a623)' }} />
                  </div>
                </div>
                <a href={`http://localhost:5000/report?token=${token}`} target="_blank" rel="noreferrer" className="report-link">
                  Export Task Report
                </a>
              </div>

              <div className="dark-card">
                <div className="card-title">Active Session Cookies</div>
                <div className="cookie-panel">
                  <div className="cookie-title">Cookies stored in your browser</div>
                  <div className="cookie-row">
                    <span className="cookie-key">authToken</span>
                    <span className="cookie-val">{cookieToken ? cookieToken.substring(0, 30) + '...' : 'Not set'}</span>
                  </div>
                  <div className="cookie-row">
                    <span className="cookie-key">userRole</span>
                    <span className="cookie-val">{cookieRole || 'Not set'}</span>
                  </div>
                  <div className="cookie-row">
                    <span className="cookie-key">rememberedEmail</span>
                    <span className="cookie-val">{Cookies.get('rememberedEmail') || 'Not set'}</span>
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