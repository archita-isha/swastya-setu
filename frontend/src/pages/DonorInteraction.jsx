import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Heart, CheckCircle, XCircle } from 'lucide-react';

export default function DonorInteraction() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending'); // pending, accepted, declined

  if (status === 'accepted') {
    return (
      <div className="container" style={styles.centerContainer}>
        <div className="glass-panel animate-fade-in" style={styles.successCard}>
          <Heart size={64} color="var(--primary)" className="animate-pulse" />
          <h2 style={{...styles.title, marginTop: '1rem'}}>Thank You!</h2>
          <p style={styles.subtitle}>You are a hero. The requester has been notified of your acceptance.</p>
          <button style={styles.homeBtn} onClick={() => navigate('/dashboard')}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (status === 'declined') {
    return (
      <div className="container" style={styles.centerContainer}>
        <div className="glass-panel animate-fade-in" style={styles.successCard}>
          <XCircle size={64} color="var(--text-muted)" />
          <h2 style={{...styles.title, marginTop: '1rem'}}>Response Recorded</h2>
          <p style={styles.subtitle}>Thank you for letting us know. The system will continue searching.</p>
          <button style={styles.homeBtn} onClick={() => navigate('/dashboard')}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={styles.container}>
      <div className="glass-panel animate-fade-in" style={styles.card}>
        <div style={styles.header}>
          <AlertTriangle size={40} color="var(--primary)" />
          <h1 style={styles.title}>Incoming Request</h1>
          <p style={styles.subtitle}>Someone urgently needs your help.</p>
        </div>

        <div style={styles.requestDetails}>
          <div style={styles.detailRow}>
            <span style={styles.label}>Blood Group</span>
            <span style={styles.valueHighlight}>O-</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.label}>Urgency</span>
            <span style={styles.valueWarning}>Critical</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.label}>Location</span>
            <span style={styles.value}>Manipal Hospital, Bangalore</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.label}>Distance</span>
            <span style={styles.value}>4.2 km (approx 15 mins)</span>
          </div>
        </div>

        <div style={styles.actionSection}>
          <h3 style={styles.actionTitle}>Can you donate right now?</h3>
          <div style={styles.actionButtons}>
            <button 
              style={styles.mapCheckBtn} 
              onClick={() => navigate('/map', { state: { destination: "Manipal Hospital, Bangalore" } })}
            >
              <MapPin size={20} />
              Check Location on Map
            </button>
            <button style={styles.acceptBtn} onClick={() => setStatus('accepted')}>
              <CheckCircle size={20} />
              Yes, I will go
            </button>
            <button style={styles.declineBtn} onClick={() => setStatus('declined')}>
              <XCircle size={20} />
              No, I can't
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '2rem 1rem',
  },
  centerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
  },
  card: {
    width: '100%',
    maxWidth: '500px',
    padding: '0',
    overflow: 'hidden',
  },
  successCard: {
    width: '100%',
    maxWidth: '400px',
    padding: '3rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  header: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    borderBottom: '1px solid var(--border-color)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    margin: '1rem 0 0.5rem 0',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    margin: 0,
  },
  requestDetails: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border-color)',
  },
  label: {
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
  value: {
    color: 'var(--text-primary)',
    fontWeight: 700,
    textAlign: 'right',
  },
  valueHighlight: {
    color: '#fff',
    backgroundColor: 'var(--primary)',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontWeight: 800,
  },
  valueWarning: {
    color: 'var(--warning)',
    fontWeight: 800,
  },
  actionSection: {
    padding: '0 2rem 2rem 2rem',
  },
  actionTitle: {
    textAlign: 'center',
    fontSize: '1.1rem',
    marginBottom: '1.5rem',
    color: 'var(--text-primary)',
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  mapCheckBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--secondary)',
    color: '#fff',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 700,
  },
  acceptBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--success)',
    color: '#fff',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 700,
  },
  declineBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: 'transparent',
    border: '2px solid var(--border-color)',
    color: 'var(--text-secondary)',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  homeBtn: {
    marginTop: '2rem',
    backgroundColor: 'var(--secondary)',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: 600,
  }
};
