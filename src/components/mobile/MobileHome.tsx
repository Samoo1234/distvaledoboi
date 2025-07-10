import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Divider 
} from '@mui/material';
import { 
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Tela inicial para interface mobile (vendedores)
 */
const MobileHome: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.name || 'Vendedor';
  
  // Dados simulados para a demonstração
  const todayOrders = 3;
  const todaySales = 'R$ 1.250,00';

  return (
    <Box sx={{ p: 2 }}>
      {/* Cabeçalho com boas-vindas */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#333333' }}>
          👋 Olá, {userName}!
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#666666' }}>
          📊 {todayOrders} pedidos hoje
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Botões principais */}
      <Grid container spacing={2}>
        {/* Botão Novo Pedido */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              borderRadius: 2,
              bgcolor: '#990000',
              color: 'white',
              mb: 2
            }}
          >
            <CardContent sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 3,
              '&:last-child': { pb: 3 }
            }}>
              <ShoppingCartIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  NOVO PEDIDO
                </Typography>
                <Typography variant="body2">
                  Fazer pedido
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Botão Meus Clientes */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              borderRadius: 2,
              border: '2px solid #990000',
              mb: 2
            }}
          >
            <CardContent sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 3,
              '&:last-child': { pb: 3 }
            }}>
              <PeopleIcon sx={{ fontSize: 40, mr: 2, color: '#990000' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333333' }}>
                  MEUS CLIENTES
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ver lista
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Botão Minhas Vendas */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              borderRadius: 2,
              border: '2px solid #990000',
              mb: 2
            }}
          >
            <CardContent sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 3,
              '&:last-child': { pb: 3 }
            }}>
              <AssessmentIcon sx={{ fontSize: 40, mr: 2, color: '#990000' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333333' }}>
                  MINHAS VENDAS
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hoje: {todaySales}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Botão Suporte */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              borderRadius: 2,
              border: '2px solid #990000',
              mb: 2
            }}
          >
            <CardContent sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 3,
              '&:last-child': { pb: 3 }
            }}>
              <PhoneIcon sx={{ fontSize: 40, mr: 2, color: '#990000' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333333' }}>
                  SUPORTE
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contato
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Rodapé com nome completo */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#666666', fontStyle: 'italic' }}>
          Distribuidora de Carnes Vale do Boi
        </Typography>
        <Typography variant="caption" sx={{ color: '#999999' }}>
          Versão 1.0
        </Typography>
      </Box>
    </Box>
  );
};

export default MobileHome;
