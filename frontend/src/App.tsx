import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import ModelsList from './pages/ModelsList';
import CreateModel from './pages/CreateModel';
import Admin from './pages/Admin';
import AuditLogs from './pages/AuditLogs';
import './App.css';

function RedirectOnRefresh() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is a fresh page load (not a client-side navigation)
    const isRefresh = !window.history.state?.usr;
    
    // If it's a refresh and we're not on the homepage, redirect to home
    if (isRefresh && location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  return null;
}

export default function App() {
  return (
    <Router>
      <RedirectOnRefresh />
      <div className="app">
        <header className="app-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>AutoCRUD-RBAC</h1>
              <p className="app-subtitle">Dynamic Model Builder</p>
            </div>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>
                🏠 Home
              </Link>
              <Link to="/models" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>
                📋 Models
              </Link>
              <Link to="/admin" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>
                📊 Admin
              </Link>
              <Link to="/audit-logs" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>
                📜 Audit Logs
              </Link>
            </nav>
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/models" element={<ModelsList />} />
            <Route path="/models/new" element={<CreateModel />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
