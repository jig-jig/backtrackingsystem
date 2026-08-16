// import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import SessionTimeoutGuard from './components/SessionTimeoutGuard';

function App() {
  return (
    <BrowserRouter>
      {/* 🛡️ Guard checks every page under this branch layout tree layer */}
      <SessionTimeoutGuard timeoutMins={15}> 
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/register" element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <Register />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </SessionTimeoutGuard>
    </BrowserRouter>
  );
}

export default App;
