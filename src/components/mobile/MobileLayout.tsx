import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import {
  Home as HomeIcon,
  ShoppingCart as CartIcon,
  People as ClientIcon,
  TrendingUp as SalesIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useOffline } from '../../hooks/useOffline';
import { useNotification } from '../shared/Notification';
import MobileHome from './MobileHome';
import OrdersList from './OrdersList';
import MobileClientsList from './MobileClientsList';
import MobileSales from './MobileSales';
import NewOrder from './NewOrder';
import LoadingScreen from '../shared/LoadingScreen';

/**
 * Layout principal para interface mobile (vendedores)
 */
const MobileLayout: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const { isOnline } = useOffline();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState(0);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      setShowLogoutDialog(false);
      await signOut();
      showNotification({
        message: 'Logout realizado com sucesso!',
        type: 'success'
      });
    } catch (error) {
      showNotification({
        message: 'Erro ao fazer logout. Tente novamente.',
        type: 'error'
      });
    }
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  // Função para iniciar novo pedido
  const handleNewOrder = () => {
    console.log('🎯 MobileLayout: Iniciando novo pedido...');
    setShowNewOrder(true);
  };

  // Função para fechar novo pedido
  const handleCloseNewOrder = () => {
    setShowNewOrder(false);
    setActiveTab(0); // Volta para a tela inicial
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const renderContent = () => {
    // Se estiver criando novo pedido, mostra o componente específico
    if (showNewOrder) {
      return (
        <NewOrder onClose={handleCloseNewOrder} />
      );
    }

    switch (activeTab) {
      case 0:
        return (
          <MobileHome 
            onNewOrder={() => setShowNewOrder(true)}
            onNavigateToClients={() => setActiveTab(2)}
            onNavigateToSales={() => setActiveTab(3)}
          />
        );
      case 1:
        return (
          <OrdersList
            onNewOrder={() => setShowNewOrder(true)}
          />
        );
      case 2:
        return <MobileClientsList />;
      case 3:
        return <MobileSales />;
      default:
        return (
          <MobileHome 
            onNewOrder={() => setShowNewOrder(true)}
            onNavigateToClients={() => setActiveTab(2)}
            onNavigateToSales={() => setActiveTab(3)}
          />
        );
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      bgcolor: '#ffffff'
    }}>
      {/* Status de conectividade */}
      {!isOnline && (
        <Box 
          sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bgcolor: '#ff9800', 
            color: 'white', 
            py: 1, 
            px: 2, 
            zIndex: 1000,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            📡 Modo Offline - Dados serão sincronizados quando conectar
          </Typography>
        </Box>
      )}

      {/* Header da aplicação */}
      <AppBar position="static" sx={{ bgcolor: '#990000' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Vale do Boi
          </Typography>
          
          {/* Indicador de status de conectividade */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Box 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: isOnline ? '#4caf50' : '#ff9800',
                mr: 1
              }} 
            />
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {isOnline ? 'Online' : 'Offline'}
            </Typography>
          </Box>

          {/* Ícone de notificações */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Avatar do usuário */}
          <IconButton 
            color="inherit" 
            onClick={handleProfileMenuOpen}
            sx={{ p: 0 }}
          >
            <Avatar sx={{ bgcolor: '#7d0000', width: 32, height: 32 }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Menu do usuário */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {user?.name || 'Usuário'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sair</ListItemText>
        </MenuItem>
      </Menu>

      {/* Conteúdo Principal */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        pb: 7 // Espaço para a navegação inferior
      }}>
        {renderContent()}
      </Box>



      {/* Navegação Inferior */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          zIndex: 2
        }} 
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            '& .Mui-selected': {
              color: '#990000'
            }
          }}
        >
          <BottomNavigationAction label="Início" icon={<HomeIcon />} />
          <BottomNavigationAction label="Pedidos" icon={<CartIcon />} />
          <BottomNavigationAction label="Clientes" icon={<ClientIcon />} />
          <BottomNavigationAction label="Vendas" icon={<SalesIcon />} />
        </BottomNavigation>
      </Paper>

      {/* Dialog de confirmação de logout */}
      <Dialog
        open={showLogoutDialog}
        onClose={cancelLogout}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          Confirmar Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Tem certeza que deseja sair do sistema? Todos os dados não salvos serão perdidos.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelLogout} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmLogout} color="error" variant="contained">
            Sair
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MobileLayout;
