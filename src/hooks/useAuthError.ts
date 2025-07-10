import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/shared/Notification';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para tratamento padronizado de erros de autenticação e autorização
 * Garante comportamento consistente em toda a aplicação
 */
export const useAuthError = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { signOut } = useAuth();

  /**
   * Função que trata erros de API relacionados à autenticação e autorização
   * - Erro 401: Redireciona para login
   * - Erro 403: Mostra mensagem de acesso negado
   * - Outros erros: Exibe mensagem genérica
   */
  const handleAuthError = (error: any) => {
    // Extrai código de status do erro (se disponível)
    const statusCode = error.status || 
                      error.statusCode || 
                      (error.message && error.message.includes('401') ? 401 : null) ||
                      (error.message && error.message.includes('403') ? 403 : null);

    // Mensagem personalizada por tipo de erro
    const errorMessage = error.message || 'Ocorreu um erro na requisição';

    switch (statusCode) {
      case 401: // Não autenticado
        showNotification({
          message: 'Sua sessão expirou. Por favor, faça login novamente.',
          type: 'error'
        });
        // Faz logout e redireciona para tela de login
        signOut().then(() => navigate('/login'));
        break;
      
      case 403: // Não autorizado
        showNotification({
          message: 'Você não tem permissão para realizar esta operação.',
          type: 'error'
        });
        break;
      
      default:
        showNotification({
          message: errorMessage,
          type: 'error'
        });
        break;
    }

    return error;
  };

  return { handleAuthError };
};

export default useAuthError;
