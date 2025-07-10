import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './components/shared/Notification';
import ProtectedRoute from './components/shared/ProtectedRoute';
import MobileLayout from './components/mobile/MobileLayout';
import DesktopLayout from './components/desktop/DesktopLayout';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NotificationProvider>
          <AuthProvider>
            <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Mobile Routes (Vendedor) */}
            <Route path="/mobile" element={
              <ProtectedRoute role="vendedor">
                <MobileLayout />
              </ProtectedRoute>
            } />
            
            {/* Desktop Routes (Separação) */}
            <Route path="/separacao" element={
              <ProtectedRoute role="separacao">
                <DesktopLayout type="separacao" />
              </ProtectedRoute>
            } />
            
            {/* Desktop Routes (Admin) */}
            <Route path="/admin" element={
              <ProtectedRoute role="admin">
                <DesktopLayout type="admin" />
              </ProtectedRoute>
            } />
            
            {/* Default redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AuthProvider>
        </NotificationProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
