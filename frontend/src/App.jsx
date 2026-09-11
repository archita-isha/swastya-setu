import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BloodRequest from './pages/BloodRequest';
import Processing from './pages/Processing';
import Tracking from './pages/Tracking';
import FinalSelection from './pages/FinalSelection';
import DonorInteraction from './pages/DonorInteraction';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ActiveRequests from './pages/ActiveRequests';
import MapNavigation from './pages/MapNavigation';

import Navbar from './components/Navbar';
import EmergencyPopup from './components/EmergencyPopup';
import { useAppContext } from './context/AppContext';

function ProtectedRoute({ children }) {
  const { user } = useAppContext();
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <div className="app-bg-wrapper">
        <div className="app-bg-overlay"></div>
      </div>
      <div className="app-container">
        <Navbar />
        <main className="page-wrapper animate-fade-in">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/request" element={<ProtectedRoute><BloodRequest /></ProtectedRoute>} />
            <Route path="/processing" element={<ProtectedRoute><Processing /></ProtectedRoute>} />
            <Route path="/tracking" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
            <Route path="/selection" element={<ProtectedRoute><FinalSelection /></ProtectedRoute>} />
            <Route path="/donor-interaction" element={<ProtectedRoute><DonorInteraction /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/active-requests" element={<ProtectedRoute><ActiveRequests /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><MapNavigation /></ProtectedRoute>} />
          </Routes>
        </main>
        <EmergencyPopup />
      </div>
    </Router>
  );
}

export default App;
