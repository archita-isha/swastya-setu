import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Droplet, ChevronRight } from 'lucide-react';

export default function ActiveRequests() {
  const navigate = useNavigate();

  const requests = [
    { id: 1, group: 'O-', location: 'Manipal Hospital', urgency: 'Critical', time: '10 mins ago' },
    { id: 2, group: 'B+', location: 'BGS Gleneagles', urgency: 'Medium', time: '1 hour ago' },
    { id: 3, group: 'A+', location: 'RNSIT Campus Clinic', urgency: 'Low', time: '3 hours ago' },
  ];

  return (
    <div className="container" style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={20} />
        Back
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>Active Blood Requests</h1>
        <p style={styles.subtitle}>Check if someone in need matches your blood type.</p>
      </div>

      <div style={styles.list}>
        {requests.map((req) => (
          <div key={req.id} className="glass-panel glass-panel-hover" style={styles.card}>
            <div style={styles.bloodBadge}>
              <Droplet size={24} color="#fff" />
              <span style={styles.bloodText}>{req.group}</span>
            </div>
            
            <div style={styles.info}>
              <h3 style={styles.location}>
                <MapPin size={16} color="var(--text-muted)"/> 
                {req.location}
              </h3>
              <div style={styles.meta}>
                <span style={{
                  ...styles.urgency, 
                  color: req.urgency === 'Critical' ? 'var(--primary)' : (req.urgency === 'Medium' ? 'var(--warning)' : 'var(--success)')
                }}>
                  {req.urgency} Priority
                </span>
                <span style={styles.time}>
                  <Clock size={14} /> {req.time}
                </span>
              </div>
            </div>

            <div style={styles.actionGroup}>
              <button 
                style={styles.mapBtn} 
                onClick={() => navigate('/map', { state: { destination: req.location } })}
                title="View on Map"
              >
                <MapPin size={20} />
              </button>
              <button style={styles.actionBtn} onClick={() => navigate('/donor-interaction', { state: { requestData: req } })}>
                Donate
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    padding: '0.5rem 0',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  header: {
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    margin: 0,
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1.1rem',
    marginTop: '0.5rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    padding: '1.5rem',
    gap: '1.5rem',
  },
  bloodBadge: {
    background: 'var(--primary)',
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(239, 68, 68, 0.4)',
  },
  bloodText: {
    color: '#fff',
    fontWeight: 800,
    fontSize: '1.1rem',
  },
  info: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  location: {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  urgency: {
    fontWeight: 700,
    fontSize: '0.9rem',
  },
  time: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  mapBtn: {
    background: 'transparent',
    color: 'var(--secondary)',
    border: '2px solid var(--secondary)',
    padding: '0.75rem',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  actionBtn: {
    background: 'var(--secondary)',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background 0.2s',
  }
};
