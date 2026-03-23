import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (data: {
    numero_mecanografico: string;
    nome_completo: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    setIsLoading(true);
    try {
      const { authService } = await import("../../services/auth");
      await authService.register(data);
      
      toast.success("Cadastro realizado com sucesso!");
      navigate("/dashboard");
    } catch (error: unknown) {
      const errObj = error as any;
      const errors = errObj.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach((err: any) => {
          toast.error(err[0]);
        });
      } else {
        toast.error(errObj.response?.data?.message || "Erro ao cadastrar");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Cadastro | Sistema de RH e Folha de Pagamento"
        description="Crie sua conta para acessar o sistema de gestão de RH e folha de pagamento"
      />
      <AuthLayout>
        <SignUpForm onRegister={handleRegister} isLoading={isLoading} />
      </AuthLayout>
    </>
  );
}