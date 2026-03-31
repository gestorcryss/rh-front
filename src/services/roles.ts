import api from "./api";

export interface Role {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  ativo: boolean;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  slug: string;
  descricao: string | null;
}

const rolesService = {
  list: () => api.get<{ data: Role[] }>("/v1/roles"),
  getById: (id: number) => api.get<{ data: Role }>(`/v1/roles/${id}`),
  create: (data: Partial<Role>) => api.post("/v1/roles", data),
  update: (id: number, data: Partial<Role>) => api.put(`/v1/roles/${id}`, data),
  delete: (id: number) => api.delete(`/v1/roles/${id}`),
  getPermissions: () => api.get<{ data: Permission[] }>("/v1/permissions"),
  syncPermissions: (roleId: number, permissions: number[]) =>
    api.post(`/v1/roles/${roleId}/permissions`, { permissions }),
};

export { rolesService };