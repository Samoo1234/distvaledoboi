import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Container
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  Inventory as ProductsIcon,
  People as CustomersIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  LocalShipping as ShippingIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useOffline } from '../../hooks/useOffline';
import LoadingScreen from '../shared/LoadingScreen';
import SeparacaoDashboard from './separacao/SeparacaoDashboard';
import AdminDashboard from './admin/AdminDashboard';

const drawerWidth = 250;

interface DesktopLayoutProps {
  type: 'separacao' | 'admin';
}

/**
 * Layout principal para interface desktop (separação e admin)
 */
const DesktopLayout: React.FC<DesktopLayoutProps> = ({ type }) => {
  const { user, loading, signOut } = useAuth();
  const { isOnline } = useOffline();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
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

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const menuItems = type === 'separacao' 
    ? [
        { id: 'dashboard', text: 'Dashboard', icon: <DashboardIcon /> },
        { id: 'orders', text: 'Pedidos', icon: <OrdersIcon /> },
        { id: 'shipping', text: 'Separação', icon: <ShippingIcon /> },
        { id: 'reports', text: 'Relatórios', icon: <ReportsIcon /> },
      ]
    : [
        { id: 'dashboard', text: 'Dashboard', icon: <DashboardIcon /> },
        { id: 'orders', text: 'Pedidos', icon: <OrdersIcon /> },
        { id: 'products', text: 'Produtos', icon: <ProductsIcon /> },
        { id: 'customers', text: 'Clientes', icon: <CustomersIcon /> },
        { id: 'reports', text: 'Relatórios', icon: <ReportsIcon /> },
        { id: 'settings', text: 'Configurações', icon: <SettingsIcon /> },
      ];

  const renderContent = () => {
    // Renderiza o conteúdo com base no tipo e seção ativa
    if (activeSection === 'dashboard') {
      if (type === 'separacao') {
        return <SeparacaoDashboard />;
      } else if (type === 'admin') {
        return <AdminDashboard />;
      }
    }
    
    // Placeholder para outras seções
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
        </Typography>
        <Typography variant="body1">
          Esta seção será implementada na Fase 2 do desenvolvimento.
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#990000'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Distribuidora de Carnes Vale do Boi
          </Typography>
          
          {!isOnline && (
            <Typography 
              variant="caption" 
              sx={{ 
                bgcolor: 'error.main', 
                color: 'white', 
                px: 1, 
                py: 0.5, 
                borderRadius: 1,
                mr: 2
              }}
            >
              Offline
            </Typography>
          )}
          
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
            sx={{ ml: 1 }}
          >
            <Avatar 
              sx={{ 
                bgcolor: '#FFFFFF',
                color: '#990000'
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          
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
              <ListItemText>Minha Conta</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Sair</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          {/* Área de perfil/usuário */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            p: 2,
            mb: 2
          }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                mb: 2,
                bgcolor: '#990000',
                color: 'white'
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {user?.name || 'Usuário'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {type === 'separacao' ? 'Equipe de Separação' : 'Administrador'}
            </Typography>
          </Box>

          <Divider />

          {/* Menu de navegação */}
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={activeSection === item.id}
                  onClick={() => setActiveSection(item.id)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: '#ffebee',
                      borderLeft: '4px solid #990000',
                      '&:hover': {
                        backgroundColor: '#ffebee',
                      }
                    },
                    '&:hover': {
                      backgroundColor: '#fff0f0',
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: activeSection === item.id ? '#990000' : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: activeSection === item.id ? 'bold' : 'normal',
                      color: activeSection === item.id ? '#990000' : 'inherit',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Botão de sair */}
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Sair" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      
      {/* Conteúdo principal */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { sm: drawerOpen ? `${drawerWidth}px` : 0 },
          transition: 'margin 0.2s',
          bgcolor: '#f9f9f9',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Container maxWidth="xl">
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
};

export default DesktopLayout;
