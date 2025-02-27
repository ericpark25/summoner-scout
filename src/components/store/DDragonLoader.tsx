'use client';

import { useDDragonStore } from '@/stores/ddragon-store';
import { useEffect } from 'react';

const DDragonLoader = () => {
  // get store values and fetch function
  const fetchData = useDDragonStore((state) => state.fetchData);
  const isLoading = useDDragonStore((state) => state.isLoading);
  const error = useDDragonStore((state) => state.error);

  // fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return null;
};

export default DDragonLoader;
