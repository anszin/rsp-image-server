import { create } from 'zustand';
import { LayoutDto } from '../api/storeApi';

interface LayoutState {
  layout: LayoutDto;
  setLayout: (layout: LayoutDto) => void;
  setOrientation: (orientation: 'LANDSCAPE' | 'PORTRAIT') => void;
  setColumns: (n: number) => void;
  setRows: (n: number) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  layout: { storeId: 0, orientation: 'LANDSCAPE', columns: 4, rows: 3, itemsPerPage: 12 },
  setLayout: (layout) => set({ layout }),
  setOrientation: (orientation) =>
    set((s) => ({ layout: { ...s.layout, orientation, itemsPerPage: s.layout.columns * s.layout.rows } })),
  setColumns: (columns) =>
    set((s) => ({ layout: { ...s.layout, columns, itemsPerPage: columns * s.layout.rows } })),
  setRows: (rows) =>
    set((s) => ({ layout: { ...s.layout, rows, itemsPerPage: s.layout.columns * rows } })),
}));
