import api from "./api";

export const funcoesService = {
  list: () => api.get("/v1/funcoes"),
  get: (id: number) => api.get(`/v1/funcoes/${id}`),
  create: (data: { codigo: string; nome: string; descricao?: string; nivel?: number; ativo?: boolean }) =>
    api.post("/v1/funcoes", data),
  update: (id: number, data: { nome?: string; descricao?: string; nivel?: number; ativo?: boolean }) =>
    api.put(`/v1/funcoes/${id}`, data),
  delete: (id: number) => api.delete(`/v1/funcoes/${id}`),
};