import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertColor, 
  Theme,
  Slide, 
  SlideProps
} from '@mui/material';

// Interface para a configuração da notificação
interface NotificationOptions {
  message: string;
  type?: AlertColor;
  duration?: number;
  vertical?: 'top' | 'bottom';
  horizontal?: 'left' | 'center' | 'right';
}

// Interface para o contexto de notificação
interface NotificationContextType {
  showNotification: (options: NotificationOptions) => void;
  hideNotification: () => void;
}

// Contexto de notificação
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Função para transição da notificação
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

// Hook personalizado para usar notificações
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  
  return context;
};

// Propriedades do provedor de notificação
interface NotificationProviderProps {
  children: ReactNode;
}

// Provedor de notificação
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AlertColor>('info');
  const [duration, setDuration] = useState(5000);
  const [position, setPosition] = useState({
    vertical: 'bottom' as 'top' | 'bottom',
    horizontal: 'center' as 'left' | 'center' | 'right'
  });

  // Função para exibir notificação
  const showNotification = ({
    message,
    type = 'info',
    duration = 5000,
    vertical = 'bottom',
    horizontal = 'center'
  }: NotificationOptions) => {
    setMessage(message);
    setType(type);
    setDuration(duration);
    setPosition({ vertical, horizontal });
    setOpen(true);
  };

  // Função para esconder notificação
  const hideNotification = () => {
    setOpen(false);
  };

  // Estilo de alerta baseado no tipo
  const getAlertStyle = (theme: Theme, type: AlertColor) => {
    const styles = {
      success: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        border: '1px solid #a5d6a7'
      },
      error: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        border: '1px solid #ef9a9a'
      },
      warning: {
        backgroundColor: '#fff8e1',
        color: '#ff8f00',
        border: '1px solid #ffe082'
      },
      info: {
        backgroundColor: '#e1f5fe',
        color: '#0288d1',
        border: '1px solid #81d4fa'
      }
    };
    
    return styles[type] || styles.info;
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={hideNotification}
        anchorOrigin={position}
        TransitionComponent={SlideTransition}
        sx={{ 
          maxWidth: '90%',
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        <Alert
          onClose={hideNotification}
          severity={type}
          variant="filled"
          sx={(theme) => ({
            width: '100%',
            boxShadow: 2,
            fontWeight: 'medium',
            '& .MuiAlert-icon': {
              color: type === 'success' ? '#2e7d32' : 
                    type === 'error' ? '#c62828' :
                    type === 'warning' ? '#ff8f00' : '#0288d1'
            },
            ...getAlertStyle(theme, type)
          })}
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
