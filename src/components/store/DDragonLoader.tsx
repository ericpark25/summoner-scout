'use client';

import { useDDragonStore } from '@/stores/ddragon-store';
import { useEffect } from 'react';

const DDragonLoader = () => {
  // useEffect to fetch assets from data dragon
  const fetchData = useDDragonStore((state) => state.fetchData);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return null;
};
export default DDragonLoader;
