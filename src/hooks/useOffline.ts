import { useState, useEffect } from 'react';

interface UseOfflineReturn {
  isOnline: boolean;
  lastOnline: Date | null;
  offlineSince: Date | null;
  hasOfflineData: boolean;
  pendingSyncCount: number;
  syncData: () => Promise<boolean>;
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

  // Verifica se existem dados offline armazenados
  const checkOfflineData = async () => {
    try {
      // Verificando IndexedDB para pedidos offline
      const dbName = 'valeDoBoiOfflineDB';
      const request = indexedDB.open(dbName);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (db.objectStoreNames.contains('offlinePedidos')) {
          const transaction = db.transaction('offlinePedidos', 'readonly');
          const store = transaction.objectStore('offlinePedidos');
          const countRequest = store.count();
          
          countRequest.onsuccess = () => {
            const count = countRequest.result;
            setHasOfflineData(count > 0);
            setPendingSyncCount(count);
          };
        }
        
        db.close();
      };
    } catch (error) {
      console.error('Erro ao verificar dados offline:', error);
      setHasOfflineData(false);
      setPendingSyncCount(0);
    }
  };

  // Sincroniza dados quando estiver online
  const syncData = async (): Promise<boolean> => {
    if (!isOnline) {
      console.warn('Não é possível sincronizar enquanto estiver offline');
      return false;
    }

    // Implementação básica da sincronização
    // Na fase 3, isso será substituído por uma implementação completa
    try {
      // Simulação de sincronização bem-sucedida
      console.log('Sincronizando dados offline...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasOfflineData(false);
      setPendingSyncCount(0);
      return true;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      return false;
    }
  };

  useEffect(() => {
    // Verifica dados offline na montagem
    checkOfflineData();

    // Gerencia eventos de online/offline
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
      setOfflineSince(null);
      // Tenta sincronizar automaticamente ao voltar online
      if (hasOfflineData) {
        syncData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineSince(new Date());
    };

    // Configura listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Configura verificação periódica de dados offline (a cada minuto)
    const interval = setInterval(checkOfflineData, 60000);

    // Limpeza
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [hasOfflineData]);

  return {
    isOnline,
    lastOnline,
    offlineSince,
    hasOfflineData,
    pendingSyncCount,
    syncData
  };
};

export default useOffline;
