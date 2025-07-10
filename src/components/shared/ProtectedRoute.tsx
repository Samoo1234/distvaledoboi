import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: string | string[];
}

/**
 * Componente para proteger rotas com base na autenticação e perfil do usuário
 * Redireciona para login se não autenticado
 * Verifica se o usuário tem o perfil necessário para acessar a rota
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, loading, checkUserRole } = useAuth();

  // Mostra tela de carregamento enquanto verifica a autenticação
  if (loading) {
    return <LoadingScreen />;
  }

  // Se não estiver autenticado, redireciona para o login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se a rota exige um perfil específico, verifica se o usuário tem permissão
  if (role) {
    const requiredRoles = Array.isArray(role) ? role : [role];
    
    // Se o usuário não tem o perfil necessário, redireciona para a página apropriada
    if (!checkUserRole(requiredRoles)) {
      // Redireciona para a página correspondente ao perfil do usuário
      if (user.role === 'vendedor') {
        return <Navigate to="/mobile" replace />;
      } else if (user.role === 'separacao') {
        return <Navigate to="/separacao" replace />;
      } else if (user.role === 'admin') {
        return <Navigate to="/admin" replace />;
      } else {
        // Perfil desconhecido ou inválido, volta para o login
        return <Navigate to="/login" replace />;
      }
    }
  }

  // Se passou por todas as verificações, renderiza o conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute;
