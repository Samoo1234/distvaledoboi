import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  children: ReactNode;
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
  const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
    try {
      console.log('📄 Buscando perfil do usuário:', userId);
      
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, name, avatar_url, active')
        .eq('id', userId)
        .single();
      
      console.log('📨 Resultado da busca:', { profileData, profileError });
      
      if (profileError) {
        console.log('❌ Erro ao buscar perfil:', profileError.message);
        return null;
      }
      
      if (!profileData.active) {
        console.log('❌ Conta desativada');
        showNotification({
          message: 'Sua conta está desativada. Entre em contato com o administrador.',
          type: 'error'
        });
        await supabase.auth.signOut();
        return null;
      }
      
      const userData: AuthUser = {
        id: userId,
        email: session?.user?.email || '',
        name: profileData.name || 'Usuário',
        role: profileData.role,
        avatar_url: profileData.avatar_url
      };
      
      console.log('✅ Perfil processado:', userData);
      return userData;
    } catch (error) {
      console.error('💥 Erro ao buscar perfil:', error);
      return null;
    }
  };

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
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('🔄 AuthContext: onAuthStateChange triggered', { event, hasSession: !!currentSession });
      
      setSession(currentSession);
      
      if (event === 'SIGNED_IN' && currentSession) {
        console.log('✅ Usuario logou, carregando perfil...');
        
        // Aguardar um momento para a sessão se estabelecer
        setTimeout(async () => {
          const userData = await fetchUserProfile(currentSession.user.id);
          if (userData) {
            console.log('🎯 Definindo usuário no estado:', userData);
            setUser(userData);
          } else {
            console.log('❌ Falha ao carregar perfil, fazendo logout');
            await supabase.auth.signOut();
          }
        }, 500);
        
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 Usuario fez logout');
        setUser(null);
      }
    });
    
    // Limpa o listener quando o componente é desmontado
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, showNotification]);
  
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
