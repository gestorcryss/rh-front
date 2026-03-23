import { useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { contratosService } from "../../services/contratos";
import { funcionariosService } from "../../services/funcionarios";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { PlusIcon, EyeIcon, PencilIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { Contrato } from "./components/types";

const ContratosList: React.FC = () => {
  const { funcionarioId } = useParams<{ funcionarioId: string }>();
  const [status, setStatus] = useState("");

  // Buscar dados do funcionário
  const { data: funcionarioData } = useQuery({
    queryKey: ["funcionario", funcionarioId],
    queryFn: () => funcionariosService.get(Number(funcionarioId)),
    enabled: !!funcionarioId,
  });

  // Buscar contratos
  const { data, isLoading } = useQuery({
    queryKey: ["contratos", funcionarioId, status],
    queryFn: () =>
      contratosService.list(Number(funcionarioId), { status: status || undefined }),
    enabled: !!funcionarioId,
  });

  const contratos: Contrato[] = data?.data?.data.data || [];
  const funcionario = funcionarioData?.data.data;

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
        title={`Contratos - ${funcionario?.nome_completo || "Funcionário"} | Sistema de RH`}
        description="Lista de contratos do funcionário"
      />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to={`/funcionarios/${funcionarioId}`}
              className="text-sm text-primary hover:underline"
            >
              ← Voltar para funcionário
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">
              Contratos
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {funcionario?.nome_completo} | {funcionario?.numero_mecanografico}
            </p>
          </div>
          <Link to={`/funcionarios/${funcionarioId}/contratos/novo`}>
            <Button className="inline-flex items-center gap-2">
              <PlusIcon className="size-5" />
              Novo Contrato
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <ComponentCard title="Filtros">
          <div className="flex flex-wrap gap-4">
            <div className="w-64">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
              >
                <option value="">Todos</option>
                <option value="ATIVO">Ativos</option>
                <option value="INATIVO">Inativos</option>
                <option value="SUSPENSO">Suspensos</option>
                <option value="ENCERRADO">Encerrados</option>
              </select>
            </div>
          </div>
        </ComponentCard>

        {/* Tabela de contratos */}
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : contratos.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">Nenhum contrato encontrado</p>
              <Link to={`/funcionarios/${funcionarioId}/contratos/novo`} className="mt-4">
                <Button size="sm">Criar primeiro contrato</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Tipo de Contrato
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Vigência
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Salário Base
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Carga Horária
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Ações
                    </th>
                   </tr>
                </thead>
                <tbody>
                  {contratos.map((contrato) => (
                    <tr
                      key={contrato.id}
                      className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {contrato.tipo_contrato?.nome || "-"}
                          </p>
                          {contrato.tipo_contrato?.codigo && (
                            <p className="text-xs text-gray-500">{contrato.tipo_contrato.codigo}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        <div>
                          <p>Início: {formatDate(contrato.data_inicio)}</p>
                          {contrato.data_fim && (
                            <p className="text-xs text-gray-500">Fim: {formatDate(contrato.data_fim)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {contrato.versao_atual ? formatCurrency(contrato.versao_atual.salario_base) : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {contrato.versao_atual?.carga_horaria || "-"}h/semana
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(contrato.status)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/contratos/${contrato.id}`}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800"
                            title="Visualizar"
                          >
                            <EyeIcon className="size-5" />
                          </Link>
                          <Link
                            to={`/contratos/${contrato.id}/editar`}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-warning dark:text-gray-400 dark:hover:bg-gray-800"
                            title="Editar (criar nova versão)"
                          >
                            <PencilIcon className="size-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default ContratosList;