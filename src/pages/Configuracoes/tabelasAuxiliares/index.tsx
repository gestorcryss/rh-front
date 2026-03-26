import { Outlet } from "react-router";
import PageMeta from "../../../components/common/PageMeta";

const TabelasAuxiliares: React.FC = () => {
  return (
    <>
      <PageMeta title="Tabelas Auxiliares" description="Gestão de tabelas auxiliares do sistema" />
      <Outlet />
    </>
  );
};

export default TabelasAuxiliares;