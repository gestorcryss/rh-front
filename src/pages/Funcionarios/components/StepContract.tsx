import React from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { ContractForm } from "./types";

interface StepContractProps {
  data: ContractForm;
  onChange: (data: Partial<ContractForm>) => void;
  tiposContrato: Array<{ id: number; nome: string; codigo: string; descricao?: string; prazo_meses?: number }>;
  errors?: Record<string, string>;
  isLoading?: boolean;
}

const StepContract: React.FC<StepContractProps> = ({
  data,
  onChange,
  tiposContrato,
  errors = {},
  isLoading = false,
}) => {
  const handleChange = (field: keyof ContractForm, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-800">
        <DocumentTextIcon className="h-6 w-6 text-primary" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Dados Contratuais
        </h2>
        <span className="ml-auto text-sm text-gray-400">Passo 4 de 5</span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

<div>
  <Label>Tipo de Contrato *</Label>
  <select
    value={data.tipo_contrato_id}  // Este já é string, não pode ser undefined
    onChange={(e) => handleChange("tipo_contrato_id", e.target.value)}
    disabled={isLoading}
    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary disabled:opacity-50 dark:border-gray-700 dark:text-white"
  >
    <option value="">Selecione o tipo de contrato</option>
    {tiposContrato.map((tipo) => (
      <option key={tipo.id} value={tipo.id}>
        {tipo.nome} {tipo.codigo && `(${tipo.codigo})`}
      </option>
    ))}
  </select>
</div>

<div>
  <Label>Data de Início *</Label>
  <Input
    type="date"
    value={data.data_inicio}  // Este já é string
    onChange={(e) => handleChange("data_inicio", e.target.value)}
    error={!!errors.data_inicio}
  />
</div>

<div>
  <Label>Data de Fim (opcional)</Label>
  <Input
    type="date"
    value={data.data_fim ?? ""}  // <- Garantir string
    onChange={(e) => handleChange("data_fim", e.target.value)}
    min={data.data_inicio}
  />
</div>

<div>
  <Label>Salário Base (Kz) *</Label>
  <Input
    type="number"
    placeholder="0,00"
    value={data.salario_base}  // Este já é string
    onChange={(e) => handleChange("salario_base", e.target.value)}
    error={!!errors.salario_base}
  />
</div>

<div>
  <Label>Carga Horária Semanal (h) *</Label>
  <Input
    type="number"
    placeholder="44"
    value={data.carga_horaria}  // Este já é string
    onChange={(e) => handleChange("carga_horaria", e.target.value)}
    error={!!errors.carga_horaria}
  />
</div>

<div>
  <Label>Status do Contrato</Label>
  <select
    value={data.status_contrato}  // Este já é string
    onChange={(e) => handleChange("status_contrato", e.target.value as ContractForm["status_contrato"])}
    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
  >
    <option value="ATIVO">Ativo</option>
    <option value="INATIVO">Inativo</option>
    <option value="SUSPENSO">Suspenso</option>
  </select>
</div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          📄 O contrato define as condições de trabalho, salário base e carga horária.
          O salário base será usado como referência para todos os cálculos da folha.
        </p>
      </div>
    </div>
  );
};

export default StepContract;