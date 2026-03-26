import api from "./api";

export interface CentroCusto {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

const centrosCustoService = {
  list: () => api.get<{ data: CentroCusto[] }>("v1/centro-custo"),
  create: (data: Partial<CentroCusto>) => api.post("v1/centro-custo", data),
  update: (id: number, data: Partial<CentroCusto>) =>
    api.put(`v1/centro-custo/${id}`, data),
  delete: (id: number) => api.delete(`v1/centro-custo/${id}`),
};

export { centrosCustoService };