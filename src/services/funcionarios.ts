import api from "./api";

export interface Funcionario {
  id: number;
  numero_mecanografico: string;
  nome_completo: string;
  status: "ATIVO" | "INATIVO" | "SUSPENSO";
  departamento_id?: number;
  funcao_id?: number;
  centro_custo_id?: number;
  created_at: string;
  updated_at: string;
}

export interface FuncionariosListParams {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  departamento_id?: number;
  funcao_id?: number;
  centro_custo_id?: number;
}

export const funcionariosService = {
  list: async (params?: FuncionariosListParams) => {
    console.log("🔍 Chamando API /v1/funcionarios com params:", params);
    const response = await api.get("/v1/funcionarios", { params });
    console.log("📦 Resposta da API funcionarios:", response.data);
    return response;
  },

  get: (id: number) => api.get(`/v1/funcionarios/${id}`),

  create: (data: Partial<Funcionario>) => api.post("/v1/funcionarios", data),

  update: (id: number, data: Partial<Funcionario>) =>
    api.put(`/v1/funcionarios/${id}`, data),

  delete: (id: number) => api.delete(`/v1/funcionarios/${id}`),

  getDadosPessoais: (id: number) => api.get(`/v1/funcionarios/${id}/dados-pessoais`),

  getDadosPessoaisAtuais: (id: number) =>
    api.get(`/v1/funcionarios/${id}/dados-pessoais/atual`),

  createDadosPessoais: (id: number, data: unknown) =>
    api.post(`/v1/funcionarios/${id}/dados-pessoais`, data),

  getContratos: (id: number) => api.get(`/v1/funcionarios/${id}/contratos`),

  getEstruturaAtual: (id: number) =>
    api.get(`/v1/funcionarios/${id}/estruturas-salariais/atual`),

  getMovimentos: (id: number, mes: number, ano: number) =>
    api.get(`/v1/funcionarios/${id}/movimentos`, { params: { mes, ano } }),

  lancarFalta: (id: number, data: { horas: number; data: string; justificada?: boolean; observacao?: string }) =>
    api.post(`/v1/funcionarios/${id}/faltas`, data),

  lancarHoraExtra: (id: number, data: { horas: number; percentual: 50 | 100; data: string; observacao?: string }) =>
    api.post(`/v1/funcionarios/${id}/horas-extras`, data),

  createEstruturaSalarial: (funcionarioId: number, data: {
  data_inicio_vigencia: string;
  itens: Array<{
    rubrica_id: number;
    valor: number;
    tipo_valor: string;
  }>;
}) => api.post(`/v1/funcionarios/${funcionarioId}/estruturas-salariais`, data),
};