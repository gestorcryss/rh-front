import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { rolesService, Role, Permission } from "../../services/roles";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import ConfirmModal from "../../components/ui/modal/ConfirmModal";
import Badge from "../../components/ui/badge/Badge";
import { PencilIcon, TrashIcon, PlusIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import Modal from "../../components/ui/modal";

const RolesPermissoes: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [editando, setEditando] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<{ id: number; nome: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ nome: "", slug: "", descricao: "", ativo: true });
  const [permissionsList, setPermissionsList] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  // Buscar roles
  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesService.list(),
  });
  const roles = rolesData?.data?.data.data || [];

  // Buscar permissões
  const { data: permissionsData } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => rolesService.getPermissions(),
  });
  const allPermissions = permissionsData?.data?.data.data || [];

  // Mutation para criar/atualizar role
  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (editando) {
        return rolesService.update(editando.id, data);
      }
      return rolesService.create(data);
    },
    onSuccess: () => {
      toast.success(editando ? "Role atualizada!" : "Role criada!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setModalOpen(false);
      resetForm();
      setEditando(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao salvar role");
    },
  });

  // Mutation para excluir
  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesService.delete(id),
    onSuccess: () => {
      toast.success("Role excluída!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setDeleteModalOpen(false);
      setRoleToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao excluir role");
    },
  });

  // Mutation para sincronizar permissões
  const syncPermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: number; permissions: number[] }) =>
      rolesService.syncPermissions(roleId, permissions),
    onSuccess: () => {
      toast.success("Permissões atualizadas!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setPermModalOpen(false);
      setSelectedRole(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar permissões");
    },
  });

  const resetForm = () => {
    setFormData({ nome: "", slug: "", descricao: "", ativo: true });
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
    if (roleToDelete) deleteMutation.mutate(roleToDelete.id);
  };

  const openPermissionsModal = async (role: Role) => {
    setSelectedRole(role);
    // Buscar permissões já atribuídas
    try {
      const roleData = await rolesService.getById(role.id);
      const existingPermissions = roleData.data.data.permissions?.map((p: any) => p.id) || [];
      setSelectedPermissions(existingPermissions);
    } catch (error) {
      setSelectedPermissions([]);
    }
    setPermModalOpen(true);
  };

  const handleSyncPermissions = () => {
    if (selectedRole) {
      syncPermissionsMutation.mutate({ roleId: selectedRole.id, permissions: selectedPermissions });
    }
  };

  const togglePermission = (permId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const getGroupedPermissions = () => {
    const groups: Record<string, Permission[]> = {};
    allPermissions.forEach((perm: Permission) => {
      const group = perm.slug.split(".")[0];
      if (!groups[group]) groups[group] = [];
      groups[group].push(perm);
    });
    return groups;
  };

  return (
    <>
      <PageMeta title="Roles e Permissões" description="Gestão de perfis de acesso" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Roles e Permissões</h1>
            <p className="text-sm text-gray-500">Controle de acesso dos usuários</p>
          </div>
          <Button onClick={() => { setEditando(null); resetForm(); setModalOpen(true); }} className="inline-flex items-center gap-2">
            <PlusIcon className="size-5" /> Nova Role
          </Button>
        </div>

        <ComponentCard title="Roles">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>
          ) : roles.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center"><p>Nenhuma role cadastrada</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Descrição</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role: Role) => (
                    <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{role.nome}</td>
                      <td className="px-4 py-3 text-sm">{role.slug}</td>
                      <td className="px-4 py-3 text-sm">{role.descricao || "-"}</td>
                      <td className="px-4 py-3">
                        <Badge color={role.ativo ? "success" : "error"}>{role.ativo ? "Ativo" : "Inativo"}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openPermissionsModal(role)} className="p-2 text-gray-500 hover:text-primary" title="Permissões">
                            <ShieldCheckIcon className="size-5" />
                          </button>
                          <button onClick={() => handleEdit(role)} className="p-2 text-gray-500 hover:text-warning" title="Editar">
                            <PencilIcon className="size-5" />
                          </button>
                          <button onClick={() => openDeleteModal(role)} className="p-2 text-gray-500 hover:text-error" title="Excluir">
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
        </ComponentCard>
      </div>

      {/* Modal de Role */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditando(null); }} >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div><Label>Nome *</Label><Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} /></div>
            <div><Label>Slug *</Label><Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s/g, '_') })} required /></div>
            <div><Label>Descrição</Label><textarea rows={2} className="w-full rounded-lg border p-2" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} /></div>
            <div><Label className="flex items-center gap-2"><input type="checkbox" checked={formData.ativo} onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })} /> Ativo</Label></div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={mutation.isPending}>{editando ? "Atualizar" : "Criar"}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Permissões */}
      <Modal isOpen={permModalOpen} onClose={() => setPermModalOpen(false)} >
        <div className="max-h-96 overflow-y-auto">
          {Object.entries(getGroupedPermissions()).map(([group, perms]) => (
            <div key={group} className="mb-4">
              <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">{group}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {perms.map((perm) => (
                  <label key={perm.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={selectedPermissions.includes(perm.id)} onChange={() => togglePermission(perm.id)} />
                    <span className="text-sm">{perm.descricao || perm.slug}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setPermModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSyncPermissions} isLoading={syncPermissionsMutation.isPending}>Salvar Permissões</Button>
        </div>
      </Modal>

      <ConfirmModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete} title="Excluir Role" message={`Deseja excluir a role "${roleToDelete?.nome}"?`} confirmText="Excluir" confirmVariant="error" isLoading={deleteMutation.isPending} />
    </>
  );
};

export default RolesPermissoes;