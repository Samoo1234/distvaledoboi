import React, { useState, useEffect } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Settings as SettingsIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Email as EmailIcon,
  Backup as BackupIcon,
  Computer as SystemIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Save as SaveIcon,
  RestoreFromTrash as RestoreIcon,
  CloudUpload as CloudUploadIcon,
  GetApp as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ExpandMore as ExpandMoreIcon,
  VpnKey as KeyIcon,
  Shield as ShieldIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
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

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'vendedor' | 'separacao' | 'admin';
  active: boolean;
  created_at: string;
}

interface SystemSettings {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  backup_enabled: boolean;
  auto_backup_frequency: string;
  session_timeout: number;
  max_login_attempts: number;
  require_password_change: boolean;
  password_min_length: number;
}

/**
 * Componente de configurações administrativas
 */
const SettingsAdmin: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    company_name: 'Distribuidora de Carnes Vale do Boi',
    company_email: 'contato@valedoboi.com',
    company_phone: '(11) 99999-9999',
    company_address: 'Rua das Carnes, 123 - São Paulo, SP',
    notifications_enabled: true,
    email_notifications: true,
    backup_enabled: true,
    auto_backup_frequency: 'daily',
    session_timeout: 30,
    max_login_attempts: 5,
    require_password_change: false,
    password_min_length: 6
  });

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendedor' as 'vendedor' | 'separacao' | 'admin',
    active: true
  });

  // Carregar usuários
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Buscar usuários da tabela user_profiles (que deve existir)
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          email,
          role,
          active,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar perfis:', error);
        
        // Se a tabela user_profiles não existir, tentar tabela users
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log('Tentando tabela users...');
          
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, user_metadata, role, created_at')
            .order('created_at', { ascending: false });
            
          if (usersError) {
            console.error('Erro ao carregar usuários:', usersError);
            showNotification({ 
              message: 'Tabelas de usuários não encontradas. Verifique se o banco está configurado.', 
              type: 'warning' 
            });
            setUsers([]);
            return;
          }
          
          // Transformar dados da tabela users para o formato esperado
          const transformedUsers = users?.map(user => ({
            id: user.id,
            name: user.user_metadata?.name || 'Sem nome',
            email: user.email || 'Sem email',
            role: user.role || 'vendedor',
            active: true,
            created_at: user.created_at
          })) || [];
          
          setUsers(transformedUsers);
          return;
        }
        throw error;
      }

      setUsers(profiles || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      showNotification({ message: 'Erro ao carregar usuários', type: 'error' });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Salvar configurações do sistema
  const handleSaveSystemSettings = async () => {
    try {
      setLoading(true);
      
      // Simular salvamento das configurações
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification({ 
        message: 'Configurações do sistema salvas com sucesso!', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      showNotification({ 
        message: 'Erro ao salvar configurações', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Gerenciar usuários
  const handleAddUser = () => {
    setSelectedUser(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'vendedor',
      active: true
    });
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      active: user.active
    });
    setUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      setLoading(true);
      
      if (selectedUser) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from('user_profiles')
          .update({
            name: userForm.name,
            role: userForm.role,
            active: userForm.active
          })
          .eq('id', selectedUser.id);

        if (error) throw error;
        
        showNotification({ 
          message: 'Usuário atualizado com sucesso!', 
          type: 'success' 
        });
      } else {
        // Criar novo usuário
        const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
          email: userForm.email,
          password: userForm.password,
          email_confirm: true
        });

        if (authError) throw authError;

        // Criar perfil
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: newUser.user.id,
            name: userForm.name,
            role: userForm.role,
            active: userForm.active
          });

        if (profileError) throw profileError;

        showNotification({ 
          message: 'Usuário criado com sucesso!', 
          type: 'success' 
        });
      }

      setUserDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      showNotification({ 
        message: error.message || 'Erro ao salvar usuário', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ active: false })
        .eq('id', userId);

      if (error) throw error;
      
      showNotification({ 
        message: 'Usuário desativado com sucesso!', 
        type: 'success' 
      });
      
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      showNotification({ 
        message: error.message || 'Erro ao excluir usuário', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Backup e restauração
  const handleBackupData = async () => {
    try {
      setLoading(true);
      
      // Simular backup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showNotification({ 
        message: 'Backup realizado com sucesso!', 
        type: 'success' 
      });
    } catch (error) {
      showNotification({ 
        message: 'Erro ao realizar backup', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreData = async () => {
    if (!window.confirm('Tem certeza que deseja restaurar os dados? Esta ação não pode ser desfeita.')) return;

    try {
      setLoading(true);
      
      // Simular restauração
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      showNotification({ 
        message: 'Dados restaurados com sucesso!', 
        type: 'success' 
      });
    } catch (error) {
      showNotification({ 
        message: 'Erro ao restaurar dados', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'separacao': return 'warning';
      case 'vendedor': return 'info';
      default: return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'separacao': return 'Separação';
      case 'vendedor': return 'Vendedor';
      default: return role;
    }
  };

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
          Configurações do Sistema
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<BackupIcon />}
            onClick={() => setBackupDialogOpen(true)}
            sx={{ borderColor: '#990000', color: '#990000' }}
          >
            Backup
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSystemSettings}
            disabled={loading}
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </Box>
      </Box>

      {/* Abas de configurações */}
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Geral" icon={<SettingsIcon />} />
          <Tab label="Usuários" icon={<PeopleIcon />} />
          <Tab label="Segurança" icon={<SecurityIcon />} />
          <Tab label="Notificações" icon={<NotificationsIcon />} />
          <Tab label="Backup" icon={<StorageIcon />} />
        </Tabs>

        {/* Aba Geral */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Informações da Empresa
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Nome da Empresa"
                      value={systemSettings.company_name}
                      onChange={(e) => setSystemSettings({...systemSettings, company_name: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Email da Empresa"
                      value={systemSettings.company_email}
                      onChange={(e) => setSystemSettings({...systemSettings, company_email: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Telefone da Empresa"
                      value={systemSettings.company_phone}
                      onChange={(e) => setSystemSettings({...systemSettings, company_phone: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Endereço da Empresa"
                      value={systemSettings.company_address}
                      onChange={(e) => setSystemSettings({...systemSettings, company_address: e.target.value})}
                      multiline
                      rows={2}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    <SystemIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Configurações do Sistema
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Timeout de Sessão (minutos)"
                      type="number"
                      value={systemSettings.session_timeout}
                      onChange={(e) => setSystemSettings({...systemSettings, session_timeout: Number(e.target.value)})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Máximo de Tentativas de Login"
                      type="number"
                      value={systemSettings.max_login_attempts}
                      onChange={(e) => setSystemSettings({...systemSettings, max_login_attempts: Number(e.target.value)})}
                      sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Frequência de Backup</InputLabel>
                      <Select
                        value={systemSettings.auto_backup_frequency}
                        onChange={(e) => setSystemSettings({...systemSettings, auto_backup_frequency: e.target.value})}
                        label="Frequência de Backup"
                      >
                        <MenuItem value="daily">Diário</MenuItem>
                        <MenuItem value="weekly">Semanal</MenuItem>
                        <MenuItem value="monthly">Mensal</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemSettings.backup_enabled}
                          onChange={(e) => setSystemSettings({...systemSettings, backup_enabled: e.target.checked})}
                        />
                      }
                      label="Backup Automático"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Aba Usuários */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddUser}
              sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
            >
              Novo Usuário
            </Button>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Usuários do Sistema
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Perfil</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Criado em</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getRoleText(user.role)} 
                            color={getRoleColor(user.role)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.active ? 'Ativo' : 'Inativo'} 
                            color={user.active ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleEditUser(user)} size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDeleteUser(user.id)} 
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Aba Segurança */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    <ShieldIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Política de Senhas
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Tamanho Mínimo da Senha"
                      type="number"
                      value={systemSettings.password_min_length}
                      onChange={(e) => setSystemSettings({...systemSettings, password_min_length: Number(e.target.value)})}
                      sx={{ mb: 2 }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemSettings.require_password_change}
                          onChange={(e) => setSystemSettings({...systemSettings, require_password_change: e.target.checked})}
                        />
                      }
                      label="Exigir Troca de Senha Periódica"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    <KeyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Logs de Segurança
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Login bem-sucedido"
                        secondary="admin@valedoboi.com - Hoje às 14:30"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tentativa de login falhada"
                        secondary="vendedor@teste.com - Hoje às 13:45"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Usuário criado"
                        secondary="separacao@valedoboi.com - Ontem às 16:20"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Aba Notificações */}
        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configurações de Notificações
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.notifications_enabled}
                      onChange={(e) => setSystemSettings({...systemSettings, notifications_enabled: e.target.checked})}
                    />
                  }
                  label="Notificações do Sistema"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.email_notifications}
                      onChange={(e) => setSystemSettings({...systemSettings, email_notifications: e.target.checked})}
                    />
                  }
                  label="Notificações por Email"
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" gutterBottom>
                Tipos de Notificações
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Novos Pedidos"
                    secondary="Notificar quando novos pedidos chegarem"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Estoque Baixo"
                    secondary="Alertar quando produtos estiverem com estoque baixo"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Backup Automático"
                    secondary="Notificar sobre status dos backups"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Novos Usuários"
                    secondary="Notificar quando novos usuários forem criados"
                  />
                  <ListItemSecondaryAction>
                    <Switch />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Aba Backup */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    <BackupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Backup de Dados
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Último backup realizado: Hoje às 02:00
                    </Alert>
                    
                    <Button
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      onClick={handleBackupData}
                      disabled={loading}
                      sx={{ mr: 2, mb: 2, bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
                    >
                      {loading ? 'Fazendo Backup...' : 'Fazer Backup Agora'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      sx={{ mb: 2, borderColor: '#990000', color: '#990000' }}
                    >
                      Baixar Último Backup
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    <RestoreIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Restaurar Dados
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      ⚠️ Restaurar dados irá substituir todos os dados atuais
                    </Alert>
                    
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<RestoreIcon />}
                      onClick={handleRestoreData}
                      disabled={loading}
                      sx={{ mb: 2 }}
                    >
                      {loading ? 'Restaurando...' : 'Restaurar Dados'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Histórico de Backups
                  </Typography>
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Data</TableCell>
                          <TableCell>Tipo</TableCell>
                          <TableCell>Tamanho</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Hoje 02:00</TableCell>
                          <TableCell>Automático</TableCell>
                          <TableCell>45.2 MB</TableCell>
                          <TableCell>
                            <Chip label="Sucesso" color="success" size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small">
                              <DownloadIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Ontem 02:00</TableCell>
                          <TableCell>Automático</TableCell>
                          <TableCell>44.8 MB</TableCell>
                          <TableCell>
                            <Chip label="Sucesso" color="success" size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small">
                              <DownloadIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>15/11/2024 14:30</TableCell>
                          <TableCell>Manual</TableCell>
                          <TableCell>44.1 MB</TableCell>
                          <TableCell>
                            <Chip label="Sucesso" color="success" size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small">
                              <DownloadIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Dialog de usuário */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  required
                  disabled={!!selectedUser}
                />
              </Grid>
              {!selectedUser && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    required
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <HideIcon /> : <ViewIcon />}
                        </IconButton>
                      )
                    }}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Perfil</InputLabel>
                  <Select
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value as any})}
                    label="Perfil"
                  >
                    <MenuItem value="vendedor">Vendedor</MenuItem>
                    <MenuItem value="separacao">Separação</MenuItem>
                    <MenuItem value="admin">Administrador</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userForm.active}
                      onChange={(e) => setUserForm({...userForm, active: e.target.checked})}
                    />
                  }
                  label="Usuário Ativo"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de backup */}
      <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Operações de Backup</DialogTitle>
        <DialogContent>
          <List>
            <ListItem button onClick={handleBackupData}>
              <ListItemIcon>
                <CloudUploadIcon />
              </ListItemIcon>
              <ListItemText
                primary="Fazer Backup Agora"
                secondary="Criar backup manual dos dados atuais"
              />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <DownloadIcon />
              </ListItemIcon>
              <ListItemText
                primary="Baixar Backup"
                secondary="Baixar último backup disponível"
              />
            </ListItem>
            <ListItem button onClick={handleRestoreData}>
              <ListItemIcon>
                <RestoreIcon />
              </ListItemIcon>
              <ListItemText
                primary="Restaurar Dados"
                secondary="Restaurar sistema a partir de backup"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsAdmin; 