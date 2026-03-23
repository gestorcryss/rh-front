import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { contratosService } from "../../services/contratos";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import ContractForm from "./components/ContractForm";
import VersionHistory from "./components/VersionHistory";
import { ContratoFormData, TipoContrato } from "./components/types";
import { ChevronLeftIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const EditContrato: React.FC = () => {
  const navigate = useNavigate();
  const { contratoId } = useParams<{ contratoId: string }>();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalData, setOriginalData] = useState<ContratoFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<ContratoFormData>({
    tipo_contrato_id: 0,
    data_inicio: "",
    data_fim: "",
    status: "ATIVO",
    salario_base: 0,
    carga_horaria: 44,
    regime_trabalho: "",
  });

  // Buscar dados do contrato
  const { data: contratoData, isLoading: loadingContrato, refetch: refetchContrato } = useQuery({
    queryKey: ["contrato", contratoId],
    queryFn: async () => {
      const response = await contratosService.get(Number(contratoId));
      console.log("📦 Resposta completa do contrato:", response);
      console.log("📦 Contrato data:", response.data);
      return response;
    },
    enabled: !!contratoId,
  });

  // Buscar tipos de contrato
  const { data: tiposData, isLoading: loadingTipos } = useQuery({
    queryKey: ["tipos-contrato"],
    queryFn: async () => {
      const response = await contratosService.getTipos();
      console.log("📦 Tipos de contrato:", response);
      return response;
    },
  });

  const contratoRaw = contratoData?.data;
  const tiposContrato: TipoContrato[] = tiposData?.data?.data || tiposData?.data || [];

  console.log("🔍 contratoRaw:", contratoRaw);
  console.log("🔍 contratoRaw?.data:", contratoRaw?.data);
  console.log("🔍 contratoRaw?.data.versoes:", contratoRaw?.data.versoes);

  // Popular formulário com dados do contrato
  useEffect(() => {
    // Tentar diferentes estruturas possíveis da resposta
    const contrato = contratoRaw?.data || contratoRaw;
    const versaoAtual = contrato?.versao_atual || contrato?.versaoAtual;
    
    console.log("📋 Contrato extraído:", contrato);
    console.log("📋 Versão atual extraída:", versaoAtual);

    if (contrato && versaoAtual) {
      const newData = {
        tipo_contrato_id: contrato.tipo_contrato_id,
        data_inicio: contrato.data_inicio,
        data_fim: contrato.data_fim || "",
        status: contrato.status,
        salario_base: versaoAtual.salario_base,
        carga_horaria: versaoAtual.carga_horaria,
        regime_trabalho: versaoAtual.regime_trabalho || "",
      };
      
      console.log("✅ Dados carregados com sucesso:", newData);
      setFormData(newData);
      setOriginalData(newData);
      setIsLoading(false);
    } else {
      console.log("❌ Dados incompletos:", { contrato, versaoAtual });
      setIsLoading(false);
    }
  }, [contratoRaw]);

  // Verificar se houve mudanças (comparação profunda)
  const hasChanges = (): boolean => {
    if (!originalData) {
      console.log("❌ originalData é null - não pode comparar");
      return false;
    }

    const changes = {
      salario_base: formData.salario_base !== originalData.salario_base,
      carga_horaria: formData.carga_horaria !== originalData.carga_horaria,
      regime_trabalho: formData.regime_trabalho !== originalData.regime_trabalho,
      status: formData.status !== originalData.status,
      data_fim: formData.data_fim !== originalData.data_fim,
    };

    console.log("📊 Comparação:", { original: originalData, current: formData, changes });

    const hasAnyChange = Object.values(changes).some(v => v === true);
    console.log("✅ Tem mudanças:", hasAnyChange);
    
    return hasAnyChange;
  };

  // Criar nova versão do contrato
  const createVersao = useMutation({
    mutationFn: (data: ContratoFormData) =>
      contratosService.createVersao(Number(contratoId), {
        salario_base: data.salario_base,
        carga_horaria: data.carga_horaria,
        regime_trabalho: data.regime_trabalho,
        data_inicio_vigencia: new Date().toISOString().split("T")[0],
      }),
    onSuccess: () => {
      toast.success("Nova versão do contrato criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["contrato", contratoId] });
      queryClient.invalidateQueries({ queryKey: ["contrato-versoes", contratoId] });
      refetchContrato();
      navigate(`/contratos/${contratoId}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erro ao criar nova versão";
      toast.error(message);
      console.error("Erro ao criar versão:", error);
    },
  });

  // Atualizar apenas campos não versionados
  const updateContrato = useMutation({
    mutationFn: (data: ContratoFormData) => {
      const updateData: any = {};
      
      if (data.status !== originalData?.status) {
        updateData.status = data.status;
      }
      if (data.data_fim !== originalData?.data_fim) {
        updateData.data_fim = data.data_fim || null;
      }
      
      console.log("📤 Atualizando contrato com:", updateData);
      return contratosService.update(Number(contratoId), updateData);
    },
    onSuccess: () => {
      const hasVersionChanges = 
        formData.salario_base !== originalData?.salario_base ||
        formData.carga_horaria !== originalData?.carga_horaria ||
        formData.regime_trabalho !== originalData?.regime_trabalho;
      
      if (hasVersionChanges) {
        createVersao.mutate(formData);
      } else {
        toast.success("Contrato atualizado com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["contrato", contratoId] });
        navigate(`/contratos/${contratoId}`);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erro ao atualizar contrato";
      toast.error(message);
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

    if (!hasChanges()) {
      toast.info("Nenhuma alteração detectada. Modifique algum campo para salvar.");
      return;
    }

    await updateContrato.mutateAsync(formData);
  };

  const resetForm = () => {
    if (originalData) {
      setFormData(originalData);
      toast.info("Formulário resetado para os valores originais");
    }
  };

  const handleRestore = async (versaoId: number) => {
    if (window.confirm("Deseja restaurar esta versão? Isso criará uma nova versão com os dados selecionados.")) {
      try {
        const response = await contratosService.getVersao(Number(contratoId), versaoId);
        const versao = response.data.data;

        setFormData({
          ...formData,
          salario_base: versao.salario_base,
          carga_horaria: versao.carga_horaria,
          regime_trabalho: versao.regime_trabalho || "",
        });
        
        toast.success("Dados da versão carregados. Clique em 'Criar Nova Versão' para salvar.");
      } catch (error) {
        toast.error("Erro ao carregar versão");
      }
    }
  };

  if (loadingContrato || loadingTipos || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!originalData) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-gray-500">Erro ao carregar dados do contrato</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  const hasAnyChange = hasChanges();

  return (
    <>
      <PageMeta
        title={`Editar Contrato | Sistema de RH`}
        description="Editar contrato do funcionário"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              to={`/funcionarios/${contratoRaw?.funcionario_id || contratoRaw?.data?.funcionario_id}/contratos`}
              className="text-sm text-primary hover:underline"
            >
              ← Voltar para contratos
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">
              Editar Contrato
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetForm} disabled={!hasAnyChange}>
              <ArrowPathIcon className="mr-2 h-5 w-5" />
              Resetar
            </Button>
            <Button variant="outline" onClick={() => navigate(`/contratos/${contratoId}`)}>
              <ChevronLeftIcon className="mr-2 h-5 w-5" />
              Cancelar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ComponentCard title="Detalhes do Contrato">
              <form onSubmit={handleSubmit}>
                <ContractForm
                  data={formData}
                  onChange={(p) => setFormData((prev) => ({ ...prev, ...p }))}
                  tiposContrato={tiposContrato}
                  errors={errors}
                  isLoading={updateContrato.isPending || createVersao.isPending}
                  isEdit={true}
                />

                {hasAnyChange && (
                  <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      📝 Alterações detectadas. Salvar criará uma nova versão do contrato.
                    </p>
                  </div>
                )}

                <div className="mt-8 flex justify-end border-t border-gray-200 pt-6 dark:border-gray-800">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!hasAnyChange || updateContrato.isPending || createVersao.isPending}
                  >
                    <ArrowPathIcon className="mr-2 h-5 w-5" />
                    {updateContrato.isPending || createVersao.isPending
                      ? "Salvando..."
                      : hasAnyChange
                        ? "Criar Nova Versão"
                        : "Sem Alterações"}
                  </Button>
                </div>
              </form>
            </ComponentCard>
          </div>

          <div>
            <ComponentCard title="Histórico de Versões">
              <VersionHistory
                contratoId={Number(contratoId)}
                onRestore={handleRestore}
                canRestore={true}
              />
            </ComponentCard>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditContrato;