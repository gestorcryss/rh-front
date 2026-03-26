import AuxTable, { AuxTableConfig } from "../../../components/common/AuxTable";
import { projetosService } from "../../../services/projetos";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";

const config: AuxTableConfig = {
  title: "Projetos",
  description: "Gerencie os projetos da empresa",
  service: projetosService,
  fields: [
    { name: "codigo", label: "Código", type: "text", required: true },
    { name: "nome", label: "Nome", type: "text", required: true },
    { name: "data_inicio", label: "Data Início", type: "date", required: false },
    { name: "data_fim", label: "Data Fim", type: "date", required: false },
    { name: "ativo", label: "Ativo", type: "select", required: false, options: [
      { value: "1", label: "Sim" },
      { value: "0", label: "Não" },
    ] },
  ],
  columns: [
    { key: "codigo", label: "Código" },
    { key: "nome", label: "Nome" },
    {
      key: "data_inicio",
      label: "Período",
      render: (item) => {
        if (!item.data_inicio && !item.data_fim) return "-";
        if (item.data_inicio && !item.data_fim) return `Início: ${new Date(item.data_inicio).toLocaleDateString()}`;
        return `${new Date(item.data_inicio).toLocaleDateString()} - ${new Date(item.data_fim).toLocaleDateString()}`;
      },
    },
    { key: "ativo", label: "Status", render: (item) => (
      <Badge color={item.ativo ? "success" : "error"}>{item.ativo ? "Ativo" : "Inativo"}</Badge>
    ) },
  ],
  getId: (item) => item.id,
  getLabel: (item) => item.nome,
  canDelete: (item) => !item.contratos?.length,
};

const Projetos: React.FC = () => {
  return (
    <>  
        <PageMeta title="Projetos" description="Gestão de projetos" />
        <AuxTable config={config} />
    </>
  );
}

export default Projetos;