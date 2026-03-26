import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import ConfirmModal from "../../components/ui/modal/ConfirmModal";
import Badge from "../../components/ui/badge/Badge";
import { PencilIcon, TrashIcon, PlusIcon, KeyIcon } from "@heroicons/react/24/outline";
import Modal from "../../components/ui/modal";
import Tabs from "../../components/common/Tabs";
import { Permission, Role, rolesService } from "../../services/roles";

const tabs = [
  { id: "roles", label: "Perfis (Roles)" },
  { id: "permissions", label: "Permissões" },
];

// Componente de listagem de permissões (simples)
const PermissionsList: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => rolesService.getPermissions(),
  });
  const permissions = data?.data?.data || [];

  if (isLoading) return <div className="p-4 text-center">Carregando...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Descrição</th>
           </tr>
        </thead>
        <tbody>
          {permissions.map((perm: Permission) => (
            <tr key={perm.id} className="border-b border-gray-100">
              <td className="px-4 py-3 text-sm font-mono">{perm.slug}</td>
              <td className="px-4 py-3 text-sm">{perm.descricao || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Modal para editar permissões de uma role
const PermissionsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: () => void;
}> = ({ isOpen, onClose, role, onSuccess }) => {
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const { data: permissionsData, isLoading: loadingPerms } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => rolesService.getPermissions(),
    enabled: isOpen,
  });
  const permissions = permissionsData?.data?.data || [];

  // Aqui você poderia buscar as permissões já atribuídas à role
  // Mas por simplicidade, não implementamos isso agora.

  const mutation = useMutation({
    mutationFn: () => rolesService.assignPermissions(role!.id, selectedPermissions),
    onSuccess: () => {
      toast.success("Permissões atualizadas!");
      onSuccess();
      onClose();
    },
    onError: () => toast.error("Erro ao atualizar permissões"),
  });

  const handleToggle = (permId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSubmit = () => {
    mutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Selecione as permissões para este perfil</p>
        {loadingPerms ? (
          <div className="text-center">Carregando...</div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {permissions.map((perm: Permission) => (
              <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(perm.id)}
                  onChange={() => handleToggle(perm.id)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm font-mono">{perm.slug}</span>
                <span className="text-xs text-gray-500">- {perm.descricao}</span>
              </label>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} isLoading={mutation.isPending}>Salvar</Button>
        </div>
      </div>
    </Modal>
  );
};

const RolesPermissoes: React.FC = () => {
  const [activeTab, setActiveTab] = useState("roles");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [editando, setEditando] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<{ id: number; nome: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    slug: "",
    descricao: "",
    ativo: true,
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesService.list(),
  });

  const roles = data?.data.data.data || [];

  console.log("Roles fetched:", roles);

  // Mutation para criar/atualizar role
  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (editando) {
        return rolesService.update(editando.id, data);
      }
      return rolesService.create(data);
    },
    onSuccess: () => {
      toast.success(editando ? "Perfil atualizado!" : "Perfil criado!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
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
    mutationFn: (id: number) => rolesService.delete(id),
    onSuccess: () => {
      toast.success("Perfil excluído!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setDeleteModalOpen(false);
      setRoleToDelete(null);
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Erro ao excluir";
      toast.error(message);
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      slug: "",
      descricao: "",
      ativo: true,
    });
  };

  const handleEdit = (role: Role) => {
    setEditando(role);
    setFormData({
      nome: role.nome,
      slug: role.slug,
      descricao: role.descricao || "",
      ativo: role.ativo,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const openDeleteModal = (role: Role) => {
    setRoleToDelete({ id: role.id, nome: role.nome });
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete.id);
    }
  };

  const openPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    setPermissionsModalOpen(true);
  };

  return (
    <>
      <PageMeta title="Roles e Permissões" description="Gestão de perfis de acesso e permissões" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Roles e Permissões</h1>
            <p className="mt-1 text-sm text-gray-500">Gerencie perfis de acesso e permissões do sistema</p>
          </div>
          {activeTab === "roles" && (
            <Button onClick={() => { setEditando(null); resetForm(); setModalOpen(true); }} className="inline-flex items-center gap-2">
              <PlusIcon className="size-5" /> Novo Perfil
            </Button>
          )}
        </div>

        <ComponentCard title="">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "roles" && (
            <div className="pt-4">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : roles.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center">
                  <p className="text-gray-500">Nenhum perfil cadastrado</p>
                  <Button onClick={() => setModalOpen(true)} className="mt-4">Criar primeiro perfil</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Descrição</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Usuários</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((role: Role) => (
                        <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800">
                          <td className="px-4 py-3 text-sm font-medium">{role.nome}</td>
                          <td className="px-4 py-3 text-sm font-mono">{role.slug}</td>
                          <td className="px-4 py-3 text-sm">{role.descricao || "-"}</td>
                          <td className="px-4 py-3">
                            <Badge color={role.ativo ? "success" : "error"}>{role.ativo ? "Ativo" : "Inativo"}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">{role.users_count || 0}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openPermissionsModal(role)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-primary"
                                title="Permissões"
                              >
                                <KeyIcon className="size-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(role)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-warning"
                                title="Editar"
                              >
                                <PencilIcon className="size-5" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(role)}
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
            </div>
          )}

          {activeTab === "permissions" && <PermissionsList />}
        </ComponentCard>
      </div>

      {/* Modal de Role */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Administrador"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                placeholder="Ex: admin"
                disabled={!!editando}
              />
              <p className="text-xs text-gray-500 mt-1">Identificador único, usado no código.</p>
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <textarea
                id="descricao"
                rows={3}
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-3"
                placeholder="Descrição do perfil"
              />
            </div>
            <div>
              <Label htmlFor="ativo">Status</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="h-4 w-4 rounded text-primary"
                />
                <label htmlFor="ativo" className="text-sm">Ativo</label>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={mutation.isPending}>{editando ? "Atualizar" : "Criar"}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Permissões */}
      <PermissionsModal
        isOpen={permissionsModalOpen}
        onClose={() => setPermissionsModalOpen(false)}
        role={selectedRole}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["roles"] })}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Perfil"
        message={`Tem certeza que deseja excluir o perfil "${roleToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmVariant="error"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

export default RolesPermissoes;