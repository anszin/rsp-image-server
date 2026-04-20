import axios from 'axios';

export interface TenantDto { id: number; code: string; name: string; active: boolean; }
export interface StoreDto { id: number; tenantId: number | null; tenantName: string | null; code: string; name: string; address: string; description: string; active: boolean; }
export interface MenuDto { id: number; name: string; active: boolean; }
export interface CategoryDto { id: number; name: string; sortOrder: number; }
export interface LayoutDto {
  storeId: number;
  orientation: 'LANDSCAPE' | 'PORTRAIT';
  columns: number;
  rows: number;
  itemsPerPage: number;
}
export interface SlotDto {
  id: number;
  page: number;
  row: number;
  col: number;
  itemId: number | null;
  itemName: string | null;
  itemPrice: number | null;
  itemStatus: string | null;
  imageUrl: string | null;
}

export const tenantApi = {
  list: () => axios.get<{ data: TenantDto[] }>('/api/v1/admin/tenants').then(r => r.data.data),
  create: (body: { code: string; name: string }) =>
    axios.post<{ data: TenantDto }>('/api/v1/admin/tenants', body).then(r => r.data.data),
  update: (id: number, body: { code: string; name: string; active: boolean }) =>
    axios.put<{ data: TenantDto }>(`/api/v1/admin/tenants/${id}`, body).then(r => r.data.data),
  delete: (id: number) => axios.delete(`/api/v1/admin/tenants/${id}`),
  stores: (id: number) => axios.get<{ data: StoreDto[] }>(`/api/v1/admin/tenants/${id}/stores`).then(r => r.data.data),
};

export const storeApi = {
  list: (tenantId?: number) =>
    axios.get<{ data: StoreDto[] }>('/api/v1/admin/stores', { params: tenantId ? { tenantId } : {} }).then(r => r.data.data),
  create: (body: { tenantId?: number; code: string; name: string; address?: string; description?: string }) =>
    axios.post<{ data: StoreDto }>('/api/v1/admin/stores', body).then(r => r.data.data),
  update: (id: number, body: Partial<StoreDto & { active: boolean }>) =>
    axios.put<{ data: StoreDto }>(`/api/v1/admin/stores/${id}`, body).then(r => r.data.data),
  delete: (id: number) => axios.delete(`/api/v1/admin/stores/${id}`),
};

export const menuApi = {
  list: (storeId: number) =>
    axios.get<{ data: MenuDto[] }>(`/api/v1/admin/stores/${storeId}/menus`).then(r => r.data.data),
  create: (storeId: number, name: string) =>
    axios.post<{ data: MenuDto }>(`/api/v1/admin/stores/${storeId}/menus`, { name }).then(r => r.data.data),
  update: (storeId: number, menuId: number, name: string) =>
    axios.put<{ data: MenuDto }>(`/api/v1/admin/stores/${storeId}/menus/${menuId}`, { name }).then(r => r.data.data),
  delete: (storeId: number, menuId: number) =>
    axios.delete(`/api/v1/admin/stores/${storeId}/menus/${menuId}`),
};

export const categoryApi2 = {
  list: (storeId: number, menuId: number) =>
    axios.get<{ data: CategoryDto[] }>(`/api/v1/admin/stores/${storeId}/menus/${menuId}/categories`).then(r => r.data.data),
  create: (storeId: number, menuId: number, name: string) =>
    axios.post<{ data: CategoryDto }>(`/api/v1/admin/stores/${storeId}/menus/${menuId}/categories`, { name }).then(r => r.data.data),
  update: (storeId: number, menuId: number, categoryId: number, name: string, sortOrder: number) =>
    axios.put<{ data: CategoryDto }>(`/api/v1/admin/stores/${storeId}/menus/${menuId}/categories/${categoryId}`, { name, sortOrder }).then(r => r.data.data),
  delete: (storeId: number, menuId: number, categoryId: number) =>
    axios.delete(`/api/v1/admin/stores/${storeId}/menus/${menuId}/categories/${categoryId}`),
};

export const layoutApi = {
  get: (storeId: number) =>
    axios.get<{ data: LayoutDto }>(`/api/v1/admin/stores/${storeId}/layout`).then(r => r.data.data),
  save: (storeId: number, body: { orientation: string; columns: number; rows: number }) =>
    axios.put<{ data: LayoutDto }>(`/api/v1/admin/stores/${storeId}/layout`, body).then(r => r.data.data),
};

export const slotApi = {
  list: (menuId: number) =>
    axios.get<{ data: SlotDto[] }>(`/api/v1/admin/menus/${menuId}/slots`).then(r => r.data.data),
  assign: (menuId: number, page: number, row: number, col: number, itemId: number | null) =>
    axios.put<{ data: SlotDto }>(`/api/v1/admin/menus/${menuId}/slots/${page}/${row}/${col}`, { itemId }).then(r => r.data.data),
  clear: (menuId: number, page: number, row: number, col: number) =>
    axios.delete(`/api/v1/admin/menus/${menuId}/slots/${page}/${row}/${col}`),
};
