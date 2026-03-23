import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { funcionariosService } from "../../services/funcionarios";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { HTMLExportModal } from "./components/HTMLExport";
import {
  ChevronLeftIcon,
  PencilIcon,
  DocumentArrowDownIcon,
  UserIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

const ShowFuncionario: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const funcionarioId = Number(id);
  const [showExportModal, setShowExportModal] = useState(false);

  // Buscar dados do funcionário
  const { data, isLoading, isError } = useQuery({
    queryKey: ["funcionario", funcionarioId],
    queryFn: () => funcionariosService.get(funcionarioId),
    enabled: !!funcionarioId,
  });

  const funcionario = data?.data.data;
  
  // Dados pessoais atuais (primeiro registro com data_fim_vigencia = null)
  const dadosPessoaisAtuais = funcionario?.dados_pessoais?.find(
    (d: any) => d.data_fim_vigencia === null
  ) || funcionario?.dados_pessoais?.[0];
  
  // Contrato ativo (status ATIVO)
  const contratoAtivo = funcionario?.contratos?.find(
    (c: any) => c.status === "ATIVO"
  );
  
  // Versão ativa do contrato
  const versaoAtiva = contratoAtivo?.versoes?.find(
    (v: any) => v.data_fim_vigencia === null
  ) || contratoAtivo?.versoes?.[0];
  
  // Estrutura salarial ativa
  const estruturaAtiva = funcionario?.estrutura_salarial_ativa;
  
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "-";
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 2,
    }).format(numValue);
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy");
  };

  const formatDateTime = (date: string) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy HH:mm");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ATIVO":
        return <Badge color="success">Ativo</Badge>;
      case "INATIVO":
        return <Badge color="error">Inativo</Badge>;
      case "SUSPENSO":
        return <Badge color="warning">Suspenso</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("ficha-funcionario");
    if (printContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Ficha_${funcionario?.numero_mecanografico}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  padding: 20px;
                  margin: 0;
                }
                @media print {
                  body { margin: 0; padding: 0; }
                  .no-print { display: none; }
                }
                .badge {
                  display: inline-block;
                  padding: 2px 8px;
                  border-radius: 9999px;
                  font-size: 12px;
                  font-weight: 600;
                }
                .badge-success { background: #10b981; color: white; }
                .badge-error { background: #ef4444; color: white; }
                .badge-warning { background: #f59e0b; color: white; }
              </style>
            </head>
            <body>
              ${printContent.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isError || !funcionario) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="text-red-500">Erro ao carregar dados do funcionário</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/funcionarios")}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${funcionario.nome_completo} | Sistema de RH`}
        description="Visualização detalhada do funcionário"
      />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              {funcionario.nome_completo}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nº Mecanográfico: <span className="font-medium text-gray-700 dark:text-gray-300">{funcionario.numero_mecanografico}</span>
              </p>
              <div>{getStatusBadge(funcionario.status)}</div>
              {funcionario.usuario && (
                <p className="text-sm text-gray-500">
                  <EnvelopeIcon className="mr-1 inline h-3 w-3" />
                  {funcionario.usuario.email}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/funcionarios")}>
              <ChevronLeftIcon className="mr-2 h-5 w-5" />
              Voltar
            </Button>
            <Button variant="outline" onClick={() => navigate(`/funcionarios/${id}/editar`)}>
              <PencilIcon className="mr-2 h-5 w-5" />
              Editar
            </Button>
            <Button variant="primary" onClick={() => setShowExportModal(true)}>
              <DocumentArrowDownIcon className="mr-2 h-5 w-5" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Conteúdo da ficha */}
        <div id="ficha-funcionario" className="space-y-6">
          {/* Dados Pessoais */}
          <ComponentCard title="Dados Pessoais" icon={<UserIcon className="h-5 w-5" />}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">Gênero</p>
                <p className="font-medium">{dadosPessoaisAtuais?.genero || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data de Nascimento</p>
                <p className="font-medium">{formatDate(dadosPessoaisAtuais?.data_nascimento)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado Civil</p>
                <p className="font-medium">{dadosPessoaisAtuais?.estado_civil || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">NIF</p>
                <p className="font-medium">{dadosPessoaisAtuais?.nif || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Número INSS</p>
                <p className="font-medium">{dadosPessoaisAtuais?.inss_numero || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Documento</p>
                <p className="font-medium">
                  {dadosPessoaisAtuais?.tipo_documento || "-"} {dadosPessoaisAtuais?.numero_documento ? `(${dadosPessoaisAtuais.numero_documento})` : ""}
                </p>
              </div>
              {dadosPessoaisAtuais?.validade_documento && (
                <div>
                  <p className="text-sm text-gray-500">Validade Documento</p>
                  <p className="font-medium">{formatDate(dadosPessoaisAtuais.validade_documento)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Data de Cadastro</p>
                <p className="font-medium">{formatDateTime(funcionario.created_at)}</p>
              </div>
            </div>
          </ComponentCard>

          {/* Dados Profissionais */}
          <ComponentCard title="Dados Profissionais" icon={<BriefcaseIcon className="h-5 w-5" />}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">Departamento</p>
                <p className="font-medium">{funcionario.departamento?.nome || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Função/Cargo</p>
                <p className="font-medium">{funcionario.funcao?.nome || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Centro de Custo</p>
                <p className="font-medium">{funcionario.centro_custo?.nome || "-"}</p>
              </div>
            </div>
          </ComponentCard>

          {/* Dados Contratuais */}
          <ComponentCard title="Dados Contratuais" icon={<DocumentTextIcon className="h-5 w-5" />}>
            {contratoAtivo ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Contrato</p>
                    <p className="font-medium">{contratoAtivo.tipo_contrato?.nome || "-"}</p>
                    {contratoAtivo.tipo_contrato?.codigo && (
                      <p className="text-xs text-gray-400">Código: {contratoAtivo.tipo_contrato.codigo}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data de Início</p>
                    <p className="font-medium">{formatDate(contratoAtivo.data_inicio)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data de Fim</p>
                    <p className="font-medium">{formatDate(contratoAtivo.data_fim) || "Em vigor"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div>{getStatusBadge(contratoAtivo.status)}</div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-sm text-gray-500">Salário Base</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(versaoAtiva?.salario_base)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Carga Horária</p>
                      <p className="font-medium">{versaoAtiva?.carga_horaria || 44} horas/semana</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Regime de Trabalho</p>
                      <p className="font-medium">{versaoAtiva?.regime_trabalho || "Não definido"}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Nenhum contrato ativo encontrado</p>
            )}
          </ComponentCard>

          {/* Estrutura Salarial */}
          <ComponentCard title="Estrutura Salarial" icon={<CurrencyDollarIcon className="h-5 w-5" />}>
            {estruturaAtiva?.itens && estruturaAtiva.itens.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="py-2 text-left text-sm font-semibold text-gray-600">Rubrica</th>
                        <th className="py-2 text-left text-sm font-semibold text-gray-600">Código</th>
                        <th className="py-2 text-right text-sm font-semibold text-gray-600">Valor</th>
                        <th className="py-2 text-right text-sm font-semibold text-gray-600">Tipo</th>
                       </tr>
                    </thead>
                    <tbody>
                      {estruturaAtiva.itens.map((item: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-2 text-left">{item.rubrica?.nome || "-"}</td>
                          <td className="py-2 text-left text-sm text-gray-500">{item.rubrica?.codigo || "-"}</td>
                          <td className="py-2 text-right font-medium">
                            {item.tipo_valor === "PERCENTUAL"
                              ? `${item.valor}%`
                              : formatCurrency(item.valor)}
                          </td>
                          <td className="py-2 text-right text-sm text-gray-500">
                            {item.tipo_valor === "FIXO" ? "Fixo" : 
                             item.tipo_valor === "PERCENTUAL" ? "Percentual" : 
                             item.tipo_valor === "FORMULA" ? "Fórmula" : "Informativo"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Proventos</p>
                      <p className="text-lg font-semibold text-green-600">
                        + {formatCurrency(estruturaAtiva.total_proventos)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Descontos</p>
                      <p className="text-lg font-semibold text-red-600">
                        - {formatCurrency(estruturaAtiva.total_descontos)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma rubrica definida na estrutura salarial</p>
            )}
          </ComponentCard>

          {/* Histórico de Contratos */}
          {funcionario.contratos && funcionario.contratos.length > 1 && (
            <ComponentCard title="Histórico de Contratos" icon={<CalendarIcon className="h-5 w-5" />}>
              <div className="space-y-3">
                {funcionario.contratos.slice(0, 5).map((c: any, index: number) => {
                  const versao = c.versoes?.[0];
                  const isActive = c.status === "ATIVO";
                  return (
                    <div
                      key={c.id}
                      className={`rounded-lg border p-3 ${
                        isActive ? "border-primary/50 bg-primary/5" : "border-gray-200 dark:border-gray-800"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {c.tipo_contrato?.nome || "Contrato"} 
                            {isActive && <span className="ml-2 text-xs text-primary">(Atual)</span>}
                          </p>
                          <p className="text-sm text-gray-500">
                            Período: {formatDate(c.data_inicio)} - {formatDate(c.data_fim) || "Atual"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary">
                            {formatCurrency(versao?.salario_base)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {versao?.carga_horaria}h/semana
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {funcionario.contratos.length > 5 && (
                  <p className="text-center text-sm text-gray-500">
                    + {funcionario.contratos.length - 5} versões anteriores
                  </p>
                )}
              </div>
            </ComponentCard>
          )}

          {/* Acesso ao Sistema */}
          {funcionario.usuario && (
            <ComponentCard title="Acesso ao Sistema" icon={<EnvelopeIcon className="h-5 w-5" />}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">{funcionario.usuario.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{funcionario.usuario.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div>{getStatusBadge(funcionario.usuario.ativo ? "ATIVO" : "INATIVO")}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Último Login</p>
                  <p className="font-medium">{formatDateTime(funcionario.usuario.last_login)}</p>
                </div>
              </div>
            </ComponentCard>
          )}
        </div>
      </div>

      {/* Modal de Exportação */}
      {showExportModal && (
        <HTMLExportModal
          funcionario={funcionario}
          personalData={dadosPessoaisAtuais}
          contract={contratoAtivo}
          salaryStructure={estruturaAtiva}
          departamento={funcionario.departamento}
          funcao={funcionario.funcao}
          onClose={() => setShowExportModal(false)}
          onPrint={handlePrint}
        />
      )}
    </>
  );
};

export default ShowFuncionario;