import { useState, useMemo, useCallback } from 'react';
import type { FilterState, FilterConfig } from '@/types';

const initialFilters: FilterState = {
  search: '',
  status: [],
  pm: [],
  ux: [],
  group: [],
};

export function useFilters<T extends Record<string, unknown>>(
  items: T[],
  config: FilterConfig<T>
) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleArrayFilter = useCallback(
    (key: 'status' | 'pm' | 'ux' | 'group', value: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: prev[key].includes(value)
          ? prev[key].filter((v) => v !== value)
          : [...prev[key], value],
      }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = config.searchFields.some((field) => {
          const value = item[field];
          return typeof value === 'string' && value.toLowerCase().includes(searchLower);
        });
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(item.status as string)) {
        return false;
      }

      // PM filter
      if (filters.pm.length > 0 && !filters.pm.includes(item.pm as string)) {
        return false;
      }

      // UX filter
      if (filters.ux.length > 0 && !filters.ux.includes(item.ux as string)) {
        return false;
      }

      // Group filter
      if (filters.group.length > 0 && !filters.group.includes(item.group as string)) {
        return false;
      }

      return true;
    });
  }, [items, filters, config.searchFields]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.status.length > 0 ||
      filters.pm.length > 0 ||
      filters.ux.length > 0 ||
      filters.group.length > 0
    );
  }, [filters]);

  return {
    filters,
    filteredItems,
    hasActiveFilters,
    updateFilter,
    toggleArrayFilter,
    clearFilters,
  };
}
