import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useDropzone } from "react-dropzone";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Modal from "../../components/ui/modal";
import { movimentosMensaisService } from "../../services/movimentosMensais";
import { funcionariosService } from "../../services/funcionarios";
import { rubricasService } from "../../services/rubricas";

interface Funcionario {
  id: number;
  numero_mecanografico: string;
  nome_completo: string;
  status: string;
}

interface Rubrica {
  id: number;
  codigo: string;
  nome: string;
}

interface Movimento {
  id: number;
  funcionario_id: number;
  rubrica_id: number;
  data: string;           // YYYY-MM-DD
  observacoes?: string;
}

const MovimentosMensaisList: React.FC = () => {
  const queryClient = useQueryClient();

  // Estados principais
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [selectedRubricaId, setSelectedRubricaId] = useState<number | null>(null);
  const [marcarSabado, setMarcarSabado] = useState(true);
  const [marcarDomingo, setMarcarDomingo] = useState(true);
  const [marcarFeriado, setMarcarFeriado] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal
  const [movimentoModalOpen, setMovimentoModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentMovimento, setCurrentMovimento] = useState<Movimento | null>(null);
  const [modalData, setModalData] = useState({ data: "", observacoes: "" });

  // Importação
  const [importModalOpen, setImportModalOpen] = useState(false);

  // ====================== QUERIES ======================
  const { data: funcionariosData, isLoading: loadingFunc } = useQuery({
    queryKey: ["funcionarios-ativos"],
    queryFn: () => funcionariosService.list({ status: "ATIVO", per_page: 500 }),
  });

  const { data: rubricasData } = useQuery({
    queryKey: ["rubricas-select"],
    queryFn: () => rubricasService.list({ per_page: 100 }),
  });

  const { data: movimentosData, isLoading: loadingMov, refetch: refetchMovimentos } = useQuery({
    queryKey: ["movimentos", selectedFuncionario?.id],
    queryFn: () => {
      if (!selectedFuncionario) return { data: { data: [] } };
      return movimentosMensaisService.listByFuncionario(selectedFuncionario.id);
    },
    enabled: !!selectedFuncionario,
  });

  // ====================== DADOS MEMOIZADOS ======================
  const funcionarios = useMemo(() => {
    return (funcionariosData?.data?.data?.data || funcionariosData?.data || [])
      .filter((f: Funcionario) => f.status === "ATIVO");
  }, [funcionariosData]);

  const rubricas = useMemo(() => {
    return rubricasData?.data?.data?.data || rubricasData?.data || [];
  }, [rubricasData]);

  const filteredFuncionarios = useMemo(() => {
    if (!searchTerm.trim()) return funcionarios;
    const term = searchTerm.toLowerCase();
    return funcionarios.filter((f: Funcionario) =>
      f.nome_completo.toLowerCase().includes(term) ||
      f.numero_mecanografico.toLowerCase().includes(term)
    );
  }, [funcionarios, searchTerm]);

  const calendarEvents = useMemo(() => {
    const movimentos = movimentosData?.data?.data || [];
    return movimentos.map((mov: Movimento) => ({
      id: mov.id.toString(),
      title: rubricas.find((r) => r.id === mov.rubrica_id)?.codigo || "Mov.",
      start: mov.data,
      allDay: true,
      color: "#3b82f6",
    }));
  }, [movimentosData, rubricas]);

  // ====================== MUTATIONS ======================
  const createMutation = useMutation({
    mutationFn: (data: any) => movimentosMensaisService.create(selectedFuncionario!.id, data),
    onSuccess: () => {
      toast.success("Movimento criado!");
      closeMovimentoModal();
      refetchMovimentos();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) =>
      movimentosMensaisService.update(selectedFuncionario!.id, id, data),
    onSuccess: () => {
      toast.success("Movimento atualizado!");
      closeMovimentoModal();
      refetchMovimentos();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => movimentosMensaisService.delete(selectedFuncionario!.id, id),
    onSuccess: () => {
      toast.success("Movimento removido!");
      closeMovimentoModal();
      refetchMovimentos();
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return movimentosMensaisService.importFolhaPonto(formData);
    },
    onSuccess: () => {
      toast.success("Importação concluída!");
      setImportModalOpen(false);
      refetchMovimentos();
    },
  });

  // ====================== HANDLERS ======================
  const handleDateClick = useCallback((info: any) => {
    if (!selectedFuncionario) {
      toast.warning("Selecione um funcionário primeiro");
      return;
    }
    if (!selectedRubricaId) {
      toast.warning("Selecione uma rubrica");
      return;
    }

    setModalMode("create");
    setCurrentMovimento(null);
    setModalData({ data: info.dateStr, observacoes: "" });
    setMovimentoModalOpen(true);
  }, [selectedFuncionario, selectedRubricaId]);

  const handleEventClick = useCallback((info: any) => {
    const mov = (movimentosData?.data?.data || []).find(
      (m: Movimento) => m.id === Number(info.event.id)
    );
    if (mov) {
      setModalMode("edit");
      setCurrentMovimento(mov);
      setModalData({ data: mov.data, observacoes: mov.observacoes || "" });
      setSelectedRubricaId(mov.rubrica_id);
      setMovimentoModalOpen(true);
    }
  }, [movimentosData]);

  const handleSaveMovement = () => {
    if (!selectedFuncionario || !selectedRubricaId) return;

    const payload = {
      rubrica_id: selectedRubricaId,
      data: modalData.data,
      observacoes: modalData.observacoes,
    };

    if (modalMode === "create") {
      createMutation.mutate(payload);
    } else if (modalMode === "edit" && currentMovimento) {
      updateMutation.mutate({ id: currentMovimento.id, ...payload });
    }
  };

  const closeMovimentoModal = () => {
    setMovimentoModalOpen(false);
    setCurrentMovimento(null);
    setModalData({ data: "", observacoes: "" });
  };

  // ====================== RENDER ======================
  return (
    <>
      <PageMeta title="Alterações Mensais" description=""/>

      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex justify-between border-b pb-3">
          <h1 className="text-2xl font-semibold">Alterações Mensais</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setImportModalOpen(true)}>
              📤 Importar Folha de Ponto
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendário */}
          <div className="lg:col-span-8">
            <ComponentCard className="p-4" title="">
              {loadingMov && <div className="text-center py-8">Carregando marcações...</div>}
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth" }}
                height="auto"
                locale="pt"
                events={calendarEvents}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                buttonText={{ today: "Hoje" }}
              />
            </ComponentCard>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Funcionário selecionado */}
            {selectedFuncionario && (
              <ComponentCard title="Funcionário Selecionado">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedFuncionario.nome_completo}</p>
                  <p className="text-sm text-gray-500">Mat: {selectedFuncionario.numero_mecanografico}</p>
                </div>
              </ComponentCard>
            )}

            {/* Rubricas */}
            <ComponentCard title="Rubrica">
              <select
                value={selectedRubricaId || ""}
                onChange={(e) => setSelectedRubricaId(Number(e.target.value) || null)}
                className="w-full rounded-lg border p-3"
              >
                <option value="">Selecione uma rubrica...</option>
                {rubricas.map((r: Rubrica) => (
                  <option key={r.id} value={r.id}>
                    {r.codigo} – {r.nome}
                  </option>
                ))}
              </select>
            </ComponentCard>

            {/* Configurações de dias */}
            <ComponentCard title="Configurações">
              <div className="space-y-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={marcarSabado} onChange={(e) => setMarcarSabado(e.target.checked)} />
                  Marcação ao Sábado
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={marcarDomingo} onChange={(e) => setMarcarDomingo(e.target.checked)} />
                  Marcação ao Domingo
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={marcarFeriado} onChange={(e) => setMarcarFeriado(e.target.checked)} />
                  Marcação ao Feriado
                </label>
              </div>
            </ComponentCard>

            {/* Lista de funcionários */}
            <ComponentCard title="Funcionários Ativos">
              <Input
                placeholder="Buscar funcionário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
              />
              <div className="max-h-72 overflow-y-auto space-y-1 pr-2">
                {filteredFuncionarios.map((f: Funcionario) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFuncionario(f)}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      selectedFuncionario?.id === f.id
                        ? "bg-blue-100 border border-blue-300"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-mono text-xs">{f.numero_mecanografico}</span>
                    <p className="text-sm font-medium">{f.nome_completo}</p>
                  </div>
                ))}
              </div>
            </ComponentCard>
          </div>
        </div>
      </div>

      {/* Modal Movimento */}
      <Modal
        isOpen={movimentoModalOpen}
        onClose={closeMovimentoModal}
      >
        {/* ... conteúdo do modal igual ao anterior, mantive igual pois estava bom */}
        {/* (copie o conteúdo do modal do seu código anterior) */}
      </Modal>

      {/* Modal Importação */}
      <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} >
        <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-12 text-center ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}>
          <input {...getInputProps()} />
          <p className="text-lg">Arraste o ficheiro ou clique para selecionar</p>
          <p className="text-sm text-gray-500">.xlsx ou .csv</p>
        </div>
      </Modal>
    </>
  );
};

export default MovimentosMensaisList;