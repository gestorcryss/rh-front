import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";

import { movimentosMensaisService, MovimentoMensal } from "../../services/movimentosMensais";
import { funcionariosService } from "../../services/funcionarios";
import { rubricasService } from "../../services/rubricas";

// ====================== VALIDAÇÃO ======================
const formSchema = z.object({
  funcionario_id: z.number({ required_error: "Selecione um funcionário" }).min(1),
  rubrica_id: z.number({ required_error: "Selecione uma rubrica" }).min(1),
  valor: z.number({ required_error: "Valor é obrigatório" }).positive("Valor deve ser maior que zero"),
  quantidade: z.number().optional().default(1),
  mes: z.number().min(1).max(12),
  ano: z.number().min(2020).max(2035),
});

type FormData = z.infer<typeof formSchema>;

// ====================== COMPONENTE ======================
const MovimentoMensalForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantidade: 1,
      mes: new Date().getMonth() + 1,
      ano: new Date().getFullYear(),
    },
  });

  const funcionarioId = watch("funcionario_id");

  // Selects
  const { data: funcionariosData } = useQuery({
    queryKey: ["funcionarios-select"],
    queryFn: () => funcionariosService.list({ per_page: 300, status: "ATIVO" }),
  });

  const { data: rubricasData } = useQuery({
    queryKey: ["rubricas-select"],
    queryFn: () => rubricasService.list({ per_page: 300 }),
  });

  const funcionarios = funcionariosData?.data?.data?.data || [];
  const rubricas = rubricasData?.data?.data?.data || [];

  // Carregar movimento para edição (use pendentes ou listByFuncionario se preferir)
  // Nota: se quiser GET único, adicione no backend: Route::get('movimentos/{movimento}', [...]);
  const { data: movimentoData } = useQuery({
    queryKey: ["movimento-mensal", id],
    queryFn: () => movimentosMensaisService.pendentes({ id }), // workaround usando pendentes
    enabled: isEditing,
  });

  useEffect(() => {
    if (movimentoData?.data?.data) {
      const m: MovimentoMensal = Array.isArray(movimentoData.data.data)
        ? movimentoData.data.data.find((item: any) => item.id === Number(id))
        : movimentoData.data.data;

      if (m) {
        reset({
          funcionario_id: m.funcionario_id,
          rubrica_id: m.rubrica_id,
          valor: Number(m.valor),
          quantidade: Number(m.quantidade) || 1,
          mes: m.mes,
          ano: m.ano,
        });
      }
    }
  }, [movimentoData, reset, id]);

  // Mutation (create ou update com URL aninhada)
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (isEditing) {
        return movimentosMensaisService.update(data.funcionario_id, Number(id), data);
      }
      return movimentosMensaisService.create(data.funcionario_id, data);
    },
    onSuccess: () => {
      toast.success(isEditing ? "Movimento atualizado!" : "Movimento criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["movimentos-mensais"] });
      navigate("/movimentos-mensais");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Erro ao salvar movimento";
      toast.error(msg);
    },
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <>
      <PageMeta
        title={`${isEditing ? "Editar" : "Novo"} Movimento Mensal | RH`}
        description="Lançamento de rubrica para folha de pagamento"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              {isEditing ? "Editar Movimento Mensal" : "Novo Movimento Mensal"}
            </h1>
          </div>
          <Link to="/movimentos-mensais">
            <Button variant="outline">← Voltar</Button>
          </Link>
        </div>

        <ComponentCard title="">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* FUNCIONÁRIO */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Funcionário *
                </label>
                <select
                  {...register("funcionario_id", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 bg-transparent py-3 px-4 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
                >
                  <option value="">Selecione um funcionário...</option>
                  {funcionarios.map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.numero_mecanografico} — {f.nome_completo}
                    </option>
                  ))}
                </select>
                {errors.funcionario_id && <p className="mt-1 text-xs text-red-500">{errors.funcionario_id.message}</p>}
              </div>

              {/* RUBRICA */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Rubrica *
                </label>
                <select
                  {...register("rubrica_id", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 bg-transparent py-3 px-4 outline-none focus:border-primary dark:border-gray-700 dark:text-white"
                >
                  <option value="">Selecione uma rubrica...</option>
                  {rubricas.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.codigo} — {r.nome}
                    </option>
                  ))}
                </select>
                {errors.rubrica_id && <p className="mt-1 text-xs text-red-500">{errors.rubrica_id.message}</p>}
              </div>

              {/* Mês e Ano */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Mês *</label>
                <select {...register("mes", { valueAsNumber: true })} className="w-full rounded-lg border ...">
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {String(i + 1).padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Ano *</label>
                <select {...register("ano", { valueAsNumber: true })} className="w-full rounded-lg border ...">
                  {Array.from({ length: 6 }, (_, i) => {
                    const y = new Date().getFullYear() - 2 + i;
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
              </div>

              {/* Valor e Quantidade */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Valor (AOA) *</label>
                <Input type="number" step="0.01" {...register("valor", { valueAsNumber: true })} />
                {errors.valor && <p className="mt-1 text-xs text-red-500">{errors.valor.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Quantidade</label>
                <Input type="number" step="0.01" {...register("quantidade", { valueAsNumber: true })} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Link to="/movimentos-mensais">
                <Button variant="outline" type="button">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : isEditing ? "Atualizar Movimento" : "Criar Movimento"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
};

export default MovimentoMensalForm;