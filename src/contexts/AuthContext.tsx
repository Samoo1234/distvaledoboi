import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Session, 
  User, 
  AuthError,
  AuthResponse
} from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { useNotification } from '../components/shared/Notification';

// Interface para credenciais de login
interface LoginCredentials {
  email: string;
  password: string;
}

// Interface para o usuário autenticado
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'vendedor' | 'separacao' | 'admin';
  avatar_url?: string;
}

// Interface para o contexto de autenticação
interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  checkUserRole: (allowedRoles: string[]) => boolean;
}

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto de autenticação
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

// Props do provedor de autenticação
interface AuthProviderProps {
  children: React.ReactNode;
}

// Provedor de autenticação
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Função para fazer login
  const signIn = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('📡 AuthContext: signIn chamado com email:', credentials.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('📨 AuthContext: Resposta do signInWithPassword:', { hasData: !!data, error });
      
      if (error) throw error;
      
      console.log('✅ AuthContext: signIn bem-sucedido, retornando dados');
      return { data, error };
    } catch (error) {
      console.error('💥 AuthContext: Erro ao fazer login:', error);
      showNotification({ 
        message: (error as AuthError).message || 'Erro ao fazer login', 
        type: 'error' 
      });
      throw error;
    }
  };

  // Função para fazer logout
  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redireciona para login após logout
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      showNotification({ 
        message: 'Erro ao fazer logout', 
        type: 'error' 
      });
    }
  };

  // Verificar se o usuário tem um papel específico
  const checkUserRole = (allowedRoles: string[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  // Função auxiliar para buscar perfil do usuário
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }
  }, []);

  // Efeito para carregar e monitorar a sessão do usuário
  useEffect(() => {
    const setupAuth = async () => {
      setLoading(true);
      
      try {
        console.log('🔄 Configurando autenticação inicial...');
        
        // Obtém a sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession) {
          console.log('✅ Sessão encontrada, carregando perfil...');
          const userData = await fetchUserProfile(currentSession.user.id);
          setUser(userData);
        } else {
          console.log('❌ Nenhuma sessão encontrada');
          setUser(null);
        }
      } catch (error) {
        console.error('💥 Erro ao configurar auth:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Configura a autenticação inicial
    setupAuth();
    
    // Configura o listener para mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setSession(session);
        setLoading(false);
      }
    );
    
    // Limpa o listener quando o componente é desmontado
    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);
  
  // Verifica se o usuário está autenticado
  const isAuthenticated = !!session && !!user;
  
  // Log mudanças importantes no estado
  useEffect(() => {
    console.log('📊 AuthContext: Estado mudou:', { 
      hasUser: !!user, 
      hasSession: !!session, 
      isAuthenticated, 
      loading,
      userRole: user?.role 
    });
  }, [user, session, isAuthenticated, loading]);
  
  // Valores expostos pelo contexto
  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated,
    checkUserRole
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
