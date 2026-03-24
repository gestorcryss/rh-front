import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { contratosService } from "../../services/contratos";
import { funcionariosService } from "../../services/funcionarios";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import ContractForm from "./components/ContractForm";
import { ContratoFormData, TipoContrato } from "./components/types";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string>;
}

const CreateContrato: React.FC = () => {
  const navigate = useNavigate();
  const { funcionarioId } = useParams<{ funcionarioId: string }>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Buscar tipos de contrato
  const { data: tiposData, isLoading: loadingTipos } = useQuery({
    queryKey: ["tipos-contrato"],
    queryFn: () => contratosService.getTipos(),
  });

  // Buscar dados do funcionário
  const { data: funcionarioData } = useQuery({
    queryKey: ["funcionario", funcionarioId],
    queryFn: () => funcionariosService.get(Number(funcionarioId)),
    enabled: !!funcionarioId,
  });

  const tiposContrato: TipoContrato[] = tiposData?.data?.data.data || [];
  const funcionario = funcionarioData?.data.data;

  const [formData, setFormData] = useState<ContratoFormData>({
    tipo_contrato_id: 0,
    data_inicio: new Date().toISOString().split("T")[0],
    data_fim: "",
    status: "ATIVO",
    salario_base: 0,
    carga_horaria: 44,
    regime_trabalho: "",
  });

  const createContrato = useMutation({
    mutationFn: (data: ContratoFormData) =>
      contratosService.create(Number(funcionarioId), data),
    onSuccess: () => {
      toast.success("Contrato criado com sucesso!");
      navigate(`/funcionarios/${funcionarioId}/contratos`);
    },
    onError: (error: unknown) => {
      const apiError = axios.isAxiosError<ApiErrorResponse>(error) ? error : null;
      const message = apiError?.response?.data?.message || "Erro ao criar contrato";
      toast.error(message);
      if (apiError?.response?.data?.errors) {
        setErrors(apiError.response.data.errors);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipo_contrato_id) {
      setErrors({ tipo_contrato_id: "Tipo de contrato é obrigatório" });
      return;
    }
    if (!formData.salario_base || formData.salario_base <= 0) {
      setErrors({ salario_base: "Salário base é obrigatório" });
      return;
    }

    await createContrato.mutateAsync(formData);
  };

  if (!funcionarioId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Funcionário não especificado</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Novo Contrato - ${funcionario?.nome_completo || "Funcionário"} | Sistema de RH`}
        description="Criar novo contrato"
      />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              to={`/funcionarios/${funcionarioId}/contratos`}
              className="text-sm text-primary hover:underline"
            >
              ← Voltar para contratos
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">
              Novo Contrato
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {funcionario?.nome_completo} ({funcionario?.numero_mecanografico})
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(`/funcionarios/${funcionarioId}/contratos`)}>
            <ChevronLeftIcon className="mr-2 h-5 w-5" />
            Cancelar
          </Button>
        </div>

        {/* Formulário */}
        <ComponentCard title="">
          <form onSubmit={handleSubmit}>
            <ContractForm
              data={formData}
              onChange={(p) => setFormData((prev) => ({ ...prev, ...p }))}
              tiposContrato={tiposContrato}
              errors={errors}
              isLoading={loadingTipos || createContrato.isPending}
              isEdit={false}
            />

            <div className="mt-8 flex justify-end border-t border-gray-200 pt-6 dark:border-gray-800">
              <Button
                type="submit"
                variant="primary"
                disabled={createContrato.isPending}
              >
                <ChevronLeftIcon className="mr-2 h-5 w-5" />
                {createContrato.isPending ? "Criando..." : "Criar Contrato"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
};

export default CreateContrato;