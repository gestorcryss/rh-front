import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ClockIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { contratosService } from "../../../services/contratos";
import { ContratoVersao } from "./types";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";

interface VersionHistoryProps {
  contratoId: number;
  onRestore?: (versaoId: number) => void;
  canRestore?: boolean;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  contratoId,
  onRestore,
  canRestore = true,
}) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["contrato-versoes", contratoId],
    queryFn: () => contratosService.getVersoes(contratoId),
    enabled: !!contratoId,
  });

  const versoes: ContratoVersao[] = data?.data?.data.data || [];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-AO");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (versoes.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2">Nenhuma versão encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">
          Histórico de Versões
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="!p-2"
        >
          <ArrowPathIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {versoes.map((versao, index) => {
          const isAtual = !versao.data_fim_vigencia;
          const isPrimeira = index === versoes.length - 1;

          return (
            <div
              key={versao.id}
              className={`relative rounded-lg border p-4 transition-all ${
                isAtual
                  ? "border-primary bg-primary/5 dark:border-primary/50 dark:bg-primary/10"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              {!isPrimeira && (
                <div className="absolute -top-3 left-6 h-3 w-px bg-gray-300 dark:bg-gray-700" />
              )}

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isAtual ? (
                      <Badge color="success">Versão Atual</Badge>
                    ) : (
                      <Badge color="info">Versão Anterior</Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      Vigência: {formatDate(versao.data_inicio_vigencia)}
                      {versao.data_fim_vigencia && ` até ${formatDate(versao.data_fim_vigencia)}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Salário Base:</span>
                      <span className="ml-2 font-medium text-gray-800 dark:text-white">
                        {formatCurrency(versao.salario_base)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Carga Horária:</span>
                      <span className="ml-2 font-medium text-gray-800 dark:text-white">
                        {versao.carga_horaria}h/semana
                      </span>
                    </div>
                    {versao.regime_trabalho && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Regime:</span>
                        <span className="ml-2 font-medium text-gray-800 dark:text-white">
                          {versao.regime_trabalho}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {!isAtual && canRestore && onRestore && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRestore(versao.id)}
                  >
                    Restaurar esta versão
                  </Button>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-400">
                Criado em: {formatDate(versao.created_at)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VersionHistory;