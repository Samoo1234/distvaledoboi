import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Alert,
  LinearProgress,
  Divider,
  Paper,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  QrCode as QrCodeIcon,
  Inventory as InventoryIcon,
  LocalOffer as LabelIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { OrderService, Order } from '../../../services/orders';
import { useNotification } from '../../shared/Notification';

/**
 * Componente para o processo de separação e organização logística
 */
const ShippingSeparacao: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const { showNotification } = useNotification();

  // Carregar pedidos em separação
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

  // Separar pedidos por status
  const processingOrders = orders.filter(order => order.status === 'processing');
  const completedOrders = orders.filter(order => order.status === 'completed');
  const pendingOrders = orders.filter(order => order.status === 'pending');

  // Filtrar pedidos em separação
  const filteredProcessingOrders = processingOrders.filter(order =>
    order.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Steps do processo de separação
  const separationSteps = [
    {
      label: 'Receber Pedido',
      description: 'Verificar dados do pedido e cliente'
    },
    {
      label: 'Separar Produtos',
      description: 'Localizar e separar os produtos no estoque'
    },
    {
      label: 'Conferir Items',
      description: 'Verificar quantidade e qualidade dos produtos'
    },
    {
      label: 'Embalar',
      description: 'Embalar adequadamente para transporte'
    },
    {
      label: 'Gerar Etiquetas',
      description: 'Imprimir etiquetas de identificação'
    },
    {
      label: 'Finalizar',
      description: 'Marcar como pronto para entrega'
    }
  ];

  // Estatísticas de produtividade
  const totalItems = processingOrders.length + completedOrders.length;
  const completionRate = totalItems > 0 ? (completedOrders.length / totalItems) * 100 : 0;

  // Formatar data
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Simular impressão de etiqueta
  const handlePrintLabel = (orderId: string) => {
    showNotification({ 
      message: `Etiqueta do pedido #${orderId.substring(0, 8)} enviada para impressão`, 
      type: 'success' 
    });
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
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
        Centro de Separação
      </Typography>

      {/* Estatísticas de produtividade */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ color: '#1976d2', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Em Separação
                  </Typography>
                  <Typography variant="h5" component="h2" sx={{ color: '#1976d2' }}>
                    {processingOrders.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#e8f5e8' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckIcon sx={{ color: '#2e7d32', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Finalizados
                  </Typography>
                  <Typography variant="h5" component="h2" sx={{ color: '#2e7d32' }}>
                    {completedOrders.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ color: '#e65100', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Aguardando
                  </Typography>
                  <Typography variant="h5" component="h2" sx={{ color: '#e65100' }}>
                    {pendingOrders.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimelineIcon sx={{ color: '#7b1fa2', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Produtividade
                  </Typography>
                  <Typography variant="h5" component="h2" sx={{ color: '#7b1fa2' }}>
                    {completionRate.toFixed(0)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Processo de Separação */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#990000', mb: 3 }}>
                <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Processo de Separação
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Siga estas etapas para garantir uma separação eficiente e sem erros.
                </Typography>
              </Alert>

              <Stepper activeStep={activeStep} orientation="vertical">
                {separationSteps.map((step, index) => (
                  <Step key={index}>
                    <StepLabel 
                      onClick={() => setActiveStep(index)}
                      sx={{ cursor: 'pointer' }}
                    >
                      {step.label}
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(index + 1)}
                          sx={{ mt: 1, mr: 1, bgcolor: '#990000' }}
                          size="small"
                        >
                          {index === separationSteps.length - 1 ? 'Finalizar' : 'Continuar'}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={() => setActiveStep(index - 1)}
                          sx={{ mt: 1 }}
                          size="small"
                        >
                          Voltar
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {activeStep === separationSteps.length && (
                <Paper square elevation={0} sx={{ p: 3 }}>
                  <Typography>Processo de separação concluído!</Typography>
                  <Button 
                    onClick={() => setActiveStep(0)} 
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Reiniciar Processo
                  </Button>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Pedidos em Separação */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#990000', mb: 2 }}>
                <ShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Pedidos em Separação
              </Typography>

              {/* Busca */}
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar pedido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Progress bar */}
              {processingOrders.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Progresso da Separação
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={completionRate} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#990000'
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {completedOrders.length} de {totalItems} pedidos finalizados
                  </Typography>
                </Box>
              )}

              {filteredProcessingOrders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Nenhum pedido em separação
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {processingOrders.length === 0 
                      ? 'Todos os pedidos foram finalizados!'
                      : 'Nenhum pedido encontrado com os filtros aplicados'
                    }
                  </Typography>
                </Box>
              ) : (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {filteredProcessingOrders.map((order, index) => (
                    <React.Fragment key={order.id}>
                      <ListItem
                        sx={{
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: '#fff3e0'
                        }}
                      >
                        <ListItemIcon>
                          <Chip 
                            label={`#${order.id.substring(0, 6)}`}
                            size="small"
                            sx={{ bgcolor: '#990000', color: 'white' }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={order.customer?.company_name || 'Cliente não informado'}
                          secondary={
                            <Box>
                              <Typography variant="body2" component="span">
                                R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" component="div">
                                Iniciado: {formatTime(order.updated_at || order.created_at)}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handlePrintLabel(order.id)}
                            sx={{ color: '#990000' }}
                          >
                            <PrintIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{ color: '#666' }}
                          >
                            <QrCodeIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                      {index < filteredProcessingOrders.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ações Rápidas */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
            <LabelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Ações Rápidas
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PrintIcon />}
                sx={{ 
                  py: 1.5,
                  borderColor: '#990000',
                  color: '#990000',
                  '&:hover': { borderColor: '#660000', color: '#660000' }
                }}
              >
                Imprimir Todas as Etiquetas
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<QrCodeIcon />}
                sx={{ 
                  py: 1.5,
                  borderColor: '#990000',
                  color: '#990000',
                  '&:hover': { borderColor: '#660000', color: '#660000' }
                }}
              >
                Gerar QR Codes
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<InventoryIcon />}
                sx={{ 
                  py: 1.5,
                  borderColor: '#990000',
                  color: '#990000',
                  '&:hover': { borderColor: '#660000', color: '#660000' }
                }}
              >
                Relatório de Estoque
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<TimelineIcon />}
                sx={{ 
                  py: 1.5,
                  bgcolor: '#990000',
                  '&:hover': { bgcolor: '#660000' }
                }}
                onClick={loadOrders}
              >
                Atualizar Lista
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ShippingSeparacao; 