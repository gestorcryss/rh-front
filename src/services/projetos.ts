import api from "./api";

export interface Projeto {
  id: number;
  codigo: string;
  nome: string;
  data_inicio: string | null;
  data_fim: string | null;
  ativo: boolean;
}

const projetosService = {
  list: () => api.get<{ data: Projeto[] }>("v1/projetos"),
  create: (data: Partial<Projeto>) => api.post("v1/projetos", data),
  update: (id: number, data: Partial<Projeto>) => api.put(`v1/projetos/${id}`, data),
  delete: (id: number) => api.delete(`v1/projetos/${id}`),
};

export { projetosService };