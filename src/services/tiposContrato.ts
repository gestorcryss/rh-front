import api from "./api";

export interface TipoContrato {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  prazo_meses: number | null;
  ativo: boolean;
}

const tiposContratoService = {
  list: () => api.get<{ data: TipoContrato[] }>("v1/tipo-contrato"),
  create: (data: Partial<TipoContrato>) => api.post("v1/tipo-contrato", data),
  update: (id: number, data: Partial<TipoContrato>) =>
    api.put(`v1/tipo-contrato/${id}`, data),
  delete: (id: number) => api.delete(`v1/tipo-contrato/${id}`),
};

export { tiposContratoService };