export interface BasicInfoForm {
  numero_mecanografico: string;
  nome_completo: string;
  status: "ATIVO" | "INATIVO" | "SUSPENSO";
  email?: string;
  username?: string;
}

export interface PersonalDataForm {
  genero?: "MASCULINO" | "FEMININO" | "OUTRO";
  data_nascimento?: string;
  estado_civil?: string;
  tipo_documento?: string;
  numero_documento?: string;
  validade_documento?: string;
  nif?: string;
  inss_numero?: string;
}

export interface ProfessionalDataForm {
  departamento_id?: string;
  funcao_id?: string;
  centro_custo_id?: string;
}

export interface ContractForm {
  tipo_contrato_id: string;
  data_inicio: string;
  data_fim?: string;
  status_contrato: "ATIVO" | "INATIVO" | "SUSPENSO";
  salario_base: string;
  carga_horaria: string;
}

export interface SalaryStructureItem {
  rubrica_id: number;
  valor: string;
  tipo_valor: "FIXO" | "PERCENTUAL" | "FORMULA" | "INFORMATIVO";
}

export interface SalaryStructureForm {
  itens: SalaryStructureItem[];
}