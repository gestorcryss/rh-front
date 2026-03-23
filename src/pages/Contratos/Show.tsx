import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { contratosService } from "../../services/contratos";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import VersionHistory from "./components/VersionHistory";
import {PencilIcon } from "@heroicons/react/24/outline";

const ShowContrato: React.FC = () => {
  const { contratoId } = useParams<{ contratoId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["contrato", contratoId],
    queryFn: () => contratosService.get(Number(contratoId)),
    enabled: !!contratoId,
  });

  const contrato = data?.data.data;
  console.log("Contrato carregado:", contrato);
  const versaoAtual = contrato?.versao_atual;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-AO");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ATIVO":
        return <Badge color="success">Ativo</Badge>;
      case "INATIVO":
        return <Badge color="info">Inativo</Badge>;
      case "SUSPENSO":
        return <Badge color="warning">Suspenso</Badge>;
      case "ENCERRADO":
        return <Badge color="error">Encerrado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Contrato não encontrado</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Contrato - ${contrato.tipo_contrato?.nome || "Contrato"} | Sistema de RH`}
        description="Detalhes do contrato"
      />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              to={`/funcionarios/${contrato.funcionario_id}/contratos`}
              className="text-sm text-primary hover:underline"
            >
              ← Voltar para contratos
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">
              Detalhes do Contrato
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {contrato.tipo_contrato?.nome} - {contrato.tipo_contrato?.codigo}
            </p>
          </div>
          <Link to={`/contratos/${contratoId}/editar`}>
            <Button variant="outline" className="inline-flex items-center gap-2">
              <PencilIcon className="size-5" />
              Criar Nova Versão
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Informações do Contrato */}
          <div className="lg:col-span-2">
            <ComponentCard title="Informações do Contrato">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Contrato</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {contrato.tipo_contrato?.nome}
                    </p>
                    {contrato.tipo_contrato?.descricao && (
                      <p className="text-xs text-gray-500">{contrato.tipo_contrato.descricao}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div>{getStatusBadge(contrato.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Data de Início</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {formatDate(contrato.data_inicio)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data de Fim</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {contrato.data_fim ? formatDate(contrato.data_fim) : "Sem data definida"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
                  <h3 className="mb-3 font-medium text-gray-800 dark:text-white">
                    Versão Atual
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Salário Base</p>
                      <p className="text-xl font-bold text-primary">
                        {versaoAtual ? formatCurrency(versaoAtual.salario_base) : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Carga Horária</p>
                      <p className="text-xl font-bold text-gray-800 dark:text-white">
                        {versaoAtual?.carga_horaria || "-"}h/semana
                      </p>
                    </div>
                    {versaoAtual?.regime_trabalho && (
                      <div>
                        <p className="text-sm text-gray-500">Regime de Trabalho</p>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {versaoAtual.regime_trabalho}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Vigência</p>
                      <p className="text-sm text-gray-800 dark:text-white">
                        {formatDate(versaoAtual?.data_inicio_vigencia || "")}
                        {versaoAtual?.data_fim_vigencia && ` até ${formatDate(versaoAtual.data_fim_vigencia)}`}
                        {!versaoAtual?.data_fim_vigencia && " (vigente)"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>

          {/* Histórico de Versões */}
          <div>
            <ComponentCard title="Histórico de Versões">
              <VersionHistory
                contratoId={Number(contratoId)}
                canRestore={false}
              />
            </ComponentCard>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShowContrato;