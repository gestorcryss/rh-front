import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { format } from "date-fns";

// Registrar fontes (opcional - para suporte a português)
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Roboto",
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    backgroundColor: "#f3f4f6",
    padding: 5,
    color: "#374151",
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
    padding: 4,
  },
  label: {
    width: 140,
    fontWeight: "bold",
    color: "#4b5563",
  },
  value: {
    flex: 1,
    color: "#1f2937",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  gridItem: {
    width: "50%",
    flexDirection: "row",
    marginBottom: 5,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 5,
  },
  tableCell: {
    flex: 1,
  },
  signature: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "center",
  },
  signatureText: {
    fontSize: 10,
    color: "#9ca3af",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
});

interface PDFExportProps {
  funcionario: any;
  personalData: any;
  contract: any;
  salaryStructure: any;
  departamento: any;
  funcao: any;
}

export const FuncionarioPDF: React.FC<PDFExportProps> = ({
  funcionario,
  personalData,
  contract,
  salaryStructure,
  departamento,
  funcao,
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

  const formatStatus = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      ATIVO: { label: "Ativo", color: "#10b981" },
      INATIVO: { label: "Inativo", color: "#ef4444" },
      SUSPENSO: { label: "Suspenso", color: "#f59e0b" },
    };
    return statusMap[status]?.label || status;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>FICHA DE FUNCIONÁRIO</Text>
          <Text style={styles.subtitle}>Sistema de Gestão de RH e Folha de Pagamento</Text>
          <Text style={styles.subtitle}>Data de emissão: {format(new Date(), "dd/MM/yyyy HH:mm")}</Text>
        </View>

        {/* Identificação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. IDENTIFICAÇÃO</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nº Mecanográfico:</Text>
            <Text style={styles.value}>{funcionario.numero_mecanografico}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nome Completo:</Text>
            <Text style={styles.value}>{funcionario.nome_completo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{formatStatus(funcionario.status)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Cadastro:</Text>
            <Text style={styles.value}>{formatDate(funcionario.created_at)}</Text>
          </View>
        </View>

        {/* Dados Pessoais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. DADOS PESSOAIS</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Gênero:</Text>
              <Text style={styles.value}>{personalData?.genero || "-"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Data Nascimento:</Text>
              <Text style={styles.value}>{formatDate(personalData?.data_nascimento)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Estado Civil:</Text>
              <Text style={styles.value}>{personalData?.estado_civil || "-"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>NIF:</Text>
              <Text style={styles.value}>{personalData?.nif || "-"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>INSS:</Text>
              <Text style={styles.value}>{personalData?.inss_numero || "-"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Documento:</Text>
              <Text style={styles.value}>
                {personalData?.tipo_documento} {personalData?.numero_documento}
              </Text>
            </View>
          </View>
        </View>

        {/* Dados Profissionais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. DADOS PROFISSIONAIS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Departamento:</Text>
            <Text style={styles.value}>{departamento?.nome || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Função/Cargo:</Text>
            <Text style={styles.value}>{funcao?.nome || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Centro de Custo:</Text>
            <Text style={styles.value}>{funcionario.centro_custo?.nome || "-"}</Text>
          </View>
        </View>

        {/* Dados Contratuais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. DADOS CONTRATUAIS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo de Contrato:</Text>
            <Text style={styles.value}>{contract?.tipo_contrato?.nome || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Início:</Text>
            <Text style={styles.value}>{formatDate(contract?.data_inicio)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Fim:</Text>
            <Text style={styles.value}>{formatDate(contract?.data_fim) || "Em vigor"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Salário Base:</Text>
            <Text style={styles.value}>{formatCurrency(contract?.versao_atual?.salario_base || 0)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Carga Horária:</Text>
            <Text style={styles.value}>{contract?.versao_atual?.carga_horaria || 44}h/semana</Text>
          </View>
        </View>

        {/* Estrutura Salarial */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. ESTRUTURA SALARIAL</Text>
          {salaryStructure?.itens && salaryStructure.itens.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Rubrica</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>Valor</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>Tipo</Text>
              </View>
              {salaryStructure.itens.map((item: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{item.rubrica?.nome || "-"}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                    {item.tipo_valor === "PERCENTUAL"
                      ? `${item.valor}%`
                      : formatCurrency(Number(item.valor))}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                    {item.tipo_valor === "FIXO" ? "Fixo" : item.tipo_valor === "PERCENTUAL" ? "%" : item.tipo_valor}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.value}>Nenhuma rubrica definida</Text>
          )}
        </View>

        {/* Histórico de Contratos */}
        {funcionario.contratos && funcionario.contratos.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. HISTÓRICO DE CONTRATOS</Text>
            {funcionario.contratos.slice(0, 5).map((c: any, index: number) => (
              <View key={index} style={styles.row}>
                <Text style={[styles.label, { width: 100 }]}>Versão {index + 1}:</Text>
                <Text style={styles.value}>
                  {formatDate(c.data_inicio)} - {formatDate(c.data_fim) || "Atual"} | 
                  Salário: {formatCurrency(c.versao_atual?.salario_base || 0)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Assinaturas */}
        <View style={styles.signature}>
          <Text style={styles.signatureText}>_________________________</Text>
          <Text style={styles.signatureText}>Assinatura do Funcionário</Text>
        </View>
        <View style={styles.signature}>
          <Text style={styles.signatureText}>_________________________</Text>
          <Text style={styles.signatureText}>Assinatura do Responsável RH</Text>
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>Documento gerado eletronicamente - Sistema de RH e Folha de Pagamento</Text>
        </View>
      </Page>
    </Document>
  );
};