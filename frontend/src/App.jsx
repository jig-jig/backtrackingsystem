import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Access Entry Routing Points */}
        <Route path="/login" element={<Login />} />
        
        {/* Core Dashboard Protected Route */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Staff Provision Access Route - Restricted to Administrators Only */}
        <Route path="/register" element={
          <ProtectedRoute allowedRoles={['Administrator']}>
            <Register />
          </ProtectedRoute>
        } />

        {/* Default Fallback Redirect Route Catching Handler */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
