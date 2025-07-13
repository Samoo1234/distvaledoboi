import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Fab,
  IconButton,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  ContactPhone as ContactPhoneIcon,
  ContactMail as ContactMailIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import customerService, { Customer } from '../../services/customerService';
import { useNotification } from '../shared/Notification';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Componente para listagem de clientes na interface mobile
 */
const MobileClientsList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useNotification();
  const { user } = useAuth();

  // Carregar clientes
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll({ activeOnly: true });
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
  const filteredCustomers = customers.filter(customer => 
    customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_phone.includes(searchTerm)
  );

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 8 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Meus Clientes
        </Typography>
        
        {/* Estatística rápida */}
        <Card sx={{ bgcolor: '#e3f2fd', mb: 2 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon sx={{ color: '#1976d2', mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#1976d2' }}>
                  {customers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Clientes ativos
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Busca */}
      <TextField
        fullWidth
        placeholder="Buscar clientes..."
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

      {/* Lista de clientes */}
      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchTerm 
                ? 'Tente buscar por outro termo'
                : 'Entre em contato com o administrador para cadastrar clientes'
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List sx={{ px: 0 }}>
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} sx={{ mb: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {customer.company_name}
                  </Typography>
                  {customer.contact_name && (
                    <Typography variant="body2" color="text.secondary">
                      Contato: {customer.contact_name}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon sx={{ color: '#666', mr: 1, fontSize: 18 }} />
                  <Typography variant="body2">
                    {formatPhone(customer.contact_phone)}
                  </Typography>
                  <IconButton 
                    size="small" 
                    href={`tel:${customer.contact_phone}`}
                    sx={{ ml: 1, color: '#990000' }}
                  >
                    <PhoneIcon fontSize="small" />
                  </IconButton>
                </Box>

                {customer.contact_email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ color: '#666', mr: 1, fontSize: 18 }} />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {customer.contact_email}
                    </Typography>
                    <IconButton 
                      size="small" 
                      href={`mailto:${customer.contact_email}`}
                      sx={{ color: '#990000' }}
                    >
                      <EmailIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}

                {customer.address && (
                  <Typography variant="body2" color="text.secondary">
                    📍 {customer.address}
                    {customer.city && customer.state && 
                      `, ${customer.city}/${customer.state}`
                    }
                  </Typography>
                )}

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Button
                      size="small"
                      href={`tel:${customer.contact_phone}`}
                      sx={{ color: '#990000', mr: 1 }}
                    >
                      Ligar
                    </Button>
                    {customer.contact_email && (
                      <Button
                        size="small"
                        href={`mailto:${customer.contact_email}`}
                        sx={{ color: '#990000' }}
                      >
                        E-mail
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}
    </Box>
  );
};

export default MobileClientsList; 