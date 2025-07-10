import apiClient from './apiClient';

/**
 * Interface para itens do pedido
 */
export interface OrderItem {
  id?: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product_name?: string;
}

/**
 * Interface para pedidos
 */
export interface Order {
  id?: number;
  customer_id: number;
  customer_name?: string;
  salesperson_id: string;
  salesperson_name?: string;
  total_amount: number;
  status: 'pendente' | 'separacao' | 'entrega' | 'concluido' | 'cancelado';
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
}

/**
 * Serviço de pedidos que utiliza o ApiClient autenticado
 */
const orderService = {
  /**
   * Busca todos os pedidos
   */
  getAll: async (): Promise<Order[]> => {
    return apiClient.get<Order[]>('/orders');
  },

  /**
   * Busca pedido por ID
   */
  getById: async (id: number): Promise<Order> => {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  /**
   * Cria um novo pedido
   */
  create: async (order: Order): Promise<Order> => {
    return apiClient.post<Order>('/orders', order);
  },

  /**
   * Atualiza um pedido existente
   */
  update: async (id: number, order: Partial<Order>): Promise<Order> => {
    return apiClient.put<Order>(`/orders/${id}`, order);
  },

  /**
   * Atualiza status do pedido
   */
  updateStatus: async (id: number, status: Order['status']): Promise<Order> => {
    return apiClient.put<Order>(`/orders/${id}/status`, { status });
  },

  /**
   * Busca pedidos por vendedor
   */
  getBySalesperson: async (salespersonId: string): Promise<Order[]> => {
    return apiClient.get<Order[]>(`/orders/salesperson/${salespersonId}`);
  },

  /**
   * Busca pedidos por cliente
   */
  getByCustomer: async (customerId: number): Promise<Order[]> => {
    return apiClient.get<Order[]>(`/orders/customer/${customerId}`);
  }
};

export default orderService;
