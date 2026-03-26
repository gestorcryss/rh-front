export interface TipoContrato {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  prazo_meses?: number;
  ativo: boolean;
}

export interface ContratoVersao {
  id: number;
  contrato_id: number;
  salario_base: number;
  carga_horaria: number;
  regime_trabalho?: string;
  data_inicio_vigencia: string;
  data_fim_vigencia?: string;
  created_at: string;
  updated_at: string;
}

export interface Contrato {
  id: number;
  funcionario_id: number;
  tipo_contrato_id: number;
  projeto_id?: number;
  data_inicio: string;
  data_fim?: string;
  status: "ATIVO" | "INATIVO" | "SUSPENSO" | "ENCERRADO";
  created_at: string;
  updated_at: string;
  tipo_contrato?: TipoContrato;
  projeto?: { id: number; nome: string; codigo: string };
  versoes?: ContratoVersao[];
  versao_atual?: ContratoVersao;
}

export interface ContratoFormData {
  tipo_contrato_id: number;
  data_inicio: string;
  data_fim?: string;
  status: "ATIVO" | "INATIVO" | "SUSPENSO";
  salario_base: number;
  carga_horaria: number;
  regime_trabalho?: string;
}