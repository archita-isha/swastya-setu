import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, MapPin, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function BloodRequest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bloodGroup: '',
    units: 1,
    urgency: 'Medium',
    location: '',
    contact: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send real data to Flask backend
      await fetch(`${API_BASE_URL}/api/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      navigate('/processing', { state: { requestData: formData } });
    } catch (err) {
      console.error("Failed to connect to backend", err);
      // Fallback for demonstration if backend isn't running
      navigate('/processing', { state: { requestData: formData } });
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="container" style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <Droplet size={32} color="#fff" />
          </div>
          <div>
            <h1 style={styles.title}>Request Blood</h1>
            <p style={styles.subtitle}>Initiate an AI search for eligible donors.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <div className="input-group">
              <label className="input-label">Blood Group Required</label>
              <select 
                className="input-field" 
                name="bloodGroup" 
                value={formData.bloodGroup} 
                onChange={handleChange}
                required
              >
                <option value="">Select Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Units Required</label>
              <input 
                type="number" 
                className="input-field" 
                name="units" 
                min="1" 
                max="10" 
                value={formData.units} 
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Urgency Level</label>
            <div style={styles.urgencyGrid}>
              {['Low', 'Medium', 'Critical'].map(level => (
                <div 
                  key={level}
                  style={{
                    ...styles.urgencyOption,
                    ...(formData.urgency === level ? styles[`urgency${level}Active`] : {})
                  }}
                  onClick={() => setFormData({...formData, urgency: level})}
                >
                  {level}
                </div>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Location</label>
            <div style={styles.inputWithIcon}>
              <MapPin size={20} color="var(--text-muted)" style={styles.inputIcon} />
              <input 
                type="text" 
                className="input-field" 
                style={{paddingLeft: '2.5rem', width: '100%'}}
                name="location" 
                placeholder="Hospital Name, Area, City"
                value={formData.location} 
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Contact Number</label>
            <div style={styles.inputWithIcon}>
              <Phone size={20} color="var(--text-muted)" style={styles.inputIcon} />
              <input 
                type="tel" 
                className="input-field" 
                style={{paddingLeft: '2.5rem', width: '100%'}}
                name="contact" 
                placeholder="10-digit mobile number"
                value={formData.contact} 
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" style={styles.submitBtn}>
            Find Donors Now
            <ArrowRight size={20} />
          </button>
        </form>
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
    padding: '2.5rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  iconWrapper: {
    background: 'var(--primary)',
    padding: '1rem',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)',
  },
  title: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
  },
  subtitle: {
    margin: 0,
    color: 'var(--text-secondary)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  urgencyGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '0.5rem',
  },
  urgencyOption: {
    padding: '0.75rem',
    textAlign: 'center',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s',
    color: 'var(--text-secondary)',
  },
  urgencyLowActive: {
    background: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'var(--success)',
    color: 'var(--success)',
  },
  urgencyMediumActive: {
    background: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'var(--warning)',
    color: 'var(--warning)',
  },
  urgencyCriticalActive: {
    background: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'var(--primary)',
    color: 'var(--primary)',
  },
  inputWithIcon: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '0.75rem',
  },
  submitBtn: {
    marginTop: '1rem',
    width: '100%',
    padding: '1rem',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'background 0.2s',
  }
};
