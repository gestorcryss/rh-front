import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { funcionariosService } from "../../services/funcionarios";
import { departamentosService } from "../../services/departamentos";
import { funcoesService } from "../../services/funcoes";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Badge from "../../components/ui/badge/Badge";
import ConfirmModal from "../../components/ui/modal/ConfirmModal";
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from "@heroicons/react/24/outline";

interface Funcionario {
  id: number;
  numero_mecanografico: string;
  nome_completo: string;
  status: "ATIVO" | "INATIVO" | "SUSPENSO";
  departamento_id?: number;
  funcao_id?: number;
  centro_custo_id?: number;
  departamento?: { id: number; nome: string };
  funcao?: { id: number; nome: string };
  dados_pessoais_atuais?: {
    genero?: string;
    nif?: string;
    data_nascimento?: string;
  };
  created_at: string;
}

interface Departamento {
  id: number;
  codigo: string;
  nome: string;
}

interface Funcao {
  id: number;
  codigo: string;
  nome: string;
  nivel?: number;
}

const FuncionariosList: React.FC = () => {
  // Estados para filtros
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [funcaoId, setFuncaoId] = useState("");
  const [perPage] = useState(10);

  // Estados para modal de confirmação
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [funcionarioToDelete, setFuncionarioToDelete] = useState<{ id: number; nome: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Buscar departamentos para o filtro
  const { data: departamentosData, isLoading: loadingDeptos } = useQuery({
    queryKey: ["departamentos"],
    queryFn: () => departamentosService.list(),
  });

  // Buscar funções para o filtro
  const { data: funcoesData, isLoading: loadingFuncoes } = useQuery({
    queryKey: ["funcoes"],
    queryFn: () => funcoesService.list(),
  });

  // Buscar funcionários com filtros
  const {
    data: funcionariosData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["funcionarios", page, searchDebounced, status, departamentoId, funcaoId],
    queryFn: () =>
      funcionariosService.list({
        page,
        per_page: perPage,
        search: searchDebounced || undefined,
        status: status || undefined,
        departamento_id: departamentoId ? Number(departamentoId) : undefined,
        funcao_id: funcaoId ? Number(funcaoId) : undefined,
      }),
  });

  // Debug: log da estrutura dos dados
  console.log("📦 funcionariosData:", funcionariosData);

  // Extrair dados corretamente
  const funcionariosRaw = funcionariosData?.data?.data?.data;
  const funcionarios = Array.isArray(funcionariosRaw) ? funcionariosRaw : [];
  const meta = funcionariosData?.data?.data ?? null;
  
  const departamentos = departamentosData?.data?.data.data || departamentosData?.data || [];
  const funcoes = funcoesData?.data?.data.data || funcoesData?.data.data || [];

  const openDeleteModal = (id: number, nome: string) => {
    setFuncionarioToDelete({ id, nome });
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!funcionarioToDelete) return;

    setIsDeleting(true);
    try {
      await funcionariosService.delete(funcionarioToDelete.id);
      toast.success(`Funcionário ${funcionarioToDelete.nome} excluído com sucesso!`);
      refetch();
      setDeleteModalOpen(false);
      setFuncionarioToDelete(null);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Erro ao excluir funcionário";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ATIVO":
        return <Badge color="success">Ativo</Badge>;
      case "INATIVO":
        return <Badge color="error">Inativo</Badge>;
      case "SUSPENSO":
        return <Badge color="warning">Suspenso</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setDepartamentoId("");
    setFuncaoId("");
    setPage(1);
  };

  return (
    <>
      <PageMeta
        title="Funcionários | Sistema de RH e Folha de Pagamento"
        description="Lista de funcionários cadastrados no sistema"
      />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Funcionários
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gerencie todos os funcionários da empresa
            </p>
          </div>
          <Link to="/funcionarios/novo">
            <Button className="inline-flex items-center gap-2">
              <PlusIcon className="size-5" />
              Novo Funcionário
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <ComponentCard title="Filtros">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Busca por nome/número */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Buscar
              </label>
              <Input
                type="text"
                placeholder="Nome ou Nº Mecanográfico"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Status */}
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
              </select>
            </div>

            {/* Departamento */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Departamento
              </label>
              <select
                value={departamentoId}
                onChange={(e) => {
                  setDepartamentoId(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
                disabled={loadingDeptos}
              >
                <option value="">Todos</option>
                {Array.isArray(departamentos) && departamentos.map((depto: Departamento) => (
                  <option key={depto.id} value={depto.id}>
                    {depto.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Função/Cargo */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Função/Cargo
              </label>
              <select
                value={funcaoId}
                onChange={(e) => {
                  setFuncaoId(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
                disabled={loadingFuncoes}
              >
                <option value="">Todos</option>
                {Array.isArray(funcoes) && funcoes.map((funcao: Funcao) => (
                  <option key={funcao.id} value={funcao.id}>
                    {funcao.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botão de limpar filtros */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="text-sm text-primary hover:underline dark:text-primary-400"
            >
              Limpar filtros
            </button>
          </div>
        </ComponentCard>

        {/* Tabela de funcionários */}
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : isError ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-red-500">Erro ao carregar funcionários</p>
            </div>
          ) : funcionarios.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum funcionário encontrado
              </p>
              <Link to="/funcionarios/novo" className="mt-4">
                <Button size="sm">Cadastrar primeiro funcionário</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Nº Mecanográfico
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Nome Completo
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Departamento
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Função
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
                  {funcionarios.map((funcionario: Funcionario) => (
                    <tr
                      key={funcionario.id}
                      className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {funcionario.numero_mecanografico}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {funcionario.nome_completo}
                          </p>
                          {funcionario.dados_pessoais_atuais?.nif && (
                            <p className="text-xs text-gray-500">
                              NIF: {funcionario.dados_pessoais_atuais.nif}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {funcionario.departamento?.nome || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {funcionario.funcao?.nome || "-"}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(funcionario.status)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/funcionarios/${funcionario.id}`}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800"
                            title="Visualizar"
                          >
                            <EyeIcon className="size-5" />
                          </Link>
                          <Link
                            to={`/funcionarios/${funcionario.id}/editar`}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-warning dark:text-gray-400 dark:hover:bg-gray-800"
                            title="Editar"
                          >
                            <PencilIcon className="size-5" />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(funcionario.id, funcionario.nome_completo)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-error dark:text-gray-400 dark:hover:bg-gray-800"
                            title="Excluir"
                          >
                            <TrashIcon className="size-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
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

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFuncionarioToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Excluir Funcionário"
        message={`Tem certeza que deseja excluir o funcionário "${funcionarioToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmVariant="error"
        isLoading={isDeleting}
        z-index={99999}
      />
    </>
  );
};

export default FuncionariosList;