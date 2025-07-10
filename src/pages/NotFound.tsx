import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

/**
 * Página de erro 404 - Não encontrado
 */
const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
        bgcolor: '#ffffff'
      }}
    >
      <Typography 
        variant="h1" 
        component="h1" 
        sx={{ 
          fontWeight: 'bold', 
          color: '#990000', 
          mb: 2,
          fontSize: { xs: '4rem', md: '6rem' }
        }}
      >
        404
      </Typography>

      <Typography 
        variant="h4" 
        component="h2" 
        sx={{ 
          fontWeight: 'bold', 
          color: '#333333', 
          mb: 2,
          fontSize: { xs: '1.5rem', md: '2.125rem' }
        }}
      >
        Página não encontrada
      </Typography>

      <Typography 
        variant="body1" 
        sx={{ 
          color: '#666666', 
          maxWidth: 600, 
          mb: 4 
        }}
      >
        A página que você está procurando não existe ou foi removida.
        Por favor, verifique o endereço ou retorne à página inicial.
      </Typography>

      <Button
        variant="contained"
        size="large"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/')}
        sx={{ 
          bgcolor: '#990000',
          '&:hover': { bgcolor: '#660000' },
          py: 1.5,
          px: 3
        }}
      >
        Voltar para o início
      </Button>

      <Box sx={{ mt: 8, color: '#999999' }}>
        <Typography variant="body2">
          Distribuidora de Carnes Vale do Boi
        </Typography>
        <Typography variant="caption">
          &copy; {new Date().getFullYear()} - Todos os direitos reservados
        </Typography>
      </Box>
    </Box>
  );
};

export default NotFound;
