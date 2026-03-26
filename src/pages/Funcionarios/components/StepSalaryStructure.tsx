import React from "react";
import { CurrencyDollarIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { SalaryStructureForm, SalaryStructureItem } from "./types";

interface StepSalaryStructureProps {
  data: SalaryStructureForm;
  onChange: (data: SalaryStructureForm) => void;
  rubricas: Array<{ id: number; codigo: string; nome: string; tipo: string; descricao?: string }>;
  salarioBase?: number;
  isLoading?: boolean;
}

const StepSalaryStructure: React.FC<StepSalaryStructureProps> = ({
  data,
  onChange,
  rubricas,
  salarioBase = 0,
  isLoading = false,
}) => {
  const addRubricaItem = () => {
    const newItem: SalaryStructureItem = {
      rubrica_id: 0,
      valor: "0",
      tipo_valor: "FIXO",
    };
    onChange({ itens: [...(data.itens || []), newItem] });
  };

  const removeRubricaItem = (index: number) => {
    const newItens = [...(data.itens || [])];
    newItens.splice(index, 1);
    onChange({ itens: newItens });
  };

  const updateRubricaItem = (index: number, field: keyof SalaryStructureItem, value: any) => {
    const newItens = [...(data.itens || [])];
    newItens[index] = { ...newItens[index], [field]: value };
    onChange({ itens: newItens });
  };

  const rubricasProventos = rubricas.filter(r => r.tipo === "PROVENTO");
  const rubricasDescontos = rubricas.filter(r => r.tipo === "DESCONTO");

  const getTotalProventos = () => {
    return (data.itens || []).reduce((total, item) => {
      if (item.tipo_valor === "FIXO") {
        return total + Number(item.valor);
      }
      if (item.tipo_valor === "PERCENTUAL") {
        return total + (salarioBase * Number(item.valor) / 100);
      }
      return total;
    }, 0);
  };

  const getTotalDescontos = () => {
    return (data.itens || []).reduce((total, item) => {
      const rubrica = rubricas.find(r => r.id === item.rubrica_id);
      if (rubrica?.tipo === "DESCONTO") {
        if (item.tipo_valor === "FIXO") {
          return total + Number(item.valor);
        }
        if (item.tipo_valor === "PERCENTUAL") {
          return total + (salarioBase * Number(item.valor) / 100);
        }
      }
      return total;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <CurrencyDollarIcon className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Estrutura Salarial
          </h2>
          <span className="text-sm text-gray-400">Passo 5 de 5</span>
        </div>
        <Button size="sm" onClick={addRubricaItem} disabled={isLoading}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Adicionar Rubrica
        </Button>
      </div>

      {(!data.itens || data.itens.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CurrencyDollarIcon className="h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">Nenhuma rubrica adicionada</p>
          <p className="text-sm text-gray-400">Adicione rubricas para compor o salário do funcionário</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={addRubricaItem}>
            Adicionar Primeira Rubrica
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data.itens.map((item, index) => {
              const rubrica = rubricas.find(r => r.id === item.rubrica_id);
              return (
                <div key={index} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-12">

<div className="md:col-span-5">
  <Label>Rubrica</Label>
  <select
    value={item.rubrica_id === 0 ? "" : String(item.rubrica_id)}  // <- Garantir string, tratar 0 como vazio
    onChange={(e) => updateRubricaItem(index, "rubrica_id", Number(e.target.value) || 0)}
    disabled={isLoading}
    className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-3 text-sm outline-none focus:border-primary disabled:opacity-50 dark:border-gray-700"
  >
    <option value="">Selecione uma rubrica</option>
    <optgroup label="Proventos">
      {rubricasProventos.map((r) => (
        <option key={r.id} value={r.id}>{r.codigo} - {r.nome}</option>
      ))}
    </optgroup>
    <optgroup label="Descontos">
      {rubricasDescontos.map((r) => (
        <option key={r.id} value={r.id}>{r.codigo} - {r.nome}</option>
      ))}
    </optgroup>
  </select>
</div>

<div className="md:col-span-3">
  <Label>Valor</Label>
  <Input
    type="number"
    placeholder="0,00"
    value={item.valor}  // Este já é string
    onChange={(e) => updateRubricaItem(index, "valor", e.target.value)}
    disabled={isLoading}
  />
</div>

<div className="md:col-span-3">
  <Label>Tipo de Valor</Label>
  <select
    value={item.tipo_valor}  // Este já é string
    onChange={(e) => updateRubricaItem(index, "tipo_valor", e.target.value)}
    disabled={isLoading}
    className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-3 text-sm outline-none focus:border-primary disabled:opacity-50 dark:border-gray-700"
  >
    <option value="FIXO">Fixo (Kz)</option>
    <option value="PERCENTUAL">Percentual do Salário Base (%)</option>
    <option value="FORMULA">Fórmula Personalizada</option>
    <option value="INFORMATIVO">Informativo (não calcula)</option>
  </select>
</div>
                    <div className="md:col-span-1 flex items-end">
                      <Button
                        variant="error"
                        size="sm"
                        onClick={() => removeRubricaItem(index)}
                        disabled={isLoading}
                        className="w-full"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {rubrica?.descricao && (
                    <p className="mt-2 text-xs text-gray-500">{rubrica.descricao}</p>
                  )}
                  {item.tipo_valor === "PERCENTUAL" && salarioBase > 0 && (
                    <p className="mt-2 text-xs text-primary">
                      Valor calculado: {((salarioBase * Number(item.valor)) / 100).toLocaleString()} Kz
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resumo da estrutura */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h3 className="mb-3 font-medium text-gray-800 dark:text-white">Resumo da Estrutura</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-white p-3 dark:bg-gray-900">
                <p className="text-sm text-gray-500">Salário Base</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {salarioBase.toLocaleString()} Kz
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 dark:bg-gray-900">
                <p className="text-sm text-green-600">Total Proventos</p>
                <p className="text-lg font-semibold text-green-600">
                  + {getTotalProventos().toLocaleString()} Kz
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 dark:bg-gray-900">
                <p className="text-sm text-red-600">Total Descontos</p>
                <p className="text-lg font-semibold text-red-600">
                  - {getTotalDescontos().toLocaleString()} Kz
                </p>
              </div>
            </div>
            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
              <div className="flex justify-between">
                <p className="font-medium text-gray-700 dark:text-gray-300">Salário Bruto Estimado:</p>
                <p className="text-xl font-bold text-primary">
                  {(salarioBase + getTotalProventos() - getTotalDescontos()).toLocaleString()} Kz
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StepSalaryStructure;