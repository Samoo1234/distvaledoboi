import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import customerService, { Customer, CustomerInput } from '../../../services/customerService';
import { useNotification } from '../../shared/Notification';
import { useAuth } from '../../../contexts/AuthContext';

interface CustomerForm {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string;
  salesperson_id: string;
  cnpj: string;
  inscricao_estadual: string;
}

const states = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

/**
 * Componente para gerenciamento completo de clientes
 */
const CustomersManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerForm>({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    notes: '',
    salesperson_id: '',
    cnpj: '',
    inscricao_estadual: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<CustomerForm>>({});
  const { showNotification } = useNotification();
  const { user } = useAuth();

  // Carregar clientes
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll({ activeOnly: false });
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      showNotification({ message: 'Erro ao carregar clientes', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Filtrar clientes
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.contact_phone.includes(searchTerm);
    return matchesSearch;
  });

  // Validar formulário
  const validateForm = (): boolean => {
    const errors: Partial<CustomerForm> = {};

    if (!formData.company_name.trim()) errors.company_name = 'Nome da empresa é obrigatório';
    if (!formData.contact_phone.trim()) errors.contact_phone = 'Telefone é obrigatório';
    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
      errors.contact_email = 'Email inválido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Formatar telefone
  const formatPhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
    } else if (digits.length === 10) {
      return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
    }
    return phone;
  };

  // Abrir dialog para novo cliente
  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setFormData({
      company_name: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      notes: '',
      salesperson_id: user?.id || '',
      cnpj: '',
      inscricao_estadual: ''
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  // Abrir dialog para editar cliente
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      company_name: customer.company_name,
      contact_name: customer.contact_name || '',
      contact_email: customer.contact_email || '',
      contact_phone: customer.contact_phone,
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zip_code: customer.zip_code || '',
      notes: customer.notes || '',
      salesperson_id: customer.salesperson_id || '',
      cnpj: (customer as any).cnpj || '',
      inscricao_estadual: (customer as any).inscricao_estadual || ''
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  // Salvar cliente
  const handleSaveCustomer = async () => {
    if (!validateForm()) return;

    try {
      const customerData: CustomerInput = {
        company_name: formData.company_name.trim(),
        contact_name: formData.contact_name.trim() || undefined,
        contact_email: formData.contact_email.trim() || undefined,
        contact_phone: formData.contact_phone.trim(),
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state || undefined,
        zip_code: formData.zip_code.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        salesperson_id: formData.salesperson_id || undefined,
        cnpj: formData.cnpj.trim() || undefined,
        inscricao_estadual: formData.inscricao_estadual.trim() || undefined
      };

      if (editingCustomer) {
        await customerService.update(editingCustomer.id, customerData);
        showNotification({ message: 'Cliente atualizado com sucesso!', type: 'success' });
      } else {
        await customerService.create(customerData);
        showNotification({ message: 'Cliente criado com sucesso!', type: 'success' });
      }

      setDialogOpen(false);
      loadCustomers();
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      showNotification({ 
        message: error.message || 'Erro ao salvar cliente', 
        type: 'error' 
      });
    }
  };

  // Desativar cliente
  const handleDeleteCustomer = async (customer: Customer) => {
    if (!window.confirm(`Tem certeza que deseja desativar o cliente "${customer.company_name}"?`)) {
      return;
    }

    try {
      await customerService.deactivate(customer.id);
      showNotification({ message: 'Cliente desativado com sucesso!', type: 'success' });
      loadCustomers();
    } catch (error: any) {
      console.error('Erro ao desativar cliente:', error);
      showNotification({ 
        message: error.message || 'Erro ao desativar cliente', 
        type: 'error' 
      });
    }
  };

  // Estatísticas rápidas
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.active).length;
  const customersWithEmail = customers.filter(c => c.contact_email).length;

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
          Gerenciamento de Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCustomer}
          sx={{ 
            bgcolor: '#990000', 
            '&:hover': { bgcolor: '#660000' } 
          }}
        >
          Novo Cliente
        </Button>
      </Box>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ color: '#990000', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total de Clientes
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {totalCustomers}
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
                <BusinessIcon sx={{ color: '#990000', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Clientes Ativos
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {activeCustomers}
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
                <EmailIcon sx={{ color: '#990000', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Com E-mail
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {customersWithEmail}
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
                <PhoneIcon sx={{ color: '#990000', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Taxa de Contato
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {totalCustomers > 0 ? Math.round((customersWithEmail / totalCustomers) * 100) : 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Buscar por empresa, contato ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setSearchTerm('')}
            >
              Limpar Busca
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela de clientes */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Empresa</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Contato</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Telefone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cidade/UF</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Nenhum cliente encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {customer.company_name}
                      </Typography>
                      {customer.address && (
                        <Typography variant="body2" color="text.secondary">
                          {customer.address}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {customer.contact_name && (
                        <Typography variant="body2">
                          {customer.contact_name}
                        </Typography>
                      )}
                      {customer.contact_email && (
                        <Typography variant="body2" color="text.secondary">
                          {customer.contact_email}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {formatPhone(customer.contact_phone)}
                  </TableCell>
                  <TableCell>
                    {customer.city && customer.state 
                      ? `${customer.city}/${customer.state}`
                      : customer.city || customer.state || '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={customer.active ? 'Ativo' : 'Inativo'} 
                      color={customer.active ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleEditCustomer(customer)}
                      sx={{ color: '#990000' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteCustomer(customer)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para adicionar/editar cliente */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Nome da Empresa *"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  error={!!formErrors.company_name}
                  helperText={formErrors.company_name}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Telefone *"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  error={!!formErrors.contact_phone}
                  helperText={formErrors.contact_phone}
                  placeholder="(11) 99999-9999"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CNPJ"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  error={!!formErrors.cnpj}
                  helperText={formErrors.cnpj}
                  placeholder="00.000.000/0000-00"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Inscrição Estadual"
                  value={formData.inscricao_estadual}
                  onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
                  error={!!formErrors.inscricao_estadual}
                  helperText={formErrors.inscricao_estadual}
                  placeholder="000.000.000.000"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome do Contato"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="E-mail"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  error={!!formErrors.contact_email}
                  helperText={formErrors.contact_email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Endereço"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    label="Estado"
                  >
                    <MenuItem value="">Selecione...</MenuItem>
                    {states.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="CEP"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  placeholder="00000-000"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveCustomer}
            variant="contained"
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            {editingCustomer ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomersManagement; 