import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { rubricasService, RubricaVersao } from "../../services/rubricas";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import ConfirmModal from "../../components/ui/modal/ConfirmModal";
import Modal from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { ChevronLeftIcon, PlusIcon, ScaleIcon, TrashIcon } from "@heroicons/react/24/outline";

const RubricaVersoes: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const rubricaId = Number(id);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVersao, setSelectedVersao] = useState<RubricaVersao | null>(null);

  // Formulário de nova versão
  const [formData, setFormData] = useState({
    rubrica_id: rubricaId,
    afecta_ferias: true,
    metodo_calculo: "FIXO" as RubricaVersao["metodo_calculo"],
    formula_calculo: "",
    data_inicio_vigencia: new Date().toISOString().split("T")[0],
  });

  // Buscar dados da rubrica
  const { data: rubricaData } = useQuery({
    queryKey: ["rubrica", rubricaId],
    queryFn: () => rubricasService.getById(rubricaId),
    enabled: Number.isFinite(rubricaId) && rubricaId > 0,
  });

  // Buscar versões
  const { data, isLoading } = useQuery({
    queryKey: ["rubrica-versoes", rubricaId, page],
    queryFn: () => rubricasService.getById(rubricaId),
    enabled: Number.isFinite(rubricaId) && rubricaId > 0,
  });

  const rubrica = rubricaData?.data?.data;
  const allVersoes = data?.data?.data?.versoes || [];
  const perPage = 15;
  const total = allVersoes.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, lastPage);
  const start = (safePage - 1) * perPage;
  const versoes = allVersoes.slice(start, start + perPage);
  const meta =
    total > 0
      ? {
        from: start + 1,
        to: Math.min(start + perPage, total),
        total,
        last_page: lastPage,
      }
      : null;

  // Mutation para criar versão
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => rubricasService.createVersao(data),
    onSuccess: () => {
      toast.success("Nova versão criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["rubrica-versoes", rubricaId] });
      queryClient.invalidateQueries({ queryKey: ["rubrica", rubricaId] });
      setModalOpen(false);
      resetForm();
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Erro ao criar versão";
      toast.error(message);
    },
  });

  const resetForm = () => {
    setFormData({
      rubrica_id: rubricaId,
      afecta_ferias: true,
      metodo_calculo: "FIXO",
      formula_calculo: "",
      data_inicio_vigencia: new Date().toISOString().split("T")[0],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const openDeleteModal = (versao: RubricaVersao) => {
    setSelectedVersao(versao);
    setDeleteModalOpen(true);
  };

  const getMetodoLabel = (metodo: string) => {
    const labels: Record<string, string> = {
      FIXO: "Fixo",
      PERCENTUAL: "Percentual",
      HORA: "Hora",
      TABELA: "Tabela",
      FORMULA: "Fórmula",
    };
    return labels[metodo] || metodo;
  };

  const isVersaoAtual = (versao: RubricaVersao) => {
    return versao.data_fim_vigencia === null;
  };

  return (
    <>
      {!Number.isFinite(rubricaId) || rubricaId <= 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <p className="text-sm text-red-500">ID de rubrica inválido.</p>
          <Button variant="outline" onClick={() => navigate("/rubricas")}>
            Voltar para Rubricas
          </Button>
        </div>
      ) : (
        <>
          <PageMeta
            title={`Versões - ${rubrica?.nome || "Rubrica"}`}
            description="Histórico de versões da rubrica"
          />

          <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/rubricas")}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <ChevronLeftIcon className="size-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    {rubrica?.nome || "Carregando..."}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Código: {rubrica?.codigo} | Tipo: {rubrica?.tipo}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2"
              >
                <PlusIcon className="size-5" />
                Nova Versão
              </Button>
            </div>

            {/* Tabela de versões */}
            <ComponentCard title="Histórico de Versões">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : versoes.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhuma versão cadastrada
                  </p>
                  <Button
                    onClick={() => setModalOpen(true)}
                    variant="outline"
                    className="mt-4"
                  >
                    Criar primeira versão
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Método
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Afeta Férias
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Vigência
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
                      {versoes.map((versao: RubricaVersao) => (
                        <tr
                          key={versao.id}
                          className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                        >
                          <td className="px-4 py-3 font-mono text-sm text-gray-700 dark:text-gray-300">
                            #{versao.id}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-800 dark:text-white">
                              {getMetodoLabel(versao.metodo_calculo)}
                            </span>
                            {versao.metodo_calculo === "FORMULA" && versao.formula_calculo && (
                              <p className="text-xs text-gray-500 truncate max-w-xs">
                                {versao.formula_calculo}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {versao.afecta_ferias ? (
                              <Badge color="success">Sim</Badge>
                            ) : (
                              <Badge color="error">Não</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {new Date(versao.data_inicio_vigencia).toLocaleDateString()}
                            {versao.data_fim_vigencia && (
                              <span className="text-gray-400">
                                {" → "}
                                {new Date(versao.data_fim_vigencia).toLocaleDateString()}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isVersaoAtual(versao) ? (
                              <Badge color="success">Atual</Badge>
                            ) : (
                              <Badge color="light">Arquivada</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDeleteModal(versao)}
                              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-error dark:text-gray-400 dark:hover:bg-gray-800"
                              title="Exclusão não disponível"
                              disabled
                            >
                              <TrashIcon className="size-5" />
                            </button>
                            <Link
                              to={`/rubricas/${rubricaId}/versoes/${versao.id}/regras-fiscais`}
                              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-info dark:text-gray-400 dark:hover:bg-gray-800"
                              title="Regras Fiscais"
                            >
                              <ScaleIcon className="size-5" />
                            </Link>
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

          {/* Modal de Nova Versão */}
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
            <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">Nova Versão</h3>
            </div>
            <div className="p-5">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="metodo_calculo">Método de Cálculo *</Label>
                    <select
                      id="metodo_calculo"
                      value={formData.metodo_calculo}
                      onChange={(e) => setFormData({ ...formData, metodo_calculo: e.target.value as RubricaVersao["metodo_calculo"] })}
                      className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
                      required
                    >
                      <option value="FIXO">Fixo (valor em Kz)</option>
                      <option value="PERCENTUAL">Percentual do salário base</option>
                      <option value="HORA">Baseado em horas trabalhadas</option>
                      <option value="TABELA">Tabela progressiva</option>
                      <option value="FORMULA">Fórmula personalizada</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="afecta_ferias">Afeta Férias</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="afecta_ferias"
                        checked={formData.afecta_ferias}
                        onChange={(e) => setFormData({ ...formData, afecta_ferias: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="afecta_ferias" className="text-sm text-gray-700 dark:text-gray-300">
                        Esta rubrica impacta o cálculo de férias
                      </label>
                    </div>
                  </div>

                  {formData.metodo_calculo === "FORMULA" && (
                    <div>
                      <Label htmlFor="formula_calculo">Fórmula de Cálculo</Label>
                      <textarea
                        id="formula_calculo"
                        rows={3}
                        value={formData.formula_calculo}
                        onChange={(e) => setFormData({ ...formData, formula_calculo: e.target.value })}
                        placeholder="Ex: (salario_base * 0.1) + 5000"
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="data_inicio_vigencia">Data de Início da Vigência *</Label>
                    <Input
                      id="data_inicio_vigencia"
                      type="date"
                      value={formData.data_inicio_vigencia}
                      onChange={(e) => setFormData({ ...formData, data_inicio_vigencia: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    isLoading={createMutation.isPending}
                    disabled={createMutation.isPending}
                  >
                    Criar Versão
                  </Button>
                </div>
              </form>
            </div>
          </Modal>

          {/* Modal de confirmação de exclusão */}
          <ConfirmModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedVersao(null);
            }}
            onConfirm={() => {
              setDeleteModalOpen(false);
              setSelectedVersao(null);
              toast.info("A API atual não possui endpoint para excluir versões.");
            }}
            title="Exclusão indisponível"
            message={`A versão #${selectedVersao?.id} não pode ser excluída por enquanto, pois não existe endpoint no backend para esta ação.`}
            confirmText="Entendi"
            cancelText="Fechar"
          />
        </>
      )}
    </>
  );
};

export default RubricaVersoes;