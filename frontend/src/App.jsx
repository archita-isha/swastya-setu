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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/request" element={<BloodRequest />} />
            <Route path="/processing" element={<Processing />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/selection" element={<FinalSelection />} />
            <Route path="/donor-interaction" element={<DonorInteraction />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/active-requests" element={<ActiveRequests />} />
            <Route path="/map" element={<MapNavigation />} />
          </Routes>
        </main>
        <EmergencyPopup />
      </div>
    </Router>
  );
}

export default App;
