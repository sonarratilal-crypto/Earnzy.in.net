import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Plans } from './pages/Plans';
import { Withdraw } from './pages/Withdraw';
import { Referral } from './pages/Referral';
import { Offers } from './pages/Offers';

function App() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading Earnzy...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {user && <Header />}
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
          <Route path="/plans" element={user ? <Plans /> : <Navigate to="/login" replace />} />
          <Route path="/withdraw" element={user ? <Withdraw /> : <Navigate to="/login" replace />} />
          <Route path="/referral" element={user ? <Referral /> : <Navigate to="/login" replace />} />
          <Route path="/offers" element={user ? <Offers /> : <Navigate to="/login" replace />} />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
