import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { useAuth } from "../../context/AuthContext";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    console.log("📞 handleLogin recebeu email:", email);
    console.log("📞 handleLogin recebeu password:", password ? "***" : "vazio");
    
    setIsLoading(true);
    
    try {
      console.log("🔄 Chamando login do contexto com:", email);
      await login(email, password);
      console.log("✅ Login bem-sucedido, redirecionando...");
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error: unknown) {
      console.error("❌ Erro capturado no handleLogin:", error);
      
      let errorMessage = "Erro ao fazer login";
      
      if (typeof error === "object" && error !== null && "response" in error) {
        const errObj = error as any;
        if (errObj.response?.data?.errors) {
          errorMessage = Object.values(errObj.response.data.errors).flat().join(", ");
        } else if (errObj.response?.data?.message) {
          errorMessage = errObj.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.log("📢 Mensagem de erro:", errorMessage);
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