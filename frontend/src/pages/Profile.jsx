import { useNavigate } from 'react-router-dom';
import { Award, Heart, Droplet, Star, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();

  // Simulated Donor Data
  const donor = {
    name: "John Doe",
    usn: "1RN21CS045",
    bloodGroup: "O+",
    rank: "Gold Hero",
    points: 1250,
    donations: 4,
    livesSaved: 12, // Usually estimated at 3 lives per pint
  };

  return (
    <div className="container" style={styles.container}>
      
      <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="glass-panel" style={styles.profileCard}>
        {/* Header Profile Section */}
        <div style={styles.profileHeader}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatar}>
              <ShieldCheck size={64} color="#ffd700" />
            </div>
            <div style={styles.rankBadge}>
              <Award size={16} color="#fff" style={{marginRight: '4px'}}/>
              {donor.rank}
            </div>
          </div>
          
          <h1 style={styles.name}>{donor.name}</h1>
          <p style={styles.usn}>{donor.usn} • {donor.bloodGroup}</p>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <Heart size={32} color="var(--primary)" />
            <h2 style={styles.statNumber}>{donor.donations}</h2>
            <p style={styles.statLabel}>Total Donations</p>
          </div>
          
          <div style={{...styles.statBox, background: 'rgba(59, 130, 246, 0.1)', borderColor: 'var(--secondary)'}}>
            <Star size={32} color="var(--secondary)" />
            <h2 style={{...styles.statNumber, color: 'var(--secondary)'}}>{donor.points}</h2>
            <p style={styles.statLabel}>Honor Points</p>
          </div>
          
          <div style={{...styles.statBox, background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)'}}>
            <Droplet size={32} color="var(--success)" />
            <h2 style={{...styles.statNumber, color: 'var(--success)'}}>{donor.livesSaved}</h2>
            <p style={styles.statLabel}>Lives Saved</p>
          </div>
        </div>

        {/* Rank Progression */}
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>Next Rank: Platinum Hero</span>
            <span style={styles.progressText}>{donor.points} / 2000 XP</span>
          </div>
          <div style={styles.progressBarBg}>
            <div style={{...styles.progressBarFill, width: '62.5%'}}></div>
          </div>
          <p style={styles.progressSub}>You are just 750 points away from unlocking the highest honor in SWASTYA SETU!</p>
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
  profileCard: {
    padding: '3rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
  },
  profileHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '0.5rem',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: '1rem',
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.05) 100%)',
    border: '3px solid #ffd700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
  },
  rankBadge: {
    position: 'absolute',
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #d4af37 0%, #aa8000 100%)',
    color: '#fff',
    padding: '0.4rem 1rem',
    borderRadius: '999px',
    fontWeight: 800,
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    whiteSpace: 'nowrap',
  },
  name: {
    fontSize: '2rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    margin: 0,
  },
  usn: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  statBox: {
    padding: '1.5rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid var(--primary)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '0.5rem',
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: 'var(--primary)',
    margin: '0.5rem 0 0 0',
    lineHeight: '1',
  },
  statLabel: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    margin: 0,
    textTransform: 'uppercase',
  },
  progressSection: {
    background: 'var(--bg-secondary)',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
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
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontSize: '1.1rem',
  },
  progressText: {
    fontWeight: 800,
    color: '#ffd700',
  },
  progressBarBg: {
    width: '100%',
    height: '16px',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #d4af37 0%, #ffeaa7 100%)',
    borderRadius: '8px',
  },
  progressSub: {
    margin: 0,
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    textAlign: 'center',
    fontStyle: 'italic',
  }
};
