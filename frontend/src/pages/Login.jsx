import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Droplet, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { loginUser } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const justRegistered = location.state?.justRegistered;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const result = await loginUser(identifier, password);

    if (!result.success) {
      setError(result.error);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      {/* Background Image Setup */}
      <div style={styles.bgWrapper}>
        <img src="/rnsit.png" alt="RNSIT Campus" style={styles.bgImage} />
        <div style={styles.bgOverlay}></div>
      </div>

      <div style={styles.content}>
        <div className="glass-panel animate-fade-in" style={styles.loginCard}>
          <div style={styles.header}>
            <img src="/logo.png" alt="RNSIT" style={styles.logo} />
            <h1 style={styles.title}>SWASTYA SETU</h1>
            <p style={styles.subtitle}>AI Donation Network for RNSIT</p>
          </div>

          {justRegistered && (
            <div style={styles.successBox}>
              <CheckCircle2 size={18} />
              <span>Account created! Please log in below.</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={styles.form}>
            <div className="input-group">
              <label className="input-label">USN / Email</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter your USN or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={styles.errorBox}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" style={styles.submitBtn}>
              Sign In
              <ArrowRight size={20} />
            </button>
          </form>

          <div style={styles.footer}>
            <p>New student? <a href="/register" style={styles.link}>Register here</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
  bgWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  bgImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 100%)',
  },
  content: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  loginCard: {
    width: '100%',
    maxWidth: '450px',
    padding: '3rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '0.5rem',
  },
  logo: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#fff',
    margin: 0,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: '#fca5a5',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    fontSize: '0.875rem',
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.4)',
    color: '#86efac',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    fontSize: '0.875rem',
  },
  submitBtn: {
    marginTop: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 600,
    transition: 'background 0.2s',
  },
  footer: {
    textAlign: 'center',
    color: '#cbd5e1',
    fontSize: '0.875rem',
  },
  link: {
    color: '#60a5fa',
    fontWeight: 600,
    textDecoration: 'none',
  }
};
