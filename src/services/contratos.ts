import api from "./api";

export const contratosService = {
  // Listar todos os contratos (visão global)
  listAll: (params?: { status?: string; search?: string; page?: number; per_page?: number }) =>
    api.get("/v1/contratos", { params }),

  // Listar contratos de um funcionário
  list: (funcionarioId: number, params?: { status?: string }) =>
    api.get(`/v1/funcionarios/${funcionarioId}/contratos`, { params }),

  // Obter contrato específico
  get: (contratoId: number) => api.get(`/v1/contratos/${contratoId}`),

  // Criar novo contrato (cria primeira versão)
  create: (funcionarioId: number, data: {
    tipo_contrato_id: number;
    data_inicio: string;
    data_fim?: string | null;
    status: string;
    salario_base: number;
    carga_horaria: number;
    regime_trabalho?: string;
  }) => api.post(`/v1/funcionarios/${funcionarioId}/contratos`, data),

  // Atualizar contrato (apenas campos não versionados)
  update: (contratoId: number, data: {
    status?: string;
    data_fim?: string;
  }) => api.put(`/v1/contratos/${contratoId}`, data),

  // Encerrar contrato
  encerrar: (contratoId: number, data: { data_fim_vigencia: string }) =>
    api.post(`/v1/contratos/${contratoId}/encerrar`, data),

  // Listar versões do contrato
  getVersoes: (contratoId: number) =>
    api.get(`/v1/contratos/${contratoId}/versoes`),

  // Criar nova versão do contrato
  createVersao: (contratoId: number, data: {
    salario_base: number;
    carga_horaria: number;
    regime_trabalho?: string;
    data_inicio_vigencia: string;
  }) => api.post(`/v1/contratos/${contratoId}/versoes`, data),

  // Obter versão específica
  getVersao: (contratoId: number, versaoId: number) =>
    api.get(`/v1/contratos/${contratoId}/versoes/${versaoId}`),

  // Encerrar versão
  encerrarVersao: (contratoId: number, versaoId: number, data: { data_fim_vigencia: string }) =>
    api.post(`/v1/contratos/${contratoId}/versoes/${versaoId}/encerrar`, data),

  // Restaurar versão
  restaurarVersao: (contratoId: number, versaoId: number) =>
    api.post(`/v1/contratos/${contratoId}/versoes/${versaoId}/restaurar`),

  // Tipos de contrato
  getTipos: () => api.get("/v1/tipo-contrato"),
};