import React from "react";
import { format } from "date-fns";

interface HTMLExportProps {
  funcionario: any;
  personalData: any;
  contract: any;
  salaryStructure: any;
  departamento: any;
  funcao: any;
  onClose: () => void;
  onPrint: () => void;
}

export const HTMLExportModal: React.FC<HTMLExportProps> = ({
  funcionario,
  personalData,
  contract,
  salaryStructure,
  departamento,
  funcao,
  onClose,
  onPrint,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy");
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ATIVO: "bg-green-100 text-green-800",
      INATIVO: "bg-red-100 text-red-800",
      SUSPENSO: "bg-yellow-100 text-yellow-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white dark:bg-gray-900">
        {/* Cabeçalho do modal */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Ficha do Funcionário
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onPrint}
              className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
            >
              🖨️ Imprimir
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Conteúdo da ficha */}
        <div id="ficha-funcionario" className="p-8">
          {/* Cabeçalho */}
          <div className="mb-8 border-b pb-4 text-center">
            <h1 className="text-2xl font-bold text-gray-800">FICHA DE FUNCIONÁRIO</h1>
            <p className="text-gray-500">Sistema de Gestão de RH e Folha de Pagamento</p>
            <p className="text-sm text-gray-400">
              Data de emissão: {format(new Date(), "dd/MM/yyyy HH:mm")}
            </p>
          </div>

          {/* Identificação */}
          <div className="mb-6">
            <h3 className="mb-3 rounded-lg bg-gray-100 p-2 text-lg font-semibold text-gray-800">
              1. IDENTIFICAÇÃO
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nº Mecanográfico</p>
                <p className="font-medium">{funcionario.numero_mecanografico}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(funcionario.status)}`}>
                  {funcionario.status === "ATIVO" ? "Ativo" : funcionario.status === "INATIVO" ? "Inativo" : "Suspenso"}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Nome Completo</p>
                <p className="font-medium">{funcionario.nome_completo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data de Cadastro</p>
                <p>{formatDate(funcionario.created_at)}</p>
              </div>
              {funcionario.usuario && (
                <div>
                  <p className="text-sm text-gray-500">Usuário</p>
                  <p>{funcionario.usuario.username}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className="mb-6">
            <h3 className="mb-3 rounded-lg bg-gray-100 p-2 text-lg font-semibold text-gray-800">
              2. DADOS PESSOAIS
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Gênero</p>
                <p>{personalData?.genero || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data Nascimento</p>
                <p>{formatDate(personalData?.data_nascimento)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado Civil</p>
                <p>{personalData?.estado_civil || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">NIF</p>
                <p>{personalData?.nif || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">INSS</p>
                <p>{personalData?.inss_numero || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Documento</p>
                <p>{personalData?.tipo_documento} {personalData?.numero_documento}</p>
              </div>
            </div>
          </div>

          {/* Dados Profissionais */}
          <div className="mb-6">
            <h3 className="mb-3 rounded-lg bg-gray-100 p-2 text-lg font-semibold text-gray-800">
              3. DADOS PROFISSIONAIS
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Departamento</p>
                <p>{departamento?.nome || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Função/Cargo</p>
                <p>{funcao?.nome || "-"}</p>
              </div>
            </div>
          </div>

          {/* Dados Contratuais */}
          <div className="mb-6">
            <h3 className="mb-3 rounded-lg bg-gray-100 p-2 text-lg font-semibold text-gray-800">
              4. DADOS CONTRATUAIS
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tipo de Contrato</p>
                <p>{contract?.tipo_contrato?.nome || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p>{contract?.status || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data de Início</p>
                <p>{formatDate(contract?.data_inicio)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data de Fim</p>
                <p>{formatDate(contract?.data_fim) || "Em vigor"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Salário Base</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(contract?.versao_atual?.salario_base || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Carga Horária</p>
                <p>{contract?.versao_atual?.carga_horaria || 44}h/semana</p>
              </div>
            </div>
          </div>

          {/* Estrutura Salarial */}
          <div className="mb-6">
            <h3 className="mb-3 rounded-lg bg-gray-100 p-2 text-lg font-semibold text-gray-800">
              5. ESTRUTURA SALARIAL
            </h3>
            {salaryStructure?.itens && salaryStructure.itens.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2 text-left">Rubrica</th>
                    <th className="border p-2 text-right">Valor</th>
                    <th className="border p-2 text-right">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryStructure.itens.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border p-2">{item.rubrica?.nome || "-"}</td>
                      <td className="border p-2 text-right">
                        {item.tipo_valor === "PERCENTUAL"
                          ? `${item.valor}%`
                          : formatCurrency(Number(item.valor))}
                      </td>
                      <td className="border p-2 text-right">
                        {item.tipo_valor === "FIXO" ? "Fixo" : item.tipo_valor === "PERCENTUAL" ? "Percentual" : item.tipo_valor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">Nenhuma rubrica definida</p>
            )}
          </div>

          {/* Histórico de Contratos */}
          {funcionario.contratos && funcionario.contratos.length > 1 && (
            <div className="mb-6">
              <h3 className="mb-3 rounded-lg bg-gray-100 p-2 text-lg font-semibold text-gray-800">
                6. HISTÓRICO DE CONTRATOS
              </h3>
              <div className="space-y-2">
                {funcionario.contratos.slice(0, 5).map((c: any, index: number) => (
                  <div key={index} className="rounded-lg border p-3">
                    <p className="text-sm">
                      <strong>Versão {index + 1}:</strong> {formatDate(c.data_inicio)} - {formatDate(c.data_fim) || "Atual"}
                    </p>
                    <p className="text-sm text-primary">
                      Salário: {formatCurrency(c.versao_atual?.salario_base || 0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assinaturas */}
          <div className="mt-8 grid grid-cols-2 gap-8 pt-8">
            <div className="text-center">
              <div className="mb-2 border-t border-gray-300 pt-4">
                <p className="text-sm text-gray-500">Assinatura do Funcionário</p>
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 border-t border-gray-300 pt-4">
                <p className="text-sm text-gray-500">Assinatura do Responsável RH</p>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="mt-8 border-t pt-4 text-center text-xs text-gray-400">
            <p>Documento gerado eletronicamente - Sistema de RH e Folha de Pagamento</p>
          </div>
        </div>
      </div>
    </div>
  );
};