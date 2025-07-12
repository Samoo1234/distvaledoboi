import React, { useState, useEffect } from 'react';
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
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { OrderService, Order, OrderStats } from '../../../services/orders';
import { useNotification } from '../../shared/Notification';

/**
 * Dashboard para equipe de separação
 */
const SeparacaoDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { showNotification } = useNotification();

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar pedidos e estatísticas em paralelo
      const [ordersData, statsData] = await Promise.all([
        OrderService.getOrdersForSeparation(),
        OrderService.getOrderStats()
      ]);

      setOrders(ordersData);
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSeparation = async (orderId: string) => {
    try {
      setActionLoading(true);
      await OrderService.startSeparation(orderId);
      showNotification({ message: 'Separação iniciada com sucesso!', type: 'success' });
      loadData(); // Recarregar dados
    } catch (err) {
      console.error('Erro ao iniciar separação:', err);
      showNotification({ message: 'Erro ao iniciar separação', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteSeparation = async (orderId: string) => {
    try {
      setActionLoading(true);
      await OrderService.completeSeparation(orderId);
      showNotification({ message: 'Separação concluída com sucesso!', type: 'success' });
      loadData(); // Recarregar dados
    } catch (err) {
      console.error('Erro ao concluir separação:', err);
      showNotification({ message: 'Erro ao concluir separação', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Função auxiliar para renderizar o status dos pedidos
  const renderStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip 
          icon={<AccessTimeIcon />} 
          label="Pendente" 
          color="warning" 
          size="small" 
          variant="outlined"
        />;
      case 'processing':
        return <Chip 
          icon={<AccessTimeIcon />} 
          label="Separando" 
          color="info" 
          size="small"
          variant="outlined" 
        />;
      case 'completed':
        return <Chip 
          icon={<CheckCircleIcon />} 
          label="Pronto" 
          color="success" 
          size="small"
          variant="outlined" 
        />;
      case 'cancelled':
        return <Chip 
          icon={<CancelIcon />} 
          label="Cancelado" 
          color="error" 
          size="small"
          variant="outlined" 
        />;
      default:
        return <Chip 
          label="Desconhecido" 
          size="small" 
        />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={loadData}
          startIcon={<RefreshIcon />}
        >
          Tentar Novamente
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Dashboard de Separação
        </Typography>
        <Button 
          variant="outlined" 
          onClick={loadData}
          startIcon={<RefreshIcon />}
        >
          Atualizar
        </Button>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: 'warning.main' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pedidos Pendentes
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aguardando separação
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: 'info.main' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Em Separação
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.processing}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Em processamento
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: 'success.main' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Prontos para Entrega
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Separação concluída
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: 'error.main' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total de Pedidos
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Todos os pedidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Pedidos */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'error.main', fontWeight: 'bold' }}>
            Pedidos para Separação
          </Typography>
          
          {orders.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Nenhum pedido encontrado
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Pedido</strong></TableCell>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Valor Total</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Criado</strong></TableCell>
                    <TableCell><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          #{order.id.slice(0, 8)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.customer?.company_name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.customer?.contact_name || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(order.total_amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {renderStatus(order.status)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(order.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewOrder(order)}
                            title="Ver detalhes"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          
                          {order.status === 'pending' && (
                            <IconButton
                              size="small"
                              onClick={() => handleStartSeparation(order.id)}
                              disabled={actionLoading}
                              title="Iniciar separação"
                              color="primary"
                            >
                              <PlayArrowIcon />
                            </IconButton>
                          )}
                          
                          {order.status === 'processing' && (
                            <IconButton
                              size="small"
                              onClick={() => handleCompleteSeparation(order.id)}
                              disabled={actionLoading}
                              title="Concluir separação"
                              color="success"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog para ver detalhes do pedido */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Detalhes do Pedido #{selectedOrder?.id.slice(0, 8)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cliente:
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.customer?.company_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedOrder.customer?.contact_name || ''}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status:
                  </Typography>
                  {renderStatus(selectedOrder.status)}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Valor Total:
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(selectedOrder.total_amount)}
                  </Typography>
                </Grid>
              </Grid>
              
              {selectedOrder.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Observações:
                  </Typography>
                  <Typography variant="body2">
                    {selectedOrder.notes}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Criado em:
                </Typography>
                <Typography variant="body2">
                  {formatDate(selectedOrder.created_at)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Fechar
          </Button>
          <Button 
            variant="contained" 
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Imprimir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeparacaoDashboard;
