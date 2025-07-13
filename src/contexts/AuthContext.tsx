import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Session, 
  User, 
  AuthError,
  AuthResponse
} from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

// Interface para credenciais de login
interface LoginCredentials {
  email: string;
  password: string;
}

// Interface para o usuário autenticado - SIMPLIFICADA
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'vendedor' | 'separacao' | 'admin'; // Padrão vendedor
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

// Função para converter User do Supabase para AuthUser
const convertToAuthUser = async (supabaseUser: User): Promise<AuthUser> => {
  try {
    // Buscar o perfil do usuário na tabela user_profiles
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('role, name')
      .eq('id', supabaseUser.id)
      .single();
    
    if (error) {
      console.warn('⚠️ Erro ao buscar perfil do usuário:', error.message);
      console.log('📝 Usando role padrão: vendedor');
    }
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: userProfile?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
      role: userProfile?.role || 'vendedor' // Usa o role da tabela ou padrão
    };
  } catch (error) {
    console.error('❌ Erro ao converter usuário:', error);
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.email?.split('@')[0] || 'Usuário',
      role: 'vendedor' // Fallback para vendedor
    };
  }
};

// Provedor de autenticação - SIMPLIFICADO
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Função para fazer login - SIMPLIFICADA
  const signIn = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('🔐 Fazendo login...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) {
        console.error('❌ Erro no login:', error.message);
        throw error;
      }
      
      console.log('✅ Login realizado com sucesso!');
      return { data, error };
    } catch (error) {
      console.error('💥 Erro ao fazer login:', error);
      throw error;
    }
  };

  // Função para fazer logout - MELHORADA
  const signOut = async (): Promise<void> => {
    try {
      console.log('🚪 Iniciando logout...');
      
      // Limpar dados locais primeiro
      setUser(null);
      setSession(null);
      
      // Limpar localStorage (carrinho, dados offline, etc.)
      try {
        localStorage.removeItem('cart');
        localStorage.removeItem('offline_orders');
        localStorage.removeItem('offline_customers');
        localStorage.removeItem('offline_products');
        console.log('🧹 Dados locais limpos');
      } catch (localStorageError) {
        console.warn('⚠️ Erro ao limpar localStorage:', localStorageError);
      }
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro no logout do Supabase:', error.message);
        // Mesmo com erro no Supabase, continua o logout local
      }
      
      // Navegar para login
      navigate('/login', { replace: true });
      console.log('✅ Logout realizado com sucesso');
      
    } catch (error) {
      console.error('💥 Erro crítico no logout:', error);
      // Em caso de erro crítico, força logout local
      setUser(null);
      setSession(null);
      navigate('/login', { replace: true });
    }
  };

  // Verificar se o usuário tem um papel específico
  const checkUserRole = (allowedRoles: string[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  // Efeito para carregar e monitorar a sessão - SIMPLIFICADO
  useEffect(() => {
    console.log('🔧 Configurando AuthContext...');
    
    // Função para obter sessão atual
    const getSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          const authUser = await convertToAuthUser(currentSession.user);
          setUser(authUser);
          console.log('✅ Usuário logado:', authUser.email, 'Role:', authUser.role);
        } else {
          setUser(null);
          console.log('❌ Nenhuma sessão ativa');
        }
      } catch (error) {
        console.error('❌ Erro ao obter sessão:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Obter sessão inicial
    getSession();
    
    // Listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Estado auth mudou:', event);
        
        setSession(session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const authUser = await convertToAuthUser(session.user);
          setUser(authUser);
          console.log('✅ Login detectado:', authUser.email, 'Role:', authUser.role);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          console.log('🚪 Logout detectado');
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Array de dependências vazio - executa apenas uma vez
  
  // Verifica se o usuário está autenticado
  const isAuthenticated = !!user && !!session;

  // Valores computados
  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated,
    checkUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
