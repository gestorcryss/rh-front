import AuxTable, { AuxTableConfig } from "../../../components/common/AuxTable";
import { funcoesService } from "../../../services/funcoes";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";

const config: AuxTableConfig = {
  title: "Funções/Cargos",
  description: "Gerencie as funções e cargos da empresa",
  service: funcoesService,
  fields: [
    { name: "codigo", label: "Código", type: "text", required: true },
    { name: "nome", label: "Nome", type: "text", required: true },
    { name: "descricao", label: "Descrição", type: "text", required: false },
    { name: "nivel", label: "Nível", type: "number", required: false },
    { name: "ativo", label: "Ativo", type: "select", required: false, options: [
      { value: "1", label: "Sim" },
      { value: "0", label: "Não" },
    ] },
  ],
  columns: [
    { key: "codigo", label: "Código" },
    { key: "nome", label: "Nome" },
    { key: "nivel", label: "Nível", render: (item) => item.nivel || "-" },
    { key: "ativo", label: "Status", render: (item) => (
      <Badge color={item.ativo ? "success" : "error"}>{item.ativo ? "Ativo" : "Inativo"}</Badge>
    ) },
  ],
  getId: (item) => item.id,
  getLabel: (item) => item.nome,
  canDelete: (item) => !item.funcionarios?.length,
};

const Funcoes: React.FC = () => {
  return (
    <>
      <PageMeta title="Funções/Cargos" description="Gestão de funções e cargos" />
      <AuxTable config={config} />
    </>
  );
};

export default Funcoes;