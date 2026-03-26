import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import ComponentCard from "./ComponentCard";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import ConfirmModal from "../ui/modal/ConfirmModal";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import Modal from "../ui/modal";

export interface AuxTableConfig {
  title: string;
  description: string;
  service: {
    list: () => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
  };
  fields: {
    name: string;
    label: string;
    type: "text" | "number" | "date" | "select";
    required?: boolean;
    options?: { value: string | number; label: string }[];
  }[];
  columns: {
    key: string;
    label: string;
    render?: (item: any) => React.ReactNode;
  }[];
  getId: (item: any) => number;
  getLabel: (item: any) => string;
  canDelete?: (item: any) => boolean;
  deleteMessage?: (item: any) => string;
}

interface AuxTableProps {
  config: AuxTableConfig;
}

const AuxTable: React.FC<AuxTableProps> = ({ config }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; nome: string } | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Buscar dados
  const { data, isLoading } = useQuery({
    queryKey: [config.title, search],
    queryFn: () => config.service.list(),
    
  });

  const items = data?.data?.data.data || data?.data || [];
console.log("Items carregados:", items);
  // Filtrar por busca
  const filteredItems = items.filter((item: any) =>
    config.getLabel(item).toLowerCase().includes(search.toLowerCase())
  );

  // Mutation para criar/atualizar
  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (editando) {
        return config.service.update(editando.id, data);
      }
      return config.service.create(data);
    },
    onSuccess: () => {
      toast.success(editando ? `${config.title} atualizado!` : `${config.title} criado!`);
      queryClient.invalidateQueries({ queryKey: [config.title] });
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
    mutationFn: (id: number) => config.service.delete(id),
    onSuccess: () => {
      toast.success(`${config.title} excluído!`);
      queryClient.invalidateQueries({ queryKey: [config.title] });
      setDeleteModalOpen(false);
      setItemToDelete(null);
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Erro ao excluir";
      toast.error(message);
    },
  });

  const resetForm = () => {
    const empty: Record<string, any> = {};
    config.fields.forEach((field) => {
      empty[field.name] = "";
    });
    setFormData(empty);
  };

  const handleEdit = (item: any) => {
    setEditando(item);
    const editData: Record<string, any> = {};
    config.fields.forEach((field) => {
      editData[field.name] = item[field.name] ?? "";
    });
    setFormData(editData);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const openDeleteModal = (item: any) => {
    setItemToDelete({
      id: config.getId(item),
      nome: config.getLabel(item),
    });
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const openCreateModal = () => {
    setEditando(null);
    resetForm();
    setModalOpen(true);
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <ComponentCard title={config.title}>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ComponentCard>
    );
  }

  return (
    <>
      <ComponentCard title={config.title}>
        <div className="space-y-4">
          {/* Cabeçalho com busca e botão */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {config.description}
            </p>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              <Button onClick={openCreateModal} className="inline-flex items-center gap-2">
                <PlusIcon className="size-5" />
                Novo
              </Button>
            </div>
          </div>

          {/* Tabela */}
          {filteredItems.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
              <p className="text-gray-500">
                {search ? "Nenhum resultado encontrado" : `Nenhum ${config.title.toLowerCase()} cadastrado`}
              </p>
              {!search && (
                <Button variant="outline" onClick={openCreateModal} className="mt-4">
                  Criar primeiro {config.title.toLowerCase()}
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    {config.columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400"
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item: any) => (
                    <tr
                      key={config.getId(item)}
                      className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                    >
                      {config.columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {col.render ? col.render(item) : item[col.key] ?? "-"}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-warning dark:text-gray-400 dark:hover:bg-gray-800"
                            title="Editar"
                          >
                            <PencilIcon className="size-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            disabled={config.canDelete ? !config.canDelete(item) : false}
                            className={`rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-error dark:text-gray-400 dark:hover:bg-gray-800 ${
                              config.canDelete && !config.canDelete(item)
                                ? "cursor-not-allowed opacity-50"
                                : ""
                            }`}
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
        </div>
      </ComponentCard>

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
            {config.fields.map((field) => (
              <div key={field.name}>
                <Label htmlFor={field.name}>
                  {field.label} {field.required && "*"}
                </Label>
                {field.type === "select" ? (
                  <select
                    id={field.name}
                    value={formData[field.name] ?? ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
                    required={field.required}
                  >
                    <option value="">Selecione...</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    value={formData[field.name] ?? ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={`Digite o ${field.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                setEditando(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={mutation.isPending}>
              {editando ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDelete}
        title={`Excluir ${config.title}`}
        message={
          config.deleteMessage && itemToDelete
            ? config.deleteMessage(itemToDelete)
            : `Tem certeza que deseja excluir "${itemToDelete?.nome}"? Esta ação não pode ser desfeita.`
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmVariant="error"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

export default AuxTable;