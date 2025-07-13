import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme';
import Login from './pages/Login';
import MobilePage from './pages/MobilePage';
import AdminPage from './pages/AdminPage';
import SeparacaoPage from './pages/SeparacaoPage';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './components/shared/Notification';
import ProtectedRoute from './components/shared/ProtectedRoute';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NotificationProvider>
          <AuthProvider>
            <CartProvider>
              <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Mobile Routes (Vendedor) */}
              <Route path="/mobile/*" element={
                <ProtectedRoute role="vendedor">
                  <MobilePage />
                </ProtectedRoute>
              } />
              
              {/* Desktop Routes (Separação) */}
              <Route path="/separacao/*" element={
                <ProtectedRoute role="separacao">
                  <SeparacaoPage />
                </ProtectedRoute>
              } />
              
              {/* Desktop Routes (Admin) */}
              <Route path="/admin/*" element={
                <ProtectedRoute role="admin">
                  <AdminPage />
                </ProtectedRoute>
              } />
              
              {/* Default redirect to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </NotificationProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
