import React from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { PersonalDataForm } from "./types";

interface StepPersonalDataProps {
    data: PersonalDataForm;
    onChange: (data: Partial<PersonalDataForm>) => void;
}

const StepPersonalData: React.FC<StepPersonalDataProps> = ({ data, onChange }) => {
    const handleChange = (field: keyof PersonalDataForm, value: string) => {
        onChange({ [field]: value });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-800">
                <DocumentTextIcon className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Dados Pessoais
                </h2>
                <span className="ml-auto text-sm text-gray-400">Passo 2 de 5</span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
                <div>
                    <Label>Gênero</Label>
                    <select
                        value={data.genero ?? ""}  // <- Garantir string
                        onChange={(e) => handleChange("genero", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
                    >
                        <option value="">Selecione</option>
                        <option value="MASCULINO">Masculino</option>
                        <option value="FEMININO">Feminino</option>
                        <option value="OUTRO">Outro</option>
                    </select>
                </div>

                <div>
                    <Label>Data de Nascimento</Label>
                    <Input
                        type="date"
                        value={data.data_nascimento ?? ""}  // <- Garantir string
                        onChange={(e) => handleChange("data_nascimento", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Estado Civil</Label>
                    <select
                        value={data.estado_civil ?? ""}  // <- Garantir string
                        onChange={(e) => handleChange("estado_civil", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
                    >
                        <option value="">Selecione</option>
                        <option value="SOLTEIRO">Solteiro(a)</option>
                        <option value="CASADO">Casado(a)</option>
                        <option value="DIVORCIADO">Divorciado(a)</option>
                        <option value="VIUVO">Viúvo(a)</option>
                        <option value="UNIAO_ESTAVEL">União Estável</option>
                    </select>
                </div>

                <div>
                    <Label>NIF</Label>
                    <Input
                        type="text"
                        placeholder="Número de Identificação Fiscal"
                        value={data.nif ?? ""}  // <- Garantir string
                        onChange={(e) => handleChange("nif", e.target.value)}
                    />
                </div>

                
                <div>
                    <Label>Tipo de Documento</Label>
                    <select
                        value={data.tipo_documento || ""}
                        onChange={(e) => handleChange("tipo_documento", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
                    >
                        <option value="">Selecione</option>
                        <option value="BI">Bilhete de Identidade (BI)</option>
                        <option value="PASSAPORTE">Passaporte</option>
                        <option value="CARTAO_CIDADAO">Cartão de Cidadão</option>
                    </select>
                </div>

                <div>
                    <Label>Número do Documento</Label>
                    <Input
                        type="text"
                        placeholder="Número do documento"
                        value={data.numero_documento || ""}
                        onChange={(e) => handleChange("numero_documento", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Validade do Documento</Label>
                    <Input
                        type="date"
                        value={data.validade_documento || ""}
                        onChange={(e) => handleChange("validade_documento", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Número INSS</Label>
                    <Input
                        type="text"
                        placeholder="Número de contribuinte"
                        value={data.inss_numero || ""}
                        onChange={(e) => handleChange("inss_numero", e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    ⚠️ Os dados pessoais são importantes para documentos oficiais e declarações fiscais.
                    Preencha com atenção.
                </p>
            </div>
        </div>
    );
};

export default StepPersonalData;