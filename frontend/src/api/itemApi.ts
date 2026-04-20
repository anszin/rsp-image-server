import axios from 'axios';
import { Item } from '../types/menu';

const BASE = '/api/v1/admin/items';

export interface CategoryOption {
  id: number;
  name: string;
  menuId: number;
  menuName: string;
  storeName: string;
}

export const categoryApi = {
  list: () => axios.get<{ data: CategoryOption[] }>('/api/v1/admin/categories').then(r => r.data.data),
};

export const itemApi = {
  listByCategory: (categoryId: number) =>
    axios.get<{ data: Item[] }>(`${BASE}?categoryId=${categoryId}`).then(r => r.data.data),
  listByMenu: (menuId: number) =>
    axios.get<{ data: Item[] }>(`${BASE}?menuId=${menuId}`).then(r => r.data.data),
  get: (id: number) => axios.get<{ data: Item }>(`${BASE}/${id}`).then(r => r.data.data),

  create: (payload: Partial<Item>) =>
    axios.post<{ data: Item }>(BASE, payload).then(r => r.data.data),

  update: (id: number, payload: Partial<Item>) =>
    axios.put<{ data: Item }>(`${BASE}/${id}`, payload).then(r => r.data.data),

  delete: (id: number) => axios.delete(`${BASE}/${id}`),

  uploadImage: (id: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return axios.post<{ data: string }>(`${BASE}/${id}/images`, form).then(r => r.data.data);
  },
};
