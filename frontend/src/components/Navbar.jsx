import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Moon, Sun, BellRing, User, Home, LogOut } from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme, triggerEmergency, logout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide navbar on login and register screens
  if (location.pathname === '/login' || location.pathname === '/' || location.pathname === '/register') return null;

  return (
    <nav style={styles.navbar} className="glass-panel">
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.logoContainer}>
          <img src="/logo.png" alt="RNSIT Logo" style={styles.logo} />
          <div style={styles.brandText}>
            <span style={styles.title}>SWASTYA SETU</span>
            <span style={styles.subtitle}>AI Donation Network</span>
          </div>
        </Link>

        <div style={styles.actions}>
          <button 
            onClick={() => triggerEmergency({
              bloodGroup: 'O-',
              location: 'Manipal Hospital, Bangalore',
              urgency: 'Critical',
              units: 2
            })}
            style={styles.demoButton}
            title="Demo Emergency Popup"
          >
            <BellRing size={20} />
            <span className="hide-mobile">Demo Alert</span>
          </button>

          <button onClick={() => navigate('/dashboard')} style={styles.iconButton} title="Home">
            <Home size={20} />
          </button>
          
          <button onClick={() => navigate('/profile')} style={styles.iconButton} title="My Profile">
            <User size={20} />
          </button>

          <button onClick={toggleTheme} style={styles.iconButton} title="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button onClick={logout} style={styles.iconButton} title="Log Out">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    margin: '1rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '16px',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    textDecoration: 'none',
  },
  logo: {
    height: '40px',
    width: 'auto',
    objectFit: 'contain',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '0.75rem',
    color: 'var(--primary)',
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  iconButton: {
    background: 'transparent',
    color: 'var(--text-primary)',
    padding: '0.5rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  demoButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--warning)',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    boxShadow: 'var(--shadow-sm)',
  }
};
