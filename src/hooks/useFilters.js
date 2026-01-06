import { useState, useCallback, useMemo } from 'react';

const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const clearFilter = useCallback((key) => {
    setFilters(prev => ({
      ...prev,
      [key]: initialFilters[key] || ''
    }));
  }, [initialFilters]);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      const initialValue = initialFilters[key];
      return value !== initialValue && value !== '' && value != null;
    });
  }, [filters, initialFilters]);

  const applyFilters = useCallback((data, filterConfig) => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === '') return true;
        
        const config = filterConfig[key];
        if (!config) return true;

        const itemValue = item[config.field || key];
        
        switch (config.type) {
          case 'exact':
            return itemValue === value;
          case 'contains':
            return itemValue?.toString().toLowerCase().includes(value.toLowerCase());
          case 'dateRange':
            if (!config.startField || !config.endField) return true;
            const startDate = new Date(filters[config.startField]);
            const endDate = new Date(filters[config.endField]);
            const itemDate = new Date(itemValue);
            return itemDate >= startDate && itemDate <= endDate;
          default:
            return true;
        }
      });
    });
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    clearFilter,
    hasActiveFilters,
    applyFilters
  };
};

export default useFilters;
