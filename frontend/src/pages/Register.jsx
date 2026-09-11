import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Heart, ArrowRight, Phone, KeyRound } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState('details'); // 'details' | 'verification'
  const [formData, setFormData] = useState({
    name: '',
    usn: '',
    bloodGroup: '',
    email: '',
    password: '',
    phone: '',
    isDonor: true
  });
  
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [timer, setTimer] = useState(600); // 10 minutes = 600s
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const timerRef = useRef(null);

  // Start the countdown timer when entering the verification step
  useEffect(() => {
    if (step === 'verification') {
      setTimer(600);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setError('OTP expired. Please request a new OTP.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const usnValid = formData.usn.trim().toUpperCase().startsWith('1RN');
    const emailValid = formData.email.trim().toLowerCase().endsWith('@rnsit.ac.in');

    if (!usnValid || !emailValid) {
      setError('Registration is open only to RNSIT students. USN must start with "1RN" and email must end with "@rnsit.ac.in".');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/register/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Verification codes sent to your email and phone.');
        setStep('verification');
      } else {
        setError(data.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (timer === 0) {
      setError('OTP has expired. Please request a new one.');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/register/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          emailOtp,
          phoneOtp
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { state: { justRegistered: true } });
        }, 1500);
      } else {
        setError(data.error || 'Verification failed. Please check the codes.');
      }
    } catch (err) {
      console.error(err);
      setError('Verification connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/register/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('New verification codes sent.');
        setTimer(600);
      } else {
        setError(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Connection to backend failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div className="glass-panel animate-fade-in" style={styles.loginCard}>
          <div style={styles.header}>
            <img src="/logo.png" alt="RNSIT" style={styles.logo} />
            <h1 style={styles.title}>Join SWASTYA SETU</h1>
            <p style={styles.subtitle}>
              {step === 'details' ? 'Register as an RNSIT Student' : 'Verify Your Identity'}
            </p>
          </div>

          {error && (
            <div style={{ color: 'var(--primary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--primary)', background: 'rgba(239, 68, 68, 0.05)', fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ color: 'var(--success)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--success)', background: 'rgba(16, 185, 129, 0.05)', fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' }}>
              {message}
            </div>
          )}

          {step === 'details' ? (
            <form onSubmit={handleSendOtp} style={styles.form}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div style={styles.inputWithIcon}>
                  <User size={20} color="var(--text-muted)" style={styles.inputIcon} />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field" 
                    style={{paddingLeft: '2.5rem', width: '100%'}}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div style={styles.grid}>
                <div className="input-group">
                  <label className="input-label">USN</label>
                  <input 
                    type="text" 
                    name="usn"
                    value={formData.usn}
                    onChange={handleInputChange}
                    className="input-field" 
                    placeholder="1RN..."
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Blood Group</label>
                  <select 
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="input-field" 
                    required
                  >
                    <option value="" disabled>Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Email</label>
                <div style={styles.inputWithIcon}>
                  <Mail size={20} color="var(--text-muted)" style={styles.inputIcon} />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field" 
                    style={{paddingLeft: '2.5rem', width: '100%'}}
                    placeholder="name@rnsit.ac.in"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <div style={styles.inputWithIcon}>
                  <Phone size={20} color="var(--text-muted)" style={styles.inputIcon} />
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field" 
                    style={{paddingLeft: '2.5rem', width: '100%'}}
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label className="input-label">Password</label>
                <div style={styles.inputWithIcon}>
                  <Lock size={20} color="var(--text-muted)" style={styles.inputIcon} />
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-field" 
                    style={{paddingLeft: '2.5rem', width: '100%'}}
                    placeholder="Create password"
                    required
                  />
                </div>
              </div>

              <div style={styles.donorOptIn}>
                <input 
                  type="checkbox" 
                  id="donor" 
                  name="isDonor"
                  checked={formData.isDonor}
                  onChange={handleInputChange}
                  style={styles.checkbox} 
                />
                <label htmlFor="donor" style={styles.donorLabel}>
                  <Heart size={16} color="var(--primary)" />
                  Register me as an active blood donor
                </label>
              </div>

              <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                <ArrowRight size={20} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={styles.form}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 0 1rem 0', textAlign: 'center' }}>
                Enter the 6-digit codes sent to verify your identity.
              </p>

              <div className="input-group">
                <label className="input-label">Email Verification Code</label>
                <div style={styles.inputWithIcon}>
                  <KeyRound size={20} color="var(--text-muted)" style={styles.inputIcon} />
                  <input 
                    type="text" 
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field" 
                    style={{paddingLeft: '2.5rem', width: '100%'}}
                    placeholder="Enter 6-digit email OTP"
                    pattern="[0-9]{6}"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">SMS Gateway Simulation Code (printed on console)</label>
                <div style={styles.inputWithIcon}>
                  <KeyRound size={20} color="var(--text-muted)" style={styles.inputIcon} />
                  <input 
                    type="text" 
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field" 
                    style={{paddingLeft: '2.5rem', width: '100%'}}
                    placeholder="Enter 6-digit Simulation OTP"
                    pattern="[0-9]{6}"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                  Time remaining: <span style={{ color: timer < 60 ? 'var(--primary)' : 'var(--secondary)' }}>{formatTime(timer)}</span>
                </span>
                <button 
                  type="button" 
                  onClick={handleResendOtp}
                  disabled={loading || timer > 540} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', fontWeight: 700, cursor: 'pointer', opacity: timer > 540 ? 0.5 : 1, fontSize: '0.9rem' }}
                >
                  Resend OTP
                </button>
              </div>

              <button type="submit" disabled={loading || timer === 0} style={styles.submitBtn}>
                {loading ? 'Verifying...' : 'Verify and Create Account'}
                <ArrowRight size={20} />
              </button>

              <button 
                type="button" 
                onClick={() => setStep('details')} 
                style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem', width: '100%', cursor: 'pointer' }}
              >
                Back to Details
              </button>
            </form>
          )}

          <div style={styles.footer}>
            <p>Already have an account? <a href="/login" style={styles.link}>Sign in here</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  content: {
    width: '100%',
    maxWidth: '500px',
  },
  loginCard: {
    padding: '3rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    backgroundColor: 'var(--bg-glass)',
    border: '1px solid var(--bg-glass-border)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '0.5rem',
  },
  logo: {
    width: '70px',
    height: '70px',
    objectFit: 'contain',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    margin: 0,
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
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
  donorOptIn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '0.5rem',
    padding: '1rem',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid var(--primary-light)',
    borderRadius: '12px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--primary)',
    cursor: 'pointer',
  },
  donorLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  submitBtn: {
    marginTop: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 600,
    transition: 'background 0.2s',
    cursor: 'pointer',
    border: 'none',
    width: '100%'
  },
  footer: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
  },
  link: {
    color: 'var(--secondary)',
    fontWeight: 600,
    textDecoration: 'none',
  }
};
