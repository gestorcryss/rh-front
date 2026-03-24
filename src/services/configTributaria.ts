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
}

export interface TabelaIRT {
  id: number;
  config_id: number;
  limite_inferior: number;
  limite_superior: number | null;
  parcela_fixa: number;
  taxa_percentual: number;
}

const configTributariaService = {
  // Configurações
  list: (funcionarioId: number) =>
    api.get<{ data: ConfigTributaria[] }>(`/v1/funcionarios/${funcionarioId}/config-tributaria`),
  
  getById: (id: number) =>
    api.get<{ data: ConfigTributaria }>(`/v1/config-tributaria/${id}`),
  
  create: (funcionarioId: number, data: Partial<ConfigTributaria>) =>
    api.post<{ data: ConfigTributaria }>(`/v1/funcionarios/${funcionarioId}/config-tributaria`, data),
  
  update: (id: number, data: Partial<ConfigTributaria>) =>
    api.put<{ data: ConfigTributaria }>(`/v1/config-tributaria/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/v1/config-tributaria/${id}`),
  
  // Tabela IRT
  getLinhasTabela: async (configId: number) => {
    const response = await api.get<{ data: ConfigTributaria & { linhas_tabela?: TabelaIRT[]; linhasTabela?: TabelaIRT[] } }>(
      `/v1/config-tributaria/${configId}`
    );
    const linhas = response.data?.data?.linhas_tabela ?? response.data?.data?.linhasTabela ?? [];
    return { data: { data: linhas } };
  },
  
  createLinha: (data: Partial<TabelaIRT>) =>
    api.post<{ data: TabelaIRT }>('/v1/config-tributaria/linhas', data),
  
  updateLinha: (id: number, data: Partial<TabelaIRT>) =>
    api.put<{ data: TabelaIRT }>(`/v1/config-tributaria/linhas/${id}`, data),
  
  deleteLinha: (id: number) =>
    api.delete(`/v1/config-tributaria/linhas/${id}`),
};

export { configTributariaService };