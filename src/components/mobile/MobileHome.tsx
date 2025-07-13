import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Avatar,
  Badge,
  Stack,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  ShoppingCart as CartIcon,
  Business as BusinessIcon,
  Assessment as ReportsIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { OrderService } from '../../services/orders';

interface MobileHomeProps {
  onNewOrder: () => void;
}

const MobileHome: React.FC<MobileHomeProps> = ({ onNewOrder }) => {
  const { user } = useAuth();
  const { state: cartState } = useCart();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f8f9fa',
      p: 3
    }}>
      {/* Saudação */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 4, 
        p: 3, 
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#990000', mb: 1 }}>
          Olá, {user?.email?.split('@')[0] || 'Vendedor'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          0 pedidos hoje
        </Typography>
      </Box>

      {/* Botão Principal - NOVO PEDIDO */}
      <Card 
        onClick={onNewOrder}
        sx={{ 
          cursor: 'pointer',
          bgcolor: '#990000',
          color: 'white',
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(153,0,0,0.3)',
          '&:hover': { 
            bgcolor: '#7d0000',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(153,0,0,0.4)'
          },
          transition: 'all 0.2s ease'
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <ShoppingCartIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            NOVO PEDIDO
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Criar novo pedido
          </Typography>
        </CardContent>
      </Card>

      {/* Botões Secundários - Layout Limpo */}
      <Stack spacing={2}>
        {/* MEUS CLIENTES */}
        <Card sx={{ 
          cursor: 'pointer',
          bgcolor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 2,
          '&:hover': { 
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          },
          transition: 'all 0.2s ease'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <PeopleIcon sx={{ fontSize: 40, color: '#666', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
              MEUS CLIENTES
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerenciar clientes
            </Typography>
          </CardContent>
        </Card>

        {/* MINHAS VENDAS */}
        <Card sx={{ 
          cursor: 'pointer',
          bgcolor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 2,
          '&:hover': { 
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          },
          transition: 'all 0.2s ease'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <TrendingUpIcon sx={{ fontSize: 40, color: '#666', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
              MINHAS VENDAS
            </Typography>
            <Typography variant="body2" color="text.secondary">
              R$ 0,00 hoje
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* CARRINHO (se tem itens) */}
      {cartState.itemCount > 0 && (
        <Card sx={{ 
          cursor: 'pointer',
          bgcolor: '#990000',
          color: 'white',
          mt: 2,
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(153,0,0,0.3)',
          '&:hover': { 
            bgcolor: '#7d0000',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(153,0,0,0.4)'
          },
          transition: 'all 0.2s ease'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Badge 
              badgeContent={cartState.itemCount} 
              color="secondary"
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: '#fff',
                  color: '#990000',
                  fontWeight: 'bold'
                }
              }}
            >
              <CartIcon sx={{ fontSize: 42, mb: 1 }} />
            </Badge>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              CARRINHO
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {cartState.itemCount} itens • R$ {cartState.total.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MobileHome;
