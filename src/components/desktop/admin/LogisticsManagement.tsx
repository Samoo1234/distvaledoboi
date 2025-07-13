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
  LocalShipping as TruckIcon,
  DirectionsCar as VanIcon,
  TwoWheeler as MotorcycleIcon,
  DriveEta as CarIcon,
  Person as DriverIcon,
  Phone as PhoneIcon,
  Route as RouteIcon,
  LocalShipping as DeliveryIcon,
  Build as MaintenanceIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  GasMeter as FuelIcon
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
      id={`logistics-tabpanel-${index}`}
      aria-labelledby={`logistics-tab-${index}`}
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

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  vehicle_type: 'truck' | 'van' | 'motorcycle' | 'car';
  capacity_weight: number;
  capacity_volume: number;
  fuel_type: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
  current_mileage: number;
  status: 'available' | 'in_route' | 'maintenance' | 'inactive';
  insurance_expiry?: string;
  license_expiry?: string;
  active: boolean;
}

interface Driver {
  id: string;
  name: string;
  cpf: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  phone: string;
  hire_date?: string;
  status: 'available' | 'driving' | 'resting' | 'vacation' | 'inactive';
  active: boolean;
}

interface DeliveryRoute {
  id: string;
  name: string;
  description: string;
  start_location: string;
  estimated_duration_minutes: number;
  estimated_distance_km: number;
  max_stops: number;
  active: boolean;
}

interface Delivery {
  id: string;
  order_id: string;
  vehicle_plate: string;
  driver_name: string;
  route_name?: string;
  delivery_address: string;
  scheduled_date: string;
  delivery_status: 'scheduled' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
  recipient_name?: string;
}

interface Maintenance {
  id: string;
  vehicle_plate: string;
  maintenance_type: 'preventive' | 'corrective' | 'inspection' | 'emergency';
  description: string;
  scheduled_date?: string;
  completed_date?: string;
  cost: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface VehicleForm {
  plate: string;
  brand: string;
  model: string;
  year: number;
  vehicle_type: 'truck' | 'van' | 'motorcycle' | 'car';
  capacity_weight: number;
  capacity_volume: number;
  fuel_type: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
  current_mileage: number;
  status: 'available' | 'in_route' | 'maintenance' | 'inactive';
  insurance_expiry: string;
  license_expiry: string;
  purchase_date: string;
  purchase_price: number;
  renavam: string;
  color: string;
  notes: string;
}

interface DriverForm {
  name: string;
  cpf: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  phone: string;
  hire_date: string;
  status: 'available' | 'driving' | 'resting' | 'vacation' | 'inactive';
  address: string;
  city: string;
  state: string;
  zip_code: string;
  email: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  base_salary: number;
  notes: string;
}

interface RouteForm {
  name: string;
  description: string;
  start_location: string;
  route_points: string;
  estimated_duration_minutes: number;
  estimated_distance_km: number;
  max_stops: number;
  vehicle_types: string[];
  notes: string;
}

interface DeliveryForm {
  order_id: string;
  vehicle_id: string;
  driver_id: string;
  route_id: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zip_code: string;
  scheduled_date: string;
  scheduled_time_start: string;
  scheduled_time_end: string;
  recipient_name: string;
  recipient_document: string;
  special_instructions: string;
  delivery_fee: number;
  notes: string;
}

interface MaintenanceForm {
  vehicle_id: string;
  maintenance_type: 'preventive' | 'corrective' | 'inspection' | 'emergency';
  description: string;
  scheduled_date: string;
  service_provider: string;
  cost: number;
  parts_replaced: string;
  next_service_mileage: number;
  next_service_date: string;
  notes: string;
}

/**
 * Componente para gestão completa de logística
 */
const LogisticsManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  
  // Dialogs
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  
  // Form states
  const [vehicleForm, setVehicleForm] = useState<VehicleForm>({
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    vehicle_type: 'truck',
    capacity_weight: 0,
    capacity_volume: 0,
    fuel_type: 'diesel',
    current_mileage: 0,
    status: 'available',
    insurance_expiry: '',
    license_expiry: '',
    purchase_date: '',
    purchase_price: 0,
    renavam: '',
    color: '',
    notes: ''
  });

  const [driverForm, setDriverForm] = useState<DriverForm>({
    name: '',
    cpf: '',
    license_number: '',
    license_category: 'B',
    license_expiry: '',
    phone: '',
    hire_date: new Date().toISOString().split('T')[0],
    status: 'available',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    email: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    base_salary: 0,
    notes: ''
  });

  const [routeForm, setRouteForm] = useState<RouteForm>({
    name: '',
    description: '',
    start_location: '',
    route_points: '',
    estimated_duration_minutes: 60,
    estimated_distance_km: 0,
    max_stops: 10,
    vehicle_types: [],
    notes: ''
  });

  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>({
    order_id: '',
    vehicle_id: '',
    driver_id: '',
    route_id: '',
    delivery_address: '',
    delivery_city: '',
    delivery_state: '',
    delivery_zip_code: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time_start: '08:00',
    scheduled_time_end: '18:00',
    recipient_name: '',
    recipient_document: '',
    special_instructions: '',
    delivery_fee: 0,
    notes: ''
  });

  const [maintenanceForm, setMaintenanceForm] = useState<MaintenanceForm>({
    vehicle_id: '',
    maintenance_type: 'preventive',
    description: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    service_provider: '',
    cost: 0,
    parts_replaced: '',
    next_service_mileage: 0,
    next_service_date: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<any>({});
  
  const { showNotification } = useNotification();

  // Estados brasileiros
  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Categorias de CNH
  const licenseCategories = ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'];

  // Tipos de veículo
  const vehicleTypes = [
    { value: 'truck', label: 'Caminhão' },
    { value: 'van', label: 'Van' },
    { value: 'motorcycle', label: 'Moto' },
    { value: 'car', label: 'Carro' }
  ];

  // Carregar dados
  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setVehicles(data || []);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      showNotification({ message: 'Erro ao carregar veículos', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setDrivers(data || []);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      showNotification({ message: 'Erro ao carregar motoristas', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const loadRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('delivery_routes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setRoutes(data || []);
    } catch (error) {
      console.error('Erro ao carregar rotas:', error);
      showNotification({ message: 'Erro ao carregar rotas', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const loadDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setDeliveries(data || []);
    } catch (error) {
      console.error('Erro ao carregar entregas:', error);
      showNotification({ message: 'Erro ao carregar entregas', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const loadMaintenance = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('maintenance')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setMaintenances(data || []);
    } catch (error) {
      console.error('Erro ao carregar manutenções:', error);
      showNotification({ message: 'Erro ao carregar manutenções', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const loadOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      showNotification({ message: 'Erro ao carregar pedidos', type: 'error' });
    }
  }, [showNotification]);

  useEffect(() => {
    loadVehicles();
    loadDrivers();
    loadRoutes();
    loadDeliveries();
    loadMaintenance();
    loadOrders();
  }, [loadVehicles, loadDrivers, loadRoutes, loadDeliveries, loadMaintenance, loadOrders]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Validação dos formulários
  const validateVehicleForm = (): boolean => {
    const errors: any = {};

    if (!vehicleForm.plate) errors.plate = 'Placa é obrigatória';
    if (!vehicleForm.brand) errors.brand = 'Marca é obrigatória';
    if (!vehicleForm.model) errors.model = 'Modelo é obrigatório';
    if (vehicleForm.year < 1900 || vehicleForm.year > new Date().getFullYear() + 1) {
      errors.year = 'Ano inválido';
    }
    if (vehicleForm.capacity_weight <= 0) errors.capacity_weight = 'Capacidade de peso deve ser positiva';
    if (vehicleForm.capacity_volume <= 0) errors.capacity_volume = 'Capacidade de volume deve ser positiva';
    if (vehicleForm.current_mileage < 0) errors.current_mileage = 'Quilometragem deve ser positiva';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateDriverForm = (): boolean => {
    const errors: any = {};

    if (!driverForm.name) errors.name = 'Nome é obrigatório';
    if (!driverForm.cpf) errors.cpf = 'CPF é obrigatório';
    if (!driverForm.license_number) errors.license_number = 'Número da CNH é obrigatório';
    if (!driverForm.license_expiry) errors.license_expiry = 'Vencimento da CNH é obrigatório';
    if (!driverForm.phone) errors.phone = 'Telefone é obrigatório';
    if (!driverForm.hire_date) errors.hire_date = 'Data de contratação é obrigatória';
    if (driverForm.base_salary < 0) errors.base_salary = 'Salário base deve ser positivo';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRouteForm = (): boolean => {
    const errors: any = {};

    if (!routeForm.name) errors.name = 'Nome da rota é obrigatório';
    if (!routeForm.description) errors.description = 'Descrição é obrigatória';
    if (!routeForm.start_location) errors.start_location = 'Local de início é obrigatório';
    if (routeForm.estimated_duration_minutes <= 0) errors.estimated_duration_minutes = 'Duração deve ser positiva';
    if (routeForm.estimated_distance_km <= 0) errors.estimated_distance_km = 'Distância deve ser positiva';
    if (routeForm.max_stops <= 0) errors.max_stops = 'Número de paradas deve ser positivo';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateDeliveryForm = (): boolean => {
    const errors: any = {};

    if (!deliveryForm.order_id) errors.order_id = 'Pedido é obrigatório';
    if (!deliveryForm.vehicle_id) errors.vehicle_id = 'Veículo é obrigatório';
    if (!deliveryForm.driver_id) errors.driver_id = 'Motorista é obrigatório';
    if (!deliveryForm.delivery_address) errors.delivery_address = 'Endereço de entrega é obrigatório';
    if (!deliveryForm.scheduled_date) errors.scheduled_date = 'Data é obrigatória';
    if (!deliveryForm.recipient_name) errors.recipient_name = 'Nome do destinatário é obrigatório';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateMaintenanceForm = (): boolean => {
    const errors: any = {};

    if (!maintenanceForm.vehicle_id) errors.vehicle_id = 'Veículo é obrigatório';
    if (!maintenanceForm.description) errors.description = 'Descrição é obrigatória';
    if (!maintenanceForm.scheduled_date) errors.scheduled_date = 'Data é obrigatória';
    if (maintenanceForm.cost < 0) errors.cost = 'Custo deve ser positivo';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers para salvar dados
  const handleSaveVehicle = async () => {
    if (!validateVehicleForm()) return;

    try {
      setLoading(true);
      
      const formData = {
        ...vehicleForm,
        year: Number(vehicleForm.year),
        capacity_weight: Number(vehicleForm.capacity_weight),
        capacity_volume: Number(vehicleForm.capacity_volume),
        current_mileage: Number(vehicleForm.current_mileage),
        purchase_price: Number(vehicleForm.purchase_price)
      };

      const { error } = await supabase
        .from('vehicles')
        .insert([formData]);
      
      if (error) throw error;
      
      showNotification({ message: 'Veículo cadastrado com sucesso!', type: 'success' });
      setVehicleDialogOpen(false);
      setVehicleForm({
        plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        vehicle_type: 'truck',
        capacity_weight: 0,
        capacity_volume: 0,
        fuel_type: 'diesel',
        current_mileage: 0,
        status: 'available',
        insurance_expiry: '',
        license_expiry: '',
        purchase_date: '',
        purchase_price: 0,
        renavam: '',
        color: '',
        notes: ''
      });
      loadVehicles();
    } catch (error: any) {
      console.error('Erro ao salvar veículo:', error);
      showNotification({ message: error.message || 'Erro ao salvar veículo', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDriver = async () => {
    if (!validateDriverForm()) return;

    try {
      setLoading(true);
      
      const formData = {
        ...driverForm,
        base_salary: Number(driverForm.base_salary)
      };

      const { error } = await supabase
        .from('drivers')
        .insert([formData]);
      
      if (error) throw error;
      
      showNotification({ message: 'Motorista cadastrado com sucesso!', type: 'success' });
      setDriverDialogOpen(false);
      setDriverForm({
        name: '',
        cpf: '',
        license_number: '',
        license_category: 'B',
        license_expiry: '',
        phone: '',
        hire_date: new Date().toISOString().split('T')[0],
        status: 'available',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        email: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        base_salary: 0,
        notes: ''
      });
      loadDrivers();
    } catch (error: any) {
      console.error('Erro ao salvar motorista:', error);
      showNotification({ message: error.message || 'Erro ao salvar motorista', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoute = async () => {
    if (!validateRouteForm()) return;

    try {
      setLoading(true);
      
      const formData = {
        name: routeForm.name,
        description: routeForm.description,
        start_location: routeForm.start_location,
        route_points: routeForm.route_points ? JSON.parse(`[${routeForm.route_points}]`) : [],
        estimated_duration_minutes: Number(routeForm.estimated_duration_minutes),
        estimated_distance_km: Number(routeForm.estimated_distance_km),
        max_stops: Number(routeForm.max_stops),
        vehicle_types: routeForm.vehicle_types,
        notes: routeForm.notes
      };

      const { error } = await supabase
        .from('delivery_routes')
        .insert([formData]);
      
      if (error) throw error;
      
      showNotification({ message: 'Rota cadastrada com sucesso!', type: 'success' });
      setRouteDialogOpen(false);
      setRouteForm({
        name: '',
        description: '',
        start_location: '',
        route_points: '',
        estimated_duration_minutes: 60,
        estimated_distance_km: 0,
        max_stops: 10,
        vehicle_types: [],
        notes: ''
      });
      loadRoutes();
    } catch (error: any) {
      console.error('Erro ao salvar rota:', error);
      showNotification({ message: error.message || 'Erro ao salvar rota', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDelivery = async () => {
    if (!validateDeliveryForm()) return;

    try {
      setLoading(true);
      
      const formData = {
        ...deliveryForm,
        delivery_fee: Number(deliveryForm.delivery_fee)
      };

      const { error } = await supabase
        .from('deliveries')
        .insert([formData]);
      
      if (error) throw error;
      
      showNotification({ message: 'Entrega agendada com sucesso!', type: 'success' });
      setDeliveryDialogOpen(false);
      setDeliveryForm({
        order_id: '',
        vehicle_id: '',
        driver_id: '',
        route_id: '',
        delivery_address: '',
        delivery_city: '',
        delivery_state: '',
        delivery_zip_code: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time_start: '08:00',
        scheduled_time_end: '18:00',
        recipient_name: '',
        recipient_document: '',
        special_instructions: '',
        delivery_fee: 0,
        notes: ''
      });
      loadDeliveries();
    } catch (error: any) {
      console.error('Erro ao salvar entrega:', error);
      showNotification({ message: error.message || 'Erro ao salvar entrega', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMaintenance = async () => {
    if (!validateMaintenanceForm()) return;

    try {
      setLoading(true);
      
      const formData = {
        ...maintenanceForm,
        cost: Number(maintenanceForm.cost),
        next_service_mileage: Number(maintenanceForm.next_service_mileage),
        parts_replaced: maintenanceForm.parts_replaced ? maintenanceForm.parts_replaced.split(',').map(p => p.trim()) : []
      };

      const { error } = await supabase
        .from('vehicle_maintenance')
        .insert([formData]);
      
      if (error) throw error;
      
      showNotification({ message: 'Manutenção agendada com sucesso!', type: 'success' });
      setMaintenanceDialogOpen(false);
      setMaintenanceForm({
        vehicle_id: '',
        maintenance_type: 'preventive',
        description: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        service_provider: '',
        cost: 0,
        parts_replaced: '',
        next_service_mileage: 0,
        next_service_date: '',
        notes: ''
      });
      loadMaintenance();
    } catch (error: any) {
      console.error('Erro ao salvar manutenção:', error);
      showNotification({ message: error.message || 'Erro ao salvar manutenção', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.cpf.includes(searchTerm) ||
    driver.license_number.includes(searchTerm)
  );

  // Estatísticas
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const availableDrivers = drivers.filter(d => d.status === 'available').length;
  const activeDeliveries = deliveries.filter(d => d.delivery_status === 'in_transit').length;
  const pendingMaintenance = maintenances.filter(m => m.status === 'scheduled' || m.status === 'in_progress').length;

  // Helpers para UI
  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'truck': return <TruckIcon />;
      case 'van': return <VanIcon />;
      case 'motorcycle': return <MotorcycleIcon />;
      case 'car': return <CarIcon />;
      default: return <TruckIcon />;
    }
  };

  const getVehicleTypeText = (type: string) => {
    switch (type) {
      case 'truck': return 'Caminhão';
      case 'van': return 'Van';
      case 'motorcycle': return 'Moto';
      case 'car': return 'Carro';
      default: return 'Caminhão';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'in_route': case 'driving': return 'info';
      case 'maintenance': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'in_route': return 'Em Rota';
      case 'driving': return 'Dirigindo';
      case 'maintenance': return 'Manutenção';
      case 'inactive': return 'Inativo';
      case 'resting': return 'Descansando';
      case 'vacation': return 'Férias';
      default: return status;
    }
  };

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
          Gestão de Logística
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setVehicleDialogOpen(true)}
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            Novo Veículo
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDriverDialogOpen(true)}
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            Novo Motorista
          </Button>
        </Box>
      </Box>

      {/* Aviso sobre configuração */}
      {vehicles.length === 0 && drivers.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Sistema de Logística
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
                <TruckIcon sx={{ color: '#1976d2', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Veículos Disponíveis
                  </Typography>
                  <Typography variant="h5" component="h2" color="primary.main">
                    {availableVehicles}
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
                <DriverIcon sx={{ color: '#2e7d32', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Motoristas Disponíveis
                  </Typography>
                  <Typography variant="h5" component="h2" color="success.main">
                    {availableDrivers}
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
                <DeliveryIcon sx={{ color: '#ff9800', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Entregas Ativas
                  </Typography>
                  <Typography variant="h5" component="h2" color="warning.main">
                    {activeDeliveries}
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
                <MaintenanceIcon sx={{ color: '#9c27b0', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Manutenções Pendentes
                  </Typography>
                  <Typography variant="h5" component="h2" color="secondary.main">
                    {pendingMaintenance}
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
          <Tab label="Veículos" icon={<TruckIcon />} />
          <Tab label="Motoristas" icon={<DriverIcon />} />
          <Tab label="Rotas" icon={<RouteIcon />} />
          <Tab label="Entregas" icon={<DeliveryIcon />} />
          <Tab label="Manutenção" icon={<MaintenanceIcon />} />
        </Tabs>

        {/* Aba Veículos */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <TextField
              placeholder="Buscar veículos..."
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

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Placa</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Marca/Modelo</TableCell>
                  <TableCell>Ano</TableCell>
                  <TableCell>Capacidade</TableCell>
                  <TableCell>Combustível</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getVehicleTypeIcon(vehicle.vehicle_type)}
                        <Typography sx={{ ml: 1, fontWeight: 'bold' }}>
                          {vehicle.plate}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getVehicleTypeText(vehicle.vehicle_type)}</TableCell>
                    <TableCell>{vehicle.brand} {vehicle.model}</TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell>
                      {vehicle.capacity_weight}kg / {vehicle.capacity_volume}m³
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={vehicle.fuel_type} 
                        size="small"
                        icon={<FuelIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(vehicle.status)} 
                        color={getStatusColor(vehicle.status)}
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
        </TabPanel>

        {/* Aba Motoristas */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <TextField
              placeholder="Buscar motoristas..."
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

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>CPF</TableCell>
                  <TableCell>CNH</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Vencimento CNH</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DriverIcon sx={{ mr: 1 }} />
                        {driver.name}
                      </Box>
                    </TableCell>
                    <TableCell>{driver.cpf}</TableCell>
                    <TableCell>{driver.license_number}</TableCell>
                    <TableCell>
                      <Chip label={driver.license_category} size="small" />
                    </TableCell>
                    <TableCell>
                      {new Date(driver.license_expiry).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        {driver.phone}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(driver.status)} 
                        color={getStatusColor(driver.status)}
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
        </TabPanel>

        {/* Aba Rotas */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<RouteIcon />}
              onClick={() => setRouteDialogOpen(true)}
              sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
            >
              Nova Rota
            </Button>
          </Box>

          <Grid container spacing={3}>
            {routes.map((route) => (
              <Grid item xs={12} md={6} lg={4} key={route.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                        {route.name}
                      </Typography>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {route.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">Duração:</Typography>
                      <Typography variant="caption">{Math.floor(route.estimated_duration_minutes / 60)}h {route.estimated_duration_minutes % 60}min</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">Distância:</Typography>
                      <Typography variant="caption">{route.estimated_distance_km}km</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption">Max. Paradas:</Typography>
                      <Typography variant="caption">{route.max_stops}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Aba Entregas */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<DeliveryIcon />}
              onClick={() => setDeliveryDialogOpen(true)}
              sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
            >
              Nova Entrega
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Pedido</TableCell>
                  <TableCell>Veículo</TableCell>
                  <TableCell>Motorista</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>#{delivery.order_id.substring(0, 8)}</TableCell>
                    <TableCell>{delivery.vehicle_plate}</TableCell>
                    <TableCell>{delivery.driver_name}</TableCell>
                    <TableCell>{delivery.delivery_address}</TableCell>
                    <TableCell>
                      {new Date(delivery.scheduled_date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={delivery.delivery_status} 
                        color={getStatusColor(delivery.delivery_status)}
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
        </TabPanel>

        {/* Aba Manutenção */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<MaintenanceIcon />}
              onClick={() => setMaintenanceDialogOpen(true)}
              sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
            >
              Nova Manutenção
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Veículo</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Custo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {maintenances.map((maintenance) => (
                  <TableRow key={maintenance.id}>
                    <TableCell>{maintenance.vehicle_plate}</TableCell>
                    <TableCell>{maintenance.maintenance_type}</TableCell>
                    <TableCell>{maintenance.description}</TableCell>
                    <TableCell>
                      {maintenance.scheduled_date && new Date(maintenance.scheduled_date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      R$ {maintenance.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={maintenance.status} 
                        color={getStatusColor(maintenance.status)}
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
        </TabPanel>
      </Paper>

      {/* Dialog Novo Veículo */}
      <Dialog open={vehicleDialogOpen} onClose={() => setVehicleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Novo Veículo</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Placa *"
                  value={vehicleForm.plate}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, plate: e.target.value })}
                  error={!!formErrors.plate}
                  helperText={formErrors.plate}
                  placeholder="ABC-1234"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Veículo</InputLabel>
                  <Select
                    value={vehicleForm.vehicle_type}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_type: e.target.value as any })}
                    label="Tipo de Veículo"
                  >
                    <MenuItem value="truck">Caminhão</MenuItem>
                    <MenuItem value="van">Van</MenuItem>
                    <MenuItem value="motorcycle">Moto</MenuItem>
                    <MenuItem value="car">Carro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Marca *"
                  value={vehicleForm.brand}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                  error={!!formErrors.brand}
                  helperText={formErrors.brand}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Modelo *"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  error={!!formErrors.model}
                  helperText={formErrors.model}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Ano *"
                  type="number"
                  value={vehicleForm.year}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, year: Number(e.target.value) })}
                  error={!!formErrors.year}
                  helperText={formErrors.year}
                  inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cor"
                  value={vehicleForm.color}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="RENAVAM"
                  value={vehicleForm.renavam}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, renavam: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Capacidade de Peso (kg) *"
                  type="number"
                  value={vehicleForm.capacity_weight}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, capacity_weight: Number(e.target.value) })}
                  error={!!formErrors.capacity_weight}
                  helperText={formErrors.capacity_weight}
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Capacidade de Volume (m³) *"
                  type="number"
                  value={vehicleForm.capacity_volume}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, capacity_volume: Number(e.target.value) })}
                  error={!!formErrors.capacity_volume}
                  helperText={formErrors.capacity_volume}
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Combustível</InputLabel>
                  <Select
                    value={vehicleForm.fuel_type}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, fuel_type: e.target.value as any })}
                    label="Combustível"
                  >
                    <MenuItem value="diesel">Diesel</MenuItem>
                    <MenuItem value="gasoline">Gasolina</MenuItem>
                    <MenuItem value="electric">Elétrico</MenuItem>
                    <MenuItem value="hybrid">Híbrido</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={vehicleForm.status}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value as any })}
                    label="Status"
                  >
                    <MenuItem value="available">Disponível</MenuItem>
                    <MenuItem value="in_route">Em Rota</MenuItem>
                    <MenuItem value="maintenance">Manutenção</MenuItem>
                    <MenuItem value="inactive">Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quilometragem Atual"
                  type="number"
                  value={vehicleForm.current_mileage}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, current_mileage: Number(e.target.value) })}
                  error={!!formErrors.current_mileage}
                  helperText={formErrors.current_mileage}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Preço de Compra (R$)"
                  type="number"
                  value={vehicleForm.purchase_price}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, purchase_price: Number(e.target.value) })}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data de Compra"
                  type="date"
                  value={vehicleForm.purchase_date}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, purchase_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vencimento do Seguro"
                  type="date"
                  value={vehicleForm.insurance_expiry}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, insurance_expiry: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vencimento do Licenciamento"
                  type="date"
                  value={vehicleForm.license_expiry}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, license_expiry: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                  value={vehicleForm.notes}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVehicleDialogOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveVehicle}
            disabled={loading}
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Novo Motorista */}
      <Dialog open={driverDialogOpen} onClose={() => setDriverDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Novo Motorista</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Nome Completo *"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="CPF *"
                  value={driverForm.cpf}
                  onChange={(e) => setDriverForm({ ...driverForm, cpf: e.target.value })}
                  error={!!formErrors.cpf}
                  helperText={formErrors.cpf}
                  placeholder="000.000.000-00"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número da CNH *"
                  value={driverForm.license_number}
                  onChange={(e) => setDriverForm({ ...driverForm, license_number: e.target.value })}
                  error={!!formErrors.license_number}
                  helperText={formErrors.license_number}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Categoria CNH</InputLabel>
                  <Select
                    value={driverForm.license_category}
                    onChange={(e) => setDriverForm({ ...driverForm, license_category: e.target.value })}
                    label="Categoria CNH"
                  >
                    {licenseCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Vencimento CNH *"
                  type="date"
                  value={driverForm.license_expiry}
                  onChange={(e) => setDriverForm({ ...driverForm, license_expiry: e.target.value })}
                  error={!!formErrors.license_expiry}
                  helperText={formErrors.license_expiry}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone *"
                  value={driverForm.phone}
                  onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  placeholder="(11) 99999-9999"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="E-mail"
                  type="email"
                  value={driverForm.email}
                  onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data de Contratação *"
                  type="date"
                  value={driverForm.hire_date}
                  onChange={(e) => setDriverForm({ ...driverForm, hire_date: e.target.value })}
                  error={!!formErrors.hire_date}
                  helperText={formErrors.hire_date}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={driverForm.status}
                    onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value as any })}
                    label="Status"
                  >
                    <MenuItem value="available">Disponível</MenuItem>
                    <MenuItem value="driving">Dirigindo</MenuItem>
                    <MenuItem value="resting">Descansando</MenuItem>
                    <MenuItem value="vacation">Férias</MenuItem>
                    <MenuItem value="inactive">Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Endereço"
                  value={driverForm.address}
                  onChange={(e) => setDriverForm({ ...driverForm, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={driverForm.city}
                  onChange={(e) => setDriverForm({ ...driverForm, city: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={driverForm.state}
                    onChange={(e) => setDriverForm({ ...driverForm, state: e.target.value })}
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
                  value={driverForm.zip_code}
                  onChange={(e) => setDriverForm({ ...driverForm, zip_code: e.target.value })}
                  placeholder="00000-000"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contato de Emergência"
                  value={driverForm.emergency_contact_name}
                  onChange={(e) => setDriverForm({ ...driverForm, emergency_contact_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone de Emergência"
                  value={driverForm.emergency_contact_phone}
                  onChange={(e) => setDriverForm({ ...driverForm, emergency_contact_phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Salário Base (R$)"
                  type="number"
                  value={driverForm.base_salary}
                  onChange={(e) => setDriverForm({ ...driverForm, base_salary: Number(e.target.value) })}
                  error={!!formErrors.base_salary}
                  helperText={formErrors.base_salary}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                  value={driverForm.notes}
                  onChange={(e) => setDriverForm({ ...driverForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDriverDialogOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveDriver}
            disabled={loading}
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Novo Veículo */}
      <Dialog open={routeDialogOpen} onClose={() => setRouteDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nova Rota</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome da Rota *"
                  value={routeForm.name}
                  onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Descrição"
                  value={routeForm.description}
                  onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Local de Início *"
                  value={routeForm.start_location}
                  onChange={(e) => setRouteForm({ ...routeForm, start_location: e.target.value })}
                  error={!!formErrors.start_location}
                  helperText={formErrors.start_location}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pontos da Rota (JSON)"
                  value={routeForm.route_points}
                  onChange={(e) => setRouteForm({ ...routeForm, route_points: e.target.value })}
                  error={!!formErrors.route_points}
                  helperText={formErrors.route_points}
                  multiline
                  rows={3}
                  placeholder='["ponto1", "ponto2", "ponto3"]'
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Duração Estimada (minutos) *"
                  type="number"
                  value={routeForm.estimated_duration_minutes}
                  onChange={(e) => setRouteForm({ ...routeForm, estimated_duration_minutes: Number(e.target.value) })}
                  error={!!formErrors.estimated_duration_minutes}
                  helperText={formErrors.estimated_duration_minutes}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Distância Estimada (km) *"
                  type="number"
                  value={routeForm.estimated_distance_km}
                  onChange={(e) => setRouteForm({ ...routeForm, estimated_distance_km: Number(e.target.value) })}
                  error={!!formErrors.estimated_distance_km}
                  helperText={formErrors.estimated_distance_km}
                  inputProps={{ min: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Máximo de Paradas *"
                  type="number"
                  value={routeForm.max_stops}
                  onChange={(e) => setRouteForm({ ...routeForm, max_stops: Number(e.target.value) })}
                  error={!!formErrors.max_stops}
                  helperText={formErrors.max_stops}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipos de Veículo Permitidos</InputLabel>
                  <Select
                    multiple
                    value={routeForm.vehicle_types}
                    onChange={(e) => setRouteForm({ ...routeForm, vehicle_types: Array.from(e.target.value as string[]) })}
                    label="Tipos de Veículo Permitidos"
                  >
                    {vehicleTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
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
                  value={routeForm.notes}
                  onChange={(e) => setRouteForm({ ...routeForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRouteDialogOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveRoute}
            disabled={loading}
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Nova Entrega */}
      <Dialog open={deliveryDialogOpen} onClose={() => setDeliveryDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Nova Entrega</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.order_id}>
                  <InputLabel>Pedido *</InputLabel>
                  <Select
                    value={deliveryForm.order_id}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, order_id: e.target.value })}
                    label="Pedido *"
                  >
                    {orders.map((order) => (
                      <MenuItem key={order.id} value={order.id}>
                        #{order.id.substring(0, 8)} - R$ {order.total_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.vehicle_id}>
                  <InputLabel>Veículo *</InputLabel>
                  <Select
                    value={deliveryForm.vehicle_id}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, vehicle_id: e.target.value })}
                    label="Veículo *"
                  >
                    {vehicles.filter(v => v.status === 'available').map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} - {vehicle.brand} {vehicle.model}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.driver_id}>
                  <InputLabel>Motorista *</InputLabel>
                  <Select
                    value={deliveryForm.driver_id}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, driver_id: e.target.value })}
                    label="Motorista *"
                  >
                    {drivers.filter(d => d.status === 'available').map((driver) => (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.name} - CNH: {driver.license_category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Rota (Opcional)</InputLabel>
                  <Select
                    value={deliveryForm.route_id}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, route_id: e.target.value })}
                    label="Rota (Opcional)"
                  >
                    <MenuItem value="">Nenhuma rota específica</MenuItem>
                    {routes.map((route) => (
                      <MenuItem key={route.id} value={route.id}>
                        {route.name} - {route.estimated_distance_km}km
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Endereço de Entrega *"
                  value={deliveryForm.delivery_address}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, delivery_address: e.target.value })}
                  error={!!formErrors.delivery_address}
                  helperText={formErrors.delivery_address}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={deliveryForm.delivery_city}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, delivery_city: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={deliveryForm.delivery_state}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, delivery_state: e.target.value })}
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
                  value={deliveryForm.delivery_zip_code}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, delivery_zip_code: e.target.value })}
                  placeholder="00000-000"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Data da Entrega *"
                  type="date"
                  value={deliveryForm.scheduled_date}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, scheduled_date: e.target.value })}
                  error={!!formErrors.scheduled_date}
                  helperText={formErrors.scheduled_date}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Horário de Início"
                  type="time"
                  value={deliveryForm.scheduled_time_start}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, scheduled_time_start: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Horário de Fim"
                  type="time"
                  value={deliveryForm.scheduled_time_end}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, scheduled_time_end: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome do Destinatário *"
                  value={deliveryForm.recipient_name}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, recipient_name: e.target.value })}
                  error={!!formErrors.recipient_name}
                  helperText={formErrors.recipient_name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Documento do Destinatário"
                  value={deliveryForm.recipient_document}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, recipient_document: e.target.value })}
                  placeholder="CPF ou CNPJ"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Taxa de Entrega (R$)"
                  type="number"
                  value={deliveryForm.delivery_fee}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, delivery_fee: Number(e.target.value) })}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Instruções Especiais"
                  value={deliveryForm.special_instructions}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, special_instructions: e.target.value })}
                  placeholder="Ex: Portão azul, entregar pela manhã..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                  value={deliveryForm.notes}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeliveryDialogOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveDelivery}
            disabled={loading}
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            {loading ? 'Agendando...' : 'Agendar Entrega'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Nova Manutenção */}
      <Dialog open={maintenanceDialogOpen} onClose={() => setMaintenanceDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nova Manutenção</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.vehicle_id}>
                  <InputLabel>Veículo *</InputLabel>
                  <Select
                    value={maintenanceForm.vehicle_id}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, vehicle_id: e.target.value })}
                    label="Veículo *"
                  >
                    {vehicles.map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Manutenção</InputLabel>
                  <Select
                    value={maintenanceForm.maintenance_type}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenance_type: e.target.value as any })}
                    label="Tipo de Manutenção"
                  >
                    <MenuItem value="preventive">Preventiva</MenuItem>
                    <MenuItem value="corrective">Corretiva</MenuItem>
                    <MenuItem value="inspection">Inspeção</MenuItem>
                    <MenuItem value="emergency">Emergência</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição *"
                  multiline
                  rows={3}
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  placeholder="Descreva detalhadamente o serviço a ser realizado..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data Agendada *"
                  type="date"
                  value={maintenanceForm.scheduled_date}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, scheduled_date: e.target.value })}
                  error={!!formErrors.scheduled_date}
                  helperText={formErrors.scheduled_date}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prestador de Serviço"
                  value={maintenanceForm.service_provider}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, service_provider: e.target.value })}
                  placeholder="Nome da oficina ou mecânico"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Custo Estimado (R$)"
                  type="number"
                  value={maintenanceForm.cost}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: Number(e.target.value) })}
                  error={!!formErrors.cost}
                  helperText={formErrors.cost}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quilometragem para Próximo Serviço"
                  type="number"
                  value={maintenanceForm.next_service_mileage}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, next_service_mileage: Number(e.target.value) })}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data do Próximo Serviço"
                  type="date"
                  value={maintenanceForm.next_service_date}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, next_service_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Peças a Substituir"
                  value={maintenanceForm.parts_replaced}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, parts_replaced: e.target.value })}
                  placeholder="Separe por vírgulas: óleo, filtro, pastilhas..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                  value={maintenanceForm.notes}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
                  placeholder="Observações adicionais sobre a manutenção..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenanceDialogOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveMaintenance}
            disabled={loading}
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            {loading ? 'Agendando...' : 'Agendar Manutenção'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LogisticsManagement; 