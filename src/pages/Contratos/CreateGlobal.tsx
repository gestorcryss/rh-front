import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { contratosService } from "../../services/contratos";
import { funcionariosService } from "../../services/funcionarios";
import ContractForm from "./components/ContractForm";
import { ContratoFormData, TipoContrato } from "./components/types";

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string>;
}

interface FuncionarioOption {
  id: number;
  nome_completo: string;
  numero_mecanografico: string;
}

const CreateContratoGlobal: React.FC = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [funcionarioSearch, setFuncionarioSearch] = useState("");
  const [funcionarioSearchDebounced, setFuncionarioSearchDebounced] = useState("");
  const [funcionarioId, setFuncionarioId] = useState<number | "">("");

  useEffect(() => {
    const timer = setTimeout(() => setFuncionarioSearchDebounced(funcionarioSearch), 400);
    return () => clearTimeout(timer);
  }, [funcionarioSearch]);

  const { data: tiposData, isLoading: loadingTipos } = useQuery({
    queryKey: ["tipos-contrato"],
    queryFn: () => contratosService.getTipos(),
  });

  // Reuse existing funcionarios endpoint; request a larger page for selection.
  const { data: funcionariosData, isLoading: loadingFuncionarios } = useQuery({
    queryKey: ["funcionarios-picker", funcionarioSearchDebounced],
    queryFn: () =>
      funcionariosService.list({
        page: 1,
        per_page: 50,
        search: funcionarioSearchDebounced || undefined,
      }),
  });

  const tiposContrato: TipoContrato[] = tiposData?.data?.data?.data || [];

  const funcionariosRaw = funcionariosData?.data?.data?.data;
  const funcionarios: FuncionarioOption[] = Array.isArray(funcionariosRaw) ? funcionariosRaw : [];

  const selectedFuncionario = useMemo(
    () => funcionarios.find((f) => f.id === funcionarioId) ?? null,
    [funcionarios, funcionarioId]
  );

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
    mutationFn: (data: ContratoFormData) => contratosService.create(Number(funcionarioId), data),
    onSuccess: () => {
      toast.success("Contrato criado com sucesso!");
      navigate("/contratos");
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
    setErrors({});

    if (!funcionarioId) {
      setErrors({ funcionario_id: "Funcionário é obrigatório" });
      return;
    }
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

  return (
    <>
      <PageMeta title="Novo Contrato | Sistema de RH" description="Criar novo contrato" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/contratos" className="text-sm text-primary hover:underline">
              ← Voltar para contratos
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">Novo Contrato</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Selecione o funcionário e preencha os dados do contrato
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/contratos")}>
            <ChevronLeftIcon className="mr-2 h-5 w-5" />
            Cancelar
          </Button>
        </div>

        <ComponentCard title="Funcionário">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Buscar funcionário</Label>
              <Input
                type="text"
                placeholder="Nome ou Nº Mecanográfico"
                value={funcionarioSearch}
                onChange={(e) => setFuncionarioSearch(e.target.value)}
              />
            </div>
            <div>
              <Label>
                Selecionar <span className="text-error-500">*</span>
              </Label>
              <select
                value={funcionarioId}
                onChange={(e) => setFuncionarioId(e.target.value ? Number(e.target.value) : "")}
                disabled={loadingFuncionarios}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary disabled:opacity-50 dark:border-gray-700 dark:text-white"
              >
                <option value="">Selecione o funcionário</option>
                {funcionarios.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome_completo} ({f.numero_mecanografico})
                  </option>
                ))}
              </select>
              {errors.funcionario_id && <p className="mt-1 text-sm text-error-500">{errors.funcionario_id}</p>}
              {selectedFuncionario && (
                <p className="mt-1 text-xs text-gray-500">
                  Selecionado: {selectedFuncionario.nome_completo} ({selectedFuncionario.numero_mecanografico})
                </p>
              )}
            </div>
          </div>
        </ComponentCard>

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
              <Button type="submit" variant="primary" disabled={createContrato.isPending}>
                {createContrato.isPending ? "Criando..." : "Criar Contrato"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
};

export default CreateContratoGlobal;

