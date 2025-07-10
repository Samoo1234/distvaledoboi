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
  Chip
} from '@mui/material';
import {
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

/**
 * Dashboard para equipe de separação
 */
const SeparacaoDashboard: React.FC = () => {
  // Dados simulados para demonstração
  const pendingCount = 8;
  const processingCount = 3;
  const completedCount = 5;
  
  const mockOrders = [
    { 
      id: '001', 
      cliente: 'Açougue A', 
      vendedor: 'João', 
      items: 5, 
      status: 'processing',
      created: '10/07/2025 09:15'
    },
    { 
      id: '002', 
      cliente: 'Mercado B', 
      vendedor: 'Maria', 
      items: 3, 
      status: 'pending',
      created: '10/07/2025 10:20'
    },
    { 
      id: '003', 
      cliente: 'Padaria C', 
      vendedor: 'João', 
      items: 7, 
      status: 'completed',
      created: '10/07/2025 08:30'
    },
    { 
      id: '004', 
      cliente: 'Restaurante D', 
      vendedor: 'Ana', 
      items: 10, 
      status: 'pending',
      created: '10/07/2025 11:05'
    },
    { 
      id: '005', 
      cliente: 'Supermercado E', 
      vendedor: 'Carlos', 
      items: 8, 
      status: 'pending',
      created: '10/07/2025 09:45'
    }
  ];

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
      default:
        return <Chip 
          label="Desconhecido" 
          size="small" 
        />;
    }
  };

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
        Dashboard de Separação
      </Typography>

      {/* Cards com estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            boxShadow: 2,
            height: '100%',
            borderLeft: '4px solid #FFA000'
          }}>
            <CardContent>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Pedidos Pendentes
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {pendingCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aguardando separação
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            boxShadow: 2,
            height: '100%',
            borderLeft: '4px solid #2196F3'
          }}>
            <CardContent>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Em Separação
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {processingCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Em processamento
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            boxShadow: 2,
            height: '100%',
            borderLeft: '4px solid #4CAF50'
          }}>
            <CardContent>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Prontos para Entrega
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {completedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Separação concluída
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de pedidos */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: '#990000',
              mb: 2
            }}
          >
            Pedidos Recentes
          </Typography>
          
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Pedido</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Vendedor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow 
                    key={order.id}
                    sx={{
                      '&:hover': { bgcolor: '#f9f9f9' }
                    }}
                  >
                    <TableCell><strong>#{order.id}</strong></TableCell>
                    <TableCell>{order.cliente}</TableCell>
                    <TableCell>{order.vendedor}</TableCell>
                    <TableCell>{order.items} itens</TableCell>
                    <TableCell>{order.created}</TableCell>
                    <TableCell>{renderStatus(order.status)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          sx={{ 
                            borderColor: '#990000',
                            color: '#990000',
                            '&:hover': { 
                              borderColor: '#660000',
                              color: '#660000'
                            }
                          }}
                        >
                          Ver
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<PrintIcon />}
                          sx={{ 
                            bgcolor: '#990000',
                            '&:hover': { bgcolor: '#660000' }
                          }}
                        >
                          Etiqueta
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              sx={{ 
                borderColor: '#990000',
                color: '#990000',
                '&:hover': { 
                  borderColor: '#660000',
                  color: '#660000'
                }
              }}
            >
              Ver todos os pedidos
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Ações rápidas */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#990000'
                }}
              >
                Ações Rápidas
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  sx={{ 
                    bgcolor: '#990000',
                    '&:hover': { bgcolor: '#660000' }
                  }}
                >
                  Iniciar Separação
                </Button>
                <Button
                  variant="outlined"
                  sx={{ 
                    borderColor: '#990000',
                    color: '#990000',
                    '&:hover': { 
                      borderColor: '#660000',
                      color: '#660000'
                    }
                  }}
                >
                  Imprimir Relatório
                </Button>
                <Button
                  variant="outlined"
                  sx={{ 
                    borderColor: '#990000',
                    color: '#990000',
                    '&:hover': { 
                      borderColor: '#660000',
                      color: '#660000'
                    }
                  }}
                >
                  Atualizar Status
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#990000'
                }}
              >
                Informações
              </Typography>
              <Typography variant="body2" paragraph>
                Bem-vindo ao painel de separação da Distribuidora de Carnes Vale do Boi. 
                Aqui você pode gerenciar os pedidos que precisam ser separados e preparados para entrega.
              </Typography>
              <Typography variant="body2">
                Para iniciar a separação de um novo pedido, clique em "Iniciar Separação" ou 
                selecione um pedido específico na tabela acima.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SeparacaoDashboard;
