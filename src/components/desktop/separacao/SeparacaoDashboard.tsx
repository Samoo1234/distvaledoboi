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
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { OrderService, Order, OrderStats } from '../../../services/orders';
import { useNotification } from '../../shared/Notification';
import { generateOrderPDF } from '../../../utils/pdfGenerator';

/**
 * Dashboard para equipe de separação
 */
const SeparacaoDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const { showNotification } = useNotification();

  // Carregar dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, statsData] = await Promise.all([
        OrderService.getOrdersForSeparation(),
        OrderService.getOrderStats()
      ]);
      
      setOrders(ordersData);
      setStats(statsData);
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

  // Visualizar pedido
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  // Fechar dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
  };

  // Gerar PDF do pedido
  const handleGeneratePDF = async () => {
    if (!selectedOrder) return;
    
    try {
      setPdfLoading(true);
      showNotification({ message: 'Buscando detalhes do pedido...', type: 'info' });
      
      // Buscar pedido completo com itens
      const orderWithItems = await OrderService.getOrderById(selectedOrder.id);
      
      if (!orderWithItems) {
        showNotification({ message: 'Pedido não encontrado', type: 'error' });
        return;
      }
      
      // Verificar se tem itens antes de gerar PDF
      const pdfOrder = {
        ...orderWithItems,
        items: orderWithItems.items || []
      };
      
      // Gerar PDF
      await generateOrderPDF(pdfOrder);
      
      showNotification({ 
        message: `PDF do pedido #${selectedOrder.id.substring(0, 8)} gerado com sucesso!`, 
        type: 'success' 
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showNotification({ 
        message: 'Erro ao gerar PDF do pedido', 
        type: 'error' 
      });
    } finally {
      setPdfLoading(false);
    }
  };

  // Iniciar separação
  const handleStartSeparation = async (orderId: string) => {
    try {
      setActionLoading(true);
      await OrderService.startSeparation(orderId);
      showNotification({ message: 'Separação iniciada com sucesso!', type: 'success' });
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao iniciar separação:', error);
      showNotification({ message: 'Erro ao iniciar separação', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Concluir separação
  const handleCompleteSeparation = async (orderId: string) => {
    try {
      setActionLoading(true);
      await OrderService.completeSeparation(orderId);
      showNotification({ message: 'Separação concluída com sucesso!', type: 'success' });
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao concluir separação:', error);
      showNotification({ message: 'Erro ao concluir separação', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Renderizar status
  const renderStatus = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', color: 'warning' as const },
      processing: { label: 'Em Separação', color: 'info' as const },
      completed: { label: 'Concluído', color: 'success' as const },
      cancelled: { label: 'Cancelado', color: 'error' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
          Dashboard de Separação
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          disabled={loading}
          sx={{ borderColor: '#990000', color: '#990000', '&:hover': { borderColor: '#660000' } }}
        >
          Atualizar
        </Button>
      </Box>

      {/* Cards de estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aguardando
                  </Typography>
                </Box>
                <AccessTimeIcon sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                    {stats.processing}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Em Processamento
                  </Typography>
                </Box>
                <PlayArrowIcon sx={{ fontSize: 40, color: '#2196f3' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    {stats.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Separação Concluída
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#990000' }}>
                    {formatCurrency(stats.totalValue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valor Total
                  </Typography>
                </Box>
                <PlayArrowIcon sx={{ fontSize: 40, color: '#990000' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de pedidos */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#990000' }}>
            Pedidos para Separação
          </Typography>
          
          {orders.length === 0 ? (
            <Alert severity="info">
              Nenhum pedido aguardando separação no momento.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Pedido</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          #{order.id.substring(0, 8)}
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
                        {renderStatus(order.status)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(order.total_amount)}
                        </Typography>
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
            startIcon={pdfLoading ? <CircularProgress size={20} /> : <PrintIcon />}
            onClick={handleGeneratePDF}
            disabled={pdfLoading}
            sx={{ 
              bgcolor: '#990000', 
              '&:hover': { bgcolor: '#660000' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
          >
            {pdfLoading ? 'Gerando PDF...' : 'Gerar PDF'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeparacaoDashboard;
