# RNSIT AI Blood Donation App - Frontend

This is the fully responsive, production-ready frontend for the AI-based Blood Donation system, specifically customized for RNSIT College.

## Features Included
- **Dark/Light Mode** support out-of-the-box (using Context API).
- **Glassmorphism UI** for a premium and modern look.
- **RNSIT Branding**: Custom logo and background assets integrated.
- **Emergency Popup System**: A high-priority full-screen modal triggered globally.
- **Live Tracking Dashboard**: Simulating real-time donor responses.
- **Complete User Flow**: Login -> Dashboard -> Request Blood -> AI Processing -> Tracking -> Final Selection.

## How to Execute the Frontend

1. Ensure you have [Node.js](https://nodejs.org/) installed on your machine.
2. Open a terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
3. Install the dependencies (if not already done):
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to `http://localhost:5173`.

## Connecting to the Python Backend API

Currently, the application uses mock simulated data and delays (using `setTimeout`) within the React components (e.g., `Processing.jsx`, `Tracking.jsx`) to demonstrate the flow without needing the backend to be running.

To connect this frontend to your final Python backend:

1. **Create an Axios/Fetch Service**: 
   Create a file `src/services/api.js` and configure your backend base URL (e.g., `http://localhost:5000/api`).

2. **Replace Mock Delays in `BloodRequest.jsx`**:
   Instead of just navigating to the processing screen, send a POST request to your backend:
   ```javascript
   const handleSubmit = async (e) => {
     e.preventDefault();
     try {
       await fetch('http://localhost:5000/api/requests', {
         method: 'POST',
         body: JSON.stringify(formData)
       });
       navigate('/processing');
     } catch (err) {
       console.error(err);
     }
   };
   ```

3. **Listen for WebSockets (for Tracking.jsx)**:
   Instead of using `setInterval` to mock donor responses, connect to your backend WebSocket or use Server-Sent Events (SSE) to receive live YES/NO updates from the AI agent system.

4. **Trigger Emergency Popups Dynamically**:
   In `App.jsx`, listen to WebSocket events from the backend to automatically call the `triggerEmergency(data)` function from `AppContext` when a matching donor is found.

## Dependencies
- React (Vite)
- React Router DOM
- Lucide React (for Icons)
- Vanilla CSS (for Styling)
