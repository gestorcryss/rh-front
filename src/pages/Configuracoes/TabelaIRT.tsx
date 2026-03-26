import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { configTributariaService, TabelaIRT as TabelaIRTType } from "../../services/configTributaria";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
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
    excesso_base: null as number | null,
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
      toast.success(editando ? "Faixa atualizada!" : "Faixa criada!");
      queryClient.invalidateQueries({ queryKey: ["tabela-irt", configId] });
      setEditando(null);
      resetForm();
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Erro ao salvar";
      toast.error(message);
    },
  });

  // Mutation para excluir
  const deleteMutation = useMutation({
    mutationFn: (id: number) => configTributariaService.deleteLinha(id),
    onSuccess: () => {
      toast.success("Faixa excluída!");
      queryClient.invalidateQueries({ queryKey: ["tabela-irt", configId] });
      setDeleteModalOpen(false);
      setLinhaToDelete(null);
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Erro ao excluir";
      toast.error(message);
    },
  });

  const resetForm = () => {
    setFormData({
      limite_inferior: 0,
      limite_superior: null,
      parcela_fixa: 0,
      taxa_percentual: 0,
      excesso_base: null,
    });
  };

  const handleEdit = (linha: TabelaIRTType) => {
    setEditando(linha.id);
    setFormData({
      limite_inferior: linha.limite_inferior,
      limite_superior: linha.limite_superior,
      parcela_fixa: linha.parcela_fixa,
      taxa_percentual: linha.taxa_percentual,
      excesso_base: linha.excesso_base,
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

  const openDeleteModal = (linha: TabelaIRTType) => {
    const descricao = linha.limite_superior
      ? `${linha.limite_inferior.toLocaleString()} - ${linha.limite_superior.toLocaleString()} Kz`
      : `Acima de ${linha.limite_inferior.toLocaleString()} Kz`;
    setLinhaToDelete({ id: linha.id, descricao });
    setDeleteModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">
          Tabela Progressiva de IRT
        </h3>
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

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Limite Inferior (Kz)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Limite Superior (Kz)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Taxa (%)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Parcela Fixa (Kz)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Excesso Base</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* Linha de edição/criação */}
            {editando === -1 && (
              <tr className="bg-blue-50 dark:bg-blue-900/20">
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
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    value={formData.excesso_base ?? ""}
                    onChange={(e) => setFormData({ ...formData, excesso_base: e.target.value ? Number(e.target.value) : null })}
                    placeholder="= limite inferior"
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
              </tr>
            )}

            {/* Linhas existentes */}
            {linhas.map((linha: TabelaIRTType) => (
              <tr key={linha.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        value={formData.excesso_base ?? ""}
                        onChange={(e) => setFormData({ ...formData, excesso_base: e.target.value ? Number(e.target.value) : null })}
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
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {linha.limite_inferior.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {linha.limite_superior ? linha.limite_superior.toLocaleString() : "∞"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {linha.taxa_percentual}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {linha.parcela_fixa.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {linha.excesso_base ? linha.excesso_base.toLocaleString() : "= limite inferior"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(linha)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-warning"
                          title="Editar"
                        >
                          <PencilIcon className="size-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(linha)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-error"
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

      {linhas.length === 0 && editando !== -1 && (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="text-gray-500">Nenhuma faixa cadastrada</p>
          <Button variant="outline" size="sm" onClick={() => setEditando(-1)} className="mt-2">
            Adicionar primeira faixa
          </Button>
        </div>
      )}

      <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        <strong>Fórmula de cálculo:</strong> IRT = Parcela Fixa + ((Matéria Coletável - Excesso Base) × Taxa)
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
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