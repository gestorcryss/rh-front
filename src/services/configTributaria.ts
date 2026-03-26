import api from './api';

export interface ConfigTributaria {
  id: number;
  funcionario_id: number | null;
  regime_irt: string;
  percentual_inss: number;
  isento_irt: boolean;
  dependentes: number;
  data_inicio_vigencia: string;
  data_fim_vigencia: string | null;
  created_at: string;
  updated_at: string;
}

export interface TabelaIRT {
  id: number;
  config_id: number;
  limite_inferior: number;
  limite_superior: number | null;
  parcela_fixa: number;
  taxa_percentual: number;
  excesso_base: number | null;
  ordem: number;
}

export interface ListParams {
  page?: number;
  per_page?: number;
  global?: boolean;
  funcionario_id?: number;
  regime?: string;
}

const configTributariaService = {
  // Configurações
  list: (params?: ListParams) =>
    api.get<{ data: { data: ConfigTributaria[]; total: number; current_page: number; last_page: number; from: number; to: number } }>(
      'v1/config-tributaria',
      { params }
    ),

  getById: (id: number) =>
    api.get<{ data: ConfigTributaria }>(`v1/config-tributaria/${id}`),

  create: (data: Partial<ConfigTributaria>) =>
    api.post<{ data: ConfigTributaria }>('/config-tributaria', data),

  update: (id: number, data: Partial<ConfigTributaria>) =>
    api.put<{ data: ConfigTributaria }>(`v1/config-tributaria/${id}`, data),

  delete: (id: number) =>
    api.delete(`/config-tributaria/${id}`),

  // Tabela IRT
  getLinhasTabela: (configId: number) =>
    api.get<{ data: TabelaIRT[] }>(`v1/config-tributaria/${configId}/linhas`),

  createLinha: (data: Partial<TabelaIRT>) =>
    api.post<{ data: TabelaIRT }>('v1/config-tributaria/linhas', data),

  updateLinha: (id: number, data: Partial<TabelaIRT>) =>
    api.put<{ data: TabelaIRT }>(`v1/config-tributaria/linhas/${id}`, data),

  deleteLinha: (id: number) =>
    api.delete(`v1/config-tributaria/linhas/${id}`),
};

export { configTributariaService };