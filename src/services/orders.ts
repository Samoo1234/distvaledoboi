// Orders Service - Sistema Vale do Boi - VERSÃO ULTRA SIMPLES
import { supabase } from './supabase';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: {
    name: string;
    description: string;
    sku: string;
    category: string;
  };
}

export interface Order {
  id: string;
  customer_id: string;
  salesperson_id?: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_method?: string;
  delivery_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    company_name: string;
    contact_name: string;
    contact_phone: string;
    address: string;
  };
}

export interface OrderFilters {
  status?: string;
  salesperson_id?: string;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface OrderStats {
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  total: number;
}

export class OrderService {
  // VERSÃO ULTRA SIMPLES - SÓ PEGA OS DADOS BÁSICOS
  static async getOrders(filters: OrderFilters = {}): Promise<Order[]> {
    try {
      console.log('🔍 Buscando pedidos - versão simples');
      
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar pedidos:', error);
        throw new Error(`Erro ao buscar pedidos: ${error.message}`);
      }

      console.log('✅ Pedidos encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro no OrderService.getOrders:', error);
      throw error;
    }
  }

  static async getOrderById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Erro ao buscar pedido: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Erro no OrderService.getOrderById:', error);
      throw error;
    }
  }

  static async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    try {
      console.log(`🔄 Atualizando pedido ${id} para status: ${status}`);
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar status: ${error.message}`);
      }

      console.log('✅ Status atualizado com sucesso');
      return data;
    } catch (error) {
      console.error('❌ Erro no OrderService.updateOrderStatus:', error);
      throw error;
    }
  }

  static async getOrderStats(): Promise<OrderStats> {
    try {
      console.log('📊 Buscando estatísticas dos pedidos');
      
      const { data, error } = await supabase
        .from('orders')
        .select('status');

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      const stats: OrderStats = {
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0,
        total: 0
      };

      data?.forEach((order: { status: string }) => {
        const status = order.status as keyof OrderStats;
        if (status !== 'total') {
          stats[status]++;
          stats.total++;
        }
      });

      console.log('✅ Estatísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro no OrderService.getOrderStats:', error);
      throw error;
    }
  }

  static async getOrdersForSeparation(): Promise<Order[]> {
    console.log('🎯 Buscando pedidos para separação');
    return this.getOrders();
  }

  static async startSeparation(orderId: string): Promise<Order> {
    console.log('▶️ Iniciando separação do pedido:', orderId);
    return this.updateOrderStatus(orderId, 'processing');
  }

  static async completeSeparation(orderId: string): Promise<Order> {
    console.log('✅ Concluindo separação do pedido:', orderId);
    return this.updateOrderStatus(orderId, 'completed');
  }

  static async cancelOrder(orderId: string): Promise<Order> {
    console.log('❌ Cancelando pedido:', orderId);
    return this.updateOrderStatus(orderId, 'cancelled');
  }
}

export default OrderService; 