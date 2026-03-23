import React from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { TipoContrato, ContratoFormData } from "./types";

interface ContractFormProps {
  data: ContratoFormData;
  onChange: (data: Partial<ContratoFormData>) => void;
  tiposContrato: TipoContrato[];
  errors?: Record<string, string>;
  isLoading?: boolean;
  isEdit?: boolean;
}

const ContractForm: React.FC<ContractFormProps> = ({
  data,
  onChange,
  tiposContrato,
  errors = {},
  isLoading = false,
  isEdit = false,
}) => {
  const handleChange = (field: keyof ContratoFormData, value: string | number) => {
    onChange({ [field]: value });
  };

  const selectedTipo = tiposContrato.find(t => t.id === data.tipo_contrato_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-800">
        <DocumentTextIcon className="h-6 w-6 text-primary" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Dados do Contrato
        </h2>
        {isEdit && (
          <span className="ml-auto text-sm text-blue-600 dark:text-blue-400">
            ⚠️ Alterações criarão uma nova versão
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label>
            Tipo de Contrato <span className="text-error-500">*</span>
          </Label>
          <select
            value={data.tipo_contrato_id || ""}
            onChange={(e) => handleChange("tipo_contrato_id", Number(e.target.value))}
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
          {errors.tipo_contrato_id && (
            <p className="mt-1 text-sm text-error-500">{errors.tipo_contrato_id}</p>
          )}
          {selectedTipo?.descricao && (
            <p className="mt-1 text-xs text-gray-500">{selectedTipo.descricao}</p>
          )}
        </div>

        <div>
          <Label>
            Data de Início <span className="text-error-500">*</span>
          </Label>
          <Input
            type="date"
            value={data.data_inicio}
            onChange={(e) => handleChange("data_inicio", e.target.value)}
            error={!!errors.data_inicio}
          />
          {errors.data_inicio && (
            <p className="mt-1 text-sm text-error-500">{errors.data_inicio}</p>
          )}
        </div>

        <div>
          <Label>Data de Fim (opcional)</Label>
          <Input
            type="date"
            value={data.data_fim || ""}
            onChange={(e) => handleChange("data_fim", e.target.value)}
            min={data.data_inicio}
          />
          {selectedTipo?.prazo_meses && (
            <p className="mt-1 text-xs text-gray-500">
              Este contrato tem prazo padrão de {selectedTipo.prazo_meses} meses
            </p>
          )}
        </div>

        <div>
          <Label>Status do Contrato</Label>
          <select
            value={data.status}
            onChange={(e) => handleChange("status", e.target.value as ContratoFormData["status"])}
            className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
          >
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="SUSPENSO">Suspenso</option>
          </select>
        </div>

        <div>
          <Label>
            Salário Base (Kz) <span className="text-error-500">*</span>
          </Label>
          <Input
            type="number"
            placeholder="0,00"
            value={data.salario_base}
            onChange={(e) => handleChange("salario_base", Number(e.target.value))}
            error={!!errors.salario_base}
          />
          {errors.salario_base && (
            <p className="mt-1 text-sm text-error-500">{errors.salario_base}</p>
          )}
        </div>

        <div>
          <Label>
            Carga Horária Semanal (h) <span className="text-error-500">*</span>
          </Label>
          <Input
            type="number"
            placeholder="44"
            value={data.carga_horaria}
            onChange={(e) => handleChange("carga_horaria", Number(e.target.value))}
            error={!!errors.carga_horaria}
          />
          <p className="mt-1 text-xs text-gray-500">Padrão: 44 horas (segunda a sexta)</p>
        </div>

        <div>
          <Label>Regime de Trabalho</Label>
          <select
            value={data.regime_trabalho || ""}
            onChange={(e) => handleChange("regime_trabalho", e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
          >
            <option value="">Selecione</option>
            <option value="INTEGRAL">Integral (44h)</option>
            <option value="PARCIAL">Parcial (20h)</option>
            <option value="MEIO_PERIODO">Meio Período (22h)</option>
            <option value="REMOTO">Remoto</option>
            <option value="HIBRIDO">Híbrido</option>
          </select>
        </div>
      </div>

      {isEdit && (
        <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            ⚠️ Alterações no salário base ou carga horária criarão uma <strong>nova versão</strong> do contrato.
            O histórico anterior será mantido para fins de auditoria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContractForm;