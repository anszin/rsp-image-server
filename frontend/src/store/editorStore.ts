import { create } from 'zustand';
import { Item, OptionGroup, ItemStatus } from '../types/menu';

interface EditorState {
  draft: Partial<Item>;
  previewMode: 'KIOSK' | 'POS' | 'QR';
  setField: <K extends keyof Item>(key: K, value: Item[K]) => void;
  setPreviewMode: (mode: 'KIOSK' | 'POS' | 'QR') => void;
  addOptionGroup: () => void;
  updateOptionGroup: (index: number, group: Partial<OptionGroup>) => void;
  removeOptionGroup: (index: number) => void;
  addOptionValue: (groupIndex: number) => void;
  updateOptionValue: (groupIndex: number, valueIndex: number, name: string, extraPrice: number) => void;
  removeOptionValue: (groupIndex: number, valueIndex: number) => void;
  setImageUrls: (urls: string[]) => void;
  reset: () => void;
  loadItem: (item: Item) => void;
}

const defaultDraft: Partial<Item> = {
  productCode: '',
  name: '',
  price: 0,
  status: 'ON_SALE',
  sortOrder: 0,
  imageUrls: [],
  optionGroups: [],
};

export const useEditorStore = create<EditorState>((set) => ({
  draft: { ...defaultDraft },
  previewMode: 'KIOSK',

  setField: (key, value) =>
    set((state) => ({ draft: { ...state.draft, [key]: value } })),

  setPreviewMode: (mode) => set({ previewMode: mode }),

  addOptionGroup: () =>
    set((state) => ({
      draft: {
        ...state.draft,
        optionGroups: [
          ...(state.draft.optionGroups ?? []),
          { name: '', required: false, multiSelect: false, sortOrder: state.draft.optionGroups?.length ?? 0, values: [] },
        ],
      },
    })),

  updateOptionGroup: (index, group) =>
    set((state) => {
      const groups = [...(state.draft.optionGroups ?? [])];
      groups[index] = { ...groups[index], ...group };
      return { draft: { ...state.draft, optionGroups: groups } };
    }),

  removeOptionGroup: (index) =>
    set((state) => ({
      draft: {
        ...state.draft,
        optionGroups: (state.draft.optionGroups ?? []).filter((_, i) => i !== index),
      },
    })),

  addOptionValue: (groupIndex) =>
    set((state) => {
      const groups = [...(state.draft.optionGroups ?? [])];
      const group = groups[groupIndex];
      groups[groupIndex] = {
        ...group,
        values: [...group.values, { name: '', extraPrice: 0, sortOrder: group.values.length }],
      };
      return { draft: { ...state.draft, optionGroups: groups } };
    }),

  updateOptionValue: (groupIndex, valueIndex, name, extraPrice) =>
    set((state) => {
      const groups = [...(state.draft.optionGroups ?? [])];
      const values = [...groups[groupIndex].values];
      values[valueIndex] = { ...values[valueIndex], name, extraPrice };
      groups[groupIndex] = { ...groups[groupIndex], values };
      return { draft: { ...state.draft, optionGroups: groups } };
    }),

  removeOptionValue: (groupIndex, valueIndex) =>
    set((state) => {
      const groups = [...(state.draft.optionGroups ?? [])];
      groups[groupIndex] = {
        ...groups[groupIndex],
        values: groups[groupIndex].values.filter((_, i) => i !== valueIndex),
      };
      return { draft: { ...state.draft, optionGroups: groups } };
    }),

  setImageUrls: (urls) =>
    set((state) => ({ draft: { ...state.draft, imageUrls: urls } })),

  reset: () => set({ draft: { ...defaultDraft } }),

  loadItem: (item) => set({ draft: { ...item } }),
}));
