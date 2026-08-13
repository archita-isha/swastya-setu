import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation2, Crosshair } from 'lucide-react';

export default function MapNavigation() {
  const navigate = useNavigate();
  const locationState = useLocation();
  const destination = locationState.state?.destination || 'Nearest Blood Bank';

  return (
    <div className="container" style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <MapPin size={32} color="#fff" />
          </div>
          <div>
            <h1 style={styles.title}>Live Navigation</h1>
            <p style={styles.subtitle}>Routing to: {destination}</p>
          </div>
        </div>

        <div style={styles.mapContainer}>
          {/* Simulated Map View using CSS Background */}
          <div style={styles.mockMap}>
            <div className="animate-pulse" style={styles.userDot}></div>
            <div style={styles.hospitalDot}>
              <Crosshair size={24} color="var(--primary)" />
            </div>
            
            {/* Overlay Info */}
            <div style={styles.mapOverlay}>
              <div style={styles.etaBox}>
                <span style={styles.etaText}>15 min</span>
                <span style={styles.distText}>4.2 km</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.directionsPanel}>
          <div style={styles.directionStep}>
            <Navigation2 size={24} color="var(--secondary)" style={{transform: 'rotate(45deg)'}}/>
            <div>
              <p style={styles.stepTitle}>Head towards {destination}</p>
              <p style={styles.stepDist}>200m</p>
            </div>
          </div>
          
          <button style={styles.startBtn} onClick={() => alert('Starting Live GPS Navigation...')}>
            Start Live Navigation
          </button>
        </div>
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
    gap: '1rem',
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
  card: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  iconCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'var(--success)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)',
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
  },
  subtitle: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '1.1rem',
  },
  mapContainer: {
    width: '100%',
    height: '400px',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '2px solid var(--border-color)',
    position: 'relative',
  },
  mockMap: {
    width: '100%',
    height: '100%',
    background: 'url("https://www.transparenttextures.com/patterns/cubes.png"), linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDot: {
    position: 'absolute',
    bottom: '20%',
    left: '20%',
    width: '20px',
    height: '20px',
    backgroundColor: 'var(--secondary)',
    borderRadius: '50%',
    border: '4px solid #fff',
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)',
  },
  hospitalDot: {
    position: 'absolute',
    top: '30%',
    right: '30%',
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--primary)',
  },
  mapOverlay: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
  },
  etaBox: {
    background: 'var(--bg-secondary)',
    padding: '1rem',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid var(--border-color)',
  },
  etaText: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--success)',
    lineHeight: '1',
  },
  distText: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
  directionsPanel: {
    background: 'var(--bg-secondary)',
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  directionStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  stepTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  stepDist: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  startBtn: {
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '1rem',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '1.1rem',
    cursor: 'pointer',
    width: '100%',
    transition: 'background 0.2s',
  }
};
