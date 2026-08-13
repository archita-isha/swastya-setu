import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Phone, Navigation, MapPin, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function FinalSelection() {
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSelected() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/selected`);
        if (response.ok) {
          const data = await response.json();
          setDonors(data);
        }
      } catch (err) {
        console.error("Error fetching selected donors:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSelected();
  }, []);

  return (
    <div className="container" style={styles.container}>
      <div className="glass-panel animate-fade-in" style={styles.card}>
        
        <div style={styles.header}>
          <div style={styles.successIcon}>
            <CheckCircle2 size={48} color="#fff" />
          </div>
          <h1 style={styles.title}>
            {loading ? "Loading Match..." : donors.length > 0 ? "Match Found!" : "No Match Found"}
          </h1>
          <p style={styles.subtitle}>
            {loading ? "Fetching selected donor details..." : donors.length > 0 ? "Eligible donor(s) have accepted your request." : "Waiting for donor responses..."}
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="animate-pulse" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Loading...</div>
          </div>
        ) : donors.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {donors.map((donor, idx) => (
              <div key={idx} style={styles.donorCard}>
                <div style={styles.profileSection}>
                  <div style={styles.avatar}>
                    <UserCheck size={40} color="var(--primary)" />
                  </div>
                  <div style={styles.donorInfo}>
                    <h2 style={styles.donorName}>{donor.name}</h2>
                    <span style={styles.bloodBadge}>{donor.bloodGroup}</span>
                  </div>
                </div>

                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <MapPin size={20} color="var(--text-muted)" />
                    <div style={styles.detailText}>
                      <span style={styles.detailLabel}>Location</span>
                      <span style={styles.detailValue}>{donor.address}</span>
                    </div>
                  </div>
                  
                  {donor.contact && donor.contact !== "None" && donor.contact !== "N/A" && (
                    <div style={styles.detailItem}>
                      <Phone size={20} color="var(--text-muted)" />
                      <div style={styles.detailText}>
                        <span style={styles.detailLabel}>Contact</span>
                        <span style={styles.detailValue}>{donor.contact}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={styles.actions}>
                  <button style={styles.callBtn} onClick={() => window.location.href = `tel:${donor.contact}`}>
                    <Phone size={20} />
                    Call Donor
                  </button>
                  
                  <button style={styles.navBtn} onClick={() => alert(`Navigating to ${donor.name}'s location...`)}>
                    <Navigation size={20} />
                    Navigate
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
            No donors have responded YES yet. Please check active requests or wait.
          </div>
        )}
        
        <button style={styles.homeBtn} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>

      </div>
    </div>
  );
}

const styles = {
  donorCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '1.5rem',
    background: 'var(--bg-secondary)',
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '2rem 1rem',
  },
  card: {
    width: '100%',
    maxWidth: '500px',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '1rem',
  },
  successIcon: {
    background: 'var(--success)',
    padding: '1rem',
    borderRadius: '50%',
    boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    margin: 0,
  },
  subtitle: {
    color: 'var(--text-secondary)',
    margin: 0,
  },
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1.5rem',
    background: 'var(--bg-secondary)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donorInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  donorName: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  bloodBadge: {
    background: 'var(--primary)',
    color: '#fff',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.875rem',
    fontWeight: 700,
    display: 'inline-block',
    alignSelf: 'flex-start',
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  },
  detailText: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  detailValue: {
    fontSize: '1rem',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  actions: {
    display: 'flex',
    gap: '1rem',
  },
  callBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--success)',
    color: '#fff',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 600,
  },
  navBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--secondary)',
    color: '#fff',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 600,
  },
  homeBtn: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    padding: '1rem',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 600,
    marginTop: '0.5rem',
  }
};
