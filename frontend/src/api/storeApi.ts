import client from './client';

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
  categoryId: number;
  itemId: number | null;
  itemName: string | null;
  itemPrice: number | null;
  itemStatus: string | null;
  imageUrl: string | null;
}

export const tenantApi = {
  list: () => client.get<{ data: TenantDto[] }>('/api/v1/admin/tenants').then(r => r.data.data),
  create: (body: { code: string; name: string }) =>
    client.post<{ data: TenantDto }>('/api/v1/admin/tenants', body).then(r => r.data.data),
  update: (id: number, body: { code: string; name: string; active: boolean }) =>
    client.put<{ data: TenantDto }>(`/api/v1/admin/tenants/${id}`, body).then(r => r.data.data),
  delete: (id: number) => client.delete(`/api/v1/admin/tenants/${id}`),
  stores: (id: number) => client.get<{ data: StoreDto[] }>(`/api/v1/admin/tenants/${id}/stores`).then(r => r.data.data),
};

export const storeApi = {
  list: (tenantId?: number) =>
    client.get<{ data: StoreDto[] }>('/api/v1/admin/stores', { params: tenantId ? { tenantId } : {} }).then(r => r.data.data),
  create: (body: { tenantId?: number; code: string; name: string; address?: string; description?: string }) =>
    client.post<{ data: StoreDto }>('/api/v1/admin/stores', body).then(r => r.data.data),
  update: (id: number, body: Partial<StoreDto & { active: boolean }>) =>
    client.put<{ data: StoreDto }>(`/api/v1/admin/stores/${id}`, body).then(r => r.data.data),
  delete: (id: number) => client.delete(`/api/v1/admin/stores/${id}`),
};

export const menuApi = {
  list: (storeId: number) =>
    client.get<{ data: MenuDto[] }>(`/api/v1/admin/stores/${storeId}/menus`).then(r => r.data.data),
  create: (storeId: number, name: string) =>
    client.post<{ data: MenuDto }>(`/api/v1/admin/stores/${storeId}/menus`, { name }).then(r => r.data.data),
  update: (storeId: number, menuId: number, name: string) =>
    client.put<{ data: MenuDto }>(`/api/v1/admin/stores/${storeId}/menus/${menuId}`, { name }).then(r => r.data.data),
  delete: (storeId: number, menuId: number) =>
    client.delete(`/api/v1/admin/stores/${storeId}/menus/${menuId}`),
};

export const categoryApi2 = {
  list: (storeId: number, menuId: number) =>
    client.get<{ data: CategoryDto[] }>(`/api/v1/admin/stores/${storeId}/menus/${menuId}/categories`).then(r => r.data.data),
  create: (storeId: number, menuId: number, name: string) =>
    client.post<{ data: CategoryDto }>(`/api/v1/admin/stores/${storeId}/menus/${menuId}/categories`, { name }).then(r => r.data.data),
  update: (storeId: number, menuId: number, categoryId: number, name: string, sortOrder: number) =>
    client.put<{ data: CategoryDto }>(`/api/v1/admin/stores/${storeId}/menus/${menuId}/categories/${categoryId}`, { name, sortOrder }).then(r => r.data.data),
  delete: (storeId: number, menuId: number, categoryId: number) =>
    client.delete(`/api/v1/admin/stores/${storeId}/menus/${menuId}/categories/${categoryId}`),
};

export const layoutApi = {
  get: (storeId: number) =>
    client.get<{ data: LayoutDto }>(`/api/v1/admin/stores/${storeId}/layout`).then(r => r.data.data),
  save: (storeId: number, body: { orientation: string; columns: number; rows: number }) =>
    client.put<{ data: LayoutDto }>(`/api/v1/admin/stores/${storeId}/layout`, body).then(r => r.data.data),
};

export const slotApi = {
  list: (menuId: number, categoryId: number) =>
    client.get<{ data: SlotDto[] }>(`/api/v1/admin/menus/${menuId}/slots`, { params: { categoryId } }).then(r => r.data.data),
  assign: (menuId: number, categoryId: number, page: number, row: number, col: number, itemId: number) =>
    client.put<{ data: SlotDto }>(`/api/v1/admin/menus/${menuId}/slots/${categoryId}/${page}/${row}/${col}`, { itemId }).then(r => r.data.data),
  clear: (menuId: number, categoryId: number, page: number, row: number, col: number) =>
    client.delete(`/api/v1/admin/menus/${menuId}/slots/${categoryId}/${page}/${row}/${col}`),
};
