import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import { contratosService } from "../../services/contratos";
import { Contrato } from "./components/types";
import { PlusIcon, EyeIcon, PencilIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

type ContratoGlobal = Contrato & {
  funcionario?: { id: number; nome_completo: string; numero_mecanografico: string };
};

const ContratosAllList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["contratos-all", page, perPage, status, searchDebounced],
    queryFn: () =>
      contratosService.listAll({
        page,
        per_page: perPage,
        status: status || undefined,
        search: searchDebounced || undefined,
      }),
  });

  const contratosRaw = data?.data?.data?.data;
  console.log("contratosRaw", contratosRaw);
  const contratos: ContratoGlobal[] = Array.isArray(contratosRaw) ? contratosRaw : [];
  const meta = data?.data?.data ?? null;

  const formatDate = (date: string) => new Date(date).toLocaleDateString("pt-AO");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
    }).format(value);

  const getStatusBadge = (value: string) => {
    switch (value) {
      case "ATIVO":
        return <Badge color="success">Ativo</Badge>;
      case "INATIVO":
        return <Badge color="info">Inativo</Badge>;
      case "SUSPENSO":
        return <Badge color="warning">Suspenso</Badge>;
      case "ENCERRADO":
        return <Badge color="error">Encerrado</Badge>;
      default:
        return <Badge>{value}</Badge>;
    }
  };

  return (
    <>
      <PageMeta title="Contratos | Sistema de RH" description="Lista global de contratos" />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Contratos</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Visão global de contratos (todos os funcionários)
            </p>
          </div>
          <Link to="/contratos/novo">
            <Button className="inline-flex items-center gap-2">
              <PlusIcon className="size-5" />
              Novo Contrato
            </Button>
          </Link>
        </div>

        <ComponentCard title="Filtros">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Buscar
              </label>
              <Input
                type="text"
                placeholder="Funcionário, nº mecanográfico, tipo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
              >
                <option value="">Todos</option>
                <option value="ATIVO">Ativos</option>
                <option value="INATIVO">Inativos</option>
                <option value="SUSPENSO">Suspensos</option>
                <option value="ENCERRADO">Encerrados</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setPage(1);
                }}
                className="text-sm text-primary hover:underline dark:text-primary-400"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : isError ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-red-500">Erro ao carregar contratos</p>
            </div>
          ) : contratos.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">Nenhum contrato encontrado</p>
              <Link to="/contratos/novo" className="mt-4">
                <Button size="sm">Criar primeiro contrato</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Funcionário
                    </th>
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
                        {contrato.funcionario ? (
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">
                              {contrato.funcionario.nome_completo}
                            </p>
                            <p className="text-xs text-gray-500">
                              {contrato.funcionario.numero_mecanografico}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 dark:text-white">
                          {contrato.tipo_contrato?.nome || "-"}
                        </p>
                        {contrato.tipo_contrato?.codigo && (
                          <p className="text-xs text-gray-500">{contrato.tipo_contrato.codigo}</p>
                        )}
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
                            title="Editar"
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

          {meta && meta.last_page > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando {meta.from || 0} a {meta.to || 0} de {meta.total} registros
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-700"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm">
                  Página {page} de {meta.last_page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={page === meta.last_page}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-700"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default ContratosAllList;

