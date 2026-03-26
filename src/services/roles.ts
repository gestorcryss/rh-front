import api from "./api";

export interface Role {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  ativo: boolean;
  users_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  slug: string;
  descricao: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  path: string;
}

const rolesService = {
  list: () => api.get<PaginationResponse<Role>>("/v1/roles"),
  create: (data: Partial<Role>) => api.post("/v1/roles", data),
  update: (id: number, data: Partial<Role>) => api.put(`/v1/roles/${id}`, data),
  delete: (id: number) => api.delete(`/v1/roles/${id}`),
  getPermissions: () => api.get<{ data: Permission[] }>("/v1/permissions"),
  assignPermissions: (roleId: number, permissionIds: number[]) =>
    api.post(`/v1/roles/${roleId}/permissions`, { permission_ids: permissionIds }),
};

export { rolesService };