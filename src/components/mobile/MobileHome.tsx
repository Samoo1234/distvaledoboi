import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Divider,
  IconButton
} from '@mui/material';
import { 
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Phone as PhoneIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import ProductsList from './ProductsList';
import { Product } from '../../services/productService';

type MobileView = 'home' | 'products' | 'clients' | 'sales';

/**
 * Tela inicial para interface mobile (vendedores)
 */
const MobileHome: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.name || 'Vendedor';
  const [currentView, setCurrentView] = useState<MobileView>('home');
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);
  
  // Dados simulados para a demonstração
  const todayOrders = 3;
  const todaySales = 'R$ 1.250,00';

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  // Renderizar tela baseada na view atual
  if (currentView === 'products') {
    return (
      <Box>
        {/* Header com botão voltar */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2, 
          bgcolor: '#990000', 
          color: 'white' 
        }}>
          <IconButton 
            onClick={() => setCurrentView('home')} 
            sx={{ color: 'white', mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Produtos Disponíveis
          </Typography>
          {cartItems.length > 0 && (
            <Typography variant="body2">
              Carrinho: {cartItems.length} itens
            </Typography>
          )}
        </Box>
        
        <ProductsList onAddToCart={handleAddToCart} />
      </Box>
    );
  }

  // Outras views (placeholder por enquanto)
  if (currentView !== 'home') {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => setCurrentView('home')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            {currentView === 'clients' && 'Meus Clientes'}
            {currentView === 'sales' && 'Minhas Vendas'}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Esta seção será implementada em breve.
        </Typography>
      </Box>
    );
  }

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
            onClick={() => setCurrentView('products')}
            sx={{ 
              borderRadius: 2,
              bgcolor: '#990000',
              color: 'white',
              mb: 2,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#7d0000',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s'
              }
            }}
          >
            <CardContent sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 3,
              '&:last-child': { pb: 3 }
            }}>
              <ShoppingCartIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  NOVO PEDIDO
                </Typography>
                <Typography variant="body2">
                  Ver produtos e fazer pedido
                </Typography>
              </Box>
              {cartItems.length > 0 && (
                <Box sx={{ 
                  bgcolor: 'white', 
                  color: '#990000', 
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {cartItems.length}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Botão Meus Clientes */}
        <Grid item xs={12}>
          <Card 
            onClick={() => setCurrentView('clients')}
            sx={{ 
              borderRadius: 2,
              border: '2px solid #990000',
              mb: 2,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#fff0f0',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s'
              }
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
                  Gerenciar clientes
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Botão Minhas Vendas */}
        <Grid item xs={12}>
          <Card 
            onClick={() => setCurrentView('sales')}
            sx={{ 
              borderRadius: 2,
              border: '2px solid #990000',
              mb: 2,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#fff0f0',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s'
              }
            }}
          >
            <CardContent sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 3,
              '&:last-child': { pb: 3 }
            }}>
              <AssessmentIcon sx={{ fontSize: 40, mr: 2, color: '#990000' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333333' }}>
                  MINHAS VENDAS
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hoje: {todaySales}
                </Typography>
              </Box>
              {cartItems.length > 0 && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#990000' }}>
                    Carrinho: R$ {getCartTotal().toFixed(2)}
                  </Typography>
                </Box>
              )}
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
