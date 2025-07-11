import { supabase } from './supabase';

/**
 * Interface para clientes
 */
export interface Customer {
  id: string;
  company_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  salesperson_id?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  cnpj?: string;
  inscricao_estadual?: string;
}

/**
 * Interface para filtros de clientes
 */
export interface CustomerFilters {
  salesperson_id?: string;
  search?: string;
  activeOnly?: boolean;
}

/**
 * Interface para criação/edição de clientes
 */
export interface CustomerInput {
  company_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  salesperson_id?: string;
  active?: boolean;
  cnpj?: string;
  inscricao_estadual?: string;
}

/**
 * Serviço de clientes usando Supabase diretamente
 */
const customerService = {
  /**
   * Busca todos os clientes
   */
  getAll: async (filters?: CustomerFilters): Promise<Customer[]> => {
    try {
      let query = supabase
        .from('customers')
        .select('*')
        .order('company_name');

      // Aplicar filtros
      if (filters?.activeOnly !== false) {
        query = query.eq('active', true);
      }

      if (filters?.salesperson_id) {
        query = query.eq('salesperson_id', filters.salesperson_id);
      }

      if (filters?.search) {
        query = query.or(
          `company_name.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%,contact_phone.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar clientes:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no customerService.getAll:', error);
      throw error;
    }
  },

  /**
   * Busca cliente por ID
   */
  getById: async (id: string): Promise<Customer | null> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar cliente:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no customerService.getById:', error);
      throw error;
    }
  },

  /**
   * Busca clientes por vendedor
   */
  getBySalesperson: async (salespersonId: string): Promise<Customer[]> => {
    return customerService.getAll({ salesperson_id: salespersonId, activeOnly: true });
  },

  /**
   * Busca clientes por termo de pesquisa
   */
  search: async (query: string): Promise<Customer[]> => {
    return customerService.getAll({ search: query, activeOnly: true });
  },

  /**
   * Cria um novo cliente
   */
  create: async (customer: CustomerInput): Promise<Customer> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...customer,
          active: customer.active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar cliente:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no customerService.create:', error);
      throw error;
    }
  },

  /**
   * Atualiza um cliente existente
   */
  update: async (id: string, customer: Partial<CustomerInput>): Promise<Customer> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...customer,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no customerService.update:', error);
      throw error;
    }
  },

  /**
   * Desativa um cliente (soft delete)
   */
  deactivate: async (id: string): Promise<Customer> => {
    return customerService.update(id, { active: false });
  },

  /**
   * Ativa um cliente
   */
  activate: async (id: string): Promise<Customer> => {
    return customerService.update(id, { active: true });
  },

  /**
   * Exclui um cliente permanentemente
   * Use com cuidado - prefer deactivate()
   */
  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir cliente:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro no customerService.delete:', error);
      throw error;
    }
  }
};

export default customerService;
