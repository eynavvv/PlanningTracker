// Filter Types for Dashboard

export interface FilterState {
  search: string;
  status: string[];
  pm: string[];
  ux: string[];
  group: string[];
}

export interface FilterConfig<T> {
  searchFields: (keyof T)[];
}

export interface FilterOptions {
  status: string[];
  pm: string[];
  ux: string[];
  group: string[];
}
