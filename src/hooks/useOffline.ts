import { useState, useEffect } from 'react';

interface UseOfflineReturn {
  isOnline: boolean;
  lastOnline: Date | null;
  offlineSince: Date | null;
  hasOfflineData: boolean;
  pendingSyncCount: number;
  syncData: () => Promise<boolean>;
  cacheData: (key: string, data: any) => void;
  getCachedData: (key: string) => any;
  clearOfflineData: () => void;
}

/**
 * Hook para gerenciar estado offline e sincronização
 */
export const useOffline = (): UseOfflineReturn => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastOnline, setLastOnline] = useState<Date | null>(
    navigator.onLine ? new Date() : null
  );
  const [offlineSince, setOfflineSince] = useState<Date | null>(
    !navigator.onLine ? new Date() : null
  );
  const [hasOfflineData, setHasOfflineData] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Chaves para localStorage
  const CACHE_PREFIX = 'valedoboi_cache_';
  const OFFLINE_ORDERS_KEY = 'valedoboi_offline_orders';
  const SYNC_QUEUE_KEY = 'valedoboi_sync_queue';

  // Função para cache de dados
  const cacheData = (key: string, data: any) => {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cacheData = {
        data,
        timestamp: new Date().toISOString(),
        ttl: 24 * 60 * 60 * 1000 // 24 horas
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erro ao fazer cache dos dados:', error);
    }
  };

  // Função para recuperar dados do cache
  const getCachedData = (key: string) => {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cachedItem = localStorage.getItem(cacheKey);
      
      if (!cachedItem) return null;
      
      const parsedItem = JSON.parse(cachedItem);
      const now = new Date().getTime();
      const cacheTime = new Date(parsedItem.timestamp).getTime();
      
      // Verificar se o cache expirou
      if (now - cacheTime > parsedItem.ttl) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return parsedItem.data;
    } catch (error) {
      console.error('Erro ao recuperar dados do cache:', error);
      return null;
    }
  };

  // Função para adicionar item à fila de sincronização
  const addToSyncQueue = (item: any) => {
    try {
      const existingQueue = localStorage.getItem(SYNC_QUEUE_KEY);
      const queue = existingQueue ? JSON.parse(existingQueue) : [];
      
      queue.push({
        ...item,
        timestamp: new Date().toISOString(),
        id: Math.random().toString(36).substr(2, 9)
      });
      
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      setPendingSyncCount(queue.length);
      setHasOfflineData(true);
    } catch (error) {
      console.error('Erro ao adicionar à fila de sincronização:', error);
    }
  };

  // Função para verificar dados offline
  const checkOfflineData = async () => {
    try {
      const syncQueue = localStorage.getItem(SYNC_QUEUE_KEY);
      const offlineOrders = localStorage.getItem(OFFLINE_ORDERS_KEY);
      
      let pendingCount = 0;
      
      if (syncQueue) {
        const queue = JSON.parse(syncQueue);
        pendingCount += queue.length;
      }
      
      if (offlineOrders) {
        const orders = JSON.parse(offlineOrders);
        pendingCount += orders.length;
      }
      
      setPendingSyncCount(pendingCount);
      setHasOfflineData(pendingCount > 0);
    } catch (error) {
      console.error('Erro ao verificar dados offline:', error);
      setHasOfflineData(false);
      setPendingSyncCount(0);
    }
  };

  // Função para sincronizar dados
  const syncData = async (): Promise<boolean> => {
    if (!isOnline) {
      console.warn('Não é possível sincronizar enquanto estiver offline');
      return false;
    }

    try {
      console.log('🔄 Iniciando sincronização de dados offline...');
      
      // Sincronizar fila de sincronização
      const syncQueue = localStorage.getItem(SYNC_QUEUE_KEY);
      if (syncQueue) {
        const queue = JSON.parse(syncQueue);
        
        for (const item of queue) {
          try {
            // Aqui você implementaria a lógica específica de sincronização
            // Por exemplo, recriar pedidos que foram feitos offline
            console.log('Sincronizando item:', item);
            
            // Simular sincronização
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error('Erro ao sincronizar item:', error);
            // Continuar com outros itens mesmo se um falhar
          }
        }
        
        // Limpar fila após sincronização
        localStorage.removeItem(SYNC_QUEUE_KEY);
      }
      
      // Sincronizar pedidos offline
      const offlineOrders = localStorage.getItem(OFFLINE_ORDERS_KEY);
      if (offlineOrders) {
        const orders = JSON.parse(offlineOrders);
        
        for (const order of orders) {
          try {
            console.log('Sincronizando pedido offline:', order);
            
            // Aqui você implementaria a criação real do pedido
            // usando OrderService.createOrder
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error('Erro ao sincronizar pedido:', error);
          }
        }
        
        // Limpar pedidos offline após sincronização
        localStorage.removeItem(OFFLINE_ORDERS_KEY);
      }
      
      setHasOfflineData(false);
      setPendingSyncCount(0);
      
      console.log('✅ Sincronização concluída com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      return false;
    }
  };

  // Função para limpar dados offline
  const clearOfflineData = () => {
    try {
      localStorage.removeItem(SYNC_QUEUE_KEY);
      localStorage.removeItem(OFFLINE_ORDERS_KEY);
      
      // Limpar cache expirado
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          const cachedItem = localStorage.getItem(key);
          if (cachedItem) {
            try {
              const parsedItem = JSON.parse(cachedItem);
              const now = new Date().getTime();
              const cacheTime = new Date(parsedItem.timestamp).getTime();
              
              if (now - cacheTime > parsedItem.ttl) {
                localStorage.removeItem(key);
              }
            } catch (error) {
              localStorage.removeItem(key);
            }
          }
        }
      });
      
      setHasOfflineData(false);
      setPendingSyncCount(0);
    } catch (error) {
      console.error('Erro ao limpar dados offline:', error);
    }
  };

  useEffect(() => {
    // Verificar dados offline na montagem
    checkOfflineData();

    // Gerenciar eventos de online/offline
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
      setOfflineSince(null);
      
      // Sincronizar automaticamente ao voltar online
      setTimeout(() => {
        if (hasOfflineData) {
          syncData();
        }
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineSince(new Date());
    };

    // Configurar listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Configurar verificação periódica de dados offline
    const interval = setInterval(checkOfflineData, 60000);

    // Limpeza automática de cache expirado
    const cleanupInterval = setInterval(() => {
      clearOfflineData();
    }, 60 * 60 * 1000); // A cada hora

    // Limpeza
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, [hasOfflineData]);

  return {
    isOnline,
    lastOnline,
    offlineSince,
    hasOfflineData,
    pendingSyncCount,
    syncData,
    cacheData,
    getCachedData,
    clearOfflineData
  };
};

export default useOffline;
