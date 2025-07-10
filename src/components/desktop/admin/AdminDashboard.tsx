import React from 'react';
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
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as CartIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

/**
 * Dashboard para administradores
 */
const AdminDashboard: React.FC = () => {
  // Dados simulados para demonstração
  const salesTotal = 'R$ 15.240,00';
  const ordersTotal = 24;
  const customersTotal = 18;
  const productsTotal = 152;
  
  const topProducts = [
    { id: 1, name: 'Picanha', quantity: 78, percentage: 85 },
    { id: 2, name: 'Contra Filé', quantity: 65, percentage: 70 },
    { id: 3, name: 'Maminha', quantity: 54, percentage: 60 },
    { id: 4, name: 'Costela', quantity: 42, percentage: 45 }
  ];
  
  const topSellers = [
    { id: 1, name: 'João Silva', sales: 'R$ 5.780,00', orders: 8, avatar: 'J' },
    { id: 2, name: 'Maria Santos', sales: 'R$ 4.320,00', orders: 6, avatar: 'M' },
    { id: 3, name: 'Carlos Oliveira', sales: 'R$ 3.150,00', orders: 5, avatar: 'C' }
  ];

  const recentOrders = [
    { id: '001', client: 'Açougue A', seller: 'João', value: 'R$ 980,00', date: '10/07/2025' },
    { id: '002', client: 'Mercado B', seller: 'Maria', value: 'R$ 1.240,00', date: '10/07/2025' },
    { id: '003', client: 'Padaria C', seller: 'João', value: 'R$ 540,00', date: '10/07/2025' },
    { id: '004', client: 'Restaurante D', seller: 'Ana', value: 'R$ 2.350,00', date: '10/07/2025' },
    { id: '005', client: 'Supermercado E', seller: 'Carlos', value: 'R$ 1.780,00', date: '10/07/2025' }
  ];

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
                {salesTotal}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 18, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +12% em relação à semana passada
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
                  +8% em relação à semana passada
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
                  +5% em relação à semana passada
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
                  Produtos Cadastrados
                </Typography>
                <Avatar sx={{ bgcolor: '#990000', width: 40, height: 40 }}>
                  <InventoryIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {productsTotal}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingDownIcon sx={{ color: 'error.main', fontSize: 18, mr: 0.5 }} />
                <Typography variant="body2" color="error.main">
                  -3% de estoque disponível
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
                      <TableCell sx={{ fontWeight: 'bold' }}>Vendedor</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Valor</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow 
                        key={order.id}
                        sx={{
                          '&:hover': { bgcolor: '#f9f9f9' }
                        }}
                      >
                        <TableCell><strong>#{order.id}</strong></TableCell>
                        <TableCell>{order.client}</TableCell>
                        <TableCell>{order.seller}</TableCell>
                        <TableCell>{order.value}</TableCell>
                        <TableCell>{order.date}</TableCell>
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
                    ))}
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
                  Produtos Mais Vendidos
                </Typography>
                <Button
                  size="small"
                  sx={{ 
                    color: '#990000',
                    '&:hover': { color: '#660000' }
                  }}
                >
                  Ver relatório
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Produto</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Qtd. Vendida</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Desempenho</TableCell>
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
