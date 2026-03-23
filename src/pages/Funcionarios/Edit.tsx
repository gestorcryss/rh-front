import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { funcionariosService } from "../../services/funcionarios";
import { departamentosService } from "../../services/departamentos";
import { funcoesService } from "../../services/funcoes";
import { contratosService } from "../../services/contratos";
import { rubricasService } from "../../services/rubricas";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import ProgressSteps from "../../components/ui/wizard/ProgressSteps";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

// Importar componentes das etapas
import StepBasicInfo from "./components/StepBasicInfo";
import StepPersonalData from "./components/StepPersonalData";
import StepProfessionalData from "./components/StepProfessionalData";
import StepContract from "./components/StepContract";
import StepSalaryStructure from "./components/StepSalaryStructure";
import {
  BasicInfoForm,
  PersonalDataForm,
  ProfessionalDataForm,
  ContractForm,
  SalaryStructureForm,
} from "./components/types";

// Steps do wizard
const steps = [
  { id: 1, title: "Dados Básicos", description: "Informações principais" },
  { id: 2, title: "Dados Pessoais", description: "Documentos e identificação" },
  { id: 3, title: "Dados Profissionais", description: "Departamento e função" },
  { id: 4, title: "Contrato", description: "Informações contratuais" },
  { id: 5, title: "Estrutura Salarial", description: "Rubricas e benefícios" },
];

// Interface para os dados originais (para comparar mudanças)
interface OriginalData {
  basicInfo: BasicInfoForm;
  personalData: PersonalDataForm;
  professionalData: ProfessionalDataForm;
  contract: {
    salario_base: string;
    carga_horaria: string;
    tipo_contrato_id: string;
    data_inicio: string;
  };
  salaryStructure: {
    itens: Array<{ rubrica_id: number; valor: string; tipo_valor: string }>;
  };
}

const EditFuncionario: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const funcionarioId = Number(id);

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [originalData, setOriginalData] = useState<OriginalData | null>(null);

  // Estados dos formulários
  const [basicInfo, setBasicInfo] = useState<BasicInfoForm>({
    numero_mecanografico: "",
    nome_completo: "",
    status: "ATIVO",
    email: "",
    username: "",
  });

  const [personalData, setPersonalData] = useState<PersonalDataForm>({
    genero: undefined,
    data_nascimento: "",
    estado_civil: "",
    tipo_documento: "",
    numero_documento: "",
    validade_documento: "",
    nif: "",
    inss_numero: "",
  });

  const [professionalData, setProfessionalData] = useState<ProfessionalDataForm>({
    departamento_id: "",
    funcao_id: "",
    centro_custo_id: "",
  });

  const [contractData, setContractData] = useState<ContractForm>({
    tipo_contrato_id: "",
    data_inicio: "",
    data_fim: "",
    status_contrato: "ATIVO",
    salario_base: "",
    carga_horaria: "44",
  });

  const [salaryStructure, setSalaryStructure] = useState<SalaryStructureForm>({
    itens: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============================================================
  // BUSCAR DADOS DO FUNCIONÁRIO
  // ============================================================
  const { data: funcionarioData, isLoading: loadingFuncionario } = useQuery({
    queryKey: ["funcionario", funcionarioId],
    queryFn: () => funcionariosService.get(funcionarioId),
    enabled: !!funcionarioId,
  });

  // Buscar dados para selects
  const { data: departamentosData } = useQuery({
    queryKey: ["departamentos"],
    queryFn: () => departamentosService.list(),
  });

  const { data: funcoesData } = useQuery({
    queryKey: ["funcoes"],
    queryFn: () => funcoesService.list(),
  });

  const { data: tiposContratoData } = useQuery({
    queryKey: ["tipos-contrato"],
    queryFn: () => contratosService.getTipos(),
  });

  const { data: rubricasData } = useQuery({
    queryKey: ["rubricas"],
    queryFn: () => rubricasService.list(),
  });

  const departamentos = departamentosData?.data?.data.data || [];
  const funcoes = funcoesData?.data?.data.data || [];
  const tiposContrato = tiposContratoData?.data?.data.data || [];
  const rubricas = rubricasData?.data?.data.data || [];

  // ============================================================
  // POPULAR STATES COM DADOS DO FUNCIONÁRIO
  // ============================================================
  useEffect(() => {
    if (!funcionarioData?.data) return;

    const f = funcionarioData.data.data;
    setIsLoadingData(false);

    // 1. Dados Básicos
    setBasicInfo({
      numero_mecanografico: f.numero_mecanografico || "",
      nome_completo: f.nome_completo || "",
      status: f.status || "ATIVO",
      email: f.usuario?.email || "",
      username: f.usuario?.username || "",
    });

    // 2. Dados Pessoais
    const dadosPessoais = f.dados_pessoais || {};
    console.log("Dados pessoais atuais do funcionário:", dadosPessoais);
    setPersonalData({
      genero: dadosPessoais.genero || "",
      data_nascimento: dadosPessoais.data_nascimento || "",
      estado_civil: dadosPessoais.estado_civil || "",
      tipo_documento: dadosPessoais.tipo_documento || "",
      numero_documento: dadosPessoais.numero_documento || "",
      validade_documento: dadosPessoais.validade_documento || "",
      nif: dadosPessoais.nif || "",
      inss_numero: dadosPessoais.inss_numero || "",
    });

    // 3. Dados Profissionais
    setProfessionalData({
      departamento_id: f.departamento_id ? String(f.departamento_id) : "",
      funcao_id: f.funcao_id ? String(f.funcao_id) : "",
      centro_custo_id: f.centro_custo_id ? String(f.centro_custo_id) : "",
    });

    // 4. Contrato Atual
    const contratoAtual = f.contrato_atual;
    const versaoAtual = contratoAtual?.versao_atual;

    if (contratoAtual && versaoAtual) {
      setContractData({
        tipo_contrato_id: String(contratoAtual.tipo_contrato_id || ""),
        data_inicio: contratoAtual.data_inicio || "",
        data_fim: contratoAtual.data_fim || "",
        status_contrato: contratoAtual.status || "ATIVO",
        salario_base: String(versaoAtual.salario_base || ""),
        carga_horaria: String(versaoAtual.carga_horaria || "44"),
      });
    }

    // 5. Estrutura Salarial Atual
    const estruturaAtual = f.estrutura_atual;
    if (estruturaAtual?.itens) {
      setSalaryStructure({
        itens: estruturaAtual.itens.map((item: any) => ({
          rubrica_id: item.rubrica_id,
          valor: String(item.valor),
          tipo_valor: item.tipo_valor,
        })),
      });
    }

    // 6. Guardar dados originais para comparar mudanças
    setOriginalData({
      basicInfo: {
        numero_mecanografico: f.numero_mecanografico || "",
        nome_completo: f.nome_completo || "",
        status: f.status || "ATIVO",
        email: f.usuario?.email || "",
        username: f.usuario?.username || "",
      },
      personalData: {
        genero: dadosPessoais.genero || "",
        data_nascimento: dadosPessoais.data_nascimento || "",
        estado_civil: dadosPessoais.estado_civil || "",
        tipo_documento: dadosPessoais.tipo_documento || "",
        numero_documento: dadosPessoais.numero_documento || "",
        validade_documento: dadosPessoais.validade_documento || "",
        nif: dadosPessoais.nif || "",
        inss_numero: dadosPessoais.inss_numero || "",
      },
      professionalData: {
        departamento_id: f.departamento_id ? String(f.departamento_id) : "",
        funcao_id: f.funcao_id ? String(f.funcao_id) : "",
        centro_custo_id: f.centro_custo_id ? String(f.centro_custo_id) : "",
      },
      contract: {
        salario_base: String(versaoAtual?.salario_base || ""),
        carga_horaria: String(versaoAtual?.carga_horaria || "44"),
        tipo_contrato_id: String(contratoAtual?.tipo_contrato_id || ""),
        data_inicio: contratoAtual?.data_inicio || "",
      },
      salaryStructure: {
        itens: estruturaAtual?.itens?.map((item: any) => ({
          rubrica_id: item.rubrica_id,
          valor: String(item.valor),
          tipo_valor: item.tipo_valor,
        })) || [],
      },
    });
  }, [funcionarioData]);

  // ============================================================
  // FUNÇÕES DE COMPARAÇÃO (para saber se deve criar nova versão)
  // ============================================================
  const hasBasicInfoChanged = (): boolean => {
    if (!originalData) return false;
    return (
      basicInfo.numero_mecanografico !== originalData.basicInfo.numero_mecanografico ||
      basicInfo.nome_completo !== originalData.basicInfo.nome_completo ||
      basicInfo.status !== originalData.basicInfo.status ||
      basicInfo.email !== originalData.basicInfo.email ||
      basicInfo.username !== originalData.basicInfo.username
    );
  };

  const hasPersonalDataChanged = (): boolean => {
    if (!originalData) return false;
    return (
      personalData.genero !== originalData.personalData.genero ||
      personalData.data_nascimento !== originalData.personalData.data_nascimento ||
      personalData.estado_civil !== originalData.personalData.estado_civil ||
      personalData.tipo_documento !== originalData.personalData.tipo_documento ||
      personalData.numero_documento !== originalData.personalData.numero_documento ||
      personalData.validade_documento !== originalData.personalData.validade_documento ||
      personalData.nif !== originalData.personalData.nif ||
      personalData.inss_numero !== originalData.personalData.inss_numero
    );
  };

  const hasProfessionalDataChanged = (): boolean => {
    if (!originalData) return false;
    return (
      professionalData.departamento_id !== originalData.professionalData.departamento_id ||
      professionalData.funcao_id !== originalData.professionalData.funcao_id ||
      professionalData.centro_custo_id !== originalData.professionalData.centro_custo_id
    );
  };

  const hasContractChanged = (): boolean => {
    if (!originalData) return false;
    return (
      contractData.salario_base !== originalData.contract.salario_base ||
      contractData.carga_horaria !== originalData.contract.carga_horaria ||
      contractData.tipo_contrato_id !== originalData.contract.tipo_contrato_id ||
      contractData.data_inicio !== originalData.contract.data_inicio
    );
  };

  const hasSalaryStructureChanged = (): boolean => {
    if (!originalData) return false;
    
    const currentItens = salaryStructure.itens || [];
    const originalItens = originalData.salaryStructure.itens || [];
    
    if (currentItens.length !== originalItens.length) return true;
    
    for (let i = 0; i < currentItens.length; i++) {
      const current = currentItens[i];
      const original = originalItens[i];
      if (
        current.rubrica_id !== original.rubrica_id ||
        current.valor !== original.valor ||
        current.tipo_valor !== original.tipo_valor
      ) {
        return true;
      }
    }
    
    return false;
  };

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleContractDataChange = (data: Partial<ContractForm>) => {
    setContractData(prev => ({ ...prev, ...data }));
  };

  // ============================================================
  // MUTATIONS
  // ============================================================
  const updateFuncionario = useMutation({
    mutationFn: (data: BasicInfoForm) => 
      funcionariosService.update(funcionarioId, {
        numero_mecanografico: data.numero_mecanografico,
        nome_completo: data.nome_completo,
        status: data.status,
      }),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao atualizar dados básicos");
    },
  });

  const updateDadosPessoais = useMutation({
    mutationFn: (data: PersonalDataForm) => {
      // Se não há dados pessoais, cria; se há, atualiza criando nova versão
      return funcionariosService.createDadosPessoais(funcionarioId, {
        ...data,
        data_inicio_vigencia: new Date().toISOString().split("T")[0],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao atualizar dados pessoais");
    },
  });

  const updateProfessionalData = useMutation({
    mutationFn: (data: ProfessionalDataForm) =>
      funcionariosService.update(funcionarioId, {
        departamento_id: data.departamento_id ? Number(data.departamento_id) : undefined,
        funcao_id: data.funcao_id ? Number(data.funcao_id) : undefined,
        centro_custo_id: data.centro_custo_id ? Number(data.centro_custo_id) : undefined,
      }),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao atualizar dados profissionais");
    },
  });

  const createNewContract = useMutation({
    mutationFn: (data: ContractForm) =>
      contratosService.create(funcionarioId, {
        tipo_contrato_id: Number(data.tipo_contrato_id),
        data_inicio: data.data_inicio,
        data_fim: data.data_fim || null,
        status: data.status_contrato,
        salario_base: Number(data.salario_base),
        carga_horaria: Number(data.carga_horaria),
      }),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao criar nova versão do contrato");
    },
  });

  const createNewSalaryStructure = useMutation({
    mutationFn: (data: SalaryStructureForm) =>
      funcionariosService.createEstruturaSalarial(funcionarioId, {
        data_inicio_vigencia: contractData.data_inicio || new Date().toISOString().split("T")[0],
        itens: data.itens?.map(item => ({
          rubrica_id: item.rubrica_id,
          valor: Number(item.valor),
          tipo_valor: item.tipo_valor,
        })) || [],
      }),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao criar nova versão da estrutura salarial");
    },
  });

  // ============================================================
  // VALIDAÇÃO
  // ============================================================
  const validateStep = (step: number): boolean => {
    setErrors({});
    
    if (step === 1) {
      if (!basicInfo.numero_mecanografico) {
        setErrors({ numero_mecanografico: "Número mecanográfico é obrigatório" });
        return false;
      }
      if (!basicInfo.nome_completo) {
        setErrors({ nome_completo: "Nome completo é obrigatório" });
        return false;
      }
      return true;
    }
    
    if (step === 4) {
      if (!contractData.tipo_contrato_id) {
        setErrors({ tipo_contrato_id: "Tipo de contrato é obrigatório" });
        return false;
      }
      if (!contractData.salario_base || Number(contractData.salario_base) <= 0) {
        setErrors({ salario_base: "Salário base é obrigatório" });
        return false;
      }
      return true;
    }
    
    return true;
  };

  // ============================================================
  // HANDLE NEXT (SALVAMENTO INTELIGENTE POR ETAPA)
  // ============================================================
  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    try {
      // Step 1: Dados Básicos
      if (currentStep === 1 && hasBasicInfoChanged()) {
        await updateFuncionario.mutateAsync(basicInfo);
        toast.success("Dados básicos atualizados!");
      }

      // Step 2: Dados Pessoais
      if (currentStep === 2 && hasPersonalDataChanged()) {
        await updateDadosPessoais.mutateAsync(personalData);
        toast.success("Dados pessoais atualizados!");
      }

      // Step 3: Dados Profissionais
      if (currentStep === 3 && hasProfessionalDataChanged()) {
        await updateProfessionalData.mutateAsync(professionalData);
        toast.success("Dados profissionais atualizados!");
      }

      // Step 4: Contrato - SOMENTE SE HOUVE MUDANÇA (cria nova versão)
      if (currentStep === 4) {
        if (hasContractChanged()) {
          await createNewContract.mutateAsync(contractData);
          toast.success("Nova versão do contrato criada!");
        } else {
          toast.info("Nenhuma alteração no contrato detectada");
        }
      }

      // Step 5: Estrutura Salarial - SOMENTE SE HOUVE MUDANÇA (cria nova versão)
      if (currentStep === 5) {
        if (hasSalaryStructureChanged()) {
          await createNewSalaryStructure.mutateAsync(salaryStructure);
          toast.success("Nova versão da estrutura salarial criada!");
        } else {
          toast.info("Nenhuma alteração na estrutura salarial detectada");
        }
        
        // Finalizar edição
        toast.success("Funcionário atualizado com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["funcionarios"] });
        queryClient.invalidateQueries({ queryKey: ["funcionario", funcionarioId] });
        navigate("/funcionarios");
        return;
      }

      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } catch (error) {
      // Erro já tratado nas mutations
      console.error("Erro ao salvar:", error);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 1 && (!basicInfo.numero_mecanografico || !basicInfo.nome_completo)) return true;
    if (currentStep === 4 && (!contractData.tipo_contrato_id || !contractData.salario_base)) return true;
    return false;
  };

  const isLoading = updateFuncionario.isPending || updateDadosPessoais.isPending ||
                    updateProfessionalData.isPending || createNewContract.isPending ||
                    createNewSalaryStructure.isPending;

  if (loadingFuncionario || isLoadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Editar: ${basicInfo.nome_completo} | Sistema de RH`}
        description="Editar dados do funcionário"
      />

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Editar Funcionário
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {basicInfo.nome_completo} ({basicInfo.numero_mecanografico})
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/funcionarios")}>
            <ChevronLeftIcon className="mr-2 h-5 w-5" />
            Voltar
          </Button>
        </div>

        {/* Aviso de versionamento */}
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            📝 Alterações em <strong>Contrato</strong> e <strong>Estrutura Salarial</strong> 
            criam novas versões. Os dados históricos são mantidos para auditoria.
          </p>
        </div>

        {/* Progress Steps */}
        <ComponentCard title="">
          <ProgressSteps
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </ComponentCard>

        {/* Formulário por etapa */}
        <ComponentCard title="">
          {currentStep === 1 && (
            <StepBasicInfo
              data={basicInfo}
             
               onChange={(p) =>
              setBasicInfo((prev) => ({ ...prev, ...p }))
            }
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <StepPersonalData
              data={personalData}
              onChange={setPersonalData}
              
              
            />
          )}

          {currentStep === 3 && (
            <StepProfessionalData
              data={professionalData}
              onChange={setProfessionalData}
              departamentos={departamentos}
              funcoes={funcoes}
              isLoading={false}
            />
          )}

          {currentStep === 4 && (
            <StepContract
              data={contractData}
              onChange={handleContractDataChange}
              tiposContrato={tiposContrato}
              errors={errors}
              isLoading={false}
            />
          )}

          {currentStep === 5 && (
            <StepSalaryStructure
              data={salaryStructure}
              onChange={setSalaryStructure}
              rubricas={rubricas}
              salarioBase={Number(contractData.salario_base)}
              isLoading={false}
            />
          )}

          {/* Indicador de mudanças */}
          <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
            <div className="flex flex-wrap gap-3 text-xs">
              {hasBasicInfoChanged() && (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  📝 Dados básicos alterados
                </span>
              )}
              {hasPersonalDataChanged() && (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  📄 Dados pessoais alterados
                </span>
              )}
              {hasProfessionalDataChanged() && (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  💼 Dados profissionais alterados
                </span>
              )}
              {hasContractChanged() && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  📑 Contrato alterado (nova versão)
                </span>
              )}
              {hasSalaryStructureChanged() && (
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                  🏗️ Estrutura alterada (nova versão)
                </span>
              )}
            </div>
          </div>

          {/* Botões de navegação */}
          <div className="mt-6 flex justify-between border-t border-gray-200 pt-6 dark:border-gray-800">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isLoading}
            >
              <ChevronLeftIcon className="mr-2 h-5 w-5" />
              Anterior
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={isNextDisabled() || isLoading}
            >
              {currentStep === steps.length ? (
                <>
                  <ChevronRightIcon className="mr-2 h-5 w-5" />
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRightIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default EditFuncionario;