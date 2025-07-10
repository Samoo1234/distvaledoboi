import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/shared/Notification';

/**
 * Classe Interceptador para requisições API
 * Gerencia erros de autenticação e autorização de forma centralizada
 */
export class ApiInterceptor {
  private static instance: ApiInterceptor;
  private notifyFunction: ((message: string, type: 'success' | 'error' | 'info' | 'warning') => void) | null = null;
  private navigateFunction: ((path: string) => void) | null = null;

  private constructor() {}

  /**
   * Obtém instância singleton do interceptador
   */
  public static getInstance(): ApiInterceptor {
    if (!ApiInterceptor.instance) {
      ApiInterceptor.instance = new ApiInterceptor();
    }
    return ApiInterceptor.instance;
  }

  /**
   * Configura funções de notificação e navegação
   */
  public setup(
    notifyFn: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void,
    navigateFn: (path: string) => void
  ): void {
    this.notifyFunction = notifyFn;
    this.navigateFunction = navigateFn;
  }

  /**
   * Processa respostas de erro da API
   */
  public async processApiError(error: any): Promise<never> {
    console.error('API Error:', error);

    // Determina o tipo de erro
    let status = 500;
    let message = 'Ocorreu um erro ao processar sua solicitação';

    if (error.status) {
      status = error.status;
    } else if (error.response) {
      status = error.response.status;
    } else if (typeof error.message === 'string') {
      if (error.message.includes('401')) status = 401;
      if (error.message.includes('403')) status = 403;
      if (error.message.includes('404')) status = 404;
      message = error.message;
    }

    // Ações baseadas no status do erro
    switch (status) {
      case 401: // Não autenticado
        if (this.notifyFunction) {
          this.notifyFunction('Sua sessão expirou. Por favor, faça login novamente.', 'error');
        }
        // Fazer logout
        await supabase.auth.signOut();
        // Redirecionar para login
        if (this.navigateFunction) {
          this.navigateFunction('/login');
        }
        break;

      case 403: // Não autorizado
        if (this.notifyFunction) {
          this.notifyFunction('Você não tem permissão para realizar esta operação.', 'error');
        }
        break;

      case 404: // Não encontrado
        if (this.notifyFunction) {
          this.notifyFunction('O recurso solicitado não foi encontrado.', 'error');
        }
        break;

      default:
        if (this.notifyFunction) {
          this.notifyFunction(message, 'error');
        }
        break;
    }

    throw error; // Propaga o erro para ser tratado pelo chamador
  }
}

/**
 * Hook para usar o interceptador em componentes React
 */
export const useApiInterceptor = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const interceptor = ApiInterceptor.getInstance();

  // Configura o interceptador com as funções de notificação e navegação
  interceptor.setup(
    (message, type) => showNotification({ message, type }), 
    (path) => navigate(path)
  );

  return interceptor;
};

// Exporta uma instância do interceptador para uso em serviços não-React
export const apiInterceptor = ApiInterceptor.getInstance();

export default apiInterceptor;
