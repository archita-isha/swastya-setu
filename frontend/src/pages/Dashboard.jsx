import { useNavigate } from 'react-router-dom';
import { Droplet, Activity, Map, User, ChevronRight, HeartPulse } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const menuOptions = [
    {
      title: "Ask for Blood",
      subtitle: "Initiate an emergency AI donor search",
      icon: <Droplet size={36} color="#fff" />,
      route: "/request",
      color: "var(--primary)",
      gradient: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
      delay: "0.1s"
    },
    {
      title: "Check Blood Required",
      subtitle: "View live active requests in campus",
      icon: <Activity size={36} color="#fff" />,
      route: "/active-requests",
      color: "var(--warning)",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      delay: "0.2s"
    },
    {
      title: "Navigate to Map",
      subtitle: "Locate nearby blood banks and donors",
      icon: <Map size={36} color="#fff" />,
      route: "/map",
      color: "var(--success)",
      gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
      delay: "0.3s"
    },
    {
      title: "My Profile",
      subtitle: "View your donor rank and points",
      icon: <User size={36} color="#fff" />,
      route: "/profile",
      color: "var(--secondary)",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      delay: "0.4s"
    }
  ];

  return (
    <div className="container" style={styles.container}>
      {/* Welcome Section */}
      <div style={styles.header} className="glass-panel">
        <div style={styles.headerContent}>
          <div style={styles.avatarGlow}>
            <HeartPulse size={48} color="var(--primary)" className="animate-pulse" />
          </div>
          <div>
            <h1 style={styles.greeting}>SWASTYA SETU Hub</h1>
            <p style={styles.subtitle}>What would you like to do today, Hero?</p>
          </div>
        </div>
      </div>

      {/* Main Action Grid */}
      <div style={styles.grid}>
        {menuOptions.map((option, index) => (
          <div 
            key={index}
            className="glass-panel glass-panel-hover"
            style={{
              ...styles.card,
              animationDelay: option.delay,
              animation: 'fadeIn 0.5s ease-out forwards'
            }}
            onClick={() => navigate(option.route)}
          >
            <div style={{...styles.iconBox, background: option.gradient}}>
              {option.icon}
            </div>
            <div style={styles.cardInfo}>
              <h2 style={styles.cardTitle}>{option.title}</h2>
              <p style={styles.cardSubtitle}>{option.subtitle}</p>
            </div>
            <div style={styles.arrowBox}>
              <ChevronRight size={24} color="var(--text-muted)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    padding: '3rem 2rem',
    marginTop: '1rem',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    background: 'var(--bg-glass)',
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  avatarGlow: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(239, 68, 68, 0.3)',
    boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)',
  },
  greeting: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    margin: 0,
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1.25rem',
    fontWeight: 500,
    marginTop: '0.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    padding: '1.5rem',
    gap: '1.5rem',
    cursor: 'pointer',
    opacity: 0, // Starts invisible for the fadeIn animation
  },
  iconBox: {
    width: '70px',
    height: '70px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  cardTitle: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    margin: '0.25rem 0 0 0',
  },
  arrowBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-primary)',
  }
};
