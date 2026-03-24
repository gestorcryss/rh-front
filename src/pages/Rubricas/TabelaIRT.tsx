import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { configTributariaService, TabelaIRT } from "../../services/configTributaria";

import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import ConfirmModal from "../../components/ui/modal/ConfirmModal";

interface TabelaIRTProps {
  configId: number;
}

const TabelaIRT: React.FC<TabelaIRTProps> = ({ configId }) => {
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linhaToDelete, setLinhaToDelete] = useState<{ id: number; descricao: string } | null>(null);
  const [formData, setFormData] = useState({
    limite_inferior: 0,
    limite_superior: null as number | null,
    parcela_fixa: 0,
    taxa_percentual: 0,
  });

  // Buscar linhas da tabela
  const { data, isLoading } = useQuery({
    queryKey: ["tabela-irt", configId],
    queryFn: () => configTributariaService.getLinhasTabela(configId),
  });

  const linhas = data?.data?.data || [];

  // Mutation para criar/atualizar
  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (editando) {
        return configTributariaService.updateLinha(editando, data);
      }
      return configTributariaService.createLinha({ ...data, config_id: configId });
    },
    onSuccess: () => {
      toast.success(editando ? "Linha atualizada com sucesso!" : "Linha criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["tabela-irt", configId] });
      setEditando(null);
      resetForm();
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Erro ao salvar linha";
      toast.error(message);
    },
  });

  // Mutation para excluir
  const deleteMutation = useMutation({
    mutationFn: (id: number) => configTributariaService.deleteLinha(id),
    onSuccess: () => {
      toast.success("Linha excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["tabela-irt", configId] });
      setDeleteModalOpen(false);
      setLinhaToDelete(null);
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Erro ao excluir linha";
      toast.error(message);
    },
  });

  const resetForm = () => {
    setFormData({
      limite_inferior: 0,
      limite_superior: null,
      parcela_fixa: 0,
      taxa_percentual: 0,
    });
  };

  const handleEdit = (linha: TabelaIRT) => {
    setEditando(linha.id);
    setFormData({
      limite_inferior: linha.limite_inferior,
      limite_superior: linha.limite_superior,
      parcela_fixa: linha.parcela_fixa,
      taxa_percentual: linha.taxa_percentual,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleCancel = () => {
    setEditando(null);
    resetForm();
  };

  const openDeleteModal = (linha: TabelaIRT) => {
    const descricao = linha.limite_superior
      ? `${linha.limite_inferior.toLocaleString()} - ${linha.limite_superior.toLocaleString()} Kz`
      : `Acima de ${linha.limite_inferior.toLocaleString()} Kz`;
    setLinhaToDelete({ id: linha.id, descricao });
    setDeleteModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">Tabela de IRT</h3>
        <Button
          onClick={() => setEditando(-1)}
          variant="outline"
          size="sm"
          className="inline-flex items-center gap-1"
        >
          <PlusIcon className="size-4" />
          Nova Faixa
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                Limite Inferior (Kz)
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                Limite Superior (Kz)
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                Taxa (%)
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                Parcela Fixa (Kz)
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {editando === -1 && (
              <tr className="border-b border-gray-100 bg-blue-50 dark:border-gray-800 dark:bg-blue-900/20">
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    value={formData.limite_inferior}
                    onChange={(e) => setFormData({ ...formData, limite_inferior: Number(e.target.value) })}
                    placeholder="0"
                    className="w-32"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    value={formData.limite_superior ?? ""}
                    onChange={(e) => setFormData({ ...formData, limite_superior: e.target.value ? Number(e.target.value) : null })}
                    placeholder="∞ (deixe vazio)"
                    className="w-36"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    value={formData.taxa_percentual}
                    onChange={(e) => setFormData({ ...formData, taxa_percentual: Number(e.target.value) })}
                    className="w-24"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    value={formData.parcela_fixa}
                    onChange={(e) => setFormData({ ...formData, parcela_fixa: Number(e.target.value) })}
                    className="w-32"
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      isLoading={mutation.isPending}
                      disabled={mutation.isPending}
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancelar
                    </Button>
                  </div>
                </td>
              </tr>
            )}
            {linhas.map((linha: TabelaIRT) => (
              <tr key={linha.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50">
                {editando === linha.id ? (
                  <>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        value={formData.limite_inferior}
                        onChange={(e) => setFormData({ ...formData, limite_inferior: Number(e.target.value) })}
                        className="w-32"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        value={formData.limite_superior ?? ""}
                        onChange={(e) => setFormData({ ...formData, limite_superior: e.target.value ? Number(e.target.value) : null })}
                        placeholder="∞"
                        className="w-36"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        value={formData.taxa_percentual}
                        onChange={(e) => setFormData({ ...formData, taxa_percentual: Number(e.target.value) })}
                        className="w-24"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        value={formData.parcela_fixa}
                        onChange={(e) => setFormData({ ...formData, parcela_fixa: Number(e.target.value) })}
                        className="w-32"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" onClick={handleSubmit} isLoading={mutation.isPending}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                          Cancelar
                        </Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {linha.limite_inferior.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {linha.limite_superior ? linha.limite_superior.toLocaleString() : "∞"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white">
                      {linha.taxa_percentual}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {linha.parcela_fixa.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(linha)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-warning dark:text-gray-400 dark:hover:bg-gray-800"
                          title="Editar"
                        >
                          <PencilIcon className="size-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(linha)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-error dark:text-gray-400 dark:hover:bg-gray-800"
                          title="Excluir"
                        >
                          <TrashIcon className="size-5" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isLoading && linhas.length === 0 && editando !== -1 && (
        <div className="flex h-32 flex-col items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Nenhuma faixa cadastrada</p>
          <Button variant="outline" size="sm" onClick={() => setEditando(-1)} className="mt-2">
            Adicionar primeira faixa
          </Button>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setLinhaToDelete(null);
        }}
        onConfirm={() => linhaToDelete && deleteMutation.mutate(linhaToDelete.id)}
        title="Excluir Faixa"
        message={`Tem certeza que deseja excluir a faixa "${linhaToDelete?.descricao}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmVariant="error"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default TabelaIRT;