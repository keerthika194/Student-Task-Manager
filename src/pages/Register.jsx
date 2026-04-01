import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import $ from 'jquery';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    $('.register-card').hide().fadeIn(700);
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    else if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email';

    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    return newErrors;
  };

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return { label: '', color: '', width: '0%' };
    if (p.length < 4) return { label: 'Weak', color: '#ff4d6d', width: '25%' };
    if (p.length < 6) return { label: 'Fair', color: '#f5a623', width: '50%' };
    if (p.length < 10) return { label: 'Good', color: '#7c6af7', width: '75%' };
    return { label: 'Strong', color: '#22c97a', width: '100%' };
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    // jQuery highlight on change
    $(`[name="${e.target.name}"]`).addClass('input-active');
    setTimeout(() => $(`[name="${e.target.name}"]`).removeClass('input-active'), 300);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      $('.register-card').addClass('shake');
      setTimeout(() => $('.register-card').removeClass('shake'), 500);
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      // Save registration hint in cookie
      Cookies.set('justRegistered', 'true', { expires: 1 });
      Cookies.set('registeredEmail', form.email, { expires: 1 });
      setSuccess('Account created! Redirecting to login...');
      $('.register-card').animate({ opacity: 0 }, 800, () => navigate('/'));
    } catch (err) {
      setErrors({ email: 'This email is already registered' });
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <>
      <style>{`
        .bg-mesh {
          position: fixed; top: 0; left: 0;
          width: 100%; height: 100%;
          pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse at 80% 10%, rgba(124,106,247,0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 90%, rgba(167,139,250,0.08) 0%, transparent 50%);
        }
        .register-wrap {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 2rem; position: relative; z-index: 1;
        }
        .register-card {
          background: #16161f;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 2.5rem;
          width: 100%; max-width: 440px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
        }
        .logo-section { text-align: center; margin-bottom: 2rem; }
        .logo-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; filter: drop-shadow(0 0 20px rgba(124,106,247,0.5)); }
        .logo-title {
          font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800;
          background: linear-gradient(135deg, #7c6af7, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .logo-sub { color: #8888aa; font-size: 0.85rem; margin-top: 0.2rem; }
        .form-group { margin-bottom: 1.1rem; }
        .input-wrap { position: relative; }
        .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #8888aa; font-size: 0.95rem; }
        .dark-input-icon {
          background: #111118; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; color: #f0f0f8;
          padding: 0.75rem 1rem 0.75rem 2.8rem;
          width: 100%; font-family: 'DM Sans', sans-serif; font-size: 0.95rem;
          transition: border-color 0.2s, box-shadow 0.2s; outline: none;
        }
        .dark-input-icon:focus { border-color: #7c6af7; box-shadow: 0 0 0 3px rgba(124,106,247,0.2); }
        .dark-input-icon::placeholder { color: #8888aa; }
        .dark-input-icon option { background: #16161f; }
        .input-active { border-color: #a78bfa !important; }
        .field-error { color: #ff4d6d; font-size: 0.78rem; margin-top: 0.3rem; display: block; }
        .input-error { border-color: rgba(255,77,109,0.5) !important; }
        .strength-bar-wrap { margin-top: 0.5rem; }
        .strength-bar-bg { height: 4px; background: rgba(255,255,255,0.07); border-radius: 2px; overflow: hidden; }
        .strength-bar-fill { height: 100%; border-radius: 2px; transition: width 0.3s, background 0.3s; }
        .strength-label { font-size: 0.75rem; margin-top: 0.2rem; }
        .role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .role-option { display: none; }
        .role-label {
          display: flex; flex-direction: column; align-items: center;
          gap: 0.4rem; padding: 0.9rem;
          background: #111118; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; cursor: pointer; transition: all 0.2s;
          font-size: 0.85rem; color: #8888aa;
        }
        .role-label:hover { border-color: #7c6af7; color: #f0f0f8; }
        .role-option:checked + .role-label {
          border-color: #7c6af7; background: rgba(124,106,247,0.1);
          color: #a78bfa; box-shadow: 0 0 16px rgba(124,106,247,0.2);
        }
        .role-icon { font-size: 1.5rem; }
        .btn-register {
          width: 100%; padding: 0.8rem;
          background: linear-gradient(135deg, #7c6af7, #a78bfa);
          color: white; border: none; border-radius: 10px;
          font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s; margin-top: 0.75rem; letter-spacing: 0.03em;
        }
        .btn-register:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,106,247,0.4); }
        .btn-register:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .login-link { text-align: center; color: #8888aa; font-size: 0.9rem; margin-top: 1.2rem; }
        .login-link a { color: #7c6af7; text-decoration: none; font-weight: 600; }
        .login-link a:hover { color: #a78bfa; }
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
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block; vertical-align: middle; margin-right: 0.5rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dark-alert { padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.9rem; margin-bottom: 1rem; }
        .dark-alert.success { background: rgba(34,201,122,0.1); border: 1px solid rgba(34,201,122,0.3); color: #22c97a; }
      `}</style>

      <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
        <div className="bg-mesh" />
        <div className="register-wrap">
          <div className="register-card">
            <div className="logo-section">
              <span className="logo-icon">🎓</span>
              <div className="logo-title">Create Account</div>
              <div className="logo-sub">Join Student Task Manager today</div>
            </div>

            {success && <div className="dark-alert success">✅ {success}</div>}

            <form onSubmit={handleRegister} noValidate>
              <div className="form-group">
                <label className="dark-label">Full Name</label>
                <div className="input-wrap">
                  <span className="input-icon">👤</span>
                  <input
                    name="name" type="text"
                    className={`dark-input-icon ${errors.name ? 'input-error' : ''}`}
                    placeholder="Your full name"
                    value={form.name} onChange={handleChange}
                  />
                </div>
                {errors.name && <span className="field-error">⚠ {errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="dark-label">Email Address</label>
                <div className="input-wrap">
                  <span className="input-icon">✉️</span>
                  <input
                    name="email" type="email"
                    className={`dark-input-icon ${errors.email ? 'input-error' : ''}`}
                    placeholder="you@example.com"
                    value={form.email} onChange={handleChange}
                  />
                </div>
                {errors.email && <span className="field-error">⚠ {errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="dark-label">Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    name="password" type="password"
                    className={`dark-input-icon ${errors.password ? 'input-error' : ''}`}
                    placeholder="Min. 6 characters"
                    value={form.password} onChange={handleChange}
                  />
                </div>
                {form.password && (
                  <div className="strength-bar-wrap">
                    <div className="strength-bar-bg">
                      <div className="strength-bar-fill" style={{ width: strength.width, background: strength.color }} />
                    </div>
                    <div className="strength-label" style={{ color: strength.color }}>{strength.label} password</div>
                  </div>
                )}
                {errors.password && <span className="field-error">⚠ {errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="dark-label">I am a...</label>
                <div className="role-grid">
                  <div>
                    <input type="radio" name="role" id="student" value="student"
                      className="role-option"
                      checked={form.role === 'student'}
                      onChange={handleChange} />
                    <label htmlFor="student" className="role-label">
                      <span className="role-icon">🎓</span>
                      Student
                    </label>
                  </div>
                  <div>
                    <input type="radio" name="role" id="admin" value="admin"
                      className="role-option"
                      checked={form.role === 'admin'}
                      onChange={handleChange} />
                    <label htmlFor="admin" className="role-label">
                      <span className="role-icon">🛡️</span>
                      Admin
                    </label>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-register" disabled={loading}>
                {loading ? <><span className="spinner-sm" />Creating account...</> : 'Create Account →'}
              </button>
            </form>

            <div className="login-link">
              Already have an account? <Link to="/">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}