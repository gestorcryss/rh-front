import api from "./api"; // seu axios configurado com baseURL: '/api'

export interface MovimentoMensal {
  id: number;
  funcionario_id: number;
  funcionario?: { id: number; numero_mecanografico: string; nome_completo: string };
  rubrica_id: number;
  rubrica?: { id: number; codigo: string; nome: string };
  valor: number;
  quantidade?: number;
  mes: number;
  ano: number;
  processado: boolean;
  created_at?: string;
  updated_at?: string;
}

export const movimentosMensaisService = {
  // Lista global de pendentes (melhor opção para a página /movimentos-mensais)
  pendentes: (params?: any) => api.get("/v1/movimentos/pendentes", { params }),

  // Por funcionário (caso precise em outros lugares)
  listByFuncionario: (funcionarioId: number, params?: any) =>
    api.get(`/v1/funcionarios/${funcionarioId}/movimentos`, { params }),

  // CREATE → POST /v1/funcionarios/{funcionario}/movimentos
  create: (funcionarioId: number, data: any) =>
    api.post(`/v1/funcionarios/${funcionarioId}/movimentos`, data),

  // UPDATE → PUT /v1/funcionarios/{funcionario}/movimentos/{movimento}
  update: (funcionarioId: number, movimentoId: number, data: any) =>
    api.put(`/v1/funcionarios/${funcionarioId}/movimentos/${movimentoId}`, data),

  // DELETE → DELETE /v1/funcionarios/{funcionario}/movimentos/{movimento}
  delete: (funcionarioId: number, movimentoId: number) =>
    api.delete(`/v1/funcionarios/${funcionarioId}/movimentos/${movimentoId}`),
  
  importFolhaPonto: (formData: FormData) => 
    api.post("/v1/movimentos/import-folha-ponto", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
};