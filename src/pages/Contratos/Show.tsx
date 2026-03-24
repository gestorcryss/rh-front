import { useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { contratosService } from "../../services/contratos";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import VersionHistory from "./components/VersionHistory";
import Modal from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { toast } from "react-toastify";
import { PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

const ShowContrato: React.FC = () => {
  const { contratoId } = useParams<{ contratoId: string }>();
  const queryClient = useQueryClient();
  const [encerrarOpen, setEncerrarOpen] = useState(false);
  const [dataFimVigencia, setDataFimVigencia] = useState(new Date().toISOString().slice(0, 10));

  const { data, isLoading } = useQuery({
    queryKey: ["contrato", contratoId],
    queryFn: () => contratosService.get(Number(contratoId)),
    enabled: !!contratoId,
  });

  const contrato = data?.data?.data;
  console.log("Contrato carregado:", contrato);

  // IMPORTANT: hooks must be called unconditionally (before any early returns).
  const canEncerrar = !!contrato && !contrato.data_fim && contrato.status !== "ENCERRADO";

  const encerrarContrato = useMutation({
    mutationFn: (payload: { data_fim_vigencia: string }) =>
      contratosService.encerrar(Number(contratoId), payload),
    onSuccess: () => {
      setEncerrarOpen(false);
      toast.success("Contrato encerrado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["contrato", contratoId] });
    },
    onError: (error: unknown) => {
      const apiError = axios.isAxiosError<ApiErrorResponse>(error) ? error : null;
      const message = apiError?.response?.data?.message || "Erro ao encerrar contrato";
      toast.error(message);
    },
  });

  const versaoAtual = useMemo(() => {
    const versoes = contrato?.versoes ?? [];
    return (
      contrato?.versao_atual ??
      versoes.find((v: { data_fim_vigencia: string | null }) => v.data_fim_vigencia === null) ??
      versoes.slice().sort((a: { id: number }, b: { id: number }) => b.id - a.id)[0]
    );
  }, [contrato]);

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
          {canEncerrar && (
            <Button
              variant="error"
              className="ml-2"
              onClick={() => setEncerrarOpen(true)}
            >
              Encerrar Contrato
            </Button>
          )}
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

      <Modal isOpen={encerrarOpen} onClose={() => setEncerrarOpen(false)}>
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Encerrar Contrato
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Isto irá definir o fim do contrato e encerrar a versão ativa, conforme o backend.
              </p>
            </div>
            <button
              onClick={() => setEncerrarOpen(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Fechar"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Data fim vigência</Label>
              <Input
                type="date"
                value={dataFimVigencia}
                min={String(contrato.data_inicio).slice(0, 10)}
                onChange={(e) => setDataFimVigencia(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Deve ser maior ou igual à data de início do contrato.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEncerrarOpen(false)} disabled={encerrarContrato.isPending}>
                Cancelar
              </Button>
              <Button
                variant="error"
                onClick={() => encerrarContrato.mutate({ data_fim_vigencia: dataFimVigencia })}
                disabled={encerrarContrato.isPending || !dataFimVigencia}
              >
                {encerrarContrato.isPending ? "Encerrando..." : "Confirmar Encerramento"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ShowContrato;