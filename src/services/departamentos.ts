import api from "./api";


export interface Departamento {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

export const departamentosService = {
  list: () => api.get("/v1/departamentos"),
  get: (id: number) => api.get(`/v1/departamentos/${id}`),
  create: (data: { codigo: string; nome: string; descricao?: string; ativo?: boolean }) =>
    api.post("/v1/departamentos", data),
  update: (id: number, data: { nome?: string; descricao?: string; ativo?: boolean }) =>
    api.put(`/v1/departamentos/${id}`, data),
  delete: (id: number) => api.delete(`/v1/departamentos/${id}`),
};