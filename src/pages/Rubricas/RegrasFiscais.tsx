import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { rubricasService } from "../../services/rubricas";

import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Tabs from "../../components/common/Tabs";
import RegrasFiscaisTable from "./RegrasFiscaisTable";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";

const tabs = [
  { id: "inss", label: "INSS (Segurança Social)" },
  { id: "irt", label: "IRT (Imposto de Renda)" },
  { id: "outros", label: "Outros Impostos" },
];

const RegrasFiscais: React.FC = () => {
  const navigate = useNavigate();
  const { versaoId, rubricaId } = useParams();
  const [activeTab, setActiveTab] = useState("inss");

  const { data: rubricaData, isLoading } = useQuery({
    queryKey: ["rubrica", rubricaId],
    queryFn: () => rubricasService.getById(Number(rubricaId)),
    enabled: !!rubricaId,
  });

  const { data: versoesData } = useQuery({
    queryKey: ["rubrica-versoes", rubricaId],
    queryFn: () => rubricasService.getVersoes(Number(rubricaId), { per_page: 100 }),
    enabled: !!rubricaId,
  });

  const rubrica = rubricaData?.data?.data;
  const versoes = versoesData?.data?.data?.data || [];

  const versaoAtual = versoes.find((v: any) => !v.data_fim_vigencia);
  const versaoSelecionada = versaoId
    ? versoes.find((v: any) => v.id === Number(versaoId))
    : versaoAtual;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!rubrica) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-gray-500">Rubrica não encontrada</p>
        <Button onClick={() => navigate("/rubricas")} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`Regras Fiscais - ${rubrica.nome}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/rubricas/${rubrica.id}/versoes`)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeftIcon className="size-6" />
          </button>

          <div>
            <h1 className="text-2xl font-semibold">{rubrica.nome}</h1>
            <p className="text-sm text-gray-500">
              Código: {rubrica.codigo} | Tipo: {rubrica.tipo}
            </p>
          </div>
        </div>

        {/* Versões */}
        {versoes.length > 0 && (
          <ComponentCard title="Versão da Rubrica">
            <div className="flex gap-2 flex-wrap">
              {versoes.map((v: any) => (
                <button
                  key={v.id}
                  onClick={() =>
                    navigate(`/rubricas/${rubrica.id}/versoes/${v.id}/regras-fiscais`)
                  }
                  className={`px-3 py-1 rounded-full text-sm ${
                    versaoSelecionada?.id === v.id
                      ? "bg-primary text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {new Date(v.data_inicio_vigencia).toLocaleDateString("pt-BR")}
                </button>
              ))}
            </div>
          </ComponentCard>
        )}

        {/* Tabs */}
        {versaoSelecionada && (
          <>
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            <RegrasFiscaisTable
              versaoId={versaoSelecionada.id}
              rubricaNome={rubrica.nome}
              rubricaCodigo={rubrica.codigo}
              tipoFiltro={activeTab as any}
            />
          </>
        )}
      </div>
    </>
  );
};

export default RegrasFiscais;