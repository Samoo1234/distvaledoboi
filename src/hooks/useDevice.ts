import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface UseDeviceReturn {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

/**
 * Hook para detectar o tipo de dispositivo e orientação
 * Usado para renderização condicional baseada no dispositivo
 */
export const useDevice = (): UseDeviceReturn => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const checkDevice = () => {
    const width = window.innerWidth;
    
    // Definindo breakpoints
    if (width < 768) {
      setDeviceType('mobile');
    } else if (width >= 768 && width < 1024) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
    
    // Checando orientação
    setOrientation(
      window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    );
  };

  useEffect(() => {
    // Verifica o dispositivo na montagem inicial
    checkDevice();
    
    // Adiciona listener para redimensionamento da janela
    window.addEventListener('resize', checkDevice);
    
    // Adiciona listener para mudança de orientação em dispositivos móveis
    window.addEventListener('orientationchange', checkDevice);
    
    // Limpeza ao desmontar
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    orientation,
  };
};

export default useDevice;
