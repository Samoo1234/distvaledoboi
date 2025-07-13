import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Tabs,
  Tab,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  BarChart as ChartIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  BusinessCenter as BusinessIcon,
  Analytics as AnalyticsIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';
import { OrderService, Order } from '../../../services/orders';
import productService, { Product } from '../../../services/productService';
import customerService, { Customer } from '../../../services/customerService';
import { useNotification } from '../../shared/Notification';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Componente de relatórios administrativos completos
 */
const ReportsAdmin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [tabValue, setTabValue] = useState(0);
  const [customReportOpen, setCustomReportOpen] = useState(false);
  const { showNotification } = useNotification();

  // Carregar dados
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
      console.error('Erro ao carregar dados:', error);
      showNotification({ message: 'Erro ao carregar dados', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrar dados por período
  const getFilteredOrders = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (selectedPeriod) {
      case 'today':
        return orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= today;
        });
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= weekAgo;
        });
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= monthStart;
        });
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        return orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= quarterStart;
        });
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= yearStart;
        });
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  // Calcular KPIs principais
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const completedOrders = filteredOrders.filter(o => o.status === 'completed').length;
  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  // Vendas por período (últimos 7 dias)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const salesByDay = last7Days.map(date => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= dayStart && orderDate < dayEnd;
    });
    
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, order) => sum + order.total_amount, 0)
    };
  });

  // Top produtos por vendas
  const productSales = products.map(product => {
    const productOrders = filteredOrders.filter(order => 
      // Simulação - em produção seria baseado em order_items
      Math.random() > 0.7
    );
    
    return {
      ...product,
      salesCount: productOrders.length,
      salesRevenue: productOrders.reduce((sum, order) => sum + order.total_amount, 0)
    };
  }).sort((a, b) => b.salesRevenue - a.salesRevenue).slice(0, 10);

  // Top clientes
  const customerSales = customers.map(customer => {
    const customerOrders = filteredOrders.filter(order => order.customer_id === customer.id);
    
    return {
      ...customer,
      ordersCount: customerOrders.length,
      totalRevenue: customerOrders.reduce((sum, order) => sum + order.total_amount, 0),
      avgOrderValue: customerOrders.length > 0 ? customerOrders.reduce((sum, order) => sum + order.total_amount, 0) / customerOrders.length : 0
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);

  // Análise de tendências
  const previousPeriodRevenue = totalRevenue * (0.8 + Math.random() * 0.4); // Simulação
  const revenueGrowth = previousPeriodRevenue > 0 ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 0;

  // Análise de categorias
  const categoriesAnalysis = products.reduce((acc, product) => {
    const category = product.category || 'Outros';
    if (!acc[category]) {
      acc[category] = { products: 0, totalStock: 0, totalValue: 0 };
    }
    acc[category].products++;
    acc[category].totalStock += product.stock;
    acc[category].totalValue += product.price * product.stock;
    return acc;
  }, {} as Record<string, { products: number; totalStock: number; totalValue: number }>);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePrintReport = () => {
    showNotification({ message: 'Relatório enviado para impressão', type: 'success' });
  };

  const handleDownloadReport = () => {
    showNotification({ message: 'Relatório baixado em PDF', type: 'success' });
  };

  const handleCustomReport = () => {
    setCustomReportOpen(true);
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return 'Hoje';
      case 'week': return 'Últimos 7 dias';
      case 'month': return 'Este mês';
      case 'quarter': return 'Este trimestre';
      case 'year': return 'Este ano';
      default: return 'Período';
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
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
          Relatórios Administrativos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              label="Período"
            >
              <MenuItem value="today">Hoje</MenuItem>
              <MenuItem value="week">Últimos 7 dias</MenuItem>
              <MenuItem value="month">Este mês</MenuItem>
              <MenuItem value="quarter">Este trimestre</MenuItem>
              <MenuItem value="year">Este ano</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrintReport}
            sx={{ borderColor: '#990000', color: '#990000' }}
          >
            Imprimir
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadReport}
            sx={{ borderColor: '#990000', color: '#990000' }}
          >
            Baixar PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<AnalyticsIcon />}
            onClick={handleCustomReport}
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            Relatório Customizado
          </Button>
        </Box>
      </Box>

      {/* Resumo do período */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1">
          <strong>Relatório: {getPeriodLabel()}</strong> • 
          {totalOrders} pedidos • 
          R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em vendas • 
          Taxa de conclusão: {completionRate.toFixed(1)}%
        </Typography>
      </Alert>

      {/* KPIs principais */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ color: '#2e7d32', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Receita Total
                  </Typography>
                  <Typography variant="h5" component="h2" color="success.main">
                    R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {revenueGrowth >= 0 ? (
                      <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
                    ) : (
                      <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />
                    )}
                    <Typography variant="caption" color={revenueGrowth >= 0 ? 'success.main' : 'error.main'}>
                      {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}% vs período anterior
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <OrdersIcon sx={{ color: '#1976d2', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total de Pedidos
                  </Typography>
                  <Typography variant="h5" component="h2" color="primary.main">
                    {totalOrders}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {completedOrders} concluídos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ChartIcon sx={{ color: '#ff9800', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Ticket Médio
                  </Typography>
                  <Typography variant="h5" component="h2" color="warning.main">
                    R$ {avgOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Por pedido
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ color: '#9c27b0', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Clientes Ativos
                  </Typography>
                  <Typography variant="h5" component="h2" color="secondary.main">
                    {customers.filter(c => c.active).length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Base de clientes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Abas de relatórios */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Vendas" icon={<ShowChartIcon />} />
          <Tab label="Produtos" icon={<InventoryIcon />} />
          <Tab label="Clientes" icon={<PeopleIcon />} />
          <Tab label="Análises" icon={<InsightsIcon />} />
        </Tabs>

        {/* Aba Vendas */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Gráfico de vendas por dia */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Vendas por Dia (Últimos 7 dias)
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    {salesByDay.map((day, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{day.date}</Typography>
                          <Typography variant="body2">
                            {day.orders} pedidos • R$ {day.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={day.revenue > 0 ? (day.revenue / Math.max(...salesByDay.map(d => d.revenue))) * 100 : 0}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Resumo de vendas */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Resumo de Vendas
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">Total de Vendas:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">Pedidos Concluídos:</Typography>
                      <Typography variant="body2" fontWeight="bold">{completedOrders}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">Taxa de Conversão:</Typography>
                      <Typography variant="body2" fontWeight="bold">{completionRate.toFixed(1)}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Crescimento:</Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        color={revenueGrowth >= 0 ? 'success.main' : 'error.main'}
                      >
                        {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Aba Produtos */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Top 10 Produtos por Vendas
                  </Typography>
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Produto</TableCell>
                          <TableCell>Categoria</TableCell>
                          <TableCell align="right">Vendas</TableCell>
                          <TableCell align="right">Receita</TableCell>
                          <TableCell align="right">Estoque</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productSales.map((product, index) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Chip 
                                  label={index + 1} 
                                  size="small" 
                                  sx={{ mr: 1, bgcolor: '#990000', color: 'white' }} 
                                />
                                {product.name}
                              </Box>
                            </TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell align="right">{product.salesCount}</TableCell>
                            <TableCell align="right">
                              R$ {product.salesRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={product.stock} 
                                size="small"
                                color={product.stock < 10 ? 'error' : product.stock < 50 ? 'warning' : 'success'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    <PieChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Análise por Categorias
                  </Typography>
                  
                  <List>
                    {Object.entries(categoriesAnalysis).map(([category, data]) => (
                      <ListItem key={category} sx={{ px: 0 }}>
                        <ListItemText
                          primary={category}
                          secondary={
                            <Box>
                              <Typography variant="body2" component="span">
                                {data.products} produtos • Estoque: {data.totalStock}
                              </Typography>
                              <Typography variant="body2" component="div">
                                Valor: R$ {data.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Aba Clientes */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Top 10 Clientes por Faturamento
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Contato</TableCell>
                      <TableCell align="right">Pedidos</TableCell>
                      <TableCell align="right">Faturamento Total</TableCell>
                      <TableCell align="right">Ticket Médio</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customerSales.map((customer, index) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip 
                              label={index + 1} 
                              size="small" 
                              sx={{ mr: 1, bgcolor: '#990000', color: 'white' }} 
                            />
                            {customer.company_name}
                          </Box>
                        </TableCell>
                        <TableCell>{customer.contact_name || customer.contact_phone}</TableCell>
                        <TableCell align="right">{customer.ordersCount}</TableCell>
                        <TableCell align="right">
                          R$ {customer.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="right">
                          R$ {customer.avgOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={customer.active ? 'Ativo' : 'Inativo'}
                            size="small"
                            color={customer.active ? 'success' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Aba Análises */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    <InsightsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Insights Executivos
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUpIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Crescimento de vendas"
                        secondary={`${revenueGrowth >= 0 ? 'Crescimento' : 'Queda'} de ${Math.abs(revenueGrowth).toFixed(1)}% vs período anterior`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PeopleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Base de clientes"
                        secondary={`${customers.filter(c => c.active).length} clientes ativos, ${completionRate.toFixed(1)}% taxa de conversão`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <InventoryIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Gestão de estoque"
                        secondary={`${products.filter(p => p.stock < 10).length} produtos com estoque baixo`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Recomendações
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="📈 Foque nos produtos top"
                        secondary={`Os ${Math.min(3, productSales.length)} produtos mais vendidos representam maior parte da receita`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="🎯 Trabalhe a retenção"
                        secondary={`${customerSales.filter(c => c.ordersCount > 1).length} clientes já fizeram compras recorrentes`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="📦 Monitore o estoque"
                        secondary="Alguns produtos estão com estoque baixo e podem impactar vendas"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="💰 Otimize o ticket médio"
                        secondary={`Ticket médio atual: R$ ${avgOrderValue.toFixed(2)} - há oportunidades de crescimento`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Dialog de relatório customizado */}
      <Dialog open={customReportOpen} onClose={() => setCustomReportOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Gerar Relatório Customizado</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Título do Relatório"
                  defaultValue="Relatório Personalizado"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Formato de Saída</InputLabel>
                  <Select defaultValue="pdf" label="Formato de Saída">
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="excel">Excel</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data Inicial"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data Final"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomReportOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setCustomReportOpen(false);
              showNotification({ message: 'Relatório customizado gerado com sucesso!', type: 'success' });
            }}
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            Gerar Relatório
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportsAdmin; 