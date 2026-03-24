import api from './api';

export interface Rubrica {
  id: number;
  codigo: string;
  nome: string;
  tipo: 'PROVENTO' | 'DESCONTO' | 'INFORMATIVO' | 'BASE';
  categoria: string;
  ativo: boolean;
  versao_ativa?: RubricaVersao;
  created_at: string;
  updated_at: string;
}

export interface RubricaVersao {
  id: number;
  rubrica_id: number;
  afecta_ferias: boolean;
  metodo_calculo: 'FIXO' | 'PERCENTUAL' | 'HORA' | 'TABELA' | 'FORMULA';
  formula_calculo: string | null;
  data_inicio_vigencia: string;
  data_fim_vigencia: string | null;
}

export interface RubricaRegraFiscal {
  id: number;
  rubrica_versao_id: number;
  tipo_imposto: 'INSS' | 'IRT' | 'OUTRO';
  base_calculo: 'INTEGRAL' | 'ISENTO' | 'EXCEDENTE';
  limite_valor: number | null;
  limite_percentual: number | null;
  aplica_acima_limite: boolean;
  data_inicio_vigencia: string;
  data_fim_vigencia: string | null;
}

export interface RubricaRegraFiscal {
  id: number;
  rubrica_versao_id: number;
  tipo_imposto: 'INSS' | 'IRT' | 'OUTRO';
  base_calculo: 'INTEGRAL' | 'ISENTO' | 'EXCEDENTE';
  limite_valor: number | null;
  limite_percentual: number | null;
  aplica_acima_limite: boolean;
  data_inicio_vigencia: string;
  data_fim_vigencia: string | null;
}

export interface RubricaCompleta extends Rubrica {
  versoes: RubricaVersao[];
}

export interface ListResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface ListParams {
  page?: number;
  per_page?: number;
  tipo?: string;
  categoria?: string;
  search?: string;
  ativo?: boolean;
}

const rubricasService = {
  list: (params?: ListParams) => 
    api.get<{ data: ListResponse<Rubrica> }>('/v1/rubricas', { params }),
  
  getById: (id: number) => 
    api.get<{ data: RubricaCompleta }>(`/v1/rubricas/${id}`),
  
  create: (data: Partial<Rubrica>) => 
    api.post<{ data: Rubrica }>('/v1/rubricas', data),
  
  update: (id: number, data: Partial<Rubrica>) => 
    api.put<{ data: Rubrica }>(`/v1/rubricas/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/v1/rubricas/${id}`),
  
  createVersao: (data: Partial<RubricaVersao>) =>
    api.post<{ data: RubricaVersao }>('/v1/rubricas/versoes', data),
  
  
   // REGRAS FISCAIS
   getRegrasFiscais: (versaoId: number, params?: { page?: number; per_page?: number }) =>
    api.get<{ data: { data: RubricaRegraFiscal[]; total: number } }>(`/rubricas/versoes/${versaoId}/regras-fiscais`, { params }),
  
  getRegraFiscal: (id: number) =>
    api.get<{ data: RubricaRegraFiscal }>(`/rubricas/regras-fiscais/${id}`),
  
  createRegraFiscal: (data: Partial<RubricaRegraFiscal>) =>
    api.post<{ data: RubricaRegraFiscal }>('/rubricas/regras-fiscais', data),
  
  updateRegraFiscal: (id: number, data: Partial<RubricaRegraFiscal>) =>
    api.put<{ data: RubricaRegraFiscal }>(`/rubricas/regras-fiscais/${id}`, data),
  
  deleteRegraFiscal: (id: number) =>
    api.delete(`/rubricas/regras-fiscais/${id}`),
};



export { rubricasService };