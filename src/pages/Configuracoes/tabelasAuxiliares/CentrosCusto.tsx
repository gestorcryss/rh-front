import AuxTable, { AuxTableConfig } from "../../../components/common/AuxTable";
import { centrosCustoService } from "../../../services/centrosCusto";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";

const config: AuxTableConfig = {
  title: "Centros de Custo",
  description: "Gerencie os centros de custo da empresa",
  service: centrosCustoService,
  fields: [
    { name: "codigo", label: "Código", type: "text", required: true },
    { name: "nome", label: "Nome", type: "text", required: true },
    { name: "descricao", label: "Descrição", type: "text", required: false },
    { name: "ativo", label: "Ativo", type: "select", required: false, options: [
      { value: "1", label: "Sim" },
      { value: "0", label: "Não" },
    ] },
  ],
  columns: [
    { key: "codigo", label: "Código" },
    { key: "nome", label: "Nome" },
    { key: "descricao", label: "Descrição" },
    { key: "ativo", label: "Status", render: (item) => (
      <Badge color={item.ativo ? "success" : "error"}>{item.ativo ? "Ativo" : "Inativo"}</Badge>
    ) },
  ],
  getId: (item) => item.id,
  getLabel: (item) => item.nome,
  canDelete: (item) => !item.funcionarios?.length,
};

const CentrosCusto: React.FC = () => {
  return (
    <>  
        <PageMeta title="Centros de Custo" description="Gestão de centros de custo" />
        <AuxTable config={config} />
    </>
  );
}


export default CentrosCusto;