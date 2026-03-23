import React from "react";
import { BriefcaseIcon } from "@heroicons/react/24/outline";
import Label from "../../../components/form/Label";
import { ProfessionalDataForm } from "./types";

interface StepProfessionalDataProps {
    data: ProfessionalDataForm;
    onChange: (data: Partial<ProfessionalDataForm>) => void;
    departamentos: Array<{ id: number; nome: string; codigo: string }>;
    funcoes: Array<{ id: number; nome: string; codigo: string; nivel?: number }>;
    isLoading?: boolean;
}

const StepProfessionalData: React.FC<StepProfessionalDataProps> = ({
    data,
    onChange,
    departamentos,
    funcoes,
    isLoading = false,
}) => {
    const handleChange = (field: keyof ProfessionalDataForm, value: string) => {
        onChange({ [field]: value });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-800">
                <BriefcaseIcon className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Dados Profissionais
                </h2>
                <span className="ml-auto text-sm text-gray-400">Passo 3 de 5</span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">


                <div>
                    <Label>Departamento</Label>
                    <select
                        value={data.departamento_id ?? ""}  // <- Garantir string
                        onChange={(e) => handleChange("departamento_id", e.target.value)}
                        disabled={isLoading}
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary disabled:opacity-50 dark:border-gray-700 dark:text-white"
                    >
                        <option value="">Selecione o departamento</option>
                        {departamentos.map((depto) => (
                            <option key={depto.id} value={depto.id}>
                                {depto.nome} {depto.codigo && `(${depto.codigo})`}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label>Função/Cargo</Label>
                    <select
                        value={data.funcao_id ?? ""}  // <- Garantir string
                        onChange={(e) => handleChange("funcao_id", e.target.value)}
                        disabled={isLoading}
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary disabled:opacity-50 dark:border-gray-700 dark:text-white"
                    >
                        <option value="">Selecione a função</option>
                        {funcoes.map((funcao) => (
                            <option key={funcao.id} value={funcao.id}>
                                {funcao.nome} {funcao.nivel && `(Nível ${funcao.nivel})`}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label>Centro de Custo</Label>
                    <select
                        value={data.centro_custo_id ?? ""}  // <- Garantir string
                        onChange={(e) => handleChange("centro_custo_id", e.target.value)}
                        disabled={isLoading}
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary disabled:opacity-50 dark:border-gray-700 dark:text-white"
                    >
                        <option value="">Selecione o centro de custo</option>
                    </select>
                </div>
            </div>

            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <p className="text-sm text-green-600 dark:text-green-400">
                    💡 Departamento e função definem a estrutura organizacional e podem influenciar
                    benefícios e políticas internas.
                </p>
            </div>
        </div>
    );
};

export default StepProfessionalData;