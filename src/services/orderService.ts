import { apiClient } from './apiClient';

// Interfaces para pedidos
export interface OrderItem {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: {
    id: string;
    name: string;
    description?: string;
    sku?: string;
    category?: string;
  };
}

export interface Order {
  id?: string;
  customer_id: string;
  salesperson_id?: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_method?: string;
  delivery_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
  customer?: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface CreateOrderData {
  customer_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  payment_method?: string;
  delivery_date?: string;
  notes?: string;
}

class OrderService {
  private baseUrl = '/api/orders';

  async getOrders(filters?: {
    status?: string;
    customer_id?: string;
    salesperson_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<Order[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const response = await apiClient.get<{ data: Order[] }>(`${this.baseUrl}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw error;
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await apiClient.get<{ data: Order }>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      throw error;
    }
  }

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const response = await apiClient.post<{ data: Order }>(this.baseUrl, orderData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  }

  async updateOrder(id: string, orderData: Partial<Order>): Promise<Order> {
    try {
      const response = await apiClient.put<{ data: Order }>(`${this.baseUrl}/${id}`, orderData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      throw error;
    }
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    try {
      const response = await apiClient.patch<{ data: Order }>(`${this.baseUrl}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
  }

  async deleteOrder(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      throw error;
    }
  }

  async getOrdersBySalesperson(salespersonId: string): Promise<Order[]> {
    try {
      const response = await apiClient.get<{ data: Order[] }>(`${this.baseUrl}/salesperson/${salespersonId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedidos do vendedor:', error);
      throw error;
    }
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    try {
      const response = await apiClient.get<{ data: Order[] }>(`${this.baseUrl}/customer/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedidos do cliente:', error);
      throw error;
    }
  }

  // Método para salvar pedido offline
  async saveOrderOffline(orderData: CreateOrderData): Promise<string> {
    try {
      const offlineOrders = localStorage.getItem('valedoboi_offline_orders');
      const orders = offlineOrders ? JSON.parse(offlineOrders) : [];
      
      const offlineOrder = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...orderData,
        created_at: new Date().toISOString(),
        status: 'pending' as const,
        offline: true
      };
      
      orders.push(offlineOrder);
      localStorage.setItem('valedoboi_offline_orders', JSON.stringify(orders));
      
      return offlineOrder.id;
    } catch (error) {
      console.error('Erro ao salvar pedido offline:', error);
      throw error;
    }
  }

  // Método para recuperar pedidos offline
  getOfflineOrders(): Order[] {
    try {
      const offlineOrders = localStorage.getItem('valedoboi_offline_orders');
      return offlineOrders ? JSON.parse(offlineOrders) : [];
    } catch (error) {
      console.error('Erro ao recuperar pedidos offline:', error);
      return [];
    }
  }

  // Método para remover pedido offline após sincronização
  removeOfflineOrder(id: string): void {
    try {
      const offlineOrders = localStorage.getItem('valedoboi_offline_orders');
      if (offlineOrders) {
        const orders = JSON.parse(offlineOrders);
        const filteredOrders = orders.filter((order: Order) => order.id !== id);
        localStorage.setItem('valedoboi_offline_orders', JSON.stringify(filteredOrders));
      }
    } catch (error) {
      console.error('Erro ao remover pedido offline:', error);
    }
  }
}

export default new OrderService();
