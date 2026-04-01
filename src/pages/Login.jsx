import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import $ from 'jquery';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // jQuery animation on mount
    $('.login-card').hide().fadeIn(600);
    $('.login-logo').hide().slideDown(800);

    // Check cookie for remembered email
    const savedEmail = Cookies.get('rememberedEmail');
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // jQuery form shake on empty
    if (!email || !password) {
      $('.login-card').addClass('shake');
      setTimeout(() => $('.login-card').removeClass('shake'), 500);
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });

      // Save token in both localStorage and cookie (syllabus: cookies & sessions)
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      Cookies.set('authToken', res.data.token, { expires: 1 });
      Cookies.set('rememberedEmail', email, { expires: 7 });
      Cookies.set('userRole', res.data.user.role, { expires: 1 });

      // jQuery success flash
      $('.login-card').animate({ opacity: 0 }, 400, () => navigate('/dashboard'));
    } catch (err) {
      setError('Invalid email or password');
      // jQuery shake on error
      $('.login-card').effect ? $('.login-card').addClass('shake') : null;
      setTimeout(() => $('.login-card').removeClass('shake'), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .bg-mesh {
          position: fixed; top: 0; left: 0;
          width: 100%; height: 100%;
          pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse at 20% 20%, rgba(124,106,247,0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(167,139,250,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(124,106,247,0.04) 0%, transparent 70%);
        }
        .login-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }
        .login-card {
          background: #16161f;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
        }
        .login-logo {
          text-align: center;
          margin-bottom: 2rem;
        }
        .logo-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 0.5rem;
          filter: drop-shadow(0 0 20px rgba(124,106,247,0.5));
        }
        .logo-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #7c6af7, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .logo-sub {
          color: #8888aa;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }
        .form-group { margin-bottom: 1.2rem; }
        .input-wrap { position: relative; }
        .input-icon {
          position: absolute;
          left: 1rem; top: 50%;
          transform: translateY(-50%);
          color: #8888aa;
          font-size: 1rem;
        }
        .dark-input-icon {
          background: #111118;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          color: #f0f0f8;
          padding: 0.75rem 1rem 0.75rem 2.8rem;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .dark-input-icon:focus {
          border-color: #7c6af7;
          box-shadow: 0 0 0 3px rgba(124,106,247,0.2);
        }
        .dark-input-icon::placeholder { color: #8888aa; }
        .btn-login {
          width: 100%;
          padding: 0.8rem;
          background: linear-gradient(135deg, #7c6af7, #a78bfa);
          color: white;
          border: none;
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
          letter-spacing: 0.03em;
        }
        .btn-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124,106,247,0.4);
        }
        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .divider {
          text-align: center;
          color: #8888aa;
          font-size: 0.85rem;
          margin: 1.5rem 0;
          position: relative;
        }
        .divider::before, .divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 40%;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .divider::before { left: 0; }
        .divider::after { right: 0; }
        .register-link {
          text-align: center;
          color: #8888aa;
          font-size: 0.9rem;
        }
        .register-link a {
          color: #7c6af7;
          text-decoration: none;
          font-weight: 600;
        }
        .register-link a:hover { color: #a78bfa; }
        .cookie-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(124,106,247,0.08);
          border: 1px solid rgba(124,106,247,0.2);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          font-size: 0.78rem;
          color: #8888aa;
          margin-bottom: 1.5rem;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .shake { animation: shake 0.4s ease; }
        .spinner-sm {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          vertical-align: middle;
          margin-right: 0.5rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
        <div className="bg-mesh" />
        <div className="login-wrap">
          <div className="login-card">
            <div className="login-logo">
              <span className="logo-icon">📚</span>
              <div className="logo-title">Student Task Manager</div>
              <div className="logo-sub">Organize. Focus. Achieve.</div>
            </div>

            <div className="cookie-badge">
              🍪 Session secured with cookies &amp; JWT authentication
            </div>

            {error && <div className="dark-alert error">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="dark-label">Email Address</label>
                <div className="input-wrap">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    className="dark-input-icon"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="dark-label">Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    className="dark-input-icon"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? <><span className="spinner-sm" />Signing in...</> : 'Sign In →'}
              </button>
            </form>

            <div className="divider">or</div>
            <div className="register-link">
              Don't have an account? <Link to="/register">Create one</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}