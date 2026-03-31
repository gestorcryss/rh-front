import React from "react";
import { BriefcaseIcon, UserIcon } from "@heroicons/react/24/outline";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { BasicInfoForm } from "./types";

interface StepBasicInfoProps {
    data: BasicInfoForm;
    onChange: (data: Partial<BasicInfoForm>) => void;
    errors?: Record<string, string>;
    departamentos: Array<{ id: number; nome: string; codigo: string }>;
    funcoes: Array<{ id: number; nome: string; codigo: string; nivel?: number }>;
    isLoading?: boolean;
}

const StepBasicInfo: React.FC<StepBasicInfoProps> = ({ data, onChange, errors = {}, departamentos,
    funcoes, isLoading }) => {
    const handleChange = (field: keyof BasicInfoForm, value: string | boolean) => {
        onChange({ [field]: value });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-800">
                <UserIcon className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Dados Básicos
                </h2>
                <span className="ml-auto text-sm text-gray-400">Passo 1 de 5</span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <Label>
                        Número Mecanográfico <span className="text-error-500">*</span>
                    </Label>
                    <Input
                        type="text"
                        placeholder="Ex: FUNC001"
                        value={data.numero_mecanografico}
                        onChange={(e) => handleChange("numero_mecanografico", e.target.value)}
                        error={!!errors.numero_mecanografico}
                    />
                    {errors.numero_mecanografico && (
                        <p className="mt-1 text-sm text-error-500">{errors.numero_mecanografico}</p>
                    )}
                </div>

                <div>
                    <Label>
                        Nome Completo <span className="text-error-500">*</span>
                    </Label>
                    <Input
                        type="text"
                        placeholder="Nome completo do funcionário"
                        value={data.nome_completo}
                        onChange={(e) => handleChange("nome_completo", e.target.value)}
                        error={!!errors.nome_completo}
                    />
                    {errors.nome_completo && (
                        <p className="mt-1 text-sm text-error-500">{errors.nome_completo}</p>
                    )}
                </div>


                <div>
                    <Label>Email <span className="text-error-500">*</span></Label>
                    <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={data.email ?? ""}  // <- Garantir que nunca é undefined
                        onChange={(e) => handleChange("email", e.target.value)}
                    />
                </div>
                <div>
                    <Label>Nome de Usuário <span className="text-error-500">*</span></Label>
                    <Input
                        type="text"
                        placeholder="João"
                        value={data.username ?? ""}  // <- Garantir que nunca é undefined
                        onChange={(e) => handleChange("username", e.target.value)}
                    />
                </div>

                <div>
                    <Label>
                        Status <span className="text-error-500">*</span>
                    </Label>
                    <select
                        value={data.status}
                        onChange={(e) => handleChange("status", e.target.value as BasicInfoForm["status"])}
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
                    ℹ️ O número mecanográfico é único e será usado para identificar o funcionário em todo o sistema.
                    O username e email serão usados para criar o acesso ao sistema.
                </p>
            </div>

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
        </div>
    );
};

export default StepBasicInfo;