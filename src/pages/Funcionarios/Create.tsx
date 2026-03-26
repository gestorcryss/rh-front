import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { funcionariosService } from "../../services/funcionarios";
import { departamentosService } from "../../services/departamentos";
import { funcoesService } from "../../services/funcoes";
import { contratosService } from "../../services/contratos";
import { rubricasService } from "../../services/rubricas";

import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import ProgressSteps from "../../components/ui/wizard/ProgressSteps";



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

const steps = [
  { id: 1, title: "Dados Básicos" },
  { id: 2, title: "Dados Pessoais" },
  { id: 3, title: "Dados Profissionais" },
  { id: 4, title: "Contrato" },
  { id: 5, title: "Estrutura Salarial" },
];

const CreateFuncionario: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [funcionarioId, setFuncionarioId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // STATES
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

  const [professionalData, setProfessionalData] =
    useState<ProfessionalDataForm>({
      departamento_id: "",
      funcao_id: "",
      centro_custo_id: "",
    });

  const [contractData, setContractData] = useState<ContractForm>({
    tipo_contrato_id: "",
    data_inicio: new Date().toISOString().split("T")[0],
    data_fim: "",
    status_contrato: "ATIVO",
    salario_base: "",
    carga_horaria: "44",
  });

  const [salaryStructure, setSalaryStructure] =
    useState<SalaryStructureForm>({ itens: [] });

  // QUERIES
  const { data: departamentosData } = useQuery({
    queryKey: ["departamentos"],
    queryFn: departamentosService.list,
  });

  const { data: funcoesData } = useQuery({
    queryKey: ["funcoes"],
    queryFn: funcoesService.list,
  });

  const { data: tiposContratoData } = useQuery({
    queryKey: ["tipos-contrato"],
    queryFn: () => contratosService.getTipos(),
  });

  const { data: rubricasData } = useQuery({
    queryKey: ["rubricas"],
    queryFn: () => rubricasService.list(),
  });

  const departamentos = departamentosData?.data?.data || [];
  const funcoes = funcoesData?.data?.data || [];
  const tiposContrato = tiposContratoData?.data?.data || [];
  const rubricas = (rubricasData?.data?.data || []) as {
    id: number;
    codigo: string;
    nome: string;
    tipo: string;
    descricao?: string;
  }[];

  // MUTATIONS
  const createFuncionario = useMutation({
    mutationFn: funcionariosService.create,
    onSuccess: (res) => {
      setFuncionarioId(res.data.data.id);
      toast.success("Funcionário criado!");
    },
  });

  const createDadosPessoais = useMutation({
    mutationFn: (data: PersonalDataForm) => {
      if (!funcionarioId) throw new Error("Funcionário não existe");
      return funcionariosService.createDadosPessoais(funcionarioId, {
        ...data,
        data_inicio_vigencia: new Date().toISOString().split("T")[0],
      });
    },
  });

  const updateProfessional = useMutation({
    mutationFn: (data: ProfessionalDataForm) => {
      if (!funcionarioId) throw new Error("Funcionário não existe");
      return funcionariosService.update(funcionarioId, {
        departamento_id: data.departamento_id ? Number(data.departamento_id) : undefined,
        funcao_id: data.funcao_id ? Number(data.funcao_id) : undefined,
        centro_custo_id: data.centro_custo_id ? Number(data.centro_custo_id) : undefined,
      });
    },
  });

  const createContrato = useMutation({
    mutationFn: (data: ContractForm) => {
      if (!funcionarioId) throw new Error("Funcionário não existe");
      return contratosService.create(funcionarioId, {
        tipo_contrato_id: Number(data.tipo_contrato_id),
        data_inicio: data.data_inicio,
        data_fim: data.data_fim || null,
        status: data.status_contrato,
        salario_base: Number(data.salario_base),
        carga_horaria: Number(data.carga_horaria),
      });
    },
  });

  const createEstrutura = useMutation({
    mutationFn: (data: SalaryStructureForm) => {
      if (!funcionarioId) throw new Error("Funcionário não existe");

      return funcionariosService.createEstruturaSalarial(funcionarioId, {
        data_inicio_vigencia: contractData.data_inicio,
        itens: data.itens.map((i) => ({
          rubrica_id: i.rubrica_id,
          valor: Number(i.valor),
          tipo_valor: i.tipo_valor,
        })),
      });
    },
  });

  // VALIDATION
  const validateStep = () => {
    const err: Record<string, string> = {};

    if (currentStep === 1) {
      if (!basicInfo.numero_mecanografico)
        err.numero_mecanografico = "Obrigatório";
      if (!basicInfo.nome_completo)
        err.nome_completo = "Obrigatório";
    }

    if (currentStep === 3) {
      if (!professionalData.departamento_id)
        err.departamento_id = "Obrigatório";
    }

    if (currentStep === 4) {
      if (!contractData.tipo_contrato_id)
        err.tipo_contrato_id = "Obrigatório";
      if (!contractData.salario_base)
        err.salario_base = "Obrigatório";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // HANDLERS
  const next = async () => {
    if (!validateStep()) return;

    try {
      if (currentStep === 1 && !funcionarioId) {
        await createFuncionario.mutateAsync(basicInfo);
      }

      if (currentStep === 2 && funcionarioId) {
        await createDadosPessoais.mutateAsync(personalData);
      }

      if (currentStep === 3 && funcionarioId) {
        await updateProfessional.mutateAsync(professionalData);
      }

      if (currentStep === 4 && funcionarioId) {
        await createContrato.mutateAsync(contractData);
      }

      if (currentStep === 5 && funcionarioId) {
        if (salaryStructure.itens.length) {
          await createEstrutura.mutateAsync(salaryStructure);
        }

        toast.success("Funcionário criado com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["funcionarios"] });
        navigate("/funcionarios");
        return;
      }

      setCurrentStep((s) => s + 1);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Erro ao avançar");
    }
  };

  const prev = () => setCurrentStep((s) => s - 1);

  return (
    <>
      <PageMeta title="Novo Funcionário" description="Criar funcionário" />

      <ComponentCard title="">
        <ProgressSteps steps={steps} currentStep={currentStep} />
      </ComponentCard>

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
            onChange={(p) =>
              setPersonalData((prev) => ({ ...prev, ...p }))
            }
          />
        )}

        {currentStep === 3 && (
          <StepProfessionalData
            data={professionalData}
            onChange={(p) =>
              setProfessionalData((prev) => ({ ...prev, ...p }))
            }
            departamentos={departamentos}
            funcoes={funcoes}
          />
        )}

        {currentStep === 4 && (
          <StepContract
            data={contractData}
            onChange={(p) =>
              setContractData((prev) => ({ ...prev, ...p }))
            }
            tiposContrato={tiposContrato}
            errors={errors}
          />
        )}

        {currentStep === 5 && (
          <StepSalaryStructure
            data={salaryStructure}
            onChange={(p) =>
              setSalaryStructure((prev) => ({ ...prev, ...p }))
            }
            rubricas={rubricas}
            salarioBase={Number(contractData.salario_base)}
          />
        )}

        <div className="flex justify-between mt-6">
          <Button onClick={prev} disabled={currentStep === 1}>
            Anterior
          </Button>

          <Button onClick={next}>
            {currentStep === 5 ? "Finalizar" : "Próximo"}
          </Button>
        </div>
      </ComponentCard>
    </>
  );
};

export default CreateFuncionario;