import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  IconButton,
  Badge,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Phone as PhoneIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Sync as SyncIcon,
  CloudOff as CloudOffIcon,
  Wifi as WifiIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useOffline } from '../../hooks/useOffline';
import { useNotification } from '../shared/Notification';
import ProductsList from './ProductsList';
import { Product } from '../../services/productService';

type MobileView = 'home' | 'products' | 'clients' | 'sales';

interface MobileHomeProps {
  onNewOrder?: () => void;
}

/**
 * Tela inicial para interface mobile (vendedores)
 */
const MobileHome: React.FC<MobileHomeProps> = ({ onNewOrder }) => {
  const { user } = useAuth();
  const { state: cartState } = useCart();
  const {
    isOnline,
    hasOfflineData,
    pendingSyncCount,
    syncData,
    clearOfflineData
  } = useOffline();
  const { showNotification } = useNotification();
  const userName = user?.name || 'Vendedor';
  const [currentView, setCurrentView] = useState<MobileView>('home');
  const [syncing, setSyncing] = useState(false);

  // Dados simulados para a demonstração
  const todayOrders = 3;
  const todaySales = 'R$ 1.250,00';

  // Função para sincronizar dados
  const handleSync = async () => {
    if (!isOnline) {
      showNotification({ message: 'Não é possível sincronizar offline', type: 'error' });
      return;
    }

    setSyncing(true);
    try {
      const success = await syncData();
      if (success) {
        showNotification({ message: 'Dados sincronizados com sucesso!', type: 'success' });
      } else {
        showNotification({ message: 'Erro na sincronização', type: 'error' });
      }
    } catch (error) {
      showNotification({ message: 'Erro na sincronização', type: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  // Função para iniciar novo pedido
  const handleNewOrder = () => {
    console.log('🎯 MobileHome: Iniciando novo pedido...');
    if (onNewOrder) {
      onNewOrder();
    } else {
      console.warn('⚠️ onNewOrder não foi passado para MobileHome');
      // Fallback para produtos se não tiver callback
      setCurrentView('products');
    }
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
          {cartState.itemCount > 0 && (
            <Badge badgeContent={cartState.itemCount} color="error">
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 1,
                px: 1
              }}>
                <ShoppingCartIcon sx={{ mr: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  R$ {cartState.total.toFixed(2)}
                </Typography>
              </Box>
            </Badge>
          )}
        </Box>

        <ProductsList />
      </Box>
    );
  }

  // Tela inicial
  return (
    <Box sx={{ p: 2 }}>
      {/* Status de conectividade */}
      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CloudOffIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                Modo offline - Suas ações serão sincronizadas quando conectar
              </Typography>
            </Box>
          </Box>
        </Alert>
      )}

      {/* Status de sincronização */}
      {hasOfflineData && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {pendingSyncCount} itens aguardando sincronização
              </Typography>
              <Typography variant="caption">
                {isOnline ? 'Clique para sincronizar agora' : 'Aguardando conexão'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                onClick={handleSync}
                disabled={!isOnline || syncing}
                sx={{ bgcolor: '#2196f3', color: 'white' }}
              >
                {syncing ? <CircularProgress size={16} /> : <SyncIcon fontSize="small" />}
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  clearOfflineData();
                  showNotification({ message: 'Dados offline limpos', type: 'info' });
                }}
                color="error"
              >
                <Typography variant="caption">Limpar</Typography>
              </IconButton>
            </Box>
          </Box>
        </Alert>
      )}

      {/* Cabeçalho */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333333' }}>
              👋 Olá, {userName}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {todayOrders} pedidos hoje • {todaySales}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              icon={isOnline ? <WifiIcon /> : <CloudOffIcon />}
              label={isOnline ? 'Online' : 'Offline'}
              color={isOnline ? 'success' : 'warning'}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>
      </Box>

      {/* Indicador de carrinho ativo */}
      {cartState.itemCount > 0 && (
        <Card sx={{
          mb: 3,
          bgcolor: '#e8f5e8',
          border: '2px solid #4caf50',
          borderRadius: 2
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingCartIcon sx={{ color: '#4caf50', mr: 1 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    Carrinho Ativo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cartState.itemCount} itens • R$ {cartState.total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={cartState.selectedCustomer ? cartState.selectedCustomer.company_name : 'Sem cliente'}
                size="small"
                color={cartState.selectedCustomer ? "success" : "default"}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2}>
        {/* Botão Novo Pedido */}
        <Grid item xs={12}>
          <Card
            onClick={handleNewOrder}
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
                  {cartState.itemCount > 0 ? 'CONTINUAR PEDIDO' : 'NOVO PEDIDO'}
                </Typography>
                <Typography variant="body2">
                  {cartState.itemCount > 0 ?
                    `${cartState.itemCount} itens no carrinho` :
                    'Criar pedido com workflow completo'
                  }
                </Typography>
              </Box>
              {cartState.itemCount > 0 && (
                <Badge badgeContent={cartState.itemCount} color="error">
                  <Box sx={{
                    bgcolor: 'white',
                    color: '#990000',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    <AddIcon fontSize="small" />
                  </Box>
                </Badge>
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
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333333' }}>
                  MEUS CLIENTES
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lista de clientes ativos
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
              {cartState.itemCount > 0 && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#990000' }}>
                    Carrinho: R$ {cartState.total.toFixed(2)}
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
              bgcolor: '#f5f5f5',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#e0e0e0',
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
              <PhoneIcon sx={{ fontSize: 40, mr: 2, color: '#666666' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333333' }}>
                  SUPORTE
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Precisa de ajuda?
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MobileHome;
