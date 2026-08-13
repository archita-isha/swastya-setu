import { useAppContext } from '../context/AppContext';
import { AlertTriangle, Car, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmergencyPopup() {
  const { emergencyPopup, closeEmergency } = useAppContext();
  const navigate = useNavigate();

  if (!emergencyPopup.isOpen || !emergencyPopup.data) return null;

  const handleDonate = () => {
    closeEmergency();
    navigate('/donor-interaction');
  };

  return (
    <div style={styles.overlay} className="animate-fade-in">
      <div style={styles.popup} className="animate-pulse-subtle">
        <div style={styles.header}>
          <AlertTriangle size={32} color="#fff" />
          <h2 style={styles.title}>🔴 URGENT BLOOD REQUEST</h2>
        </div>
        
        <div style={styles.body}>
          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <span style={styles.label}>Blood Group Required</span>
              <span style={styles.valueRed}>{emergencyPopup.data.bloodGroup || 'O+'}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>Urgency</span>
              <span style={styles.valueWarning}>{emergencyPopup.data.urgency || 'Critical'}</span>
            </div>
          </div>
          
          <div style={styles.detailItemFull}>
            <span style={styles.label}>Location</span>
            <span style={styles.value}>{emergencyPopup.data.location || 'City Blood Bank'}</span>
          </div>

          <div style={styles.highlightBox}>
            <Car size={24} color="var(--success)" />
            <span style={styles.highlightText}>Travel charges will be fully reimbursed</span>
          </div>
        </div>

        <div style={styles.actions}>
          <button style={styles.acceptBtn} onClick={handleDonate}>
            <CheckCircle2 size={20} />
            I Can Donate
          </button>
          <button style={styles.declineBtn} onClick={closeEmergency}>
            <XCircle size={20} />
            Not Available
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(8px)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
  },
  popup: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.5)',
    overflow: 'hidden',
    border: '2px solid var(--primary)',
  },
  header: {
    backgroundColor: 'var(--primary)',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    color: '#fff',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 800,
    letterSpacing: '0.5px',
  },
  body: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    background: 'var(--bg-primary)',
    padding: '1rem',
    borderRadius: '12px',
  },
  detailItemFull: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    background: 'var(--bg-primary)',
    padding: '1rem',
    borderRadius: '12px',
  },
  label: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  value: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  valueRed: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--primary)',
  },
  valueWarning: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--warning)',
  },
  highlightBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid var(--success)',
    padding: '1rem',
    borderRadius: '12px',
    marginTop: '0.5rem',
  },
  highlightText: {
    color: 'var(--success)',
    fontWeight: 700,
    fontSize: '1.1rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    padding: '0 2rem 2rem 2rem',
  },
  acceptBtn: {
    flex: 1,
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
    transition: 'transform 0.2s',
  },
  declineBtn: {
    flex: 1,
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
    transition: 'background 0.2s',
  }
};
