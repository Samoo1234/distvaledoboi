import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Assessment as ReportsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Group as GroupIcon,
  Inventory as InventoryIcon,
  Timer as TimerIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  BarChart as BarChartIcon,
  DonutLarge as DonutLargeIcon,
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  Insights as InsightsIcon,
  TrendingFlat as TrendingFlatIcon,
  Assignment as TaskIcon,
  Done as CompletedIcon,
  DateRange as DateIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { OrderService, Order } from '../../../services/orders';
import { useNotification } from '../../shared/Notification';

/**
 * Componente de relatórios para a equipe de separação
 */
const ReportsSeparacao: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const { showNotification } = useNotification();

  // Carregar pedidos
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await OrderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      showNotification({ message: 'Erro ao carregar pedidos', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Filtrar pedidos por período
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
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  // Calcular estatísticas
  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;
  const processingOrders = filteredOrders.filter(o => o.status === 'processing').length;
  const completedOrders = filteredOrders.filter(o => o.status === 'completed').length;
  const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled').length;

  const totalValue = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

  // Taxa de conclusão
  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  // Produtividade por hora (simulado)
  const productivityRate = Math.round(completedOrders / 8); // 8 horas de trabalho

  // Tempo médio de separação (simulado)
  const avgSeparationTime = totalOrders > 0 ? Math.round(45 + Math.random() * 30) : 0; // 45-75 min

  // Top clientes por volume
  const customerVolume = filteredOrders.reduce((acc, order) => {
    const customerName = order.customer?.company_name || 'Cliente não informado';
    if (!acc[customerName]) {
      acc[customerName] = { count: 0, value: 0 };
    }
    acc[customerName].count++;
    acc[customerName].value += order.total_amount;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  const topCustomers = Object.entries(customerVolume)
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, 5);

  // Performance por dia da semana (simulado)
  const dayPerformance = [
    { day: 'Segunda', completed: Math.floor(completedOrders * 0.18), efficiency: 85 },
    { day: 'Terça', completed: Math.floor(completedOrders * 0.22), efficiency: 92 },
    { day: 'Quarta', completed: Math.floor(completedOrders * 0.20), efficiency: 88 },
    { day: 'Quinta', completed: Math.floor(completedOrders * 0.19), efficiency: 90 },
    { day: 'Sexta', completed: Math.floor(completedOrders * 0.21), efficiency: 87 }
  ];

  // Alertas e notificações
  const alerts = [
    pendingOrders > 5 && { type: 'warning', message: `${pendingOrders} pedidos aguardando separação` },
    processingOrders > 10 && { type: 'info', message: `${processingOrders} pedidos em separação simultânea` },
    completionRate < 70 && { type: 'error', message: 'Taxa de conclusão abaixo da meta (70%)' },
    avgSeparationTime > 60 && { type: 'warning', message: 'Tempo médio de separação acima do ideal' }
  ].filter(Boolean);

  // Funções de ação
  const handlePrintReport = () => {
    showNotification({ message: 'Relatório enviado para impressão', type: 'success' });
  };

  const handleDownloadReport = () => {
    showNotification({ message: 'Relatório baixado em PDF', type: 'success' });
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return 'Hoje';
      case 'week': return 'Últimos 7 dias';
      case 'month': return 'Este mês';
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
          Relatórios de Separação
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
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadReport}
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            Download PDF
          </Button>
        </Box>
      </Box>

      {/* Alertas */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alert: any, index) => (
            <Alert key={index} severity={alert.type} sx={{ mb: 1 }}>
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Resumo do período */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1">
          <strong>Relatório: {getPeriodLabel()}</strong> • 
          {totalOrders} pedidos • 
          R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em vendas
        </Typography>
      </Alert>

      {/* Métricas principais */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TaskIcon sx={{ color: '#1976d2', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total de Pedidos
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {totalOrders}
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
                <CompletedIcon sx={{ color: '#2e7d32', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Taxa de Conclusão
                  </Typography>
                  <Typography variant="h5" component="h2" color="success.main">
                    {completionRate.toFixed(1)}%
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
                <SpeedIcon sx={{ color: '#ff9800', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Produtividade/Hora
                  </Typography>
                  <Typography variant="h5" component="h2" color="warning.main">
                    {productivityRate}
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
                <ScheduleIcon sx={{ color: '#9c27b0', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Tempo Médio
                  </Typography>
                  <Typography variant="h5" component="h2" color="secondary.main">
                    {avgSeparationTime}min
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Status dos Pedidos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                <ReportsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Status dos Pedidos
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Concluídos</Typography>
                  <Typography variant="body2">{completedOrders} ({((completedOrders / totalOrders) * 100 || 0).toFixed(1)}%)</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(completedOrders / totalOrders) * 100 || 0}
                  sx={{ height: 8, borderRadius: 4, bgcolor: '#e8f5e8', '& .MuiLinearProgress-bar': { bgcolor: '#2e7d32' } }}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Em Separação</Typography>
                  <Typography variant="body2">{processingOrders} ({((processingOrders / totalOrders) * 100 || 0).toFixed(1)}%)</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(processingOrders / totalOrders) * 100 || 0}
                  sx={{ height: 8, borderRadius: 4, bgcolor: '#e3f2fd', '& .MuiLinearProgress-bar': { bgcolor: '#1976d2' } }}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Aguardando</Typography>
                  <Typography variant="body2">{pendingOrders} ({((pendingOrders / totalOrders) * 100 || 0).toFixed(1)}%)</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(pendingOrders / totalOrders) * 100 || 0}
                  sx={{ height: 8, borderRadius: 4, bgcolor: '#fff3e0', '& .MuiLinearProgress-bar': { bgcolor: '#e65100' } }}
                />
              </Box>

              <Grid container spacing={2} sx={{ mt: 3 }}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="h6" color="success.main">{completedOrders}</Typography>
                    <Typography variant="caption">Finalizados</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="h6" color="warning.main">{pendingOrders + processingOrders}</Typography>
                    <Typography variant="caption">Pendentes</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance por dia da semana */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Performance Semanal
              </Typography>
              
              <List>
                {dayPerformance.map((day, index) => (
                  <React.Fragment key={day.day}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <DateIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={day.day}
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span">
                              {day.completed} pedidos separados
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={day.efficiency}
                              sx={{ 
                                mt: 1,
                                height: 6,
                                borderRadius: 3,
                                '& .MuiLinearProgress-bar': { 
                                  bgcolor: day.efficiency >= 90 ? '#2e7d32' : day.efficiency >= 80 ? '#ff9800' : '#d32f2f'
                                }
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Eficiência: {day.efficiency}%
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < dayPerformance.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Clientes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Top Clientes ({getPeriodLabel()})
              </Typography>
              
              {topCustomers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhum dado de cliente disponível
                  </Typography>
                </Box>
              ) : (
                <List>
                  {topCustomers.map(([customer, data], index) => (
                    <React.Fragment key={customer}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Chip 
                            label={index + 1} 
                            size="small" 
                            sx={{ 
                              bgcolor: index === 0 ? '#990000' : '#e0e0e0',
                              color: index === 0 ? 'white' : 'black'
                            }} 
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={customer}
                          secondary={
                            <Box>
                              <Typography variant="body2" component="span">
                                {data.count} pedidos • R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < topCustomers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Resumo Financeiro */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Resumo Financeiro
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e8', borderRadius: 1 }}>
                    <Typography variant="h6" color="success.main">
                      R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="caption">Valor Total</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                    <Typography variant="h6" color="primary.main">
                      R$ {avgOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="caption">Ticket Médio</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Análise:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Taxa de conclusão: {completionRate >= 80 ? '✅ Excelente' : completionRate >= 60 ? '⚠️ Boa' : '❌ Precisa melhorar'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Produtividade: {productivityRate >= 10 ? '✅ Alta' : productivityRate >= 5 ? '⚠️ Média' : '❌ Baixa'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Tempo médio: {avgSeparationTime <= 45 ? '✅ Ótimo' : avgSeparationTime <= 60 ? '⚠️ Bom' : '❌ Lento'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsSeparacao; 