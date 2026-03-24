import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { rubricasService, Rubrica, RubricaVersao } from "../../services/rubricas";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

const RubricaForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== "novo";
  const queryClient = useQueryClient();

  // Estado do formulário
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    tipo: "PROVENTO" as Rubrica["tipo"],
    categoria: "",
    ativo: true,
  });

  // Estado da versão
  const [versaoData, setVersaoData] = useState({
    afecta_ferias: true,
    metodo_calculo: "FIXO" as RubricaVersao["metodo_calculo"],
    formula_calculo: "",
    data_inicio_vigencia: new Date().toISOString().split("T")[0],
  });

  // Buscar dados para edição
  const { data: rubricaData, isLoading: loadingRubrica } = useQuery({
    queryKey: ["rubrica", id],
    queryFn: () => rubricasService.getById(Number(id)),
    enabled: isEditing,
  });

  // Preencher formulário com dados existentes
  useEffect(() => {
    if (rubricaData?.data?.data) {
      const rubrica = rubricaData.data.data;
      setFormData({
        codigo: rubrica.codigo,
        nome: rubrica.nome,
        tipo: rubrica.tipo,
        categoria: rubrica.categoria || "",
        ativo: rubrica.ativo,
      });

      if (rubrica.versao_ativa) {
        setVersaoData({
          afecta_ferias: rubrica.versao_ativa.afecta_ferias,
          metodo_calculo: rubrica.versao_ativa.metodo_calculo,
          formula_calculo: rubrica.versao_ativa.formula_calculo || "",
          data_inicio_vigencia:
            rubrica.versao_ativa.data_inicio_vigencia?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [rubricaData]);

  // Mutation para criar/atualizar
  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (isEditing) {
        return rubricasService.update(Number(id), data);
      }
      return rubricasService.create(data);
    },
    onSuccess: async (response) => {
      const rubrica = response.data.data;

      // Em criação e edição, manter versão alinhada com os dados do formulário.
      if (rubrica.id) {
        await rubricasService.createVersao({
          rubrica_id: rubrica.id,
          ...versaoData,
        });
      }

      toast.success(`Rubrica ${isEditing ? "atualizada" : "criada"} com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["rubricas"] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ["rubrica", id] });
        queryClient.invalidateQueries({ queryKey: ["rubrica-versoes", Number(id)] });
      }
      navigate("/rubricas");
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Erro ao salvar rubrica";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isEditing && loadingRubrica) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={isEditing ? "Editar Rubrica" : "Nova Rubrica"}
        description="Cadastro de rubricas salariais"
      />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/rubricas")}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              {isEditing ? "Editar Rubrica" : "Nova Rubrica"}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isEditing ? "Altere os dados da rubrica" : "Cadastre uma nova rubrica salarial"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Dados Básicos */}
            <ComponentCard title="Dados Básicos">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    type="text"
                    placeholder="Ex: SAL_BASE"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    disabled={isEditing}
                  />
                  <p className="mt-1 text-xs text-gray-500">Código único identificador da rubrica</p>
                </div>

                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Ex: Salário Base"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as Rubrica["tipo"] })}
                    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
                    required
                  >
                    <option value="PROVENTO">Provento (Acréscimo)</option>
                    <option value="DESCONTO">Desconto (Dedução)</option>
                    <option value="INFORMATIVO">Informativo</option>
                    <option value="BASE">Base de Cálculo</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <select
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
                  >
                    <option value="">Selecione...</option>
                    <option value="REMUNERATIVO">Remunerativo</option>
                    <option value="BENEFÍCIO">Benefício</option>
                    <option value="VARIÁVEL">Variável</option>
                    <option value="OBRIGATORIO">Obrigatório</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="ativo">Status</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="ativo"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="ativo" className="text-sm text-gray-700 dark:text-gray-300">
                      Rubrica ativa
                    </label>
                  </div>
                </div>
              </div>
            </ComponentCard>

            {/* Configuração da Versão Inicial */}
            <ComponentCard title="Configuração Inicial">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="metodo_calculo">Método de Cálculo *</Label>
                  <select
                    id="metodo_calculo"
                    value={versaoData.metodo_calculo}
                    onChange={(e) => setVersaoData({ ...versaoData, metodo_calculo: e.target.value as RubricaVersao["metodo_calculo"] })}
                    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
                    required
                  >
                    <option value="FIXO">Fixo (valor em Kz)</option>
                    <option value="PERCENTUAL">Percentual do salário base</option>
                    <option value="HORA">Baseado em horas trabalhadas</option>
                    <option value="TABELA">Tabela progressiva</option>
                    <option value="FORMULA">Fórmula personalizada</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="afecta_ferias">Afeta Férias</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="afecta_ferias"
                      checked={versaoData.afecta_ferias}
                      onChange={(e) => setVersaoData({ ...versaoData, afecta_ferias: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="afecta_ferias" className="text-sm text-gray-700 dark:text-gray-300">
                      Esta rubrica impacta o cálculo de férias
                    </label>
                  </div>
                </div>

                {versaoData.metodo_calculo === "FORMULA" && (
                  <div>
                    <Label htmlFor="formula_calculo">Fórmula de Cálculo</Label>
                    <textarea
                      id="formula_calculo"
                      rows={3}
                      value={versaoData.formula_calculo}
                      onChange={(e) => setVersaoData({ ...versaoData, formula_calculo: e.target.value })}
                      placeholder="Ex: (salario_base * 0.1) + 5000"
                      className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Variáveis disponíveis: salario_base, horas, quantidade, valor_base
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="data_inicio_vigencia">Data de Início da Vigência *</Label>
                  <Input
                    id="data_inicio_vigencia"
                    type="date"
                    value={versaoData.data_inicio_vigencia}
                    onChange={(e) => setVersaoData({ ...versaoData, data_inicio_vigencia: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Data a partir da qual esta versão será aplicada
                  </p>
                </div>

                {isEditing && (
                  <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      ℹ️ Ao alterar uma rubrica existente, será criada uma nova versão.
                      A versão atual será encerrada automaticamente.
                    </p>
                  </div>
                )}
              </div>
            </ComponentCard>
          </div>

          {/* Botões */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/rubricas")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={mutation.isPending}
              disabled={mutation.isPending}
            >
              {isEditing ? "Atualizar" : "Criar Rubrica"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default RubricaForm;