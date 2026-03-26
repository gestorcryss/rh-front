import api from './api';

export interface Movimento {
  id: number;
  funcionario_id: number;
  rubrica_id: number;
  processamento_id: number | null;
  valor: number | null;
  quantidade: number | null;
  mes: number;
  ano: number;
  processado: boolean;
  tipo_movimento: string;
  observacao: string | null;
  created_at: string;
  rubrica?: {
    id: number;
    codigo: string;
    nome: string;
    tipo: string;
  };
  funcionario?: {
    id: number;
    nome_completo: string;
    numero_mecanografico: string;
  };
}

export interface LancarFaltaParams {
  horas: number;
  data: string;
  justificada?: boolean;
  observacao?: string;
}

export interface LancarHoraExtraParams {
  horas: number;
  percentual: 50 | 100;
  data: string;
  observacao?: string;
}

export interface LancarMovimentoParams {
  rubrica_id: number;
  valor?: number;
  quantidade?: number;
  mes: number;
  ano: number;
  tipo_movimento?: string;
  observacao?: string;
}

const movimentosService = {
  // Listar movimentos de um funcionário no período
  listByFuncionario: (funcionarioId: number, mes: number, ano: number) =>
    api.get<{ data: Movimento[] }>(`/funcionarios/${funcionarioId}/movimentos`, {
      params: { mes, ano },
    }),

  // Lançar falta
  lancarFalta: (funcionarioId: number, params: LancarFaltaParams) =>
    api.post<{ data: Movimento }>(`/funcionarios/${funcionarioId}/faltas`, params),

  // Lançar hora extra
  lancarHoraExtra: (funcionarioId: number, params: LancarHoraExtraParams) =>
    api.post<{ data: Movimento }>(`/funcionarios/${funcionarioId}/horas-extras`, params),

  // Lançar movimento manual (bónus, desconto)
  lancarMovimento: (funcionarioId: number, params: LancarMovimentoParams) =>
    api.post<{ data: Movimento }>(`/funcionarios/${funcionarioId}/movimentos`, params),

  // Remover movimento
  deleteMovimento: (funcionarioId: number, movimentoId: number) =>
    api.delete(`/funcionarios/${funcionarioId}/movimentos/${movimentoId}`),

  // Listar movimentos pendentes do período (global)
  listPendentes: (mes: number, ano: number) =>
    api.get<{ data: Movimento[] }>('/movimentos/pendentes', { params: { mes, ano } }),
};

export { movimentosService };