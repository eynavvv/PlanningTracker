import { useState } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import type { FilterState, FilterOptions } from '@/types';

interface InitiativeFiltersProps {
  filters: FilterState;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onToggleArrayFilter: (key: 'status' | 'pm' | 'ux' | 'group', value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  options: FilterOptions;
}

export function InitiativeFilters({
  filters,
  onUpdateFilter,
  onToggleArrayFilter,
  onClearFilters,
  hasActiveFilters,
  options,
}: InitiativeFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [filters.status, filters.pm, filters.ux, filters.group].reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
      <div className="flex items-center gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onUpdateFilter('search', e.target.value)}
            placeholder="Search initiatives..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-ss-primary focus:border-ss-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          {filters.search && (
            <button
              onClick={() => onUpdateFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-ss-primary text-white border-ss-primary'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-white text-ss-primary text-xs font-bold px-1.5 py-0.5 rounded">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4">
          <FilterGroup
            label="Status"
            options={options.status}
            selected={filters.status}
            onToggle={(value) => onToggleArrayFilter('status', value)}
          />
          <FilterGroup
            label="PM"
            options={options.pm}
            selected={filters.pm}
            onToggle={(value) => onToggleArrayFilter('pm', value)}
          />
          <FilterGroup
            label="UX"
            options={options.ux}
            selected={filters.ux}
            onToggle={(value) => onToggleArrayFilter('ux', value)}
          />
          <FilterGroup
            label="Group"
            options={options.group}
            selected={filters.group}
            onToggle={(value) => onToggleArrayFilter('group', value)}
          />
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onToggle(option)}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
              selected.includes(option)
                ? 'bg-ss-primary text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
