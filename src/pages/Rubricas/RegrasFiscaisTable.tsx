import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { rubricasService, RubricaRegraFiscal } from "../../services/rubricas";

import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import Button from "../../components/ui/button/Button";
import Modal from "../../components/ui/modal";

interface Props {
  versaoId: number;
  rubricaNome: string;
  rubricaCodigo: string;
  tipoFiltro: "inss" | "irt" | "outros";
}

const tipoMap = {
  inss: "INSS",
  irt: "IRT",
  outros: "OUTRO",
};

const RegrasFiscaisTable: React.FC<Props> = ({
  versaoId,
  tipoFiltro,
}) => {
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<RubricaRegraFiscal | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["regras-fiscais", versaoId],
    queryFn: () => rubricasService.getRegrasFiscais(versaoId),
  });

  const regras = data?.data?.data?.data || [];

  const regrasFiltradas = regras.filter(
    (r: RubricaRegraFiscal) => r.tipo_imposto === tipoMap[tipoFiltro]
  );

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      editando
        ? rubricasService.updateRegraFiscal(editando.id, payload)
        : rubricasService.createRegraFiscal(payload),

    onSuccess: () => {
      toast.success("Sucesso!");
      queryClient.invalidateQueries({ queryKey: ["regras-fiscais"] });
      setModalOpen(false);
      setEditando(null);
    },
  });

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between">
        <h3 className="font-medium">Regras</h3>

        <Button onClick={() => setModalOpen(true)}>
          <PlusIcon className="size-4" />
          Nova
        </Button>
      </div>

      {/* Tabela */}
      {regrasFiltradas.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nenhuma regra encontrada
        </p>
      ) : (
        <table className="w-full">
          <tbody>
            {regrasFiltradas.map((r: RubricaRegraFiscal) => (
              <tr key={r.id}>
                <td>{r.tipo_imposto}</td>
                <td>{r.base_calculo}</td>
                <td>
                  {r.limite_valor
                    ? `${r.limite_valor} Kz`
                    : r.limite_percentual
                    ? `${r.limite_percentual}%`
                    : "-"}
                </td>

                <td className="text-right">
                  <button onClick={() => setEditando(r)}>
                    <PencilIcon className="size-4" />
                  </button>
                  <button>
                    <TrashIcon className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <Button onClick={() => mutation.mutate({})}>
          Salvar
        </Button>
      </Modal>
    </div>
  );
};

export default RegrasFiscaisTable;