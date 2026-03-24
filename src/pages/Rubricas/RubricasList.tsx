import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { rubricasService, Rubrica } from "../../services/rubricas";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Badge from "../../components/ui/badge/Badge";
import ConfirmModal from "../../components/ui/modal/ConfirmModal";
import { PencilIcon, TrashIcon, PlusIcon, ClockIcon } from "@heroicons/react/24/outline";

// Mapeamento de tipos para cores
const tipoColors: Record<string, string> = {
  PROVENTO: "success",
  DESCONTO: "error",
  INFORMATIVO: "warning",
  BASE: "primary",
};

const tipoLabels: Record<string, string> = {
  PROVENTO: "Provento",
  DESCONTO: "Desconto",
  INFORMATIVO: "Informativo",
  BASE: "Base de Cálculo",
};

const categoriaLabels: Record<string, string> = {
  REMUNERATIVO: "Remunerativo",
  BENEFÍCIO: "Benefício",
  VARIÁVEL: "Variável",
  OBRIGATORIO: "Obrigatório",
};

const RubricasList: React.FC = () => {
  // Estados
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [tipo, setTipo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ativo, setAtivo] = useState("");
  const [perPage] = useState(15);

  // Modal de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rubricaToDelete, setRubricaToDelete] = useState<{ id: number; nome: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Buscar rubricas
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["rubricas", page, searchDebounced, tipo, categoria, ativo],
    queryFn: () =>
      rubricasService.list({
        page,
        per_page: perPage,
        search: searchDebounced || undefined,
        tipo: tipo || undefined,
        categoria: categoria || undefined,
        ativo: ativo === "" ? undefined : ativo === "true",
      }),
  });

  // Extrair dados
  const rubricas = data?.data?.data?.data || [];
  const meta = data?.data?.data;

  const openDeleteModal = (id: number, nome: string) => {
    setRubricaToDelete({ id, nome });
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!rubricaToDelete) return;

    setIsDeleting(true);
    try {
      await rubricasService.delete(rubricaToDelete.id);
      toast.success(`Rubrica "${rubricaToDelete.nome}" excluída com sucesso!`);
      refetch();
      setDeleteModalOpen(false);
      setRubricaToDelete(null);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Erro ao excluir rubrica";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setTipo("");
    setCategoria("");
    setAtivo("");
    setPage(1);
  };

  const getStatusBadge = (ativo: boolean) => {
    return ativo ? <Badge color="success">Ativo</Badge> : <Badge color="error">Inativo</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    const badgeColor = (tipoColors[tipo] || "light") as
      | "primary"
      | "success"
      | "error"
      | "warning"
      | "light";
    return <Badge color={badgeColor}>{tipoLabels[tipo] || tipo}</Badge>;
  };

  return (
    <>
      <PageMeta
        title="Rubricas | Sistema de RH e Folha"
        description="Gestão de rubricas salariais"
      />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Rubricas Salariais
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gerencie as rubricas que compõem a folha de pagamento
            </p>
          </div>
          <Link to="/rubricas/novo">
            <Button className="inline-flex items-center gap-2">
              <PlusIcon className="size-5" />
              Nova Rubrica
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <ComponentCard title="Filtros">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Busca */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Buscar
              </label>
              <Input
                type="text"
                placeholder="Código ou nome"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
              >
                <option value="">Todos</option>
                <option value="PROVENTO">Provento</option>
                <option value="DESCONTO">Desconto</option>
                <option value="INFORMATIVO">Informativo</option>
                <option value="BASE">Base de Cálculo</option>
              </select>
            </div>

            {/* Categoria */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
              >
                <option value="">Todas</option>
                <option value="REMUNERATIVO">Remunerativo</option>
                <option value="BENEFÍCIO">Benefício</option>
                <option value="VARIÁVEL">Variável</option>
                <option value="OBRIGATORIO">Obrigatório</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Status
              </label>
              <select
                value={ativo}
                onChange={(e) => {
                  setAtivo(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
              >
                <option value="">Todos</option>
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="text-sm text-primary hover:underline dark:text-primary-400"
            >
              Limpar filtros
            </button>
          </div>
        </ComponentCard>

        {/* Tabela de rubricas */}
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : isError ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-red-500">Erro ao carregar rubricas</p>
            </div>
          ) : rubricas.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma rubrica encontrada
              </p>
              <Link to="/rubricas/novo" className="mt-4">
                <Button size="sm">Cadastrar primeira rubrica</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Código
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Método
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
                  {rubricas.map((rubrica: Rubrica) => (
                    <tr
                      key={rubrica.id}
                      className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                    >
                      <td className="px-4 py-3 font-mono text-sm font-medium text-primary">
                        {rubrica.codigo}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 dark:text-white">
                          {rubrica.nome}
                        </p>
                        {rubrica.versao_ativa && (
                          <p className="text-xs text-gray-500">
                            Versão ativa: {new Date(rubrica.versao_ativa.data_inicio_vigencia).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">{getTipoBadge(rubrica.tipo)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {categoriaLabels[rubrica.categoria] || rubrica.categoria || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {rubrica.versao_ativa?.metodo_calculo || "-"}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(rubrica.ativo)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/rubricas/${rubrica.id}/versoes`}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-info dark:text-gray-400 dark:hover:bg-gray-800"
                            title="Versões"
                          >
                            <ClockIcon className="size-5" />
                          </Link>
                          <Link
                            to={`/rubricas/${rubrica.id}/editar`}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-warning dark:text-gray-400 dark:hover:bg-gray-800"
                            title="Editar"
                          >
                            <PencilIcon className="size-5" />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(rubrica.id, rubrica.nome)}
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

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRubricaToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Excluir Rubrica"
        message={`Tem certeza que deseja excluir a rubrica "${rubricaToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmVariant="error"
        isLoading={isDeleting}
      />
    </>
  );
};

export default RubricasList;