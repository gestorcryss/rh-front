import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditLogService, AuditLog } from "../../services/auditLog";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Badge from "../../components/ui/badge/Badge";
import { EyeIcon } from "@heroicons/react/24/outline";
import Modal from "../../components/ui/modal";

// Mapeamento de operações para cores e ícones (opcional)
const operacaoColor: Record<string, "success" | "info" | "error" | "primary" | "secondary" | "warning" | "dark"> = {
  CREATE: "success",
  UPDATE: "info",
  DELETE: "error",
  LOGIN: "primary",
  LOGOUT: "secondary",
  PROCESS: "warning",
  CLOSE: "error",
  REOPEN: "warning",
  EXPORT: "dark",
  VIEW: "secondary",
};

const operacaoLabel: Record<string, string> = {
  CREATE: "Criação",
  UPDATE: "Alteração",
  DELETE: "Exclusão",
  LOGIN: "Login",
  LOGOUT: "Logout",
  PROCESS: "Processamento",
  CLOSE: "Fechamento",
  REOPEN: "Reabertura",
  EXPORT: "Exportação",
  VIEW: "Visualização",
};

const formatData = (data: any) => {
  if (!data) return "-";
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

const AuditLogs: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    entidade: "",
    operacao: "",
    user_id: "",
    data_inicio: "",
    data_fim: "",
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, filters],
    queryFn: () =>
      auditLogService.list({
        page,
        per_page: 20,
        entidade: filters.entidade || undefined,
        operacao: filters.operacao || undefined,
        user_id: filters.user_id ? Number(filters.user_id) : undefined,
        data_inicio: filters.data_inicio || undefined,
        data_fim: filters.data_fim || undefined,
      }),
  });

  const logs = data?.data?.data?.data || [];
  const meta = data?.data?.data;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ entidade: "", operacao: "", user_id: "", data_inicio: "", data_fim: "" });
    setPage(1);
  };

  const openDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  return (
    <>
      <PageMeta title="Logs do Sistema" description="Registro de auditoria do sistema" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Logs do Sistema</h1>
          <p className="mt-1 text-sm text-gray-500">Registro de todas as operações realizadas no sistema</p>
        </div>

        <ComponentCard title="Filtros">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-sm font-medium mb-1">Entidade</label>
              <Input
                type="text"
                placeholder="Ex: funcionario"
                value={filters.entidade}
                onChange={(e) => handleFilterChange("entidade", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Operação</label>
              <select
                value={filters.operacao}
                onChange={(e) => handleFilterChange("operacao", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-3"
              >
                <option value="">Todas</option>
                {Object.entries(operacaoLabel).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Usuário ID</label>
              <Input
                type="number"
                placeholder="ID do usuário"
                value={filters.user_id}
                onChange={(e) => handleFilterChange("user_id", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Início</label>
              <Input
                type="date"
                value={filters.data_inicio}
                onChange={(e) => handleFilterChange("data_inicio", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Fim</label>
              <Input
                type="date"
                value={filters.data_fim}
                onChange={(e) => handleFilterChange("data_fim", e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={resetFilters} className="text-sm text-primary hover:underline">
              Limpar filtros
            </button>
          </div>
        </ComponentCard>

        <ComponentCard title="Registros">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-gray-500">Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Data/Hora</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Usuário</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Entidade</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Operação</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">IP</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: AuditLog) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {new Date(log.data_operacao).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.user?.username || "Sistema"}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{log.entidade}</td>
                      <td className="px-4 py-3 text-sm">{log.entidade_id}</td>
                      <td className="px-4 py-3">
                        <Badge color={operacaoColor[log.operacao] || "secondary"} size="sm">
                          {operacaoLabel[log.operacao] || log.operacao}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">{log.ip_address || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openDetails(log)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-primary"
                          title="Ver detalhes"
                        >
                          <EyeIcon className="size-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {meta && meta.last_page > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-gray-500">
                Mostrando {Math.min((page - 1) * 20 + 1, meta.total)} a {Math.min(page * 20, meta.total)} de {meta.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm">Página {page} de {meta.last_page}</span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={page === meta.last_page}
                  className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="font-medium">ID:</span> {selectedLog.id}</div>
              <div><span className="font-medium">Data:</span> {new Date(selectedLog.data_operacao).toLocaleString()}</div>
              <div><span className="font-medium">Usuário:</span> {selectedLog.user?.username || "Sistema"}</div>
              <div><span className="font-medium">IP:</span> {selectedLog.ip_address || "-"}</div>
              <div><span className="font-medium">Entidade:</span> {selectedLog.entidade}</div>
              <div><span className="font-medium">ID Entidade:</span> {selectedLog.entidade_id}</div>
              <div><span className="font-medium">Operação:</span> {operacaoLabel[selectedLog.operacao] || selectedLog.operacao}</div>
              <div><span className="font-medium">User Agent:</span> <span className="break-all">{selectedLog.user_agent || "-"}</span></div>
            </div>
            <div>
              <div className="font-medium mb-1">Dados Anteriores</div>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs overflow-auto max-h-64">
                {formatData(selectedLog.dados_anteriores)}
              </pre>
            </div>
            <div>
              <div className="font-medium mb-1">Dados Novos</div>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs overflow-auto max-h-64">
                {formatData(selectedLog.dados_novos)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AuditLogs;