import AuxTable, { AuxTableConfig } from "../../../components/common/AuxTable";
import { tiposContratoService } from "../../../services/tiposContrato";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";

const config: AuxTableConfig = {
  title: "Tipos de Contrato",
  description: "Gerencie os tipos de contrato disponíveis na empresa",
  service: tiposContratoService,
  fields: [
    { name: "codigo", label: "Código", type: "text", required: true },
    { name: "nome", label: "Nome", type: "text", required: true },
    { name: "descricao", label: "Descrição", type: "text", required: false },
    { name: "prazo_meses", label: "Prazo (meses)", type: "number", required: false },
    { name: "ativo", label: "Ativo", type: "select", required: false, options: [
      { value: "1", label: "Sim" },
      { value: "0", label: "Não" },
    ] },
  ],
  columns: [
    { key: "codigo", label: "Código" },
    { key: "nome", label: "Nome" },
    { key: "descricao", label: "Descrição" },
    { key: "prazo_meses", label: "Prazo", render: (item) => item.prazo_meses ? `${item.prazo_meses} meses` : "Indeterminado" },
    { key: "ativo", label: "Status", render: (item) => (
      <Badge color={item.ativo ? "success" : "error"}>{item.ativo ? "Ativo" : "Inativo"}</Badge>
    ) },
  ],
  getId: (item) => item.id,
  getLabel: (item) => item.nome,
  canDelete: (item) => !item.contratos?.length,
  deleteMessage: (item) => `Tem certeza que deseja excluir o tipo de contrato "${item.nome}"?`,
};

const TiposContrato: React.FC = () => {
  return (
    <>
      <PageMeta title="Tipos de Contrato" description="Gestão de tipos de contrato" />
      <AuxTable config={config} />
    </>
  );
};

export default TiposContrato;