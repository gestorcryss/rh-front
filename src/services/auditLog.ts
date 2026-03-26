import api from "./api";

export interface AuditLog {
  id: number;
  entidade: string;
  entidade_id: number;
  operacao: string;
  dados_anteriores: any;
  dados_novos: any;
  user_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  data_operacao: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface AuditLogListParams {
  page?: number;
  per_page?: number;
  entidade?: string;
  operacao?: string;
  user_id?: number;
  data_inicio?: string;
  data_fim?: string;
}

const auditLogService = {
  list: (params?: AuditLogListParams) =>
    api.get<{ data: { data: AuditLog[]; total: number; current_page: number; last_page: number } }>("/v1/audit-log", { params }),
  get: (id: number) => api.get<{ data: AuditLog }>(`/v1/audit-log/${id}`),
};

export { auditLogService };