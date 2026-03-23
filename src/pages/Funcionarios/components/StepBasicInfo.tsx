import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { BasicInfoForm } from "./types";

interface StepBasicInfoProps {
    data: BasicInfoForm;
    onChange: (data: Partial<BasicInfoForm>) => void;
    errors?: Record<string, string>;
}

const StepBasicInfo: React.FC<StepBasicInfoProps> = ({ data, onChange, errors = {} }) => {
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
                    <Label>Email</Label>
                    <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={data.email ?? ""}  // <- Garantir que nunca é undefined
                        onChange={(e) => handleChange("email", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Username</Label>
                    <Input
                        type="text"
                        placeholder="Nome de usuário"
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
        </div>
    );
};

export default StepBasicInfo;