import apiClient from './apiClient';

/**
 * Interface para usuários
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'vendedor' | 'separacao' | 'admin';
  avatar_url?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Serviço de usuários que utiliza o ApiClient autenticado
 */
const userService = {
  /**
   * Busca todos os usuários
   * Requer permissão de administrador
   */
  getAll: async (): Promise<User[]> => {
    return apiClient.get<User[]>('/users');
  },

  /**
   * Busca usuário por ID
   */
  getById: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  /**
   * Cria um novo usuário
   * Requer permissão de administrador
   */
  create: async (userData: Omit<User, 'id'> & { password: string }): Promise<User> => {
    return apiClient.post<User>('/users', userData);
  },

  /**
   * Atualiza um usuário existente
   * Requer permissão de administrador para alterar outros usuários
   */
  update: async (id: string, userData: Partial<User>): Promise<User> => {
    return apiClient.put<User>(`/users/${id}`, userData);
  },

  /**
   * Desativa um usuário
   * Requer permissão de administrador
   */
  deactivate: async (id: string): Promise<void> => {
    return apiClient.put<void>(`/users/${id}/deactivate`, {});
  },

  /**
   * Envia email de redefinição de senha
   * Requer permissão de administrador ou ser o próprio usuário
   */
  resetPassword: async (email: string): Promise<void> => {
    return apiClient.post<void>('/users/reset-password', { email });
  },

  /**
   * Obtém o perfil do usuário atual autenticado
   */
  getCurrentProfile: async (): Promise<User> => {
    return apiClient.get<User>('/users/me');
  },

  /**
   * Atualiza o perfil do usuário atual autenticado
   */
  updateProfile: async (userData: Partial<Omit<User, 'role' | 'id'>>): Promise<User> => {
    return apiClient.put<User>('/users/me', userData);
  }
};

export default userService;
