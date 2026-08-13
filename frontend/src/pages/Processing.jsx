import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Cpu, Search, Filter, BellRing, CheckCircle2 } from 'lucide-react';

export default function Processing() {
  const navigate = useNavigate();
  const location = useLocation();
  const requestData = location.state?.requestData || {};

  const [step, setStep] = useState(0);

  const steps = [
    { icon: <Search size={24} />, text: "Analyzing request details..." },
    { icon: <Filter size={24} />, text: `Filtering donors matching ${requestData.bloodGroup || 'O+'}...` },
    { icon: <Cpu size={24} />, text: "Applying AI availability prediction models..." },
    { icon: <BellRing size={24} />, text: "Sending critical push notifications..." },
    { icon: <CheckCircle2 size={24} />, text: "Tracking responses in real-time..." },
  ];

  useEffect(() => {
    // Simulate the AI agent steps processing delay
    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => navigate('/tracking'), 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1500); // Move to next step every 1.5s

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="container" style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        
        <div style={styles.animationContainer}>
          <div className="animate-pulse" style={styles.glowCircle}>
            <Cpu size={64} color="var(--secondary)" />
          </div>
        </div>

        <h2 style={styles.title}>AI Agent Processing</h2>
        <p style={styles.subtitle}>Our multi-agent system is currently working on your request.</p>

        <div style={styles.stepsContainer}>
          {steps.map((s, idx) => (
            <div 
              key={idx} 
              style={{
                ...styles.stepRow,
                opacity: idx <= step ? 1 : 0.3,
                transform: idx === step ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <div style={{
                ...styles.iconBox,
                backgroundColor: idx < step ? 'var(--success)' : (idx === step ? 'var(--secondary)' : 'var(--bg-secondary)')
              }}>
                {idx < step ? <CheckCircle2 size={24} color="#fff" /> : <div style={{color: idx === step ? '#fff' : 'var(--text-muted)'}}>{s.icon}</div>}
              </div>
              <p style={{
                ...styles.stepText,
                color: idx === step ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: idx === step ? 600 : 400
              }}>
                {s.text}
              </p>
            </div>
          ))}
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
  },
  card: {
    width: '100%',
    maxWidth: '600px',
    padding: '3rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  animationContainer: {
    marginBottom: '2rem',
    position: 'relative',
  },
  glowCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.1)',
    border: '2px solid rgba(59, 130, 246, 0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 0 40px rgba(59, 130, 246, 0.2)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    margin: 0,
  },
  subtitle: {
    color: 'var(--text-secondary)',
    margin: '0.5rem 0 2rem 0',
  },
  stepsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    textAlign: 'left',
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    transition: 'all 0.3s ease',
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'background-color 0.3s ease',
  },
  stepText: {
    margin: 0,
    fontSize: '1rem',
  }
};
