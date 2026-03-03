import { useState, useRef, useEffect } from 'react';

interface FilterDimension {
  key: string;
  label: string;
}

interface FilterChipBarProps {
  dimensions: FilterDimension[];
  values: Record<string, string[]>;
  options: Record<string, string[]>;
  onToggle: (key: string, value: string) => void;
  onClearKey: (key: string) => void;
  onClearAll: () => void;
}

export function FilterChipBar({ dimensions, values, options, onToggle, onClearKey, onClearAll }: FilterChipBarProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openKey && refs.current[openKey] && !refs.current[openKey]!.contains(e.target as Node)) {
        setOpenKey(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openKey]);

  const hasActiveFilters = dimensions.some(({ key }) => (values[key]?.length ?? 0) > 0);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {dimensions.map(({ key, label }) => {
        const opts = options[key] || [];
        const selected = values[key] || [];
        if (opts.length === 0) return null;
        return (
          <div key={key} className="relative" ref={el => { refs.current[key] = el; }}>
            <button
              onClick={(e) => { e.stopPropagation(); setOpenKey(v => v === key ? null : key); }}
              className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                selected.length > 0 || openKey === key
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {label}
              {selected.length > 0 && (
                <span className="bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                  {selected.length}
                </span>
              )}
            </button>
            {openKey === key && (
              <div
                onClick={e => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 p-3 min-w-[160px]"
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</div>
                <div className="flex flex-col gap-1.5">
                  {opts.map(value => (
                    <button
                      key={value}
                      onClick={() => onToggle(key, value)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left w-full ${
                        selected.includes(value)
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                {selected.length > 0 && (
                  <button
                    onClick={() => onClearKey(key)}
                    className="mt-2 w-full text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-center"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
