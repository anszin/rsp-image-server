export type ItemStatus = 'ON_SALE' | 'SOLD_OUT' | 'HIDDEN';

export interface OptionValue {
  id?: number;
  name: string;
  extraPrice: number;
  sortOrder: number;
}

export interface OptionGroup {
  id?: number;
  name: string;
  required: boolean;
  multiSelect: boolean;
  sortOrder: number;
  values: OptionValue[];
}

export interface Item {
  id?: number;
  productCode: string;
  name: string;
  price: number;
  status: ItemStatus;
  sortOrder: number;
  categoryId: number;
  categoryName?: string;
  imageUrls: string[];
  optionGroups: OptionGroup[];
}

export interface Category {
  id: number;
  name: string;
  sortOrder: number;
  items: Item[];
}

export interface Menu {
  menuId: number;
  menuName: string;
  categories: Category[];
}
