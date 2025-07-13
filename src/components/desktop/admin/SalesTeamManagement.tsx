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
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  Flag as FlagIcon,
  EmojiEvents as TrophyIcon,
  Terrain as TerrainIcon
} from '@mui/icons-material';
import { useNotification } from '../../shared/Notification';
import { supabase } from '../../../services/supabase';

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
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
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

interface Salesperson {
  id: string;
  user_id: string;
  employee_code: string;
  hire_date: string;
  territory_id?: string;
  commission_rate: number;
  base_salary: number;
  phone?: string;
  active: boolean;
}

interface Territory {
  id: string;
  name: string;
  description: string;
  cities: string[];
  states: string[];
  active: boolean;
}

interface SalesGoal {
  id: string;
  salesperson_id: string;
  goal_type: 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  revenue_goal: number;
  orders_goal: number;
  current_revenue: number;
  current_orders: number;
  active: boolean;
}

interface Commission {
  id: string;
  salesperson_id: string;
  order_id: string;
  commission_rate: number;
  commission_amount: number;
  bonus_amount: number;
  payment_status: 'pending' | 'paid' | 'cancelled';
  period_month: number;
  period_year: number;
}

interface SalespersonForm {
  user_id: string;
  employee_code: string;
  hire_date: string;
  territory_id: string;
  commission_rate: number;
  base_salary: number;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
}

interface TerritoryForm {
  name: string;
  description: string;
  cities: string;
  states: string;
}

interface GoalForm {
  salesperson_id: string;
  territory_id: string;
  goal_type: 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  revenue_goal: number;
  orders_goal: number;
  new_customers_goal: number;
  bonus_percentage: number;
  notes: string;
}

/**
 * Componente para gestão completa da equipe de vendas
 */
const SalesTeamManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [salesGoals, setSalesGoals] = useState<SalesGoal[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  
  // Dialogs
  const [salespersonDialogOpen, setSalespersonDialogOpen] = useState(false);
  const [territoryDialogOpen, setTerritoryDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  
  // Form states
  const [salespersonForm, setSalespersonForm] = useState<SalespersonForm>({
    user_id: '',
    employee_code: '',
    hire_date: new Date().toISOString().split('T')[0],
    territory_id: '',
    commission_rate: 5.0,
    base_salary: 0,
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: ''
  });

  const [territoryForm, setTerritoryForm] = useState<TerritoryForm>({
    name: '',
    description: '',
    cities: '',
    states: ''
  });

  const [goalForm, setGoalForm] = useState<GoalForm>({
    salesperson_id: '',
    territory_id: '',
    goal_type: 'monthly',
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    revenue_goal: 0,
    orders_goal: 0,
    new_customers_goal: 0,
    bonus_percentage: 0,
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<any>({});
  
  const { showNotification } = useNotification();

  // Estados brasileiros
  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Carregar dados
  const loadSalespeople = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('salespeople')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSalespeople(data || []);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
      showNotification({ message: 'Erro ao carregar vendedores', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const loadTerritories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('territories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setTerritories(data || []);
    } catch (error) {
      console.error('Erro ao carregar territórios:', error);
      showNotification({ message: 'Erro ao carregar territórios', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const loadSalesGoals = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales_goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSalesGoals(data || []);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      showNotification({ message: 'Erro ao carregar metas', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const loadCommissions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setCommissions(data || []);
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
      showNotification({ message: 'Erro ao carregar comissões', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      showNotification({ message: 'Erro ao carregar usuários', type: 'error' });
    }
  }, [showNotification]);

  useEffect(() => {
    loadSalespeople();
    loadTerritories();
    loadSalesGoals();
    loadCommissions();
    loadUsers();
  }, [loadSalespeople, loadTerritories, loadSalesGoals, loadCommissions, loadUsers]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Validação dos formulários
  const validateSalespersonForm = (): boolean => {
    const errors: any = {};

    if (!salespersonForm.user_id) errors.user_id = 'Usuário é obrigatório';
    if (!salespersonForm.employee_code) errors.employee_code = 'Código do funcionário é obrigatório';
    if (!salespersonForm.hire_date) errors.hire_date = 'Data de contratação é obrigatória';
    if (salespersonForm.commission_rate < 0 || salespersonForm.commission_rate > 100) {
      errors.commission_rate = 'Taxa de comissão deve estar entre 0 e 100%';
    }
    if (salespersonForm.base_salary < 0) errors.base_salary = 'Salário base deve ser positivo';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateTerritoryForm = (): boolean => {
    const errors: any = {};

    if (!territoryForm.name) errors.name = 'Nome é obrigatório';
    if (!territoryForm.description) errors.description = 'Descrição é obrigatória';
    if (!territoryForm.cities) errors.cities = 'Cidades são obrigatórias';
    if (!territoryForm.states) errors.states = 'Estados são obrigatórios';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateGoalForm = (): boolean => {
    const errors: any = {};

    if (!goalForm.salesperson_id) errors.salesperson_id = 'Vendedor é obrigatório';
    if (!goalForm.period_start) errors.period_start = 'Data de início é obrigatória';
    if (!goalForm.period_end) errors.period_end = 'Data de fim é obrigatória';
    if (goalForm.revenue_goal <= 0) errors.revenue_goal = 'Meta de faturamento deve ser positiva';
    if (goalForm.orders_goal <= 0) errors.orders_goal = 'Meta de pedidos deve ser positiva';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers para salvar dados
  const handleSaveSalesperson = async () => {
    if (!validateSalespersonForm()) return;

    try {
      setLoading(true);
      
      const formData = {
        ...salespersonForm,
        commission_rate: Number(salespersonForm.commission_rate),
        base_salary: Number(salespersonForm.base_salary)
      };

      const { error } = await supabase
        .from('salesperson_profiles')
        .insert([formData]);
      
      if (error) throw error;
      
      showNotification({ message: 'Vendedor cadastrado com sucesso!', type: 'success' });
      setSalespersonDialogOpen(false);
      setSalespersonForm({
        user_id: '',
        employee_code: '',
        hire_date: new Date().toISOString().split('T')[0],
        territory_id: '',
        commission_rate: 5.0,
        base_salary: 0,
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        notes: ''
      });
      loadSalespeople();
    } catch (error: any) {
      console.error('Erro ao salvar vendedor:', error);
      showNotification({ message: error.message || 'Erro ao salvar vendedor', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTerritory = async () => {
    if (!validateTerritoryForm()) return;

    try {
      setLoading(true);
      
      const formData = {
        name: territoryForm.name,
        description: territoryForm.description,
        cities: territoryForm.cities.split(',').map(c => c.trim()),
        states: territoryForm.states.split(',').map(s => s.trim().toUpperCase())
      };

      const { error } = await supabase
        .from('sales_territories')
        .insert([formData]);
      
      if (error) throw error;
      
      showNotification({ message: 'Território cadastrado com sucesso!', type: 'success' });
      setTerritoryDialogOpen(false);
      setTerritoryForm({
        name: '',
        description: '',
        cities: '',
        states: ''
      });
      loadTerritories();
    } catch (error: any) {
      console.error('Erro ao salvar território:', error);
      showNotification({ message: error.message || 'Erro ao salvar território', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    if (!validateGoalForm()) return;

    try {
      setLoading(true);
      
      const formData = {
        ...goalForm,
        revenue_goal: Number(goalForm.revenue_goal),
        orders_goal: Number(goalForm.orders_goal),
        new_customers_goal: Number(goalForm.new_customers_goal),
        bonus_percentage: Number(goalForm.bonus_percentage),
        current_revenue: 0,
        current_orders: 0,
        current_new_customers: 0
      };

      const { error } = await supabase
        .from('sales_goals')
        .insert([formData]);
      
      if (error) throw error;
      
      showNotification({ message: 'Meta cadastrada com sucesso!', type: 'success' });
      setGoalDialogOpen(false);
      setGoalForm({
        salesperson_id: '',
        territory_id: '',
        goal_type: 'monthly',
        period_start: new Date().toISOString().split('T')[0],
        period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        revenue_goal: 0,
        orders_goal: 0,
        new_customers_goal: 0,
        bonus_percentage: 0,
        notes: ''
      });
      loadSalesGoals();
    } catch (error: any) {
      console.error('Erro ao salvar meta:', error);
      showNotification({ message: error.message || 'Erro ao salvar meta', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar vendedores
  const filteredSalespeople = salespeople.filter(person =>
    person.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estatísticas
  const totalSalespeople = salespeople.filter(s => s.active).length;
  const totalTerritories = territories.filter(t => t.active).length;
  const activeGoals = salesGoals.filter(g => g.active).length;
  const pendingCommissions = commissions.filter(c => c.payment_status === 'pending').length;

  // Calcular performance
  const avgGoalCompletion = salesGoals.length > 0
    ? salesGoals.reduce((sum, goal) => {
        const completion = goal.revenue_goal > 0 ? (goal.current_revenue / goal.revenue_goal) * 100 : 0;
        return sum + completion;
      }, 0) / salesGoals.length
    : 0;

  const totalCommissionsPending = commissions
    .filter(c => c.payment_status === 'pending')
    .reduce((sum, c) => sum + c.commission_amount + c.bonus_amount, 0);

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
          Gestão de Equipe de Vendas
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setSalespersonDialogOpen(true)}
          sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
        >
          Novo Vendedor
        </Button>
      </Box>

      {/* Aviso sobre configuração */}
      {salespeople.length === 0 && territories.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Sistema de Vendedores
          </Typography>
          <Typography variant="body2">
            Execute o script SQL <strong>schema-vendedores-logistica-corrigido.sql</strong> no Supabase para criar as tabelas necessárias.
          </Typography>
        </Alert>
      )}

      {/* Estatísticas principais */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ color: '#1976d2', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Vendedores Ativos
                  </Typography>
                  <Typography variant="h5" component="h2" color="primary.main">
                    {totalSalespeople}
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
                <TerrainIcon sx={{ color: '#2e7d32', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Territórios
                  </Typography>
                  <Typography variant="h5" component="h2" color="success.main">
                    {totalTerritories}
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
                <TrophyIcon sx={{ color: '#ff9800', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Metas Ativas
                  </Typography>
                  <Typography variant="h5" component="h2" color="warning.main">
                    {activeGoals}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {avgGoalCompletion.toFixed(1)}% média de conclusão
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
                <MoneyIcon sx={{ color: '#9c27b0', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Comissões Pendentes
                  </Typography>
                  <Typography variant="h5" component="h2" color="secondary.main">
                    R$ {totalCommissionsPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {pendingCommissions} pagamentos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Abas principais */}
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Vendedores" icon={<PeopleIcon />} />
          <Tab label="Territórios" icon={<LocationIcon />} />
          <Tab label="Metas" icon={<FlagIcon />} />
          <Tab label="Comissões" icon={<MoneyIcon />} />
        </Tabs>

        {/* Aba Vendedores */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <TextField
              placeholder="Buscar por código do vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 400 }}
            />
          </Box>

          {salespeople.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Data Contratação</TableCell>
                    <TableCell>Comissão</TableCell>
                    <TableCell>Salário Base</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSalespeople.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell>
                        <Chip 
                          label={person.employee_code} 
                          size="small"
                          sx={{ bgcolor: '#990000', color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(person.hire_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{person.commission_rate}%</TableCell>
                      <TableCell>
                        R$ {person.base_salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{person.phone || 'Não informado'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={person.active ? 'Ativo' : 'Inativo'} 
                          color={person.active ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              <Typography variant="body1">Nenhum vendedor cadastrado</Typography>
              <Typography variant="body2">
                Clique em "Novo Vendedor" para começar ou execute o script SQL para criar as tabelas.
              </Typography>
            </Alert>
          )}
        </TabPanel>

        {/* Aba Territórios */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<LocationIcon />}
              onClick={() => setTerritoryDialogOpen(true)}
              sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
            >
              Novo Território
            </Button>
          </Box>

          {territories.length > 0 ? (
            <Grid container spacing={3}>
              {territories.map((territory) => (
                <Grid item xs={12} md={6} lg={4} key={territory.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                          {territory.name}
                        </Typography>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {territory.description}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" display="block">Estados:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {territory.states.map((state, index) => (
                            <Chip key={index} label={state} size="small" />
                          ))}
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" display="block">Principais Cidades:</Typography>
                        <Typography variant="body2">
                          {territory.cities.slice(0, 3).join(', ')}
                          {territory.cities.length > 3 && ` +${territory.cities.length - 3} mais`}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              <Typography variant="body1">Nenhum território cadastrado</Typography>
              <Typography variant="body2">
                O script SQL já criou alguns territórios exemplo. Recarregue a página ou execute o script novamente.
              </Typography>
            </Alert>
          )}
        </TabPanel>

        {/* Aba Metas */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<FlagIcon />}
              onClick={() => setGoalDialogOpen(true)}
              sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
            >
              Nova Meta
            </Button>
          </Box>

          {salesGoals.length > 0 ? (
            <Grid container spacing={3}>
              {salesGoals.map((goal) => {
                const revenueProgress = goal.revenue_goal > 0 ? (goal.current_revenue / goal.revenue_goal) * 100 : 0;
                const ordersProgress = goal.orders_goal > 0 ? (goal.current_orders / goal.orders_goal) * 100 : 0;
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={goal.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                              Vendedor #{goal.salesperson_id.substring(0, 8)}
                            </Typography>
                            <Chip 
                              label={goal.goal_type === 'monthly' ? 'Mensal' : goal.goal_type === 'quarterly' ? 'Trimestral' : 'Anual'} 
                              size="small"
                              color="primary"
                            />
                          </Box>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {new Date(goal.period_start).toLocaleDateString('pt-BR')} - {new Date(goal.period_end).toLocaleDateString('pt-BR')}
                        </Typography>

                        {/* Progress Revenue */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Faturamento</Typography>
                            <Typography variant="body2">
                              {revenueProgress.toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(revenueProgress, 100)}
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              '& .MuiLinearProgress-bar': { 
                                bgcolor: revenueProgress >= 100 ? '#2e7d32' : revenueProgress >= 80 ? '#ff9800' : '#1976d2'
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            R$ {goal.current_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / 
                            R$ {goal.revenue_goal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </Typography>
                        </Box>

                        {/* Progress Orders */}
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Pedidos</Typography>
                            <Typography variant="body2">
                              {ordersProgress.toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(ordersProgress, 100)}
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              '& .MuiLinearProgress-bar': { 
                                bgcolor: ordersProgress >= 100 ? '#2e7d32' : ordersProgress >= 80 ? '#ff9800' : '#1976d2'
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {goal.current_orders} / {goal.orders_goal} pedidos
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Alert severity="info">
              <Typography variant="body1">Nenhuma meta cadastrada</Typography>
              <Typography variant="body2">
                Clique em "Nova Meta" para definir objetivos para a equipe de vendas.
              </Typography>
            </Alert>
          )}
        </TabPanel>

        {/* Aba Comissões */}
        <TabPanel value={tabValue} index={3}>
          {commissions.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Vendedor</TableCell>
                    <TableCell>Pedido</TableCell>
                    <TableCell>Taxa</TableCell>
                    <TableCell>Comissão</TableCell>
                    <TableCell>Bônus</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Período</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>#{commission.salesperson_id.substring(0, 8)}</TableCell>
                      <TableCell>#{commission.order_id.substring(0, 8)}</TableCell>
                      <TableCell>{commission.commission_rate}%</TableCell>
                      <TableCell>R$ {commission.commission_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>R$ {commission.bonus_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          R$ {(commission.commission_amount + commission.bonus_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>
                      <TableCell>{commission.period_month}/{commission.period_year}</TableCell>
                      <TableCell>
                        <Chip 
                          label={
                            commission.payment_status === 'pending' ? 'Pendente' :
                            commission.payment_status === 'paid' ? 'Pago' : 'Cancelado'
                          }
                          color={
                            commission.payment_status === 'pending' ? 'warning' :
                            commission.payment_status === 'paid' ? 'success' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              <Typography variant="body1">Nenhuma comissão registrada</Typography>
              <Typography variant="body2">
                As comissões serão calculadas automaticamente quando houver pedidos com vendedores associados.
              </Typography>
            </Alert>
          )}
        </TabPanel>
      </Paper>

      {/* Dialog Novo Vendedor */}
      <Dialog open={salespersonDialogOpen} onClose={() => setSalespersonDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Novo Vendedor</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.user_id}>
                  <InputLabel>Usuário *</InputLabel>
                  <Select
                    value={salespersonForm.user_id}
                    onChange={(e) => setSalespersonForm({ ...salespersonForm, user_id: e.target.value })}
                    label="Usuário *"
                  >
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name || user.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Código do Funcionário *"
                  value={salespersonForm.employee_code}
                  onChange={(e) => setSalespersonForm({ ...salespersonForm, employee_code: e.target.value })}
                  error={!!formErrors.employee_code}
                  helperText={formErrors.employee_code}
                  placeholder="VEN001"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data de Contratação *"
                  type="date"
                  value={salespersonForm.hire_date}
                  onChange={(e) => setSalespersonForm({ ...salespersonForm, hire_date: e.target.value })}
                  error={!!formErrors.hire_date}
                  helperText={formErrors.hire_date}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Território</InputLabel>
                  <Select
                    value={salespersonForm.territory_id}
                    onChange={(e) => setSalespersonForm({ ...salespersonForm, territory_id: e.target.value })}
                    label="Território"
                  >
                    <MenuItem value="">Nenhum</MenuItem>
                    {territories.map((territory) => (
                      <MenuItem key={territory.id} value={territory.id}>
                        {territory.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Taxa de Comissão (%)"
                  type="number"
                  value={salespersonForm.commission_rate}
                  onChange={(e) => setSalespersonForm({ ...salespersonForm, commission_rate: Number(e.target.value) })}
                  error={!!formErrors.commission_rate}
                  helperText={formErrors.commission_rate}
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Salário Base (R$)"
                  type="number"
                  value={salespersonForm.base_salary}
                  onChange={(e) => setSalespersonForm({ ...salespersonForm, base_salary: Number(e.target.value) })}
                  error={!!formErrors.base_salary}
                  helperText={formErrors.base_salary}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={salespersonForm.phone}
                  onChange={(e) => setSalespersonForm({ ...salespersonForm, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={salespersonForm.state}
                    onChange={(e) => setSalespersonForm({ ...salespersonForm, state: e.target.value })}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Endereço"
                  value={salespersonForm.address}
                  onChange={(e) => setSalespersonForm({ ...salespersonForm, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={salespersonForm.city}
                  onChange={(e) => setSalespersonForm({ ...salespersonForm, city: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CEP"
                  value={salespersonForm.zip_code}
                  onChange={(e) => setSalespersonForm({ ...salespersonForm, zip_code: e.target.value })}
                  placeholder="00000-000"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contato de Emergência"
                  value={salespersonForm.emergency_contact_name}
                  onChange={(e) => setSalespersonForm({ ...salespersonForm, emergency_contact_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone de Emergência"
                  value={salespersonForm.emergency_contact_phone}
                  onChange={(e) => setSalespersonForm({ ...salespersonForm, emergency_contact_phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                  value={salespersonForm.notes}
                  onChange={(e) => setSalespersonForm({ ...salespersonForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSalespersonDialogOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveSalesperson}
            disabled={loading}
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Novo Território */}
      <Dialog open={territoryDialogOpen} onClose={() => setTerritoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Novo Território</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome do Território *"
                  value={territoryForm.name}
                  onChange={(e) => setTerritoryForm({ ...territoryForm, name: e.target.value })}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  placeholder="São Paulo Capital"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição *"
                  multiline
                  rows={3}
                  value={territoryForm.description}
                  onChange={(e) => setTerritoryForm({ ...territoryForm, description: e.target.value })}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  placeholder="Região metropolitana de São Paulo incluindo..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Estados *"
                  value={territoryForm.states}
                  onChange={(e) => setTerritoryForm({ ...territoryForm, states: e.target.value })}
                  error={!!formErrors.states}
                  helperText={formErrors.states || 'Separe por vírgulas (ex: SP, RJ, MG)'}
                  placeholder="SP, RJ"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Principais Cidades *"
                  value={territoryForm.cities}
                  onChange={(e) => setTerritoryForm({ ...territoryForm, cities: e.target.value })}
                  error={!!formErrors.cities}
                  helperText={formErrors.cities || 'Separe por vírgulas'}
                  placeholder="São Paulo, Osasco, Guarulhos"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTerritoryDialogOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveTerritory}
            disabled={loading}
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Nova Meta */}
      <Dialog open={goalDialogOpen} onClose={() => setGoalDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nova Meta de Vendas</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.salesperson_id}>
                  <InputLabel>Vendedor *</InputLabel>
                  <Select
                    value={goalForm.salesperson_id}
                    onChange={(e) => setGoalForm({ ...goalForm, salesperson_id: e.target.value })}
                    label="Vendedor *"
                  >
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name || user.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Meta</InputLabel>
                  <Select
                    value={goalForm.goal_type}
                    onChange={(e) => setGoalForm({ ...goalForm, goal_type: e.target.value as 'monthly' | 'quarterly' | 'yearly' })}
                    label="Tipo de Meta"
                  >
                    <MenuItem value="monthly">Mensal</MenuItem>
                    <MenuItem value="quarterly">Trimestral</MenuItem>
                    <MenuItem value="yearly">Anual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data de Início *"
                  type="date"
                  value={goalForm.period_start}
                  onChange={(e) => setGoalForm({ ...goalForm, period_start: e.target.value })}
                  error={!!formErrors.period_start}
                  helperText={formErrors.period_start}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data de Fim *"
                  type="date"
                  value={goalForm.period_end}
                  onChange={(e) => setGoalForm({ ...goalForm, period_end: e.target.value })}
                  error={!!formErrors.period_end}
                  helperText={formErrors.period_end}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Meta de Faturamento (R$) *"
                  type="number"
                  value={goalForm.revenue_goal}
                  onChange={(e) => setGoalForm({ ...goalForm, revenue_goal: Number(e.target.value) })}
                  error={!!formErrors.revenue_goal}
                  helperText={formErrors.revenue_goal}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Meta de Pedidos *"
                  type="number"
                  value={goalForm.orders_goal}
                  onChange={(e) => setGoalForm({ ...goalForm, orders_goal: Number(e.target.value) })}
                  error={!!formErrors.orders_goal}
                  helperText={formErrors.orders_goal}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Meta de Novos Clientes"
                  type="number"
                  value={goalForm.new_customers_goal}
                  onChange={(e) => setGoalForm({ ...goalForm, new_customers_goal: Number(e.target.value) })}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bônus por Atingir Meta (%)"
                  type="number"
                  value={goalForm.bonus_percentage}
                  onChange={(e) => setGoalForm({ ...goalForm, bonus_percentage: Number(e.target.value) })}
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Território</InputLabel>
                  <Select
                    value={goalForm.territory_id}
                    onChange={(e) => setGoalForm({ ...goalForm, territory_id: e.target.value })}
                    label="Território"
                  >
                    <MenuItem value="">Todos os territórios</MenuItem>
                    {territories.map((territory) => (
                      <MenuItem key={territory.id} value={territory.id}>
                        {territory.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                  value={goalForm.notes}
                  onChange={(e) => setGoalForm({ ...goalForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGoalDialogOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveGoal}
            disabled={loading}
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesTeamManagement; 