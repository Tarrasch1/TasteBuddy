import { useState, useEffect } from 'react';

/**
 * useDebounce - Bir değeri belirli bir süre sonra güncelleyen hook
 * @param value - Debounce edilecek değer
 * @param delay - Gecikme süresi (ms)
 * @returns Debounce edilmiş değer
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Değer değiştiğinde timer başlat
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup - yeni değer gelirse önceki timer'ı iptal et
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useThrottle - Bir değeri belirli aralıklarla güncelleyen hook
 * @param value - Throttle edilecek değer
 * @param interval - Minimum güncelleme aralığı (ms)
 * @returns Throttle edilmiş değer
 */
export function useThrottle<T>(value: T, interval: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    
    if (now >= lastUpdated + interval) {
      setThrottledValue(value);
      setLastUpdated(now);
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        setLastUpdated(Date.now());
      }, interval - (now - lastUpdated));
      
      return () => clearTimeout(timer);
    }
  }, [value, interval, lastUpdated]);

  return throttledValue;
}
