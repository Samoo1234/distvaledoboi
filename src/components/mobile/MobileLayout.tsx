import React, { useState } from 'react';
import { 
  Box, 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper, 
  Typography, 
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Home as HomeIcon,
  ShoppingCart as CartIcon,
  Person as ClientIcon,
  Assessment as SalesIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useOffline } from '../../hooks/useOffline';
import MobileHome from './MobileHome';
import OrdersList from './OrdersList';
import NewOrder from './NewOrder';
import MobileClientsList from './MobileClientsList';
import MobileSales from './MobileSales';
import LoadingScreen from '../shared/LoadingScreen';

/**
 * Layout principal para interface mobile (vendedores)
 */
const MobileLayout: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const { isOnline } = useOffline();
  const [activeTab, setActiveTab] = useState(0);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await signOut();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const renderContent = () => {
    // Se estiver criando novo pedido, mostra o componente específico
    if (showNewOrder) {
      return (
        <NewOrder
          onBack={() => setShowNewOrder(false)}
          onOrderCreated={() => {
            setShowNewOrder(false);
            setActiveTab(1); // Vai para aba de pedidos
          }}
        />
      );
    }

    switch (activeTab) {
      case 0:
        return <MobileHome />;
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
        return <MobileHome />;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      bgcolor: '#ffffff'
    }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ bgcolor: '#990000' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ flexGrow: 1 }}
          >
            Vale do Boi
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isOnline && (
              <Typography 
                variant="caption" 
                sx={{ 
                  bgcolor: 'error.main', 
                  color: 'white', 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1,
                  mr: 1
                }}
              >
                Offline
              </Typography>
            )}
            
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: '#FFFFFF',
                  color: '#990000'
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Box>
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
    </Box>
  );
};

export default MobileLayout;
