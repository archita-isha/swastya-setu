import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, XCircle, Users, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Tracking() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    contacted: 0,
    accepted: 0,
    declined: 0,
    target: 50
  });

  useEffect(() => {
    // Poll the backend API for real responses
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/status`);
        const data = await response.json();
        
        setStats({
          contacted: data.contacted,
          accepted: data.accepted,
          declined: data.declined,
          target: data.target || 2
        });

        if (data.accepted >= data.target) {
          clearInterval(interval);
          setTimeout(() => navigate('/selection'), 2000);
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [navigate]);

  const progressPercentage = (stats.contacted / stats.target) * 100;

  return (
    <div className="container" style={styles.container}>
      <div style={styles.header}>
        <Activity size={32} color="var(--primary)" className="animate-pulse" />
        <h1 style={styles.title}>Live Response Tracking</h1>
        <p style={styles.subtitle}>Monitoring donor responses in real-time.</p>
      </div>

      <div style={styles.statsGrid}>
        <div className="glass-panel" style={styles.statCard}>
          <Users size={32} color="var(--secondary)" />
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Total Contacted</span>
            <span style={styles.statValue}>{stats.contacted} / {stats.target}</span>
          </div>
        </div>

        <div className="glass-panel" style={styles.statCard}>
          <CheckCircle size={32} color="var(--success)" />
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>YES (Willing)</span>
            <span style={{...styles.statValue, color: 'var(--success)'}}>{stats.accepted}</span>
          </div>
        </div>

        <div className="glass-panel" style={styles.statCard}>
          <XCircle size={32} color="var(--danger)" />
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>NO (Unavailable)</span>
            <span style={{...styles.statValue, color: 'var(--danger)'}}>{stats.declined}</span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>System Progress</span>
          <span style={styles.progressPercentage}>{Math.round(progressPercentage)}%</span>
        </div>
        <div style={styles.progressBarBg}>
          <div 
            style={{
              ...styles.progressBarFill,
              width: `${progressPercentage}%`
            }}
          ></div>
        </div>
        <p style={styles.statusText}>
          {stats.accepted > 0 
            ? "Donor found! Preparing selection details..." 
            : "Waiting for responses..."}
        </p>
      </div>

      {stats.accepted > 0 && (
        <button 
          style={styles.proceedBtn} 
          onClick={() => navigate('/selection')}
          className="animate-fade-in"
        >
          View Selected Donor
          <ArrowRight size={20} />
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '0.5rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    margin: 0,
    color: 'var(--text-primary)',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  statCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '1rem',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: '1',
  },
  progressSection: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  progressPercentage: {
    fontWeight: 800,
    color: 'var(--secondary)',
  },
  progressBarBg: {
    width: '100%',
    height: '12px',
    backgroundColor: 'var(--border-color)',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--secondary)',
    transition: 'width 0.5s ease-out',
  },
  statusText: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    fontStyle: 'italic',
    margin: 0,
  },
  proceedBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--success)',
    color: '#fff',
    padding: '1.25rem',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  }
};
