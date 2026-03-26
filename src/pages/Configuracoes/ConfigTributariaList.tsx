import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { configTributariaService, ConfigTributaria } from "../../services/configTributaria";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Badge from "../../components/ui/badge/Badge";
import ConfirmModal from "../../components/ui/modal/ConfirmModal";
import Label from "../../components/form/Label";
import { PencilIcon, TrashIcon, PlusIcon, ScaleIcon } from "@heroicons/react/24/outline";
import Modal from "../../components/ui/modal";
import TabelaIRT from "../Rubricas/TabelaIRT";

interface ConfigCompleta extends ConfigTributaria {
  linhas_count?: number;
}

const ConfigTributariaList: React.FC = () => {

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tabelaModalOpen, setTabelaModalOpen] = useState(false);
  const [editando, setEditando] = useState<ConfigCompleta | null>(null);
  const [configToDelete, setConfigToDelete] = useState<{ id: number; nome: string } | null>(null);
  const [configSelecionada, setConfigSelecionada] = useState<ConfigCompleta | null>(null);

  // Formulário
  const [formData, setFormData] = useState({
    regime_irt: "",
    percentual_inss: 3.0,
    isento_irt: false,
    dependentes: 0,
    data_inicio_vigencia: new Date().toISOString().split("T")[0],
    data_fim_vigencia: null as string | null,
  });

  // Buscar configurações
  const { data, isLoading } = useQuery({
    queryKey: ["config-tributaria", page],
    queryFn: () => configTributariaService.list({ page, per_page: 15, global: true }),
  });

  const configuracoes = data?.data?.data?.data || [];
  const meta = data?.data?.data;

  // Mutation para criar/atualizar
  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (editando) {
        return configTributariaService.update(editando.id, data);
      }
      return configTributariaService.create(data);
    },
    onSuccess: () => {
      toast.success(editando ? "Configuração atualizada!" : "Configuração criada!");
      queryClient.invalidateQueries({ queryKey: ["config-tributaria"] });
      setModalOpen(false);
      resetForm();
      setEditando(null);
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Erro ao salvar";
      toast.error(message);
    },
  });

  // Mutation para excluir
  const deleteMutation = useMutation({
    mutationFn: (id: number) => configTributariaService.delete(id),
    onSuccess: () => {
      toast.success("Configuração excluída!");
      queryClient.invalidateQueries({ queryKey: ["config-tributaria"] });
      setDeleteModalOpen(false);
      setConfigToDelete(null);
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Erro ao excluir";
      toast.error(message);
    },
  });

  const resetForm = () => {
    setFormData({
      regime_irt: "",
      percentual_inss: 3.0,
      isento_irt: false,
      dependentes: 0,
      data_inicio_vigencia: new Date().toISOString().split("T")[0],
      data_fim_vigencia: null,
    });
  };

  const handleEdit = (config: ConfigCompleta) => {
    setEditando(config);
    setFormData({
      regime_irt: config.regime_irt,
      percentual_inss: config.percentual_inss,
      isento_irt: config.isento_irt,
      dependentes: config.dependentes,
      data_inicio_vigencia: config.data_inicio_vigencia,
      data_fim_vigencia: config.data_fim_vigencia,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const openDeleteModal = (config: ConfigCompleta) => {
    setConfigToDelete({ id: config.id, nome: config.regime_irt });
    setDeleteModalOpen(true);
  };

  const openTabelaModal = (config: ConfigCompleta) => {
    setConfigSelecionada(config);
    setTabelaModalOpen(true);
  };

  const getStatusBadge = (config: ConfigCompleta) => {
    const hoje = new Date().toISOString().split("T")[0];
    const inicio = config.data_inicio_vigencia;
    const fim = config.data_fim_vigencia;

    if (inicio <= hoje && (!fim || fim >= hoje)) {
      return <Badge color="success">Vigente</Badge>;
    }
    if (fim && fim < hoje) {
      return <Badge color="secondary">Expirada</Badge>;
    }
    if (inicio > hoje) {
      return <Badge color="warning">Programada</Badge>;
    }
    return <Badge>Inativa</Badge>;
  };

  return (
    <>
      <PageMeta
        title="Configurações Tributárias | Sistema RH"
        description="Gestão de regimes fiscais e tabelas de IRT"
      />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Configurações Tributárias
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gerencie os regimes fiscais e as tabelas de IRT
            </p>
          </div>
          <Button
            onClick={() => {
              setEditando(null);
              resetForm();
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2"
          >
            <PlusIcon className="size-5" />
            Novo Regime Fiscal
          </Button>
        </div>

        {/* Tabela */}
        <ComponentCard title="Regimes Fiscais">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : configuracoes.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center">
              <p className="text-gray-500">Nenhuma configuração tributária encontrada</p>
              <Button onClick={() => setModalOpen(true)} className="mt-4">
                Criar primeiro regime
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Regime
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      INSS (%)
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Isento IRT
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Faixas IRT
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
                  {configuracoes.map((config: ConfigCompleta) => (
                    <tr
                      key={config.id}
                      className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                        {config.regime_irt}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {config.percentual_inss}%
                      </td>
                      <td className="px-4 py-3">
                        {config.isento_irt ? (
                          <Badge color="success">Sim</Badge>
                        ) : (
                          <Badge color="error">Não</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openTabelaModal(config)}
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <ScaleIcon className="size-4" />
                          {config.linhas_count || 0} faixas
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(config.data_inicio_vigencia).toLocaleDateString()}
                        {config.data_fim_vigencia && (
                          <span className="text-gray-400">
                            {" → "}
                            {new Date(config.data_fim_vigencia).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(config)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(config)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-warning"
                            title="Editar"
                          >
                            <PencilIcon className="size-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(config)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-error"
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
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                Mostrando {meta.from || 0} a {meta.to || 0} de {meta.total} registros
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm">
                  Página {page} de {meta.last_page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={page === meta.last_page}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>

      {/* Modal de Cadastro/Edição */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditando(null);
          resetForm();
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="regime_irt">Nome do Regime *</Label>
              <Input
                id="regime_irt"
                placeholder="Ex: GERAL_2024, REDUZIDO_2025"
                value={formData.regime_irt}
                onChange={(e) => setFormData({ ...formData, regime_irt: e.target.value.toUpperCase() })}
                
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="percentual_inss">Percentual INSS (%) *</Label>
                <Input
                  id="percentual_inss"
                  type="number"
                  value={formData.percentual_inss}
                  onChange={(e) => setFormData({ ...formData, percentual_inss: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="dependentes">Dependentes Padrão</Label>
                <Input
                  id="dependentes"
                  type="number"
                  value={formData.dependentes}
                  onChange={(e) => setFormData({ ...formData, dependentes: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Isenção de IRT</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isento_irt"
                  checked={formData.isento_irt}
                  onChange={(e) => setFormData({ ...formData, isento_irt: e.target.checked })}
                  className="h-4 w-4 rounded text-primary"
                />
                <label htmlFor="isento_irt" className="text-sm text-gray-700">
                  Regime isento de IRT (taxa 0%)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_inicio_vigencia">Início da Vigência *</Label>
                <Input
                  id="data_inicio_vigencia"
                  type="date"
                  value={formData.data_inicio_vigencia}
                  onChange={(e) => setFormData({ ...formData, data_inicio_vigencia: e.target.value })}
                  
                />
              </div>
              <div>
                <Label htmlFor="data_fim_vigencia">Fim da Vigência</Label>
                <Input
                  id="data_fim_vigencia"
                  type="date"
                  value={formData.data_fim_vigencia ?? ""}
                  onChange={(e) => setFormData({ ...formData, data_fim_vigencia: e.target.value || null })}
                />
                <p className="mt-1 text-xs text-gray-500">Deixe vazio para vigência indefinida</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={mutation.isPending}>
              {editando ? "Atualizar" : "Criar Regime"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal da Tabela de IRT */}
      <Modal
        isOpen={tabelaModalOpen}
        onClose={() => setTabelaModalOpen(false)}
      >
        {configSelecionada && (
          <TabelaIRT configId={configSelecionada.id} />
        )}
      </Modal>

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => configToDelete && deleteMutation.mutate(configToDelete.id)}
        title="Excluir Regime Fiscal"
        message={`Tem certeza que deseja excluir o regime "${configToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmVariant="error"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

export default ConfigTributariaList;