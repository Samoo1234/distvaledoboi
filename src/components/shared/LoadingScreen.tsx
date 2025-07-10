import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingScreenProps {
  message?: string;
}

/**
 * Componente de tela de carregamento
 * Usado durante operações assíncronas ou enquanto verifica a autenticação
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Carregando...' 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'white'
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#990000', mb: 2 }}>
          Distribuidora de Carnes Vale do Boi
        </Typography>
        
        <CircularProgress 
          size={60} 
          thickness={4} 
          sx={{ color: '#990000' }} 
        />
        
        <Typography 
          variant="h6" 
          sx={{ mt: 2, color: '#333333' }}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  );
};

export default LoadingScreen;
