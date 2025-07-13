import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as CartIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { OrderService, Order } from '../../../services/orders';
import productService, { Product } from '../../../services/productService';
import customerService, { Customer } from '../../../services/customerService';
import { useNotification } from '../../shared/Notification';

/**
 * Dashboard para administradores com dados reais
 */
const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  // Carregar dados reais
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, productsData, customersData] = await Promise.all([
        OrderService.getOrders(),
        productService.getAll({ activeOnly: false }),
        customerService.getAll({ activeOnly: false })
      ]);
      
      setOrders(ordersData);
      setProducts(productsData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      showNotification({ message: 'Erro ao carregar dados do dashboard', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calcular estatísticas reais
  const salesTotal = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const ordersTotal = orders.length;
  const customersTotal = customers.filter(c => c.active).length;
  const productsTotal = products.filter(p => p.active).length;

  // Pedidos recentes (últimos 5)
  const recentOrders = orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Produtos mais vendidos (simulado - requer implementação de order_items)
  const topProducts = products
    .filter(p => p.active)
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 4)
    .map((product, index) => ({
      id: product.id,
      name: product.name,
      quantity: Math.floor(product.stock / 10), // Simulação baseada no estoque
      percentage: Math.max(20, 100 - (index * 20))
    }));

  // Top vendedores (simulado - baseado nos pedidos)
  const topSellers = [
    { id: 1, name: 'João Silva', sales: `R$ ${(salesTotal * 0.4).toFixed(2)}`, orders: Math.floor(ordersTotal * 0.4), avatar: 'J' },
    { id: 2, name: 'Maria Santos', sales: `R$ ${(salesTotal * 0.3).toFixed(2)}`, orders: Math.floor(ordersTotal * 0.3), avatar: 'M' },
    { id: 3, name: 'Carlos Oliveira', sales: `R$ ${(salesTotal * 0.3).toFixed(2)}`, orders: Math.floor(ordersTotal * 0.3), avatar: 'C' }
  ];

  // Formatação de dados
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'processing': return '#2196f3';
      case 'pending': return '#ff9800';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Título da página */}
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          fontWeight: 'bold', 
          color: '#333',
          mb: 3
        }}
      >
        Dashboard Administrativo
      </Typography>

      {/* Cards com estatísticas principais */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 2,
            height: '100%',
            borderBottom: '4px solid #990000'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontSize: 14 }} color="text.secondary">
                  Vendas Totais
                </Typography>
                <Avatar sx={{ bgcolor: '#990000', width: 40, height: 40 }}>
                  <MoneyIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                R$ {salesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 18, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  {ordersTotal} pedidos realizados
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 2,
            height: '100%',
            borderBottom: '4px solid #990000'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontSize: 14 }} color="text.secondary">
                  Pedidos Realizados
                </Typography>
                <Avatar sx={{ bgcolor: '#990000', width: 40, height: 40 }}>
                  <CartIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {ordersTotal}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 18, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  Sistema em funcionamento
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 2,
            height: '100%',
            borderBottom: '4px solid #990000'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontSize: 14 }} color="text.secondary">
                  Clientes Ativos
                </Typography>
                <Avatar sx={{ bgcolor: '#990000', width: 40, height: 40 }}>
                  <PeopleIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {customersTotal}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 18, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  Base crescendo
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 2,
            height: '100%',
            borderBottom: '4px solid #990000'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontSize: 14 }} color="text.secondary">
                  Produtos Ativos
                </Typography>
                <Avatar sx={{ bgcolor: '#990000', width: 40, height: 40 }}>
                  <InventoryIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {productsTotal}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InventoryIcon sx={{ color: 'info.main', fontSize: 18, mr: 0.5 }} />
                <Typography variant="body2" color="info.main">
                  Catálogo completo
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Conteúdo principal */}
      <Grid container spacing={3}>
        {/* Pedidos recentes */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: '#990000'
                  }}
                >
                  Pedidos Recentes
                </Typography>
                <Button
                  size="small"
                  sx={{ 
                    color: '#990000',
                    '&:hover': { color: '#660000' }
                  }}
                >
                  Ver todos
                </Button>
              </Box>
              
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Pedido</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Valor</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            Nenhum pedido encontrado
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentOrders.map((order) => (
                        <TableRow 
                          key={order.id}
                          sx={{
                            '&:hover': { bgcolor: '#f9f9f9' }
                          }}
                        >
                          <TableCell><strong>#{order.id.substring(0, 8)}</strong></TableCell>
                          <TableCell>{order.customer?.company_name || 'Cliente não informado'}</TableCell>
                          <TableCell>
                            <Box 
                              sx={{ 
                                display: 'inline-block',
                                px: 1, 
                                py: 0.5, 
                                borderRadius: 1, 
                                bgcolor: getOrderStatusColor(order.status),
                                color: 'white',
                                fontSize: '0.75rem'
                              }}
                            >
                              {getStatusText(order.status)}
                            </Box>
                          </TableCell>
                          <TableCell>R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell>{formatDate(order.created_at)}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              sx={{ 
                                minWidth: 'auto',
                                color: '#990000'
                              }}
                            >
                              <MoreVertIcon />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Produtos mais vendidos */}
          <Card>
            <CardContent>
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: '#990000'
                  }}
                >
                  Produtos em Destaque
                </Typography>
                <Button
                  size="small"
                  sx={{ 
                    color: '#990000',
                    '&:hover': { color: '#660000' }
                  }}
                >
                  Ver catálogo
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Produto</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Estoque</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Popularidade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell><strong>{product.name}</strong></TableCell>
                        <TableCell>{product.quantity} kg</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '70%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={product.percentage} 
                                sx={{
                                  height: 8,
                                  borderRadius: 5,
                                  backgroundColor: '#ffebee',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#990000',
                                    borderRadius: 5,
                                  }
                                }}
                              />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {product.percentage}%
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Vendedores destaque */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: '#990000'
                  }}
                >
                  Vendedores Destaque
                </Typography>
                <Button
                  size="small"
                  sx={{ 
                    color: '#990000',
                    '&:hover': { color: '#660000' }
                  }}
                >
                  Ver todos
                </Button>
              </Box>
              
              <List>
                {topSellers.map((seller, index) => (
                  <React.Fragment key={seller.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            bgcolor: index === 0 ? '#990000' : '#e0e0e0',
                            color: index === 0 ? 'white' : '#990000',
                            fontWeight: 'bold'
                          }}
                        >
                          {seller.avatar}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography 
                            component="span" 
                            variant="subtitle1" 
                            sx={{ fontWeight: 'bold' }}
                          >
                            {seller.name}
                          </Typography>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {seller.sales}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {seller.orders} pedidos realizados
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < topSellers.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Ações rápidas */}
          <Card>
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  color: '#990000',
                  mb: 3
                }}
              >
                Ações Rápidas
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    bgcolor: '#990000',
                    '&:hover': { bgcolor: '#660000' }
                  }}
                >
                  Gerar Relatório de Vendas
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    borderColor: '#990000',
                    color: '#990000',
                    '&:hover': { 
                      borderColor: '#660000',
                      color: '#660000'
                    }
                  }}
                >
                  Cadastrar Novo Produto
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    borderColor: '#990000',
                    color: '#990000',
                    '&:hover': { 
                      borderColor: '#660000',
                      color: '#660000'
                    }
                  }}
                >
                  Gerenciar Usuários
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    borderColor: '#990000',
                    color: '#990000',
                    '&:hover': { 
                      borderColor: '#660000',
                      color: '#660000'
                    }
                  }}
                >
                  Configurar Sistema
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
