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


export interface FuncionarioCompleto extends Funcionario {
  departamento?: { id: number; nome: string };
  funcao?: { id: number; nome: string };
  dados_pessoais_atuais?: {
    genero?: string;
  };
  contrato_ativo?: {
    id: number;
    data_inicio: string;
    data_fim: string | null;
    status: string;
  };
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
// Tipos para documentos
export interface FuncionarioDocumento {
  id: number;
  funcionario_id: number;
  nome: string;
  caminho: string;
  tipo: string;
  categoria: string | null;
  created_at: string;
  url: string;  // adicionado pelo backend
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

  listAtivosComContrato: (params?: { genero?: 'MASCULINO' | 'FEMININO' }) =>
  api.get<{ data: FuncionarioCompleto[] }>('/funcionarios', {
    params: {
      status: 'ATIVO',
      tem_contrato_ativo: true,
      ...params,
    },
  }),

  createEstruturaSalarial: (funcionarioId: number, data: {
  data_inicio_vigencia: string;
  itens: Array<{
    rubrica_id: number;
    valor: number;
    tipo_valor: string;
  }>;
}) => api.post(`/v1/funcionarios/${funcionarioId}/estruturas-salariais`, data),

 /**
   * Upload da foto do funcionário
   */
  uploadFoto: async (funcionarioId: number, file: File): Promise<{ foto_url: string }> => {
    const formData = new FormData();
    formData.append('foto', file);
    const response = await api.post(`/v1/funcionarios/${funcionarioId}/foto`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data; // { foto_url: string }
  },

  /**
   * Upload de documento
   */
  uploadDocumento: async (
    funcionarioId: number,
    file: File,
    categoria?: string
  ): Promise<FuncionarioDocumento> => {
    const formData = new FormData();
    formData.append('documento', file);
    if (categoria) formData.append('categoria', categoria);
    const response = await api.post(`/v1/funcionarios/${funcionarioId}/documentos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  /**
   * Listar documentos do funcionário
   */
  listDocumentos: async (funcionarioId: number): Promise<FuncionarioDocumento[]> => {
    const response = await api.get(`/v1/funcionarios/${funcionarioId}/documentos`);
    return response.data.data;
  },

  /**
   * Excluir documento
   */
  deleteDocumento: async (funcionarioId: number, documentoId: number): Promise<void> => {
    await api.delete(`/v1/funcionarios/${funcionarioId}/documentos/${documentoId}`);
  },

  /**
   * Exportar ficha do funcionário para PDF
   * - Retorna um blob para download
   */
  exportarPDF: async (funcionarioId: number): Promise<Blob> => {
    const response = await api.get(`/v1/funcionarios/${funcionarioId}/export-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
