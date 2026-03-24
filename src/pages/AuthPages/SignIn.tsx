import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import axios from "axios";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { useAuth } from "../../context/AuthContext";

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error: unknown) {
      let errorMessage = "Erro ao fazer login";

      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const apiErrors = error.response?.data?.errors;
        if (apiErrors) {
          errorMessage = Object.values(apiErrors).flat().join(", ");
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Login | Sistema de RH e Folha de Pagamento"
        description="Faça login para acessar o sistema de gestão de RH e folha de pagamento"
      />
      <AuthLayout>
        <SignInForm onLogin={handleLogin} isLoading={isLoading} />
      </AuthLayout>
    </>
  );
}