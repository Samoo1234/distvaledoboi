// Orders Service - Sistema Vale do Boi - VERSÃO COMPLETA
import { supabase } from './supabase';
import { CartItem } from '../contexts/CartContext';
import { Customer } from './customerService';

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
  items?: OrderItem[];
}

export interface OrderFilters {
  status?: string;
  customer_id?: string;
  salesperson_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface CreateOrderRequest {
  customer_id: string;
  salesperson_id: string;
  total_amount: number;
  payment_method?: string;
  delivery_date?: string;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

// Interface para estatísticas - ADICIONADA
export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  totalValue: number;
}

export class OrderService {
  // Buscar pedidos com filtros
  static async getOrders(filters: OrderFilters = {}): Promise<Order[]> {
    try {
      console.log('🔍 Buscando pedidos com filtros:', filters);
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          customer:customers(company_name, contact_name, contact_phone, address),
          salesperson:user_profiles(name)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.customer_id) {
        query = query.eq('customer_id', filters.customer_id);
      }

      if (filters.salesperson_id) {
        query = query.eq('salesperson_id', filters.salesperson_id);
      }

      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
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

  // Buscar pedidos para separação - ADICIONADO
  static async getOrdersForSeparation(): Promise<Order[]> {
    try {
      console.log('🔍 Buscando pedidos para separação...');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(company_name, contact_name, contact_phone, address),
          salesperson:user_profiles(name)
        `)
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar pedidos para separação:', error);
        throw new Error(`Erro ao buscar pedidos para separação: ${error.message}`);
      }

      console.log('✅ Pedidos para separação encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro no OrderService.getOrdersForSeparation:', error);
      throw error;
    }
  }

  // Buscar pedido por ID com itens
  static async getOrderById(id: string): Promise<Order | null> {
    try {
      console.log('🔍 Buscando pedido:', id);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(company_name, contact_name, contact_phone, address),
          salesperson:user_profiles(name)
        `)
        .eq('id', id)
        .single();

      if (orderError) {
        throw new Error(`Erro ao buscar pedido: ${orderError.message}`);
      }

      // Buscar itens do pedido
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(name, description, sku, category)
        `)
        .eq('order_id', id);

      if (itemsError) {
        throw new Error(`Erro ao buscar itens do pedido: ${itemsError.message}`);
      }

      return {
        ...order,
        items: items || []
      };
    } catch (error) {
      console.error('❌ Erro no OrderService.getOrderById:', error);
      throw error;
    }
  }

  // Criar novo pedido - FUNÇÃO PRINCIPAL
  static async createOrder(
    customer: Customer,
    cartItems: CartItem[],
    salesperson_id: string,
    notes?: string,
    payment_method?: string
  ): Promise<Order> {
    try {
      console.log('🚀 Criando novo pedido...');
      console.log('📊 Dados:', {
        customer: customer.company_name,
        items: cartItems.length,
        total: cartItems.reduce((sum, item) => sum + item.total, 0),
        salesperson_id
      });

      // Calcular total
      const total_amount = cartItems.reduce((sum, item) => sum + item.total, 0);

      // Preparar dados do pedido
      const orderData = {
        customer_id: customer.id,
        salesperson_id,
        total_amount,
        status: 'pending' as const,
        payment_method,
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Inserir pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        console.error('❌ Erro ao criar pedido:', orderError);
        throw new Error(`Erro ao criar pedido: ${orderError.message}`);
      }

      console.log('✅ Pedido criado com ID:', order.id);

      // Preparar itens do pedido
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product.id.toString(),
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.total,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Inserir itens do pedido
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Erro ao inserir itens do pedido:', itemsError);
        // Se falhar, tentar deletar o pedido criado
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Erro ao inserir itens do pedido: ${itemsError.message}`);
      }

      console.log('✅ Itens do pedido inseridos:', orderItems.length);

      // Retornar pedido completo
      const completeOrder = {
        ...order,
        customer: {
          company_name: customer.company_name,
          contact_name: customer.contact_name || '',
          contact_phone: customer.contact_phone,
          address: customer.address || ''
        },
        items: orderItems.map(item => ({
          ...item,
          product: cartItems.find(cartItem => cartItem.product.id.toString() === item.product_id)?.product
        }))
      };

      console.log('🎉 Pedido criado com sucesso!');
      return completeOrder;

    } catch (error) {
      console.error('❌ Erro no OrderService.createOrder:', error);
      throw error;
    }
  }

  // Atualizar status do pedido
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

  // Cancelar pedido
  static async cancelOrder(id: string): Promise<Order> {
    console.log('❌ Cancelando pedido:', id);
    return this.updateOrderStatus(id, 'cancelled');
  }

  // Iniciar separação
  static async startSeparation(orderId: string): Promise<Order> {
    console.log('▶️ Iniciando separação do pedido:', orderId);
    return this.updateOrderStatus(orderId, 'processing');
  }

  // Finalizar separação - ADICIONADO
  static async completeSeparation(orderId: string): Promise<Order> {
    console.log('✅ Finalizando separação do pedido:', orderId);
    return this.updateOrderStatus(orderId, 'completed');
  }

  // Finalizar pedido
  static async completeOrder(orderId: string): Promise<Order> {
    console.log('✅ Finalizando pedido:', orderId);
    return this.updateOrderStatus(orderId, 'completed');
  }

  // Buscar pedidos por vendedor
  static async getOrdersBySalesperson(salespersonId: string): Promise<Order[]> {
    return this.getOrders({ salesperson_id: salespersonId });
  }

  // Buscar pedidos por cliente
  static async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return this.getOrders({ customer_id: customerId });
  }

  // Buscar pedidos pendentes
  static async getPendingOrders(): Promise<Order[]> {
    return this.getOrders({ status: 'pending' });
  }

  // Buscar pedidos em processamento
  static async getProcessingOrders(): Promise<Order[]> {
    return this.getOrders({ status: 'processing' });
  }

  // Estatísticas básicas - CORRIGIDO TIPO DE RETORNO
  static async getOrderStats(salespersonId?: string): Promise<OrderStats> {
    try {
      const orders = await this.getOrders(salespersonId ? { salesperson_id: salespersonId } : {});
      
      return {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalValue: orders.reduce((sum, o) => sum + o.total_amount, 0)
      };
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      throw error;
    }
  }
} 